import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/navbar";

export default function NotFound() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  return (
    <div style={{ background: "var(--v2-bg)", minHeight: "100vh", color: "var(--v2-text)" }}>
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", padding: "0 32px" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 96, fontWeight: 800, lineHeight: 1, marginBottom: 16 }} className="yi-gold-text">404</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 14 }}>{isRtl ? "الصفحة غير موجودة" : "Page not found"}</h1>
        <p style={{ fontSize: 15, color: "var(--v2-muted)", marginBottom: 36 }}>{isRtl ? "الصفحة التي تبحث عنها غير موجودة." : "The page you're looking for doesn't exist."}</p>
        <Link href="/"><button className="yi-btn-primary">{isRtl ? "العودة للرئيسية" : "Go home"}</button></Link>
      </div>
    </div>
  );
}
