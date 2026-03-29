import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, TrendingUp, Building2, Info, ArrowUpRight, Wallet, PieChart as PieChartIcon, Coins, TrendingDown, Target } from "lucide-react";
import { useState, useMemo } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from "recharts";

export default function Tools() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  
  // ROI State
  const [roiInitial, setRoiInitial] = useState("1000");
  const [roiFinal, setRoiFinal] = useState("1500");
  const roiData = useMemo(() => {
    const i = parseFloat(roiInitial) || 0;
    const f = parseFloat(roiFinal) || 0;
    const profit = f - i;
    const perc = i !== 0 ? (profit / i) * 100 : 0;
    return { profit, perc, initial: i, final: f };
  }, [roiInitial, roiFinal]);

  // Loan State
  const [loanPrincipal, setLoanPrincipal] = useState("25000");
  const [loanRate, setLoanRate] = useState("4.5");
  const [loanTerm, setLoanTerm] = useState("10");
  const loanData = useMemo(() => {
    const p = parseFloat(loanPrincipal) || 0;
    const r = (parseFloat(loanRate) || 0) / 100 / 12;
    const n = (parseFloat(loanTerm) || 0) * 12;
    if (!p || !n) return { monthly: 0, totalPaid: 0, totalInterest: 0, chart: [] };
    
    const monthly = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - p;
    
    return {
      monthly,
      totalPaid,
      totalInterest,
      chart: [
        { name: t("calc.invested"), value: p, color: "#D4A843" },
        { name: t("calc.totalInterest"), value: totalInterest, color: "#1ABFAD" }
      ]
    };
  }, [loanPrincipal, loanRate, loanTerm, t]);

  // Compound Interest State
  const [ciPrincipal, setCiPrincipal] = useState("5000");
  const [ciRate, setCiRate] = useState("7");
  const [ciYears, setCiYears] = useState("20");
  const [ciContrib, setCiContrib] = useState("200");
  const ciData = useMemo(() => {
    const p = parseFloat(ciPrincipal) || 0;
    const r = (parseFloat(ciRate) || 0) / 100;
    const y = parseInt(ciYears) || 0;
    const c = parseFloat(ciContrib) || 0;
    
    const chartData = [];
    let currentBalance = p;
    let totalContrib = p;

    for (let i = 0; i <= y; i++) {
      if (i > 0) {
        // Simple monthly contribution modeling
        for(let m=0; m<12; m++) {
          currentBalance = (currentBalance + c) * (1 + r/12);
          totalContrib += c;
        }
      }
      chartData.push({
        year: i,
        balance: Math.round(currentBalance),
        contributions: Math.round(totalContrib),
        interest: Math.round(currentBalance - totalContrib)
      });
    }

    return {
      finalBalance: currentBalance,
      totalInvested: totalContrib,
      totalInterest: currentBalance - totalContrib,
      chart: chartData
    };
  }, [ciPrincipal, ciRate, ciYears, ciContrib]);
  
  // Zakah State
  const [zakahCash, setZakahCash] = useState("5000");
  const [zakahGold, setZakahGold] = useState("2000");
  const [zakahInvestments, setZakahInvestments] = useState("10000");
  const [zakahBusiness, setZakahBusiness] = useState("0");
  const [zakahDebts, setZakahDebts] = useState("500");

  const zakahData = useMemo(() => {
    const cash = parseFloat(zakahCash) || 0;
    const gold = parseFloat(zakahGold) || 0;
    const inv = parseFloat(zakahInvestments) || 0;
    const biz = parseFloat(zakahBusiness) || 0;
    const debts = parseFloat(zakahDebts) || 0;
    
    const assets = cash + gold + inv + biz;
    const eligible = Math.max(0, assets - debts);
    const amount = eligible * 0.025;

    return {
      assets,
      eligible,
      amount,
      chart: [
        { name: t("calc.zakah.cash"), value: cash, color: "#D4A843" },
        { name: t("calc.zakah.gold"), value: gold, color: "#1ABFAD" },
        { name: t("calc.zakah.investments"), value: inv, color: "#6366f1" },
        { name: t("calc.zakah.business"), value: biz, color: "#f43f5e" }
      ].filter(item => item.value > 0)
    };
  }, [zakahCash, zakahGold, zakahInvestments, zakahBusiness, zakahDebts, t]);
  
  // Inflation State
  const [infAmount, setInfAmount] = useState("1000");
  const [infRate, setInfRate] = useState("3");
  const [infYears, setInfYears] = useState("10");
  
  const infData = useMemo(() => {
    const amount = parseFloat(infAmount) || 0;
    const rate = (parseFloat(infRate) || 0) / 100;
    const years = parseInt(infYears) || 0;
    
    const chart = [];
    for (let i = 0; i <= years; i++) {
      const realValue = amount / Math.pow(1 + rate, i);
      chart.push({
        year: i,
        realValue: Math.round(realValue),
        loss: Math.round(amount - realValue)
      });
    }
    
    const finalValue = amount / Math.pow(1 + rate, years);
    return { finalValue, loss: amount - finalValue, chart };
  }, [infAmount, infRate, infYears]);

  // Savings State
  const [savTarget, setSavTarget] = useState("50000");
  const [savInitial, setSavInitial] = useState("5000");
  const [savMonthly, setSavMonthly] = useState("500");
  const [savRate, setSavRate] = useState("5");
  
  const savData = useMemo(() => {
    const target = parseFloat(savTarget) || 0;
    const initial = parseFloat(savInitial) || 0;
    const monthly = parseFloat(savMonthly) || 0;
    const rate = (parseFloat(savRate) || 0) / 100 / 12;
    
    let current = initial;
    let months = 0;
    const chart = [];
    
    while (current < target && months < 600) { // Limit to 50 years
      current = (current + monthly) * (1 + rate);
      months++;
      if (months % 12 === 0 || current >= target) {
        chart.push({
          year: Math.ceil(months / 12),
          balance: Math.round(current)
        });
      }
    }
    
    return { months, years: months / 12, chart, achieved: current >= target };
  }, [savTarget, savInitial, savMonthly, savRate]);

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#dfe2eb] font-sans selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 text-primary">
              <Calculator className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary/80">
                {isRtl ? "أدوات ذكية" : "Sovereign Tools"}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1] yi-gradient-text" style={{ fontFamily: "'Syne', sans-serif" }}>
              {t("tools.page.title")}
            </h1>
            
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto">
              {t("tools.page.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-32 relative">
        <div className="container px-4 mx-auto max-w-6xl">
          <Tabs defaultValue="roi" className="space-y-12">
            <div className="flex justify-center">
              <TabsList className="inline-flex bg-white/5 border border-white/10 p-1.5 h-14 rounded-2xl backdrop-blur-xl">
                {[
                  { val: "roi", label: t("tools.roi.title"), icon: TrendingUp },
                  { val: "loan", label: t("tools.loan.title"), icon: Building2 },
                  { val: "compound", label: t("tools.compound.title"), icon: ArrowUpRight },
                  { val: "zakah", label: t("tools.zakah.title"), icon: Coins },
                  { val: "inflation", label: t("tools.inflation.title"), icon: TrendingDown },
                  { val: "savings", label: t("tools.savings.title"), icon: Target },
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.val} 
                    value={tab.val} 
                    className="px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-bold tracking-tight transition-all duration-300 flex items-center gap-2"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="roi" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid lg:grid-cols-5 gap-8"
                >
                  {/* Inputs */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="yi-glass p-8 space-y-8 h-full">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{t("tools.roi.title")}</h2>
                        <p className="text-sm text-muted-foreground/70">{t("tools.roi.desc")}</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold tracking-[.2em] uppercase text-primary ml-1">{t("calc.initial")} (OMR)</Label>
                          <Input type="number" value={roiInitial} onChange={e => setRoiInitial(e.target.value)} className="yi-input-dark h-14 text-xl font-bold" />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold tracking-[.2em] uppercase text-primary ml-1">{t("calc.final")} (OMR)</Label>
                          <Input type="number" value={roiFinal} onChange={e => setRoiFinal(e.target.value)} className="yi-input-dark h-14 text-xl font-bold" />
                        </div>
                      </div>

                      <div className="pt-4 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground/60 leading-relaxed">
                          {isRtl ? "يتم تحديث النتائج تلقائيًا أثناء تغيير القيم." : "Results update automatically as you change input values."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="yi-glass p-8 md:p-12 h-full flex flex-col justify-center text-center">
                      <span className="text-[10px] font-bold tracking-[.4em] uppercase text-muted-foreground/40 mb-4 block">{t("calc.result")}</span>
                      
                      <div className="space-y-2 mb-12">
                        <div className={`text-7xl md:text-8xl font-bold tracking-tighter ${roiData.perc >= 0 ? 'text-[#1ABFAD]' : 'text-red-400'}`} style={{ fontFamily: "'Syne', sans-serif" }}>
                          {roiData.perc >= 0 ? '+' : ''}{roiData.perc.toFixed(2)}%
                        </div>
                        <div className="text-2xl font-bold text-white/90">
                          {roiData.profit >= 0 ? '+' : ''}{roiData.profit.toLocaleString()} <span className="text-sm font-medium text-white/40">OMR</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                          <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">{t("calc.initial")}</span>
                          <span className="text-lg font-bold">{roiData.initial.toLocaleString()}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                          <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">{t("calc.final")}</span>
                          <span className="text-lg font-bold">{roiData.final.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="loan" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid lg:grid-cols-5 gap-8"
                >
                  <div className="lg:col-span-2 space-y-6">
                    <div className="yi-glass p-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{t("tools.loan.title")}</h2>
                        <p className="text-sm text-muted-foreground/70">{t("tools.loan.desc")}</p>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.principal")} (OMR)</Label>
                          <Input value={loanPrincipal} onChange={e => setLoanPrincipal(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.rate")} (%)</Label>
                            <Input value={loanRate} onChange={e => setLoanRate(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.term")} (Yr)</Label>
                            <Input value={loanTerm} onChange={e => setLoanTerm(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="yi-glass p-6 bg-primary/5 border-primary/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-primary/60 block">{t("calc.monthly")}</span>
                          <span className="text-2xl font-bold text-white leading-none">
                            {loanData.monthly.toFixed(3)} <span className="text-xs font-medium text-white/40">OMR</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-6">
                    <div className="yi-glass p-8 flex flex-col md:flex-row items-center gap-8 h-full">
                      <div className="w-full h-[240px] md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={loanData.chart}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {loanData.chart.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="w-full md:w-1/2 space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold uppercase tracking-[.2em] text-muted-foreground/50">{t("calc.breakdown")}</h3>
                          <div className="h-px bg-white/5 w-full" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">{t("calc.invested")}</span>
                            </div>
                            <span className="font-bold">{(parseFloat(loanPrincipal)||0).toLocaleString()} <span className="text-[10px] text-muted-foreground">OMR</span></span>
                          </div>
                          <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-secondary" />
                              <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">{t("calc.totalInterest")}</span>
                            </div>
                            <span className="font-bold">{loanData.totalInterest.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px] text-muted-foreground">OMR</span></span>
                          </div>
                          <div className="pt-2 flex justify-between items-center border-t border-white/5">
                            <span className="text-sm font-bold text-white">{t("calc.totalPaid")}</span>
                            <span className="text-xl font-black text-primary">{loanData.totalPaid.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="compound" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Inputs Row */}
                  <div className="yi-glass p-8">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.principal")} (OMR)</Label>
                        <Input value={ciPrincipal} onChange={e => setCiPrincipal(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.rate")} (%)</Label>
                        <Input value={ciRate} onChange={e => setCiRate(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.years")}</Label>
                        <Input value={ciYears} onChange={e => setCiYears(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.contribution")} (OMR/mo)</Label>
                        <Input value={ciContrib} onChange={e => setCiContrib(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2 yi-glass p-8 min-h-[400px]">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          {t("calc.growth")}
                        </h3>
                      </div>
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={ciData.chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4A843" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                              dataKey="year" 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.3)" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={false}
                              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#D4A843" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorBalance)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="contributions" 
                              stroke="rgba(255,255,255,0.2)" 
                              strokeWidth={2}
                              fill="transparent" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Final Result Card */}
                    <div className="space-y-6">
                      <div className="yi-glass p-8 flex flex-col justify-center h-full text-center">
                        <span className="text-[10px] font-bold tracking-[.3em] uppercase text-primary/60 mb-4 block">{t("calc.futureVal")}</span>
                        <div className="text-5xl font-black mb-8 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {ciData.finalBalance.toLocaleString(undefined, {maximumFractionDigits:0})}
                          <span className="text-sm font-medium text-white/40 block mt-2 tracking-normal uppercase">Omani Rial</span>
                        </div>

                        <div className="space-y-4 w-full">
                          <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-xs font-semibold text-muted-foreground">{t("calc.invested")}</span>
                            <span className="font-bold">{ciData.totalInvested.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                            <span className="text-xs font-semibold text-secondary">{t("calc.interestEarned")}</span>
                            <span className="font-bold text-secondary">{ciData.totalInterest.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="zakah" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid lg:grid-cols-5 gap-8"
                >
                  <div className="lg:col-span-2 space-y-6">
                    <div className="yi-glass p-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{t("tools.zakah.title")}</h2>
                        <p className="text-sm text-muted-foreground/70">{t("tools.zakah.desc")}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.zakah.cash")}</Label>
                          <Input value={zakahCash} onChange={e => setZakahCash(e.target.value)} className="yi-input-dark h-11 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.zakah.gold")}</Label>
                          <Input value={zakahGold} onChange={e => setZakahGold(e.target.value)} className="yi-input-dark h-11 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.zakah.investments")}</Label>
                          <Input value={zakahInvestments} onChange={e => setZakahInvestments(e.target.value)} className="yi-input-dark h-11 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.zakah.business")}</Label>
                          <Input value={zakahBusiness} onChange={e => setZakahBusiness(e.target.value)} className="yi-input-dark h-11 font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-red-400 ml-1">{t("calc.zakah.debts")}</Label>
                          <Input value={zakahDebts} onChange={e => setZakahDebts(e.target.value)} className="yi-input-dark h-11 font-bold border-red-500/20 focus:border-red-500/50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-6">
                    <div className="yi-glass p-8 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-bold tracking-[.4em] uppercase text-primary/60 mb-4 block">{t("calc.zakah.amount")}</span>
                      <div className="text-6xl md:text-7xl font-black text-primary mb-8 leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {zakahData.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        <span className="text-sm font-medium text-white/40 block mt-2 tracking-normal uppercase">Omani Rial</span>
                      </div>

                      <div className="w-full grid md:grid-cols-2 gap-8 items-center mt-4">
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={zakahData.chart}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {zakahData.chart.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="space-y-4 text-left">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">{t("calc.zakah.eligible")}</span>
                            <span className="text-lg font-bold">{zakahData.eligible.toLocaleString()} <span className="text-xs text-muted-foreground">OMR</span></span>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground/80 leading-relaxed italic">
                              {isRtl 
                                ? "يتم احتساب الزكاة بنسبة 2.5٪ على الثروة التي حالت عليها الحول وبلغت النصاب." 
                                : "Zakah is calculated at a rate of 2.5% on wealth held for one lunar year that exceeds the Nisab threshold."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="inflation" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid lg:grid-cols-5 gap-8"
                >
                  <div className="lg:col-span-2 space-y-6">
                    <div className="yi-glass p-8 space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{t("tools.inflation.title")}</h2>
                        <p className="text-sm text-muted-foreground/70">{t("tools.inflation.desc")}</p>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.inflation.current")} (OMR)</Label>
                          <Input type="number" value={infAmount} onChange={e => setInfAmount(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.inflation.rate")} (%)</Label>
                            <Input type="number" value={infRate} onChange={e => setInfRate(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.term")} (Yr)</Label>
                            <Input type="number" value={infYears} onChange={e => setInfYears(e.target.value)} className="yi-input-dark h-12 text-lg font-bold" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="yi-glass p-6 bg-red-500/5 border-red-500/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                          <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-red-500/60 block">{t("calc.inflation.loss")}</span>
                          <span className="text-2xl font-bold text-white leading-none">
                            {infData.loss.toLocaleString()} <span className="text-xs font-medium text-white/40">OMR</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-6">
                    <div className="yi-glass p-8 flex flex-col h-full">
                      <div className="text-center mb-8">
                        <span className="text-[10px] font-bold tracking-[.4em] uppercase text-primary/60 mb-2 block">{t("calc.inflation.future")}</span>
                        <div className="text-5xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                          {infData.finalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          <span className="text-sm font-medium text-white/40 block mt-1 tracking-normal uppercase">Omani Rial</span>
                        </div>
                      </div>

                      <div className="flex-1 min-h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={infData.chart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                              itemStyle={{ color: '#D4A843' }}
                            />
                            <Line type="monotone" dataKey="realValue" stroke="#D4A843" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#D4A843', stroke: '#0D1117', strokeWidth: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="savings" className="mt-0 focus-visible:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="yi-glass p-8">
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.savings.target")} (OMR)</Label>
                        <Input type="number" value={savTarget} onChange={e => setSavTarget(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.savings.initial")} (OMR)</Label>
                        <Input type="number" value={savInitial} onChange={e => setSavInitial(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.savings.monthly")} (OMR)</Label>
                        <Input type="number" value={savMonthly} onChange={e => setSavMonthly(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase text-primary ml-1">{t("calc.rate")} (%)</Label>
                        <Input type="number" value={savRate} onChange={e => setSavRate(e.target.value)} className="yi-input-dark h-12 font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 yi-glass p-8 min-h-[400px]">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          {t("calc.growth")}
                        </h3>
                        <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                          {t("calc.savings.target")}: {parseFloat(savTarget).toLocaleString()} OMR
                        </div>
                      </div>
                      <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={savData.chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorSav" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1ABFAD" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#1ABFAD" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#1ABFAD" strokeWidth={3} fillOpacity={1} fill="url(#colorSav)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="yi-glass p-8 flex flex-col justify-center text-center">
                      <span className="text-[10px] font-bold tracking-[.3em] uppercase text-primary/60 mb-4 block">{t("calc.savings.time")}</span>
                      {savData.achieved ? (
                        <div className="space-y-4">
                          <div className="text-6xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {Math.floor(savData.years)} <span className="text-xl text-white/40 uppercase">{t("calc.savings.years")}</span>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            {savData.months % 12} <span className="text-sm font-medium text-white/40 uppercase">{t("calc.savings.months")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-red-400">
                          {isRtl ? "الهدف بعيد جداً بالمعدل الحالي" : "Goal requires more than 50 years at current rate"}
                        </div>
                      )}
                      
                      <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("calc.savings.remaining")}</span>
                          <span className="font-bold">{(parseFloat(savTarget) - parseFloat(savInitial)).toLocaleString()} OMR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
