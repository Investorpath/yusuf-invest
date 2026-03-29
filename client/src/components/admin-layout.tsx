import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  BarChart3,
  CreditCard,
  UserCheck,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/auth");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/consultation-types", label: "Consultations", icon: UserCheck },
    { href: "/admin/consultation-availability", label: "Availability", icon: Clock },
    { href: "/admin/requests", label: "Requests", icon: MessageSquare },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--v2-bg)", color: "var(--v2-text)" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 text-white border-r" style={{ background: "var(--v2-bg2)", borderColor: "var(--v2-border)" }}>
        <div className="p-6" style={{ borderBottom: "1px solid var(--v2-border)" }}>
          <h1 className="font-serif text-xl font-bold tracking-tight" style={{ background: "linear-gradient(135deg,#EBCE7C,#D4A843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Yusuf Invest</h1>
          <p className="text-xs mt-1" style={{ color: "var(--v2-muted)" }}>Admin Console</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "text-[#080A0F]"
                    : "hover:text-white"
                )}
                style={isActive
                  ? { background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F" }
                  : { color: "rgba(255,255,255,0.45)" }
                }
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid var(--v2-border)" }}>
          <Button
            variant="ghost"
            className="w-full justify-start hover:text-white hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Sidebar Overlay */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 text-white flex items-center justify-between px-4" style={{ background: "var(--v2-bg2)", borderBottom: "1px solid var(--v2-border)" }}>
           <span className="font-serif font-bold" style={{ background: "linear-gradient(135deg,#EBCE7C,#D4A843)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Yusuf Invest Admin</span>
           <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
             {sidebarOpen ? <X /> : <Menu />}
           </Button>
        </header>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 text-white pt-16" style={{ background: "var(--v2-bg2)" }}>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium hover:bg-white/5"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start mt-8 hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8" style={{ background: "var(--v2-bg)" }}>
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}