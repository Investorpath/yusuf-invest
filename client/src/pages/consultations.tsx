import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clock, Check, ChevronRight, ChevronLeft, CreditCard, AlertCircle, Copy, Building2, Smartphone, Video, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ConsultationType, ConsultationAvailability } from "@shared/schema";

function generateTimeSlots(startTime: string, endTime: string, duration = 60): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh] = endTime.split(":").map(Number);
  const startMins = sh * 60 + (sm || 0);
  const endMins = eh * 60;
  for (let m = startMins; m + duration <= endMins; m += duration) {
    const h24 = Math.floor(m / 60), min = m % 60;
    const h12 = h24 > 12 ? h24 - 12 : h24 === 0 ? 12 : h24;
    const ap = h24 >= 12 ? "PM" : "AM";
    slots.push(`${h12.toString().padStart(2,"0")}:${min.toString().padStart(2,"0")} ${ap}`);
  }
  return slots;
}
function generateSlotsForRanges(avail: ConsultationAvailability[], duration = 60) {
  const all: string[] = [];
  for (const s of avail) all.push(...generateTimeSlots(s.startTime, s.endTime, duration));
  return Array.from(new Set(all)).sort((a, b) => {
    const parse = (t: string) => { const [time, p] = t.split(" "); const [h, m] = time.split(":").map(Number); let hh = h; if (p === "PM" && h !== 12) hh += 12; if (p === "AM" && h === 12) hh = 0; return hh * 60 + m; };
    return parse(a) - parse(b);
  });
}
const MUSCAT_LOCATIONS = ["Bowsher","Al Khoudh","Al Mawalih","Al Qurm","MQ","Athaiba","Al Ghubra"];

const cardStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px 28px" } as React.CSSProperties;
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--v2-text)", borderRadius: 8 } as React.CSSProperties;

export default function Consultations() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();
  const [step, setStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer"|"mobile_transfer"|null>(null);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [mode, setMode] = useState<"online"|"offline">("online");
  const [location, setLocation] = useState("");
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", notes: "" });

  const { data: consultationTypes = [] } = useQuery<ConsultationType[]>({
    queryKey: ["/api/consultation-types"],
    queryFn: async () => { const r = await fetch("/api/consultation-types"); if (!r.ok) throw new Error("Failed"); return r.json(); },
  });
  const { data: availabilitySlots = [] } = useQuery<ConsultationAvailability[]>({
    queryKey: ["/api/consultation-availability"],
    queryFn: async () => { const r = await fetch("/api/consultation-availability"); if (!r.ok) throw new Error("Failed"); return r.json(); },
  });
  const { data: bankDetails } = useQuery<any>({
    queryKey: ["/api/payment/bank-details"],
    queryFn: async () => { const r = await fetch("/api/payment/bank-details"); if (!r.ok) return null; return r.json(); },
  });

  const dayOfWeekSlots = useMemo(() => {
    if (!date) return [];
    const dow = date.getDay();
    const active = availabilitySlots.filter(s => s.dayOfWeek === dow && s.isActive);
    return generateSlotsForRanges(active, selectedType?.duration || 60);
  }, [date, availabilitySlots, selectedType]);

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/consultation-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType: selectedType?.id,
          date: date ? format(date, "yyyy-MM-dd") : "",
          time: time!,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          notes: formData.notes,
          mode,
          location: mode === "offline" ? location : undefined,
          method: paymentMethod!,
          amount: selectedType?.price,
          currency: "OMR",
        }),
      });
      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.error);
      }
      if (!res.ok) throw new Error("Booking failed");
      return res.json();
    },
    onSuccess: (data) => { setCurrentPayment(data); setStep(4); },
    onError: (err: any) => toast.error(err.message || t("payment.error")),
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  };

  const goldBtn = { background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties;
  const ghostBtn = { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" } as React.CSSProperties;

  return (
    <div style={{ background: "var(--v2-bg)", minHeight: "100vh", color: "var(--v2-text)" }}>
      <Navbar />

      {/* Hero */}
      <section className="yi-grid-bg" style={{ background: "var(--v2-bg)", padding: "72px 0 56px", position: "relative" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 440, height: 440, background: "radial-gradient(circle,rgba(26,191,173,0.08) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="yi-section-label" style={{ justifyContent: "center", marginBottom: 16 }}>{isRtl ? "استشارات فردية" : "One-on-One Sessions"}</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 16 }}>
              {t("consult.page.title")}
            </h1>
            <p style={{ fontSize: 16, color: "var(--v2-muted)", lineHeight: 1.72 }}>{t("consult.page.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Session types grid */}
      <section style={{ padding: "0 32px 96px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {consultationTypes.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px dashed rgba(255,255,255,0.1)" }}>
              <Clock size={48} style={{ margin: "0 auto 16px", color: "var(--v2-muted)", opacity: 0.3 }} />
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--v2-text)" }}>
                {isRtl ? "لا توجد بقات استشارية متاحة" : "No consultation types available"}
              </h3>
              <p style={{ color: "var(--v2-muted)", fontSize: 14, maxWidth: 400, margin: "0 auto" }}>
                {isRtl ? "عذراً، لا توجد استشارات متاحة في الوقت الحالي. يرجى التحقق لاحقاً." : "Sorry, there are no consultations available at the moment. Please check back later."}
              </p>
            </motion.div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                {consultationTypes.map((ct, i) => (
              <motion.div key={ct.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div
                  onClick={() => { setSelectedType(ct); setIsDialogOpen(true); setStep(1); }}
                  className="yi-card-shimmer"
                  style={{ padding: "28px", cursor: "pointer", height: "100%" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <span className="yi-tag" style={{ fontSize: 11 }}>{isRtl ? ct.titleAr || ct.title : ct.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      <Clock size={11} /> {ct.duration} {isRtl ? "دق" : "min"}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--v2-muted)", lineHeight: 1.6, marginBottom: 20, minHeight: 48 }}>
                    {isRtl ? ct.descriptionAr || ct.description : ct.description}
                  </p>
                  {ct.bestFor && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--v2-teal)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t("consult.bestFor")}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{isRtl ? ct.bestForAr || ct.bestFor : ct.bestFor}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginTop: "auto" }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700 }} className="yi-gold-text">{ct.price} OMR</span>
                    <button style={goldBtn} onClick={() => { setSelectedType(ct); setIsDialogOpen(true); setStep(1); }}>
                      {t("consult.bookBtn")} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mode info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Video size={18} style={{ color: "var(--v2-teal)" }} />
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 600 }}>{isRtl ? "عبر الإنترنت" : "Online"}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--v2-muted)", lineHeight: 1.6 }}>{isRtl ? "جلسة عبر الإنترنت من أي مكان، رابط الاجتماع يُرسل بعد التأكيد." : "Session via video call from anywhere. Meeting link sent after confirmation."}</p>
            </div>
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <MapPin size={18} style={{ color: "var(--v2-gold)" }} />
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 600 }}>{isRtl ? "حضوري - مسقط" : "In-person · Muscat"}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--v2-muted)", lineHeight: 1.6 }}>{t("consult.location.note")}</p>
            </div>
          </div>
          </>
          )}
        </div>
      </section>

      {/* Booking dialog */}
      <Dialog open={isDialogOpen} onOpenChange={v => { setIsDialogOpen(v); if (!v) { setStep(1); setPaymentMethod(null); setCurrentPayment(null); } }}>
        <DialogContent style={{ background: "var(--v2-bg2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, maxWidth: 560, maxHeight: "90vh", overflowY: "auto", color: "var(--v2-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Syne',sans-serif", color: "var(--v2-text)" }}>{t("booking.title")}</DialogTitle>
            <DialogDescription style={{ color: "var(--v2-muted)" }}>{selectedType ? (isRtl ? selectedType.titleAr || selectedType.title : selectedType.title) : ""}</DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "var(--v2-gold)" : "rgba(255,255,255,0.1)", transition: "background 0.2s" }} />
            ))}
          </div>

          {/* Step 1: Date/Time/Mode */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("booking.step.date")}</Label>
                <div style={{ marginTop: 10 }}>
                  <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setTime(undefined); }} disabled={{ before: new Date() }} style={{ background: "transparent", color: "var(--v2-text)" }} />
                </div>
              </div>
              {dayOfWeekSlots.length > 0 ? (
                <div>
                  <Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("booking.time.label")}</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
                    {dayOfWeekSlots.map(slot => (
                      <button key={slot} onClick={() => setTime(slot)}
                        style={{ padding: "8px 4px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", background: time === slot ? "var(--v2-gold)" : "rgba(255,255,255,0.05)", color: time === slot ? "#080A0F" : "rgba(255,255,255,0.7)", border: `1px solid ${time === slot ? "var(--v2-gold)" : "rgba(255,255,255,0.1)"}`, fontWeight: time === slot ? 600 : 400, transition: "all 0.12s" }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ) : date && (
                <div style={{ padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  {isRtl ? "لا توجد أوقات متاحة لهذا اليوم" : "No slots available for this day"}
                </div>
              )}
              <div>
                <Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("consult.mode.label")}</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                  {(["online","offline"] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      style={{ padding: "12px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, background: mode === m ? "rgba(212,168,67,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${mode === m ? "rgba(212,168,67,0.35)" : "rgba(255,255,255,0.1)"}`, color: mode === m ? "var(--v2-gold2)" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.12s" }}>
                      {m === "online" ? <Video size={14} /> : <MapPin size={14} />}
                      {m === "online" ? (isRtl ? "عبر الإنترنت" : "Online") : (isRtl ? "حضوري" : "In-person")}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "offline" && (
                <div>
                  <Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger style={{ ...inputStyle, marginTop: 8 }}><SelectValue placeholder={isRtl ? "اختر المنطقة" : "Select area"} /></SelectTrigger>
                    <SelectContent>{MUSCAT_LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>First name</Label>
                  <Input value={formData.firstName} onChange={e => setFormData(p => ({...p, firstName: e.target.value}))} style={inputStyle} /></div>
                <div><Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Last name</Label>
                  <Input value={formData.lastName} onChange={e => setFormData(p => ({...p, lastName: e.target.value}))} style={inputStyle} /></div>
              </div>
              <div><Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{t("form.email")}</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} style={inputStyle} /></div>
              <div><Label style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{t("form.message")} ({t("form.optional")})</Label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={3} placeholder={t("form.placeholder.message")} style={{ ...inputStyle, width: "100%", padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "'DM Sans',sans-serif" }} /></div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{t("payment.product")}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{selectedType?.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{date ? format(date,"dd MMM yyyy") : ""} · {time}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 10 }} className="yi-gold-text">{selectedType?.price} OMR</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["bank_transfer","mobile_transfer"] as const).map(m => (
                  <label key={m} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${paymentMethod === m ? "rgba(212,168,67,0.4)" : "rgba(255,255,255,0.1)"}`, background: paymentMethod === m ? "rgba(212,168,67,0.07)" : "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.12s" }}>
                    <input type="radio" name="pay" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{m === "bank_transfer" ? t("payment.bankTransfer") : t("payment.mobileTransfer")}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m === "bank_transfer" ? t("payment.bankTransferDesc") : t("payment.mobileTransferDesc")}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && currentPayment && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,191,173,0.15)", border: "1px solid rgba(26,191,173,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Check size={24} style={{ color: "var(--v2-teal)" }} />
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{t("payment.pendingTitle")}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{t("payment.pendingDesc")}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{t("payment.referenceCode")}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600, color: "var(--v2-gold2)" }}>{currentPayment.referenceCode}</span>
                  <button onClick={() => copyToClipboard(currentPayment.referenceCode, "Reference")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4 }}><Copy size={14} /></button>
                </div>
              </div>
              {paymentMethod === "bank_transfer" && currentPayment.bankDetails && (
                <div style={{ background: "rgba(26,191,173,0.07)", border: "1px solid rgba(26,191,173,0.2)", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 500, color: "var(--v2-teal)" }}><Building2 size={14} /> {t("payment.bankDetails")}</div>
                  {[["Bank", currentPayment.bankDetails.bankName], ["Account", currentPayment.bankDetails.accountHolder], ["IBAN", currentPayment.bankDetails.iban]].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{l}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: l === "IBAN" ? "monospace" : "inherit" }}>{v}</span>
                        {l === "IBAN" && <button onClick={() => copyToClipboard(v, "IBAN")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 2 }}><Copy size={11} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {paymentMethod === "mobile_transfer" && currentPayment.bankDetails && (
                <div style={{ background: "rgba(212,168,67,0.07)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 500, color: "var(--v2-gold)" }}><Smartphone size={14} /> {t("payment.mobileDetails")}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{t("payment.mobileNumber")}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{currentPayment.bankDetails.mobileNumber}</span>
                      <button onClick={() => copyToClipboard(currentPayment.bankDetails.mobileNumber, "Number")} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 2 }}><Copy size={11} /></button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ background: "rgba(255,193,7,0.07)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: 8, padding: 12, fontSize: 12, color: "rgba(255,193,7,0.8)", display: "flex", gap: 8 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {t("payment.includeReference")}
              </div>
            </div>
          )}

          <DialogFooter style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {step > 1 && step < 4 && <button style={ghostBtn} onClick={() => setStep(s => s - 1)}><ChevronLeft size={14} /> {t("booking.back")}</button>}
            {step === 1 || step === 4 ? <div /> : null}
            {step === 1 && <button style={{ ...goldBtn, opacity: (!date || !time || (mode === "offline" && !location)) ? 0.5 : 1 }} disabled={!date || !time || (mode === "offline" && !location)} onClick={() => setStep(2)}>{t("booking.next")} <ChevronRight size={14} /></button>}
            {step === 2 && <button style={{ ...goldBtn, opacity: (!formData.firstName || !formData.lastName || !formData.email) ? 0.5 : 1 }} disabled={!formData.firstName || !formData.lastName || !formData.email} onClick={() => setStep(3)}>{t("payment.proceedToPayment")} <CreditCard size={14} /></button>}
            {step === 3 && <button style={{ ...goldBtn, opacity: (!paymentMethod || createPaymentMutation.isPending) ? 0.5 : 1 }} disabled={!paymentMethod || createPaymentMutation.isPending} onClick={() => createPaymentMutation.mutate()}>{createPaymentMutation.isPending ? t("payment.processing") : t("payment.confirmPayment")} <Check size={14} /></button>}
            {step === 4 && <button style={goldBtn} onClick={() => { setIsDialogOpen(false); setStep(1); setPaymentMethod(null); setCurrentPayment(null); setFormData({ firstName:"",lastName:"",email:"",notes:"" }); setMode("online"); setLocation(""); toast.success(t("payment.bookingPending"), { description: t("payment.bookingPendingDesc") }); }}>{t("payment.done")} <Check size={14} /></button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
