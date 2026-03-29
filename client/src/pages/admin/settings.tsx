import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Lock, Mail, Globe, Save, Eye, EyeOff, Building2 } from "lucide-react";

const MOCK_BANK = {
  bankName: "National Bank of Oman (NBO)",
  accountHolder: "Yoosuf Al Rahbi",
  iban: "OM880180010470208185001",
  swiftCode: "NBOMOMRXXXX",
};

export default function AdminSettings() {
  // Bank details
  const [bank, setBank] = useState(MOCK_BANK);

  // Password
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Contact / Platform
  const [contactEmail, setContactEmail] = useState("yusuf@yusinvest.com");
  const [whatsapp, setWhatsapp] = useState("+968 9X XXX XXXX");
  const [siteTagline, setSiteTagline] = useState("Financial education rooted in Islamic values.");

  const handleSaveBank = () => {
    toast.success("Bank details updated");
  };

  const handleSavePassword = () => {
    if (currentPw !== "admin123") {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password updated (demo — not persisted)");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const handleSaveContact = () => {
    toast.success("Contact info saved");
  };

  return (
    <AdminLayout>
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Settings</h2>
        <p style={{ color: "var(--v2-muted)" }}>Manage your platform configuration.</p>
      </div>

      {/* Bank / Payment Details */}
      <Card style={{ background: "var(--v2-bg2)", borderColor: "var(--v2-border)" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(212,168,67,0.12)" }}>
              <CreditCard className="w-5 h-5" style={{ color: "#D4A843" }} />
            </div>
            <div>
              <CardTitle style={{ color: "var(--v2-text)" }}>Payment & Bank Details</CardTitle>
              <CardDescription style={{ color: "var(--v2-muted)" }}>
                Shown to clients when they choose bank transfer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>Bank Name</Label>
              <Input
                value={bank.bankName}
                onChange={e => setBank({ ...bank, bankName: e.target.value })}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>Account Holder</Label>
              <Input
                value={bank.accountHolder}
                onChange={e => setBank({ ...bank, accountHolder: e.target.value })}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>IBAN</Label>
              <Input
                value={bank.iban}
                onChange={e => setBank({ ...bank, iban: e.target.value })}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>SWIFT / BIC Code</Label>
              <Input
                value={bank.swiftCode}
                onChange={e => setBank({ ...bank, swiftCode: e.target.value })}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveBank} style={{ background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F", fontWeight: 600 }}>
              <Save className="w-4 h-4 mr-2" />
              Save Bank Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card style={{ background: "var(--v2-bg2)", borderColor: "var(--v2-border)" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(26,191,173,0.12)" }}>
              <Lock className="w-5 h-5" style={{ color: "#1ABFAD" }} />
            </div>
            <div>
              <CardTitle style={{ color: "var(--v2-text)" }}>Admin Password</CardTitle>
              <CardDescription style={{ color: "var(--v2-muted)" }}>
                Change your admin login password.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--v2-muted)" }}
                  onClick={() => setShowPw(p => !p)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>New Password</Label>
              <Input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••"
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>Confirm New Password</Label>
              <Input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSavePassword} style={{ background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F", fontWeight: 600 }}>
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Platform Info */}
      <Card style={{ background: "var(--v2-bg2)", borderColor: "var(--v2-border)" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Globe className="w-5 h-5" style={{ color: "var(--v2-muted)" }} />
            </div>
            <div>
              <CardTitle style={{ color: "var(--v2-text)" }}>Contact & Platform</CardTitle>
              <CardDescription style={{ color: "var(--v2-muted)" }}>
                Public-facing contact info and site meta.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>Contact Email</Label>
              <Input
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2">
              <Label style={{ color: "var(--v2-muted)" }}>WhatsApp / Mobile</Label>
              <Input
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label style={{ color: "var(--v2-muted)" }}>Site Tagline</Label>
              <Input
                value={siteTagline}
                onChange={e => setSiteTagline(e.target.value)}
                style={{ background: "var(--v2-bg)", borderColor: "var(--v2-border)", color: "var(--v2-text)" }}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveContact} style={{ background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F", fontWeight: 600 }}>
              <Save className="w-4 h-4 mr-2" />
              Save Contact Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
