import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, RefreshCw, Trash2, Download, LogOut, Search,
  ShoppingBag, Utensils, ShoppingCart, Fuel, Zap, Laptop,
  Music, Car, Hotel, Heart, HelpCircle, Shield, Sparkles,
  TrendingDown, ArrowUpRight, CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

// ── Design tokens (mirroring the design system) ─────────────────────────────

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; dot: string }> = {
  "Food & Dining":         { icon: Utensils,   color: "#fb923c", bg: "rgba(249,115,22,0.12)",  dot: "#f97316" },
  "Groceries":             { icon: ShoppingCart,color: "#4ade80", bg: "rgba(34,197,94,0.12)",   dot: "#22c55e" },
  "Shopping":              { icon: ShoppingBag, color: "#c084fc", bg: "rgba(168,85,247,0.12)",  dot: "#a855f7" },
  "Fuel":                  { icon: Fuel,        color: "#facc15", bg: "rgba(234,179,8,0.12)",   dot: "#eab308" },
  "Utilities & Bills":     { icon: Zap,         color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  dot: "#3b82f6" },
  "Subscriptions & Tech":  { icon: Laptop,      color: "#22d3ee", bg: "rgba(6,182,212,0.12)",   dot: "#06b6d4" },
  "Entertainment":         { icon: Music,       color: "#f472b6", bg: "rgba(236,72,153,0.12)",  dot: "#ec4899" },
  "Transport":             { icon: Car,         color: "#818cf8", bg: "rgba(99,102,241,0.12)",  dot: "#6366f1" },
  "Hotels":                { icon: Hotel,       color: "#2dd4bf", bg: "rgba(20,184,166,0.12)",  dot: "#14b8a6" },
  "Personal Care & Health":{ icon: Heart,       color: "#f87171", bg: "rgba(239,68,68,0.12)",   dot: "#ef4444" },
  "Other":                 { icon: HelpCircle,  color: "#94a3b8", bg: "rgba(148,163,184,0.12)", dot: "#64748b" },
};

const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

const easeOut = cubicBezier(0.16, 1, 0.3, 1);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: easeOut } }),
};

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <TableRow className="border-white/5">
      {[40, 120, 80, 96, 32].map((w, i) => (
        <TableCell key={i}>
          <div
            className="rounded animate-pulse"
            style={{ width: w, height: 14, background: "rgba(255,255,255,0.06)" }}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ── Category pill ────────────────────────────────────────────────────────────
function CategoryPill({ category }: { category: string }) {
  const meta = CATEGORY_META[category] || CATEGORY_META["Other"];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color }}
    >
      <Icon size={11} aria-hidden="true" />
      {category}
    </span>
  );
}

// ── Merchant avatar (initials) ────────────────────────────────────────────────
function MerchantAvatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  // Deterministic hue from name
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold flex-shrink-0"
      style={{
        background: `hsla(${hue},55%,40%,0.25)`,
        color: `hsla(${hue},70%,75%,1)`,
        border: `1px solid hsla(${hue},55%,50%,0.2)`,
      }}
    >
      {initials}
    </span>
  );
}

// ── Custom donut tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const meta = CATEGORY_META[name] || CATEGORY_META["Other"];
  return (
    <div
      className="px-3 py-2 rounded-lg text-sm font-medium"
      style={{
        background: "rgba(13,16,23,0.96)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: meta.color,
        backdropFilter: "blur(8px)",
      }}
    >
      {name}: <span className="text-white">{(value as number).toFixed(3)} OMR</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GmailTracker() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") {
      toast({ title: "Gmail connected!", description: "Your account has been linked successfully." });
      window.history.replaceState({}, "", "/gmail-tracker");
      qc.invalidateQueries({ queryKey: ["gmail-status"] });
    }
    if (params.get("error")) {
      toast({ title: "Connection failed", description: "Could not link Gmail. Please try again.", variant: "destructive" });
      window.history.replaceState({}, "", "/gmail-tracker");
    }
  }, []);

  const { data: status, isLoading: statusLoading } = useQuery({
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
        date: string; category: string;
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
      toast({
        title: "Sync complete",
        description: data.inserted > 0
          ? `${data.inserted} new transaction${data.inserted !== 1 ? "s" : ""} found.`
          : "No new transactions found.",
      });
      qc.invalidateQueries({ queryKey: ["gmail-transactions"] });
    },
    onError: (e: any) => toast({ title: "Sync failed", description: e.message, variant: "destructive" }),
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => { await authFetch("/api/gmail/disconnect", { method: "DELETE" }); },
    onSuccess: () => {
      toast({ title: "Disconnected", description: "Gmail account unlinked." });
      qc.invalidateQueries({ queryKey: ["gmail-status"] });
      qc.invalidateQueries({ queryKey: ["gmail-transactions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await authFetch(`/api/gmail/transactions/${id}`, { method: "DELETE" }); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gmail-transactions"] }),
  });

  const filtered = useMemo(() =>
    txns.filter((t) => {
      const matchSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || t.category === category;
      return matchSearch && matchCat;
    }), [txns, search, category]);

  const total = useMemo(() =>
    filtered.reduce((sum, t) => sum + parseFloat(t.amount), 0), [filtered]);

  const topMerchant = useMemo(() => {
    if (!filtered.length) return null;
    const map: Record<string, number> = {};
    for (const t of filtered) map[t.merchant] = (map[t.merchant] || 0) + parseFloat(t.amount);
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  }, [filtered]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of filtered) map[t.category] = (map[t.category] || 0) + parseFloat(t.amount);
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  function exportCSV() {
    const rows = filtered.map((t) =>
      [t.date, `"${t.merchant}"`, t.amount, t.currency, `"${t.category}"`].join(",")
    );
    const blob = new Blob(["Date,Merchant,Amount,Currency,Category\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "transactions.csv" }).click();
    URL.revokeObjectURL(url);
  }

  const currency = filtered[0]?.currency || "OMR";

  return (
    <div className="min-h-screen" style={{ background: "var(--v2-bg)" }}>
      <Navbar />

      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <div
        className="yi-grid-bg border-b"
        style={{ borderColor: "var(--v2-border)", paddingTop: 56, paddingBottom: 40 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <span className="yi-section-label mb-4">Smart Finance</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
              <h1
                className="text-3xl sm:text-4xl font-bold leading-tight"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Transaction{" "}
                <span className="yi-gradient-text">Tracker</span>
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--v2-muted)" }}>
                Auto-extract spending from your Gmail bank alerts — powered by AI.
              </p>
            </motion.div>

            {/* Connected actions */}
            {status?.connected && (
              <motion.div
                variants={fadeUp} custom={2} initial="hidden" animate="visible"
                className="flex items-center gap-2 flex-wrap"
              >
                <span
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(26,191,173,0.1)", color: "var(--v2-teal)", border: "1px solid rgba(26,191,173,0.2)" }}
                >
                  <CheckCircle2 size={12} />
                  {status.gmailEmail}
                </span>
                <Button
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  style={{
                    background: "linear-gradient(135deg,#D4A843 0%,#B88E2A 100%)",
                    color: "#080A0F",
                    fontWeight: 600,
                    border: "none",
                    minWidth: 110,
                  }}
                >
                  <RefreshCw size={13} className={syncMutation.isPending ? "animate-spin" : ""} />
                  {syncMutation.isPending ? "Syncing…" : "Sync Now"}
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => disconnectMutation.mutate()}
                  aria-label="Disconnect Gmail"
                  className="h-8 w-8 p-0"
                  style={{ color: "var(--v2-muted)" }}
                >
                  <LogOut size={14} />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Empty / connect state ─────────────────────────────────────── */}
        <AnimatePresence>
          {!statusLoading && !status?.connected && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -16 }}
              className="yi-glass rounded-2xl p-8 sm:p-12 text-center"
              style={{ maxWidth: 540, margin: "0 auto" }}
            >
              {/* Icon orb */}
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.2)" }}
              >
                <Mail size={28} style={{ color: "var(--v2-gold)" }} />
              </div>

              <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
                Connect your Gmail
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--v2-muted)", lineHeight: 1.7 }}>
                We scan for bank debit alerts and use AI to extract and categorise every transaction — automatically.
              </p>

              {/* Feature list */}
              <ul className="text-left text-sm space-y-2.5 mb-8" style={{ color: "var(--v2-muted)" }}>
                {[
                  ["Reads bank alert emails only", "var(--v2-teal)"],
                  ["AI categorises every merchant", "var(--v2-gold)"],
                  ["Exports to CSV any time", "var(--v2-teal)"],
                  ["Read-only — we never send or delete", "var(--v2-gold)"],
                ].map(([text, color]) => (
                  <li key={text} className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} style={{ color, flexShrink: 0 }} />
                    {text}
                  </li>
                ))}
              </ul>

              <button
                className="yi-btn-primary w-full justify-center"
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                aria-busy={connectMutation.isPending}
              >
                <Mail size={15} />
                {connectMutation.isPending ? "Redirecting…" : "Connect Gmail Account"}
              </button>

              <div
                className="mt-4 flex items-center justify-center gap-1.5 text-xs"
                style={{ color: "var(--v2-muted)" }}
              >
                <Shield size={11} />
                Secured by Google OAuth 2.0 · Read-only scope
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Connected: stats + table ──────────────────────────────────── */}
        {status?.connected && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── Stat cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Total Spent",
                  value: `${total.toFixed(3)}`,
                  unit: currency,
                  icon: TrendingDown,
                  iconColor: "#f87171",
                  delay: 0,
                },
                {
                  label: "Transactions",
                  value: String(filtered.length),
                  unit: "records",
                  icon: Sparkles,
                  iconColor: "var(--v2-gold)",
                  delay: 1,
                },
                {
                  label: "Top Merchant",
                  value: topMerchant ? topMerchant[0] : "—",
                  unit: topMerchant ? `${topMerchant[1].toFixed(3)} ${currency}` : "",
                  icon: ArrowUpRight,
                  iconColor: "var(--v2-teal)",
                  delay: 2,
                },
              ].map(({ label, value, unit, icon: Icon, iconColor, delay }) => (
                <motion.div
                  key={label}
                  variants={fadeUp} custom={delay} initial="hidden" animate="visible"
                  className="yi-card-shimmer p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-[11px] font-medium uppercase tracking-widest"
                      style={{ color: "var(--v2-muted)" }}
                    >
                      {label}
                    </span>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <Icon size={14} style={{ color: iconColor }} aria-hidden="true" />
                    </div>
                  </div>
                  <p
                    className="text-2xl font-semibold truncate"
                    style={{ fontFamily: "Syne, sans-serif", color: "var(--v2-text)" }}
                  >
                    {value}
                  </p>
                  {unit && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--v2-muted)" }}>{unit}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ── Filters row ───────────────────────────────────────────── */}
            <motion.div
              variants={fadeUp} custom={3} initial="hidden" animate="visible"
              className="flex flex-col sm:flex-row gap-3 mb-5"
            >
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--v2-muted)" }}
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search merchant…"
                  className="pl-9 h-9"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--v2-border2)",
                    color: "var(--v2-text)",
                    fontSize: 14,
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search by merchant name"
                />
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="w-full sm:w-52 h-9 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--v2-border2)",
                    color: "var(--v2-text)",
                  }}
                  aria-label="Filter by category"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "var(--v2-bg2)", border: "1px solid var(--v2-border2)" }}
                >
                  {CATEGORIES.map((c) => (
                    <SelectItem
                      key={c} value={c}
                      className="text-sm"
                      style={{ color: "var(--v2-text)" }}
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm px-4 flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--v2-border2)",
                  color: "var(--v2-muted)",
                }}
                onClick={exportCSV}
                aria-label="Export to CSV"
              >
                <Download size={13} />
                Export CSV
              </Button>
            </motion.div>

            {/* ── Content: table + chart ─────────────────────────────────── */}
            {txnsLoading ? (
              // Skeleton
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--v2-border)" }}
              >
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "var(--v2-border)" }}>
                      {["Date", "Merchant", "Amount", "Category", ""].map((h) => (
                        <TableHead
                          key={h}
                          className="text-xs uppercase tracking-wide"
                          style={{ color: "var(--v2-muted)", background: "rgba(255,255,255,0.02)" }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
                  </TableBody>
                </Table>
              </div>
            ) : filtered.length === 0 ? (
              // Empty state
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl py-16 text-center"
                style={{ border: "1px solid var(--v2-border)", background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)" }}
                >
                  <RefreshCw size={20} style={{ color: "var(--v2-gold)" }} />
                </div>
                <p className="font-medium mb-1" style={{ color: "var(--v2-text)", fontFamily: "Syne, sans-serif" }}>
                  {txns.length === 0 ? "No transactions yet" : "No matching transactions"}
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--v2-muted)" }}>
                  {txns.length === 0
                    ? "Sync your Gmail to extract bank transaction alerts."
                    : "Try adjusting the search or category filter."}
                </p>
                {txns.length === 0 && (
                  <button
                    className="yi-btn-primary"
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                  >
                    <RefreshCw size={14} className={syncMutation.isPending ? "animate-spin" : ""} />
                    {syncMutation.isPending ? "Syncing…" : "Sync Now"}
                  </button>
                )}
              </motion.div>
            ) : (
              // Table + chart layout
              <motion.div
                variants={fadeUp} custom={4} initial="hidden" animate="visible"
                className="flex flex-col lg:flex-row gap-5"
              >
                {/* Transaction table */}
                <div
                  className="flex-1 min-w-0 rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--v2-border)" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "var(--v2-border)" }}>
                        {["Date", "Merchant", "Amount", "Category", ""].map((h, i) => (
                          <TableHead
                            key={i}
                            className={`text-xs uppercase tracking-wide ${h === "Amount" ? "text-right" : ""}`}
                            style={{
                              color: "var(--v2-muted)",
                              background: "rgba(255,255,255,0.025)",
                              fontWeight: 500,
                            }}
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filtered.map((t, i) => (
                          <motion.tr
                            key={t.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: i * 0.02 } }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b transition-colors"
                            style={{
                              borderColor: "var(--v2-border)",
                              // hover handled via Tailwind can't be done inline; use className instead
                            }}
                          >
                            <td
                              className="px-4 py-3 text-xs tabular-nums whitespace-nowrap"
                              style={{ color: "var(--v2-muted)" }}
                            >
                              {t.date}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <MerchantAvatar name={t.merchant} />
                                <span
                                  className="text-sm font-medium truncate max-w-[140px]"
                                  style={{ color: "var(--v2-text)" }}
                                >
                                  {t.merchant}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className="text-sm font-semibold tabular-nums"
                                style={{ color: "var(--v2-text)" }}
                              >
                                {parseFloat(t.amount).toFixed(3)}
                              </span>
                              <span className="text-xs ml-1" style={{ color: "var(--v2-muted)" }}>
                                {t.currency}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <CategoryPill category={t.category} />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteMutation.mutate(t.id)}
                                aria-label={`Delete ${t.merchant} transaction`}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color: "var(--v2-muted)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v2-muted)")}
                              >
                                <Trash2 size={13} aria-hidden="true" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Category donut chart */}
                {chartData.length > 0 && (
                  <div
                    className="lg:w-64 flex-shrink-0 rounded-xl p-5"
                    style={{ border: "1px solid var(--v2-border)", background: "rgba(255,255,255,0.02)" }}
                  >
                    <p
                      className="text-[11px] uppercase tracking-widest mb-4 font-medium"
                      style={{ color: "var(--v2-muted)" }}
                    >
                      By Category
                    </p>

                    <div style={{ height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%" cy="50%"
                            innerRadius={44} outerRadius={68}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {chartData.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={(CATEGORY_META[entry.name] || CATEGORY_META["Other"]).dot}
                                opacity={0.85}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <ul className="mt-4 space-y-2">
                      {chartData.slice(0, 5).map((entry) => {
                        const meta = CATEGORY_META[entry.name] || CATEGORY_META["Other"];
                        const pct = ((entry.value / total) * 100).toFixed(0);
                        return (
                          <li key={entry.name} className="flex items-center gap-2 text-xs">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: meta.dot }}
                            />
                            <span className="flex-1 truncate" style={{ color: "var(--v2-muted)" }}>
                              {entry.name}
                            </span>
                            <span
                              className="tabular-nums font-medium flex-shrink-0"
                              style={{ color: "var(--v2-text)" }}
                            >
                              {pct}%
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
