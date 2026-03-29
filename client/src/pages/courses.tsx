import { Navbar } from "@/components/navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Users, Clock, PlayCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Course } from "@shared/schema";
import { useLocalizedCourse } from "@/hooks/use-localized";
import { useState } from "react";
const imgBasics = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgStocks = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgPortfolio = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

const courseImages: Record<string, string> = {
  "Personal Finance": imgBasics, "Investing": imgStocks, "Strategy": imgPortfolio,
};

const S: React.CSSProperties = {};

export default function Courses() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const { localize } = useLocalizedCourse();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => { const r = await fetch("/api/courses"); if (!r.ok) throw new Error("Failed"); return r.json(); },
  });

  const filtered = courses.filter(c => {
    const loc = localize(c);
    const matchSearch = !search || loc.title.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "all" || c.level.toLowerCase() === level;
    return matchSearch && matchLevel;
  });

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#dfe2eb] font-sans selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="container px-4 mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <PlayCircle className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wider uppercase text-primary/80">
                {isRtl ? "مكتبة الدورات" : "Course Library"}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "'Syne', sans-serif" }}>
              {t("courses.page.title")}
            </h1>
            
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto">
              {t("courses.page.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 py-6 bg-[#080A0F]/60 backdrop-blur-xl border-y border-white/5">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center max-w-5xl mx-auto">
            <div className="relative flex-1 group w-full">
              <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary`} />
              <Input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder={isRtl ? "ابحث عن دورة..." : "Search courses..."} 
                className={`bg-white/5 border-white/10 ${isRtl ? 'pr-11' : 'pl-11'} h-12 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all`}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 h-12 rounded-2xl focus:border-primary/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#10141a] border-white/10 text-[#dfe2eb]">
                  <SelectItem value="all">{t("courses.filter.all")}</SelectItem>
                  <SelectItem value="beginner">{t("courses.filter.beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("courses.filter.intermediate")}</SelectItem>
                  <SelectItem value="advanced">{t("courses.filter.advanced")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-20 relative">
        <div className="container px-4 mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {filtered.map((rawCourse, i) => {
                const course = localize(rawCourse);
                const img = (rawCourse as any).image || courseImages[rawCourse.category] || imgBasics;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                  >
                    <Link href={`/courses/${course.id}`}>
                      <div className="group relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent hover:from-primary/20 transition-all duration-500 h-full cursor-pointer">
                        <div className="bg-[#0D1117]/90 backdrop-blur-xl rounded-[2.4rem] overflow-hidden border border-white/5 h-full flex flex-col">
                          {/* Image Thumbnail */}
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img 
                              src={img} 
                              alt={course.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent opacity-60" />
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
                                {course.category}
                              </span>
                            </div>
                          </div>

                          <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase border ${
                                course.level.toLowerCase() === 'advanced' ? 'bg-primary/10 text-primary border-primary/20' :
                                course.level.toLowerCase() === 'intermediate' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                'bg-white/5 text-muted-foreground border-white/10'
                              }`}>
                                {course.level}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                <Users className="w-3 h-3" />
                                {rawCourse.students.toLocaleString()}
                              </div>
                            </div>

                            <h3 className="text-xl font-bold mb-4 tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                              {course.title}
                            </h3>

                            <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase mb-8">
                              <span className="flex items-center gap-1.5">
                                <PlayCircle className="w-3.5 h-3.5" />
                                {rawCourse.lessons} {t("courses.card.lessons")}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {course.duration}
                              </span>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase mb-1">
                                  {isRtl ? "سعر الدورة" : "Course Price"}
                                </span>
                                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent" style={{ fontFamily: "'Syne', sans-serif" }}>
                                  {rawCourse.price} OMR
                                </span>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(242,195,91,0.3)]">
                                <motion.span 
                                  animate={{ x: [0, 2, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className={`text-lg font-bold ${isRtl ? 'rotate-180' : ''}`}
                                >
                                  →
                                </motion.span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <Search className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-xl font-bold text-muted-foreground/60" style={{ fontFamily: "'Syne', sans-serif" }}>
                {isRtl ? "لا توجد دورات مطابقة لخيارات البحث" : "No courses match your criteria"}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
