import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Smartphone, Copy, Check, Clock, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: "course" | "consultation";
  productName: string;
  amount: number;
  currency?: string;
  courseId?: string;
  consultationBookingId?: string;
  sessionType?: string;
  onPaymentCreated?: (payment: any) => void;
}

interface BankDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
  swiftCode: string;
  mobilePaymentPhone: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  productType,
  productName,
  amount,
  currency = "OMR",
  courseId,
  consultationBookingId,
  sessionType,
  onPaymentCreated,
}: PaymentModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "mobile_transfer">("bank_transfer");
  const [transferReference, setTransferReference] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentCreated, setPaymentCreated] = useState<any>(null);

  const { data: bankDetails } = useQuery<BankDetails>({
    queryKey: ["/api/payment/bank-details"],
    queryFn: async () => {
      const res = await fetch("/api/payment/bank-details");
      return res.json();
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productType,
          courseId,
          consultationBookingId,
          sessionType,
          method: paymentMethod,
          amount,
          currency,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentCreated(data.payment);
      onPaymentCreated?.(data.payment);
      toast({
        title: t("payment.created"),
        description: t("payment.createdDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("payment.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitReferenceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/payments/${paymentCreated.id}/submit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transferReference }),
      });
      if (!response.ok) throw new Error("Failed to submit reference");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("payment.referenceSubmitted"),
        description: t("payment.referenceSubmittedDesc"),
      });
      onClose();
    },
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreatePayment = () => {
    createPaymentMutation.mutate();
  };

  const handleSubmitReference = () => {
    if (transferReference.trim()) {
      submitReferenceMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" dir={isRtl ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">{t("payment.title")}</DialogTitle>
          <DialogDescription>{t("payment.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{t("payment.product")}</p>
                  <p className="font-medium">{productName}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm text-muted-foreground">{t("payment.amount")}</p>
                  <p className="text-xl font-bold text-primary">{amount} {currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!paymentCreated ? (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">{t("payment.selectMethod")}</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as any)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{t("payment.bankTransfer")}</p>
                        <p className="text-sm text-muted-foreground">{t("payment.bankTransferDesc")}</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="mobile_transfer" id="mobile_transfer" />
                    <Label htmlFor="mobile_transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{t("payment.mobileTransfer")}</p>
                        <p className="text-sm text-muted-foreground">{t("payment.mobileTransferDesc")}</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleCreatePayment} 
                className="w-full" 
                size="lg"
                disabled={createPaymentMutation.isPending}
                data-testid="button-proceed-payment"
              >
                {createPaymentMutation.isPending ? t("payment.processing") : t("payment.proceed")}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">{t("payment.pendingTitle")}</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{t("payment.pendingDesc")}</p>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("payment.referenceCode")}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                        {paymentCreated.referenceCode}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(paymentCreated.referenceCode, "ref")}
                      >
                        {copied === "ref" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {paymentMethod === "bank_transfer" && bankDetails && (
                    <div className="space-y-3">
                      <h4 className="font-medium">{t("payment.bankDetails")}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("payment.bankName")}</span>
                          <span className="font-medium">{bankDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("payment.accountHolder")}</span>
                          <span className="font-medium">{bankDetails.accountHolder}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">IBAN</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{bankDetails.iban}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                            >
                              {copied === "iban" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">SWIFT</span>
                          <span className="font-mono">{bankDetails.swiftCode}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "mobile_transfer" && bankDetails && (
                    <div className="space-y-3">
                      <h4 className="font-medium">{t("payment.mobileDetails")}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("payment.phoneNumber")}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-medium">{bankDetails.mobilePaymentPhone}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(bankDetails.mobilePaymentPhone, "phone")}
                            >
                              {copied === "phone" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{t("payment.accountHolder")}</span>
                          <span className="font-medium">{bankDetails.accountHolder}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">{t("payment.importantNote")}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{t("payment.includeReference")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("payment.enterTransferRef")}</Label>
                <Input
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder={t("payment.transferRefPlaceholder")}
                />
                <Button 
                  onClick={handleSubmitReference} 
                  className="w-full"
                  disabled={!transferReference.trim() || submitReferenceMutation.isPending}
                  data-testid="button-submit-reference"
                >
                  {submitReferenceMutation.isPending ? t("payment.submitting") : t("payment.submitReference")}
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  {t("payment.payLater")}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
