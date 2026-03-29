import { Navbar } from "@/components/navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Building2, Users, Target, CheckCircle, Briefcase, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkshopRequestForm } from "@/components/workshop-request-form";
import { useState } from "react";
const workshopImage = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

const fadeUp = { hidden: { opacity:0, y:24 }, visible: { opacity:1, y:0, transition:{ duration:0.55, ease:[0.16,1,0.3,1] as any } } };
const stagger = { hidden:{opacity:0}, visible:{opacity:1, transition:{staggerChildren:0.1}} };

export default function Corporate() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [isOpen, setIsOpen] = useState(false);

  const workshopTypes = [
    { icon: TrendingUp, title: isRtl ? "أساسيات الاستثمار" : "Investment Fundamentals", desc: isRtl ? "تعليم الموظفين أساسيات الاستثمار وبناء المحافظ" : "Teach employees investment basics and portfolio building", duration: isRtl ? "4-6 ساعات" : "4-6 hours" },
    { icon: Shield,     title: isRtl ? "التخطيط المالي الشخصي" : "Personal Financial Planning",    desc: isRtl ? "إدارة الميزانية والادخار والتخطيط للتقاعد" : "Budgeting, saving, and retirement planning",              duration: isRtl ? "3-4 ساعات" : "3-4 hours" },
    { icon: Briefcase,  title: isRtl ? "الثقافة المالية للقيادات" : "Financial Literacy for Leaders", desc: isRtl ? "فهم البيانات المالية واتخاذ القرارات" : "Understanding financial statements and decision-making",    duration: isRtl ? "5-8 ساعات" : "5-8 hours" },
    { icon: Target,     title: isRtl ? "برنامج مخصص" : "Custom Program",                          desc: isRtl ? "ورش عمل مصممة خصيصاً لاحتياجات مؤسستك" : "Workshops tailored to your organization's needs",          duration: isRtl ? "حسب الطلب" : "On request" },
  ];

  const audiences = [
    { icon: Building2, label: isRtl ? "الشركات" : "Corporates" },
    { icon: Users,     label: isRtl ? "الجهات الحكومية" : "Government Entities" },
    { icon: Target,    label: isRtl ? "الجامعات والمؤسسات" : "Universities & Institutions" },
  ];

  const formats = [
    { label: isRtl ? "جلسات 60-90 دقيقة" : "60–90 Minute Sessions",   desc: isRtl ? "مقدمات موجزة ومؤثرة" : "Brief, impactful introductions" },
    { label: isRtl ? "ورش عمل نصف يوم" : "Half-Day Workshops",        desc: isRtl ? "تدريب عملي متعمق" : "In-depth hands-on training" },
    { label: isRtl ? "برامج متعددة الجلسات" : "Multi-Session Programs", desc: isRtl ? "تحويل مستدام طويل الأمد" : "Long-term sustainable transformation" },
  ];

  const s = { card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px" } as React.CSSProperties };

  return (
    <div style={{ background: "var(--v2-bg)", minHeight: "100vh", color: "var(--v2-text)" }}>
      <Navbar />

      {/* Hero */}
      <section className="yi-grid-bg" style={{ background: "var(--v2-bg)", padding: "72px 0 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 480, height: 480, background: "radial-gradient(circle,rgba(212,168,67,0.1) 0%,transparent 65%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}><div className="yi-section-label" style={{ justifyContent: "center", marginBottom: 16 }}>{isRtl ? "برامج الشركات" : "Corporate Programs"}</div></motion.div>
            <motion.h1 variants={fadeUp} style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 20 }}>
              {t("corp.title")}
            </motion.h1>
            <motion.p variants={fadeUp} style={{ fontSize: 17, color: "var(--v2-muted)", lineHeight: 1.72, marginBottom: 36, maxWidth: 540, margin: "0 auto 36px" }}>
              {t("corp.longDesc")}
            </motion.p>
            <motion.div variants={fadeUp}>
              <button className="yi-btn-primary" onClick={() => setIsOpen(true)}>
                {t("hero.cta.corporate")} <ArrowRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px 96px" }}>

        {/* Image + formats split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 64, alignItems: "center" }}>
          <div style={{ borderRadius: 14, overflow: "hidden", position: "relative" }}>
            <img src={workshopImage} alt="Corporate Workshop" style={{ width: "100%", objectFit: "cover", aspectRatio: "4/3", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(8,10,15,0.6) 0%,transparent 50%)" }} />
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}><div className="yi-section-label" style={{ marginBottom: 16 }}>{isRtl ? "صيغ التدريب" : "Training Formats"}</div></motion.div>
            {formats.map((f, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...s.card, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle size={16} style={{ color: "var(--v2-gold)" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Workshop types */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: 64 }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 36 }}>
            <div className="yi-section-label" style={{ marginBottom: 12 }}>{isRtl ? "موضوعات البرامج" : "Workshop Topics"}</div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.025em" }}>
              {isRtl ? "اختر ما يناسب فريقك" : "Choose what fits your team"}
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {workshopTypes.map((w, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="yi-card-shimmer" style={{ padding: 28, height: "100%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--v2-gold)", marginBottom: 16, flexShrink: 0 }}>
                    <w.icon size={18} />
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{w.title}</div>
                  <div style={{ fontSize: 13, color: "var(--v2-muted)", lineHeight: 1.6, marginBottom: 16 }}>{w.desc}</div>
                  <span className="yi-tag-teal">{isRtl ? "المدة:" : "Duration:"} {w.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Audience */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ marginBottom: 64 }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <div className="yi-section-label" style={{ marginBottom: 12 }}>{isRtl ? "من نخدم" : "Who We Serve"}</div>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {audiences.map((a, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div style={{ ...s.card, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(26,191,173,0.1)", border: "1px solid rgba(26,191,173,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--v2-teal)", margin: "0 auto 14px" }}>
                    <a.icon size={20} />
                  </div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 600 }}>{a.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: "linear-gradient(135deg,rgba(212,168,67,0.08) 0%,rgba(26,191,173,0.05) 100%)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 16, padding: "48px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 12 }}>
            {isRtl ? "هل أنت مستعد لتدريب فريقك؟" : "Ready to train your team?"}
          </h2>
          <p style={{ fontSize: 15, color: "var(--v2-muted)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
            {isRtl ? "أرسل لنا طلبك وسنتواصل معك خلال 48 ساعة لمناقشة برنامج مخصص." : "Send us your inquiry and we'll get back to you within 48 hours to discuss a custom program."}
          </p>
          <button className="yi-btn-primary" onClick={() => setIsOpen(true)}>
            {t("hero.cta.corporate")} <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent style={{ background: "var(--v2-bg2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, maxWidth: 500, maxHeight: "90vh", overflowY: "auto", color: "var(--v2-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Syne',sans-serif", color: "var(--v2-text)" }}>{t("form.title")}</DialogTitle>
            <DialogDescription style={{ color: "var(--v2-muted)" }}>{t("form.desc")}</DialogDescription>
          </DialogHeader>
          <WorkshopRequestForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
