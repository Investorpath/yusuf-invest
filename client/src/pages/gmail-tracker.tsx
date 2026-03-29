import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Mail, RefreshCw, Trash2, Download, LogOut, Search, TrendingDown } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function authFetch(url: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

const CATEGORIES = [
  "All",
  "Food & Dining",
  "Groceries",
  "Shopping",
  "Fuel",
  "Utilities & Bills",
  "Subscriptions & Tech",
  "Entertainment",
  "Transport",
  "Hotels",
  "Personal Care & Health",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800",
  "Groceries": "bg-green-100 text-green-800",
  "Shopping": "bg-purple-100 text-purple-800",
  "Fuel": "bg-yellow-100 text-yellow-800",
  "Utilities & Bills": "bg-blue-100 text-blue-800",
  "Subscriptions & Tech": "bg-cyan-100 text-cyan-800",
  "Entertainment": "bg-pink-100 text-pink-800",
  "Transport": "bg-indigo-100 text-indigo-800",
  "Hotels": "bg-teal-100 text-teal-800",
  "Personal Care & Health": "bg-red-100 text-red-800",
  "Other": "bg-gray-100 text-gray-800",
};

export default function GmailTracker() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // Check query params for OAuth result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") {
      toast({ title: "Gmail connected!", description: "Your Gmail account has been linked." });
      window.history.replaceState({}, "", "/gmail-tracker");
      qc.invalidateQueries({ queryKey: ["gmail-status"] });
    }
    if (params.get("error")) {
      toast({ title: "Connection failed", description: "Could not connect Gmail. Try again.", variant: "destructive" });
      window.history.replaceState({}, "", "/gmail-tracker");
    }
  }, []);

  const { data: status } = useQuery({
    queryKey: ["gmail-status"],
    queryFn: async () => {
      const r = await authFetch("/api/gmail/status");
      return r.json() as Promise<{ connected: boolean; gmailEmail: string | null }>;
    },
  });

  const { data: txns = [], isLoading: txnsLoading } = useQuery({
    queryKey: ["gmail-transactions"],
    queryFn: async () => {
      const r = await authFetch("/api/gmail/transactions");
      return r.json() as Promise<Array<{
        id: string; merchant: string; amount: string; currency: string;
        date: string; category: string; emailId: string;
      }>>;
    },
    enabled: !!status?.connected,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const r = await authFetch("/api/gmail/auth");
      const { url } = await r.json();
      window.location.href = url;
    },
    onError: () => toast({ title: "Error", description: "Failed to initiate Gmail connection.", variant: "destructive" }),
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const r = await authFetch("/api/gmail/sync", { method: "POST" });
      if (!r.ok) throw new Error((await r.json()).error);
      return r.json() as Promise<{ inserted: number; total: number }>;
    },
    onSuccess: (data) => {
      toast({ title: "Sync complete", description: `${data.inserted} new transaction(s) found.` });
      qc.invalidateQueries({ queryKey: ["gmail-transactions"] });
    },
    onError: (e: any) => toast({ title: "Sync failed", description: e.message, variant: "destructive" }),
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await authFetch("/api/gmail/disconnect", { method: "DELETE" });
    },
    onSuccess: () => {
      toast({ title: "Disconnected", description: "Gmail account unlinked." });
      qc.invalidateQueries({ queryKey: ["gmail-status"] });
      qc.invalidateQueries({ queryKey: ["gmail-transactions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await authFetch(`/api/gmail/transactions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gmail-transactions"] }),
  });

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      const matchSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      return matchSearch && matchCat;
    });
  }, [txns, search, category]);

  const total = useMemo(() => {
    return filtered.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }, [filtered]);

  function exportCSV() {
    const header = "Date,Merchant,Amount,Currency,Category\n";
    const rows = filtered.map((t) => `${t.date},${t.merchant},${t.amount},${t.currency},${t.category}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Transaction Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Auto-extract your spending from Gmail bank alerts
            </p>
          </div>
          {status?.connected ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{status.gmailEmail}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                {syncMutation.isPending ? "Syncing…" : "Sync Now"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail
            </Button>
          )}
        </div>

        {!status?.connected && (
          <div className="border rounded-xl p-10 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Connect your Gmail to get started</p>
            <p className="text-sm mb-6">
              We'll scan for bank debit alerts and automatically categorise your spending.
              <br />Read-only access — we never modify your emails.
            </p>
            <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
              <Mail className="w-4 h-4 mr-2" />
              Connect Gmail Account
            </Button>
          </div>
        )}

        {status?.connected && (
          <>
            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Transactions</p>
                <p className="text-2xl font-bold mt-1">{filtered.length}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Spent</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                  {total.toFixed(3)} {filtered[0]?.currency || "OMR"}
                </p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Categories</p>
                <p className="text-2xl font-bold mt-1">
                  {new Set(filtered.map((t) => t.category)).size}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search merchant…"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={exportCSV} title="Export CSV">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Table */}
            {txnsLoading ? (
              <div className="text-center py-16 text-muted-foreground">Loading transactions…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border rounded-xl">
                <p className="text-lg font-medium mb-2">No transactions yet</p>
                <p className="text-sm mb-4">Click "Sync Now" to scan your Gmail for bank alerts.</p>
                <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                  {syncMutation.isPending ? "Syncing…" : "Sync Now"}
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-muted-foreground">{t.date}</TableCell>
                        <TableCell className="font-medium">{t.merchant}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {parseFloat(t.amount).toFixed(3)}{" "}
                          <span className="text-muted-foreground text-xs">{t.currency}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs font-normal ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS["Other"]}`}
                            variant="secondary"
                          >
                            {t.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(t.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
