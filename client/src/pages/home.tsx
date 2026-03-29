import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import {
  BookOpen, Users, Building2, CheckCircle,
  Video, Camera, Share2, Instagram, Youtube, Twitter, Linkedin,
  ArrowRight, Shield, Clock, Zap, Star, Quote, TrendingUp, Award,
  CalendarClock, Gift,
} from "lucide-react";
import { Link } from "wouter";
import { WorkshopRequestForm } from "@/components/workshop-request-form";
import { FinancialHealthAssessment } from "@/components/financial-health-assessment";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/* ── SVG ring helper ── */
function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle className="yi-ring-track" cx={size / 2} cy={size / 2} r={r} />
      <circle
        fill="none"
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);

  interface Service {
    icon: any;
    title: string;
    desc: string;
    features: string[];
    link?: string;
    onClick?: () => void;
    linkText: string;
  }

  const services: Service[] = [
    {
      icon: BookOpen,
      title: t("course.title"),
      desc: t("course.desc"),
      features: [t("course.feat1"), t("course.feat2"), t("course.feat3")],
      link: "/courses",
      linkText: t("nav.learn"),
    },
    {
      icon: Users,
      title: t("consult.title"),
      desc: t("consult.desc"),
      features: [t("consult.feat1"), t("consult.feat2"), t("consult.feat3")],
      link: "/consultations",
      linkText: t("nav.consultations"),
    },
    {
      icon: Building2,
      title: t("corp.title"),
      desc: t("corp.desc"),
      features: [t("corp.feat1"), t("corp.feat2"), t("corp.feat3")],
      onClick: () => setIsWorkshopOpen(true),
      linkText: t("nav.corporate"),
    },
  ];


  const testimonials = [
    {
      name: "Mohammed Al-Balushi",
      role: t("testimonials.role1"),
      text: t("testimonials.text1"),
      result: t("testimonials.result1"),
      avatar: "https://i.pravatar.cc/100?u=101",
    },
    {
      name: "Fatima Al-Rawahi",
      role: t("testimonials.role2"),
      text: t("testimonials.text2"),
      result: t("testimonials.result2"),
      avatar: "https://i.pravatar.cc/100?u=202",
    },
    {
      name: "Khalid Al-Amri",
      role: t("testimonials.role3"),
      text: t("testimonials.text3"),
      result: t("testimonials.result3"),
      avatar: "https://i.pravatar.cc/100?u=303",
    },
  ];

  const rings = [
    { label: t("score.savings"),   pct: 80, color: "#D4A843" },
    { label: t("score.investing"), pct: 45, color: "#1ABFAD" },
    { label: t("score.debt"),         pct: 90, color: "#D4A843" },
    { label: t("score.planning"),    pct: 60, color: "#1ABFAD" },
  ];

  return (
    <div style={{ background: "var(--v2-bg)", color: "var(--v2-text)", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <Navbar />

      <main className="pt-20">
        {/* Section 1: Hero Area */}
        <section className="relative px-8 lg:px-20 mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[85vh]">
          <motion.div 
            initial="hidden" animate="visible" variants={stagger}
            className="lg:col-span-7"
          >
            <motion.div variants={fadeUp}>
              <span className="font-sans uppercase tracking-widest text-[#f2ca50] text-[10px] sm:text-xs font-bold mb-4 block">
                {t("hero.badge")}
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp}
              className="font-serif text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-[#e5e2e1]"
            >
              {t("hero.title.part1")} <br/> <span className="text-[#f2ca50] italic">{t("hero.title.part2")}</span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="font-sans text-lg lg:text-xl text-[#d0c5af] max-w-xl mb-12 leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 mb-12">
              <Link href="/courses">
                <button className="bg-[#d4af37] hover:bg-[#f2ca50] text-[#3c2f00] font-bold px-10 py-4 rounded-md shadow-xl transition-all flex items-center gap-2">
                  {t("hero.cta.courses")}
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/consultations">
                <button className="glass-panel border border-[#4d4635]/20 text-[#e5e2e1] font-semibold px-10 py-4 rounded-md hover:bg-[#3a3939]/50 transition-all">
                  {t("hero.cta.consult")}
                </button>
              </Link>
            </motion.div>

            {/* Metrics */}
            <motion.div variants={fadeUp} className="flex items-center gap-10">
               <div>
                  <div className="font-serif text-2xl font-bold text-white">248+</div>
                  <div className="text-[10px] text-[#d0c5af] uppercase tracking-widest mt-1">{t("hero.metrics.students")}</div>
               </div>
               <div className="w-[1px] h-8 bg-[#4d4635]/20" />
               <div>
                  <div className="font-serif text-2xl font-bold text-white">4.9</div>
                  <div className="text-[10px] text-[#d0c5af] uppercase tracking-widest mt-1">{t("hero.metrics.rating")}</div>
               </div>
               <div className="w-[1px] h-8 bg-[#4d4635]/20" />
               <div>
                  <div className="font-serif text-2xl font-bold text-white">34</div>
                  <div className="text-[10px] text-[#d0c5af] uppercase tracking-widest mt-1">{t("hero.metrics.sessions")}</div>
               </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            {/* Financial Health Score Card */}
            <div className="glass-panel border border-[#4d4635]/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#76d6d5]/10 blur-[80px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#f2ca50]/10 blur-[80px] rounded-full"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="font-sans text-[#d0c5af] text-[10px] font-bold tracking-widest uppercase mb-1">{t("score.badge")}</h3>
                    <p className="font-serif text-3xl font-bold text-white">{t("score.title")}</p>
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-[#76d6d5]/10 flex flex-col items-center justify-center relative bg-[#1c1b1b]/50 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <span className="font-serif text-3xl font-black text-[#76d6d5] leading-none mb-1">72</span>
                    <span className="text-[10px] font-sans font-bold text-[#d0c5af]/60 tracking-tighter" dir="ltr">/ 100</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle 
                        className="text-[#76d6d5]" 
                        cx="48" cy="48" fill="none" r="44" 
                        stroke="currentColor" 
                        strokeDasharray="276.46" 
                        strokeDashoffset="77.4" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px rgba(118, 214, 213, 0.3))" }}
                      ></circle>
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {rings.map((r, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="font-sans text-[9px] font-bold tracking-widest text-[#d0c5af]/80 uppercase">{r.label}</span>
                        <span className="text-xs font-bold text-[#76d6d5]">{r.pct}%</span>
                      </div>
                      <div className="h-1 w-full bg-[#1c1b1b] rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-[#76d6d5] to-[#1ABFAD] shadow-[0_0_10px_rgba(118,214,213,0.2)]" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1c1b1b] bg-[#2a2a2a] ring-1 ring-white/10 flex items-center justify-center overflow-hidden transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                        <img className="w-full h-full object-cover" src={`https://i.pravatar.cc/100?u=${i + 12}`} alt="user" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-[#1c1b1b] bg-[#2a2a2a] ring-1 ring-white/10 flex items-center justify-center text-[10px] font-bold text-[#76d6d5] hover:bg-[#333] transition-colors">+32</div>
                  </div>
                  <span className="text-[9px] font-bold text-[#d0c5af]/40 uppercase tracking-widest">{t("score.members")}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Trust Bar */}
        <section className="px-8 lg:px-20 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-white/5 rounded-2xl bg-[#0f1118] px-8 py-6 flex flex-wrap items-center justify-between gap-6"
          >
            {[
              { value: "248+", label: t("trust.stat1") },
              { value: "4.9★", label: t("trust.stat2") },
              { value: "34",   label: t("trust.stat3") },
              { value: "12K+", label: t("trust.stat4") },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/5" />}
                <div>
                  <div className="font-serif text-2xl font-black text-[#f2ca50]">{s.value}</div>
                  <div className="text-[10px] text-[#d0c5af]/60 uppercase tracking-widest font-bold">{s.label}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[#1ABFAD] text-xs font-semibold">
              <Shield size={14} />
              {t("trust.badge")}
            </div>
          </motion.div>
        </section>

        {/* Section 2: Start Your Journey */}
        <section className="px-8 lg:px-20 mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1c1b1b] rounded-[3rem] p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12 border border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#76d6d5]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 group-hover:bg-[#76d6d5]/10 transition-colors duration-1000" />
            <div className="max-w-2xl relative z-10">
              <h2 className="font-serif text-5xl lg:text-6xl font-black mb-8 text-[#e5e2e1] tracking-tight leading-tight">
                {t("journey.title.part1")} <br /> <span className="text-[#76d6d5] italic">{t("journey.title.part2")}</span>
              </h2>
              <p className="font-sans text-xl text-[#d0c5af]/80 mb-10 leading-relaxed max-w-xl">
                {t("journey.desc")}
              </p>
              <div className="flex flex-col gap-4">
                <FinancialHealthAssessment />
              </div>
            </div>
            <div className="flex-shrink-0 relative z-10 w-full lg:w-auto">
              <div className="p-10 glass-panel border border-white/10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent shadow-2xl text-center group-hover:border-[#76d6d5]/30 transition-all duration-500">
                 <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="text-[#f2ca50] w-6 h-6 animate-pulse" />
                    <div className="text-5xl font-serif font-black text-[#f2ca50] tracking-tighter" dir="ltr">2 min</div>
                 </div>
                 <div className="text-[10px] text-[#d0c5af] uppercase tracking-[0.2em] font-black opacity-60 group-hover:opacity-100 transition-opacity">{t("journey.estTime")}</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 3: My Services Grid */}
        <section className="px-8 lg:px-20 mb-40">
          <div className="mb-16">
            <h2 className="font-serif text-4xl font-bold mb-4 text-white">{t("services.title")}</h2>
            <div className="h-1 w-24 bg-[#d4af37]"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel border border-[#4d4635]/10 rounded-xl p-10 hover:border-[#f2ca50]/30 transition-all group flex flex-col"
              >
                <div className="w-16 h-16 rounded-lg bg-[#f2ca50]/10 flex items-center justify-center mb-8 text-[#f2ca50] group-hover:scale-110 transition-transform">
                  <service.icon size={32} />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4 text-white">{service.title}</h3>
                <p className="text-[#d0c5af] text-sm mb-6 leading-relaxed flex-1">{service.desc}</p>
                {i === 1 && (
                  <div className="flex items-center gap-2 mb-6 bg-[#f2ca50]/8 border border-[#f2ca50]/15 rounded-lg px-3 py-2">
                    <CalendarClock size={13} className="text-[#f2ca50] flex-shrink-0" />
                    <span className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-wider">{t("consult.urgency")}</span>
                  </div>
                )}
                {service.link ? (
                  <Link href={service.link}>
                    <button className="font-sans uppercase tracking-widest font-bold text-[#f2ca50] text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
                      {service.linkText} <ArrowRight size={14} />
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={service.onClick}
                    className="font-sans uppercase tracking-widest font-bold text-[#f2ca50] text-[10px] flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    {service.linkText} <ArrowRight size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3b: Testimonials */}
        <section className="px-8 lg:px-20 mb-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <h2 className="font-serif text-4xl font-bold text-white mb-3">{t("testimonials.title")}</h2>
              <div className="h-1 w-24 bg-[#d4af37]" />
            </div>
            <p className="text-[#d0c5af] text-sm max-w-xs">{t("testimonials.subtitle")}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-panel border border-white/5 rounded-2xl p-8 flex flex-col gap-6 hover:border-[#f2ca50]/20 transition-all"
              >
                <Quote size={28} className="text-[#f2ca50]/30" />
                <p className="text-[#d0c5af] text-sm leading-relaxed flex-1 italic">"{t_.text}"</p>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} className="fill-[#f2ca50] text-[#f2ca50]" />
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <img src={t_.avatar} alt={t_.name} className="w-10 h-10 rounded-full ring-2 ring-[#f2ca50]/20 object-cover" />
                  <div>
                    <div className="font-semibold text-white text-sm">{t_.name}</div>
                    <div className="text-[10px] text-[#d0c5af]/60 uppercase tracking-widest">{t_.role}</div>
                  </div>
                  <div className="ms-auto">
                    <span className="bg-[#1ABFAD]/10 border border-[#1ABFAD]/20 text-[#1ABFAD] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      {t_.result}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4: Media & Collaboration */}
        <section className="px-8 lg:px-20 mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl group"
            >
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop" 
                alt="Media" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-[#f2ca50]/90 text-[#3c2f00] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <Video size={32} />
                </button>
              </div>
              <div className="absolute bottom-6 left-6">
                <span className="bg-[#76d6d5]/20 backdrop-blur-md text-[#76d6d5] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                  {t("media.badge")}
                </span>
                <p className="text-xl font-serif font-bold text-white">
                  {t("media.reportTitle")}
                </p>
              </div>
            </motion.div>

            <div className="space-y-8">
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white">
                {t("media.title.part1")} <span className="text-[#f2ca50]">{t("media.title.part2")}</span>
              </h2>
              <p className="text-lg text-[#d0c5af] leading-relaxed">
                {t("media.desc")}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-[#201f1f] rounded-lg border border-[#4d4635]/5">
                  <h4 className="font-serif font-bold text-2xl mb-1 text-white">50K+</h4>
                  <p className="text-[10px] text-[#d0c5af] uppercase tracking-widest font-bold">{t("media.metrics.learners")}</p>
                </div>
                <div className="p-6 bg-[#201f1f] rounded-lg border border-[#4d4635]/5">
                  <h4 className="font-serif font-bold text-2xl mb-1 text-white">12M+</h4>
                  <p className="text-[10px] text-[#d0c5af] uppercase tracking-widest font-bold">{t("media.metrics.views")}</p>
                </div>
              </div>
              <div className="flex items-center gap-8 pt-4">
                {[
                  { icon: Youtube, label: "YouTube" },
                  { icon: Video,   label: t("media.hub") },
                  { icon: Share2,  label: t("media.socials") }
                ].map((s, idx) => (
                  <a key={idx} className="text-[#d0c5af] hover:text-[#f2ca50] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest" href="#">
                    <s.icon size={16} /> {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Newsletter + Lead Magnet */}
        <section className="px-8 lg:px-20 mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass-panel rounded-[3rem] border border-[#4d4635]/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <BookOpen size={200} className="text-[#f2ca50]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left: Lead Magnet */}
              <div className="p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="inline-flex items-center gap-2 bg-[#f2ca50]/10 border border-[#f2ca50]/20 text-[#f2ca50] text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                  <Gift size={12} />
                  {t("newsletter.freeLabel")}
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-4 leading-tight">
                  {t("newsletter.leadmagnet.title")}
                </h3>
                <p className="text-[#d0c5af] text-sm leading-relaxed mb-6">
                  {t("newsletter.leadmagnet.desc")}
                </p>
                <ul className="space-y-3">
                  {[1, 2, 3].map(n => (
                    <li key={n} className="flex items-start gap-3 text-sm text-[#d0c5af]">
                      <CheckCircle size={15} className="text-[#1ABFAD] mt-0.5 flex-shrink-0" />
                      {t(`newsletter.leadmagnet.point${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Form */}
              <div className="p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="font-serif text-2xl font-bold mb-2 text-white">
                  {t("newsletter.badge")}
                </h2>
                <p className="text-[#d0c5af] text-sm mb-8">
                  {t("newsletter.desc")}
                </p>
                <form className="flex flex-col gap-4 relative z-10">
                  <Input
                    className="bg-[#0e0e0e] border border-[#4d4635]/20 rounded-md px-6 py-6 text-[#e5e2e1] focus:ring-[#76d6d5]"
                    placeholder={t("newsletter.placeholder")}
                    type="email"
                  />
                  <button className="bg-[#d4af37] text-[#3c2f00] font-black px-8 py-4 rounded-md hover:bg-[#f2ca50] transition-colors flex items-center justify-center gap-2">
                    {t("newsletter.btn")}
                    <ArrowRight size={16} />
                  </button>
                </form>
                <p className="mt-6 text-[10px] text-[#d0c5af] uppercase tracking-widest font-bold opacity-30">
                  {t("newsletter.members")}
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="bg-[#0e0e0e] py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-serif font-black text-[#f2ca50] mb-6 tracking-tighter uppercase">Yusuf Invest</div>
              <p className="text-[#d0c5af] text-sm max-w-xs leading-relaxed opacity-60">
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-[0.2em] mb-6">{t("payment.selectMethod")}</h4>
              <ul className="space-y-4">
                <li><Link href="/courses" className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">{t("nav.learn")}</Link></li>
                <li><Link href="/consultations" className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">{t("nav.consultations")}</Link></li>
                <li><button onClick={() => setIsWorkshopOpen(true)} className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">{t("nav.corporate")}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-[#f2ca50] uppercase tracking-[0.2em] mb-6">{t("media.socials")}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">YouTube</a></li>
                <li><a href="#" className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm text-[#d0c5af] hover:text-[#f2ca50] transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-[#d0c5af] opacity-40 uppercase tracking-widest">{t("footer.rights")}</p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] text-[#d0c5af] opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-[10px] text-[#d0c5af] opacity-40 hover:opacity-100 transition-opacity uppercase tracking-widest">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Workshop Dialog */}
      <Dialog open={isWorkshopOpen} onOpenChange={setIsWorkshopOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-[#131313] border-[#4d4635]/20 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#f2ca50]">{t("form.title")}</DialogTitle>
            <DialogDescription className="text-[#d0c5af]">{t("form.desc")}</DialogDescription>
          </DialogHeader>
          <WorkshopRequestForm onSuccess={() => setIsWorkshopOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );

}
