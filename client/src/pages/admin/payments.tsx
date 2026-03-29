import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, XCircle, Clock, DollarSign, CreditCard, 
  Building2, Smartphone, Search, Eye, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Payment } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
};

const METHOD_CONFIG: Record<string, { label: string; icon: any }> = {
  bank_transfer: { label: "Bank Transfer", icon: Building2 },
  mobile_transfer: { label: "Mobile Transfer", icon: Smartphone },
};

export default function AdminPayments() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/payments");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { id: string; notes?: string }) => {
      const response = await fetch(`/api/admin/payments/${data.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: data.notes }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setSelectedPayment(null);
      setAdminNotes("");
      toast({ title: "Payment Approved", description: "The user has been granted access." });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { id: string; notes?: string }) => {
      const response = await fetch(`/api/admin/payments/${data.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: data.notes }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setSelectedPayment(null);
      setAdminNotes("");
      toast({ title: "Payment Rejected", description: "The payment has been rejected." });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge variant="secondary" className={`${config.color} hover:${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    const config = METHOD_CONFIG[method] || METHOD_CONFIG.bank_transfer;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  const filteredPayments = payments.filter(p => 
    p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.referenceCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = payments.filter(p => p.status === "pending").length;
  const approvedCount = payments.filter(p => p.status === "approved").length;
  const totalAmount = payments
    .filter(p => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Review and approve pending bank transfers.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Verified payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount} OMR</div>
            <p className="text-xs text-muted-foreground">From approved payments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Payments</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, or reference..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                    <TableCell className="font-mono text-sm">{payment.referenceCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="capitalize">{payment.productType}</p>
                        {payment.sessionType && (
                          <p className="text-xs text-muted-foreground">{payment.sessionType}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-sm">{METHOD_CONFIG[payment.method]?.label || payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{payment.amount} {payment.currency}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        data-testid={`view-payment-${payment.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Payment Details</SheetTitle>
            <SheetDescription>
              Review payment information and take action.
            </SheetDescription>
          </SheetHeader>

          {selectedPayment && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg">{selectedPayment.referenceCode}</span>
                {getStatusBadge(selectedPayment.status)}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Customer Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{selectedPayment.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{selectedPayment.userEmail}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Payment Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{selectedPayment.amount} {selectedPayment.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(selectedPayment.method)}
                      <span>{METHOD_CONFIG[selectedPayment.method]?.label}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="capitalize">{selectedPayment.productType}</span>
                  </div>
                  {selectedPayment.transferReference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transfer Ref</span>
                      <span className="font-mono">{selectedPayment.transferReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.status === "pending" && (
                <>
                  <Separator />

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Verification Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Please verify this payment in your bank statement before approving.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this payment..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => approveMutation.mutate({ id: selectedPayment.id, notes: adminNotes })}
                      disabled={approveMutation.isPending}
                      data-testid="button-approve-payment"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {approveMutation.isPending ? "Approving..." : "Approve Payment"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate({ id: selectedPayment.id, notes: adminNotes })}
                      disabled={rejectMutation.isPending}
                      data-testid="button-reject-payment"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedPayment.status !== "pending" && selectedPayment.adminNotes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Admin Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedPayment.adminNotes}</p>
                    {selectedPayment.verifiedBy && selectedPayment.verifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Verified by {selectedPayment.verifiedBy} on {new Date(selectedPayment.verifiedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
