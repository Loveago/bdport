"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  ShoppingCart,
  ClipboardList,
  Users,
  Package,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Code2,
  Store,
  Layers,
  BarChart3,
  Shield,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Headphones,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useTheme } from "next-themes";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { cn } from "@/lib/utils";
import { formatGHS } from "@/lib/types";
import type { AuthUser } from "@/lib/types";

interface BundlePortalShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/buy-now", label: "Buy Bundle", icon: Zap },
  { href: "/dashboard/send", label: "Bulk Order", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/packages", label: "Products", icon: Package },
  { href: "/dashboard/billing", label: "Wallet & Billing", icon: Wallet },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/mtn-verification", label: "MTN Verification", icon: ShieldCheck },
  { href: "/dashboard/api", label: "API", icon: Code2 },
  { href: "/dashboard/storefront", label: "Storefront", icon: Store },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin", label: "Admin Center", icon: Shield, adminOnly: true },
];

const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/buy-now", label: "Buy", icon: Zap },
  { href: "/dashboard/send", label: "Bulk", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/billing", label: "Wallet", icon: Wallet },
];

export function BundlePortalShell({ user, children }: BundlePortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "BP";
  };

  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <div className="min-h-screen bg-[#f3f6fa] dark:bg-[#060b13] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 antialiased selection:bg-[#00df82] selection:text-slate-950">
      {/* ── TOP BAR (MATCHING SCREENSHOT) ─────────────────────────────────── */}
      <header className="h-16 border-b border-slate-200 dark:border-[#14233a] bg-white/90 dark:bg-[#070d18]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-4 lg:px-6">
        {/* Left: Mobile trigger & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0e192c]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo size="md" href="/dashboard" />
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bundles, orders, or customers..."
              className="w-full bg-slate-100 dark:bg-[#09121f] border border-slate-200 dark:border-[#14233a] rounded-xl pl-9 pr-12 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00df82] dark:focus:border-[#00df82] transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 dark:bg-[#14233a] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Theme, Mobile Balance, User Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Mobile Balance Pill */}
          <Link
            href="/dashboard/billing"
            className="flex sm:hidden items-center gap-1.5 rounded-xl border border-[#00df82]/30 bg-[#00df82]/10 px-2.5 py-1 text-xs font-mono font-black text-[#00df82]"
            title="Wallet Balance"
          >
            <Wallet className="h-3 w-3" />
            <span>{formatGHS(user.balance || 0)}</span>
          </Link>

          {/* Notification Center */}
          <NotificationCenter user={user} admin={isAdmin} />

          {/* Theme Toggle (Sun / Moon) */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#09121f] text-slate-600 dark:text-cyan-300 hover:border-[#00df82] transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>
          )}

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-[#14233a]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00df82] to-[#22d3ee] text-slate-950 font-black text-xs shadow-md shadow-[#00df82]/20">
              {getUserInitials(user.name, user.email)}
            </div>

            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user.name || "Super Admin"}
                </span>
                <span className="rounded bg-[#00df82]/15 text-[#00df82] border border-[#00df82]/40 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-0.5 sm:ml-1"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + CONTENT ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#070d18] shrink-0 overflow-y-auto p-3.5 space-y-6">
          {/* Main Navigation List */}
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-[#00df82] text-slate-950 font-black shadow-lg shadow-[#00df82]/20 border border-[#00f59b]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0a1220]"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-slate-950 fill-slate-950/20"
                        : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span className="truncate flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Need Help? Contact Support Card */}
          <div className="mt-auto pt-4">
            <Link
              href="/admin/chat"
              className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#0a1322] hover:border-[#00df82]/40 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00df82]/20 text-[#00df82] border border-[#00df82]/30 shadow-md shadow-[#00df82]/10 group-hover:scale-105 transition-transform">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Need Help?</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Contact Support</div>
                </div>
              </div>
              <span className="text-xs text-slate-400 group-hover:text-[#00df82] group-hover:translate-x-0.5 transition-all">
                →
              </span>
            </Link>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-[85%] max-w-xs bg-white dark:bg-[#070d18] border-r border-slate-200 dark:border-[#14233a] p-4 space-y-4 z-10 overflow-y-auto shadow-2xl">
              {/* Header with user info */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#14233a]">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Account Brief */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#0a1322] p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00df82] to-[#22d3ee] text-slate-950 font-black text-xs shadow-md shadow-[#00df82]/20">
                  {getUserInitials(user.name, user.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name || "Subscriber"}
                    </p>
                    <span className="rounded bg-[#00df82]/15 text-[#00df82] border border-[#00df82]/30 px-1 py-0.2 text-[9px] font-black uppercase tracking-wider shrink-0">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#00df82] font-black mt-0.5">
                    {formatGHS(user.balance || 0)}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {visibleNavItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px]",
                        isActive
                          ? "bg-[#00df82] text-slate-950 font-black shadow-md shadow-[#00df82]/20"
                          : "text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-[#0a1220]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-slate-200 dark:border-[#14233a] mt-auto">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PAGE VIEWPORT (with bottom padding for mobile nav) */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 pb-28 lg:pb-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR (FIXED FOR ONE-THUMB OPERABILITY) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070d18]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#14233a] px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] text-center",
                isActive
                  ? "text-[#00df82]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  isActive && "bg-[#00df82]/15 text-[#00df82]"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold mt-0.5 tracking-tight",
                  isActive ? "font-black text-[#00df82]" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
