import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./language-toggle";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, BookOpen, Shield } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UserRecord {
  id: number;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const getInitials = () => {
    if (user?.firstName && user?.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const navLinks = [
    { href: "/learn",         label: t("nav.learn") },
    { href: "/courses",       label: t("nav.courses") },
    { href: "/consultations", label: t("nav.consultations") },
    { href: "/corporate",     label: t("nav.corporate") },
    { href: "/tools",         label: t("nav.tools") },
  ];

  const UserMenu = () => {
    if (isLoading)
      return <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />;

    if (!isAuthenticated)
      return (
        <Link href="/auth">
          <button
            data-testid="button-login"
            style={{
              background: "linear-gradient(135deg,#D4A843,#B88E2A)",
              color: "#080A0F",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {t("nav.login")}
          </button>
        </Link>
      );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0" data-testid="button-user-menu">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback style={{ background: "linear-gradient(135deg,#D4A843,#B88E2A)", color: "#080A0F", fontSize: 12, fontWeight: 700 }}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRtl ? "start" : "end"} className="w-52">
          <div className="p-2">
            {user?.firstName && <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>}
            {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <DropdownMenuSeparator />
          {user?.role === 'admin' && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer w-full font-medium text-amber-600">
                  <Shield className="me-2 h-4 w-4" />{t("auth.admin.title")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/my-courses" className="cursor-pointer w-full" data-testid="link-my-courses">
              <BookOpen className="me-2 h-4 w-4" />{t("nav.myCourses")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button 
              onClick={() => logout()} 
              className="cursor-pointer w-full text-destructive flex items-center px-2 py-1.5 text-sm" 
              data-testid="button-logout"
            >
              <LogOut className="me-2 h-4 w-4" />{t("nav.logout")}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8,10,15,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        height: 60,
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        justifyContent: "space-between",
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg,#EBCE7C 0%,#D4A843 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          flexShrink: 0,
        }}
      >
        Yusuf Invest
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: isActive(href) ? "white" : "rgba(255,255,255,0.45)",
              padding: "6px 13px",
              borderRadius: 6,
              background: isActive(href) ? "rgba(255,255,255,0.08)" : "transparent",
              transition: "all 0.12s",
              cursor: "pointer",
            }}
            onMouseEnter={e => {
              if (!isActive(href)) {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.82)";
                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }
            }}
            onMouseLeave={e => {
              if (!isActive(href)) {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)";
                (e.target as HTMLElement).style.background = "transparent";
              }
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: 16 }}>
        <LanguageToggle />
        <UserMenu />
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3">
        <LanguageToggle />
        <UserMenu />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="top" style={{ background: "var(--v2-bg2)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex flex-col gap-1 mt-6 pb-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 15,
                    color: isActive(href) ? "var(--v2-gold2)" : "rgba(255,255,255,0.6)",
                    padding: "10px 16px",
                    borderRadius: 8,
                    background: isActive(href) ? "rgba(255,255,255,0.05)" : "transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
