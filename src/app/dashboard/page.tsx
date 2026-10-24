import * as React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatGHS } from "@/lib/types";
import {
  Zap,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  Tv,
  Gift,
  Radio,
  Eye,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Headphones,
  CheckCircle2,
  Lock,
  Flame,
  Users,
  Wallet,
} from "lucide-react";
import { DashboardSalesChart } from "@/components/dashboard/dashboard-sales-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    activeCustomers,
    userBalance,
    recentOrders,
    popularPackages,
  ] = await Promise.all([
    prisma.order.count({
      where: user.role === "ADMIN" || user.role === "MANAGER" ? {} : { userId: user.id },
    }),
    prisma.user.count({
      where: { lastLoginAt: { gte: since } },
    }),
    user.balance,
    prisma.order.findMany({
      where: user.role === "ADMIN" || user.role === "MANAGER" ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.dataPackage.findMany({
      where: { active: true, network: "MTN" },
      orderBy: { gbAmount: "asc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* ── TOP SECTION: WELCOME HERO + WALLET CARD ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Welcome Hero Banner (Col 8) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#14233a] bg-gradient-to-br from-emerald-500/10 via-[#0a1526] to-[#07111e] p-6 lg:p-7 flex flex-col justify-between shadow-xl">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#00df82]/10 blur-3xl" />

          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00df82]">
              Welcome Back,
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{user.name || "Super Admin"}</span>
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              Manage your bundles, orders, customers and keep your platform running smoothly.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00df82]/15 border border-[#00df82]/30 text-[#00df82] text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Fast &amp; Reliable</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Lock className="h-3.5 w-3.5" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Headphones className="h-3.5 w-3.5" />
              <span>24/7 Support</span>
            </div>
          </div>

          {/* Right Floating 3D Graphic */}
          <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center">
            <div className="h-28 w-24 rounded-2xl border-2 border-[#00df82]/40 bg-[#071322] shadow-2xl shadow-[#00df82]/20 flex flex-col items-center justify-center p-3 relative transform rotate-6 hover:rotate-0 transition-transform">
              <div className="h-10 w-10 rounded-xl bg-[#00df82] flex items-center justify-center shadow-lg shadow-[#00df82]/30">
                <Zap className="h-5 w-5 text-slate-950 fill-slate-950" />
              </div>
              <span className="text-[9px] font-black uppercase text-slate-300 mt-2 tracking-wider">
                Active SIM
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card (Col 4) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00df82]/20 text-[#00df82]">
                  <Wallet className="h-4 w-4" />
                </div>
                <span>Wallet Balance</span>
                <Eye className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1 rounded-xl bg-[#00df82] hover:bg-[#00f59b] px-3 py-1.5 text-xs font-black text-slate-950 shadow-md shadow-[#00df82]/20 transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Top Up</span>
              </Link>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatGHS(userBalance)}
              </div>
            </div>
          </div>

          {/* Micro stats under balance */}
          <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-100 dark:border-[#14233a]">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {totalOrders}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Customers</div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {activeCustomers}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00df82] mt-0.5">
                <span className="h-2 w-2 rounded-full bg-[#00df82] animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATEGORY QUICK CARDS (4 IN A ROW) ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MTN Bundles */}
        <Link
          href="/dashboard/buy-now?network=MTN"
          className="group rounded-2xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-4 flex items-center justify-between hover:border-amber-400/50 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
              MTN
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                MTN Bundles
              </div>
              <div className="text-[10px] text-slate-400">Airtime, Data, SMS</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Data Bundles */}
        <Link
          href="/dashboard/buy-now"
          className="group rounded-2xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-4 flex items-center justify-between hover:border-[#00df82]/50 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00df82]/20 text-[#00df82] border border-[#00df82]/40 flex items-center justify-center shadow-md shadow-[#00df82]/10">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00df82] transition-colors">
                Data Bundles
              </div>
              <div className="text-[10px] text-slate-400">Get the best data plans</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#00df82] group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* TV & SMS */}
        <Link
          href="/dashboard/packages"
          className="group rounded-2xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-4 flex items-center justify-between hover:border-blue-400/50 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-md shadow-blue-500/10">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
                TV &amp; SMS
              </div>
              <div className="text-[10px] text-slate-400">Stay connected</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Other Products */}
        <Link
          href="/dashboard/packages"
          className="group rounded-2xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-4 flex items-center justify-between hover:border-purple-400/50 transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-md shadow-purple-500/10">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                Other Products
              </div>
              <div className="text-[10px] text-slate-400">More services</div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── MAIN CONTENT (2 COLUMNS: 8 COLS / 4 COLS) ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: OVERVIEW + CHART + POPULAR BUNDLES (8 COLS) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Network Overview Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Network Overview</h2>
                  <p className="text-[11px] text-slate-400">Real-time network performance and platform stats</p>
                </div>
              </div>

              <select className="h-8 rounded-xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#0e192c] px-3 text-xs text-slate-600 dark:text-slate-300 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This Month</option>
              </select>
            </div>

            {/* 4 Overview Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Orders */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 0%</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{totalOrders}</div>
                </div>
              </div>

              {/* Active Customers */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 0%</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Customers</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{activeCustomers}</div>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">↑ 0%</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Wallet Balance</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white font-mono truncate">
                    {formatGHS(userBalance)}
                  </div>
                </div>
              </div>

              {/* Network Status */}
              <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                    <Radio className="h-4 w-4" />
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#00df82] animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Network Status</div>
                  <div className="text-sm font-bold text-[#00df82] flex items-center gap-1">
                    <span>Online</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00df82]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Overview Chart Component */}
            <DashboardSalesChart />
          </div>

          {/* Popular Bundles Row */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Popular Bundles</h3>
                  <p className="text-[11px] text-slate-400">Most used bundles by our customers</p>
                </div>
              </div>
              <Link
                href="/dashboard/packages"
                className="text-xs font-bold text-[#00df82] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularPackages.length > 0 ? (
                popularPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/dashboard/buy-now?packageId=${pkg.id}&network=${pkg.network}`}
                    className="group rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-3.5 flex items-center justify-between hover:border-[#00df82]/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        {pkg.gbAmount}GB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00df82] transition-colors">
                          {pkg.gbAmount}GB - 30 Days
                        </div>
                        <div className="text-xs font-black text-[#00df82] font-mono mt-0.5">
                          {formatGHS(pkg.retailPriceGHS ?? 10)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#00df82] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        1GB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">1GB - 7 Days</div>
                        <div className="text-xs font-black text-[#00df82] font-mono">GHS 10.00</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        2GB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">2GB - 30 Days</div>
                        <div className="text-xs font-black text-[#00df82] font-mono">GHS 20.00</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        5GB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">5GB - 30 Days</div>
                        <div className="text-xs font-black text-[#00df82] font-mono">GHS 50.00</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                        10GB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">10GB - 30 Days</div>
                        <div className="text-xs font-black text-[#00df82] font-mono">GHS 80.00</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS + PROMO + SUPPORT (4 COLS) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Actions Panel */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] p-6 shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                <Zap className="h-4 w-4 text-[#00df82]" />
                <span>Quick Actions</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Get things done faster</p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/buy-now"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] hover:border-[#00df82]/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00df82]/20 text-[#00df82]">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00df82] transition-colors">
                      Buy Now
                    </div>
                    <div className="text-[10px] text-slate-400">Get data &amp; airtime</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#00df82] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/send"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] hover:border-blue-500/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
                      Bulk Order
                    </div>
                    <div className="text-[10px] text-slate-400">Place multiple orders</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/mtn-verification"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] hover:border-amber-400/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                      Check MTN Status
                    </div>
                    <div className="text-[10px] text-slate-400">Verify your MTN line</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/reports"
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-[#14233a] bg-slate-50 dark:bg-[#070d18] hover:border-purple-400/50 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                      View Reports
                    </div>
                    <div className="text-[10px] text-slate-400">Track your sales</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* MTN Promo Card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121c10] via-[#091512] to-[#060e15] p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                Best Rates · Fast Delivery
              </span>
              <h4 className="text-lg font-black text-white">MTN Data Bundles</h4>
              <p className="text-xs text-slate-300">Stay connected, always.</p>
            </div>

            <Link
              href="/dashboard/buy-now?network=MTN"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
            >
              <span>Buy Now</span>
              <span>→</span>
            </Link>
          </div>

          {/* Need Assistance Card */}
          <Link
            href="/admin/chat"
            className="group flex items-center justify-between p-4 rounded-3xl border border-slate-200 dark:border-[#14233a] bg-white dark:bg-[#0a1220] hover:border-[#00df82]/50 transition-colors shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Need assistance?</div>
                <div className="text-[10px] text-slate-400">Our support team is here to help you.</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#00df82] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
