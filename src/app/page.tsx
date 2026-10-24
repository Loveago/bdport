import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  Code2,
  CheckCircle2,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Users,
  Smartphone,
  Server,
  Lock,
  Flame,
} from "lucide-react";
import { BrandLogo, BrandMark } from "@/components/brand-logo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  // Fetch sample active packages for live rate preview
  const packages = await prisma.dataPackage.findMany({
    where: { active: true },
    orderBy: [{ network: "asc" }, { gbAmount: "asc" }],
    take: 12,
  });

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col justify-between selection:bg-[#00df82] selection:text-[#041d14] font-sans antialiased">
      {/* Background Neon Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[850px] h-[600px] bg-gradient-to-tr from-[#00df82]/15 via-emerald-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-40 w-[700px] h-[550px] bg-gradient-to-bl from-cyan-600/10 via-[#00df82]/10 to-transparent blur-3xl opacity-50" />
        <div className="absolute -bottom-40 left-10 w-[600px] h-[500px] bg-gradient-to-tr from-[#00df82]/15 via-teal-900/15 to-transparent blur-3xl opacity-40" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-30 border-b border-[#162740] px-4 sm:px-8 py-4 backdrop-blur-xl bg-[#060b13]/85 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandMark size="md" />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white group-hover:text-[#00df82] transition-colors">
                BUNDLE PORTAL
              </span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                STAY CONNECTED · STAY AHEAD
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-[#00df82] transition-colors">
              Features
            </a>
            <a href="#rates" className="hover:text-[#00df82] transition-colors">
              Wholesale Rates
            </a>
            <a href="#storefronts" className="hover:text-[#00df82] transition-colors">
              Storefronts
            </a>
            <a href="#api" className="hover:text-[#00df82] transition-colors">
              Developer API
            </a>
            <Link href="/store" className="hover:text-[#00df82] transition-colors">
              Marketplace
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-[#162740] bg-[#070d18] px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#111e33] hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00df82] px-4 py-2 text-xs font-black text-[#041d14] shadow-[0_0_20px_rgba(0,223,130,0.3)] hover:bg-[#00c572] transition-all"
            >
              <Zap className="h-3.5 w-3.5 fill-[#041d14]" />
              Launch Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00df82]/30 bg-[#00df82]/10 px-4 py-1.5 text-xs font-semibold text-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-[#00df82]" />
                GHANA&apos;S PREMIER AUTOMATED DATA PLATFORM
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                Wholesale Data Bundles. <br />
                <span className="bg-gradient-to-r from-[#00df82] via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  Instant SIM Delivery.
                </span>
              </h1>

              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Direct telecom switching for MTN Ghana, Telecel, and AirtelTigo. Buy non-expiry data at distributor wholesale prices, launch automated reseller storefronts, or fulfill programmatically via REST API.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-[#00df82] px-7 py-3.5 text-sm font-black text-[#041d14] shadow-[0_0_25px_rgba(0,223,130,0.4)] hover:bg-[#00c572] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Zap className="h-4 w-4 fill-[#041d14]" />
                  <span>Start Sending Bundles</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#rates"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#162740] bg-[#0b1322] px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-[#111e33] transition"
                >
                  View Rates Catalog
                </a>
              </div>

              {/* Status Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#00df82] animate-pulse" />
                  <span>USSD Sub-2s Latency</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#00df82]" />
                  <span>Non-Expiry Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <ShieldCheck className="h-4 w-4 text-[#00df82]" />
                  <span>MoMo Instant Checkout</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Neon SIM Graphic matching dashboard screenshot */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-[#162740] bg-[#0b1322] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#00df82]/20 blur-3xl" />

                {/* Simulated Neon SIM Card Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[#162740]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-[#00df82] flex items-center justify-center text-[#041d14] font-black shadow-[0_0_15px_rgba(0,223,130,0.35)]">
                      <Zap className="h-5 w-5 fill-[#041d14]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">TELECOM SWITCH ENGINE</p>
                      <p className="text-sm font-black text-white">Bundle Portal v2.0</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00df82]/10 border border-[#00df82]/30 px-3 py-1 text-[11px] font-black text-[#00df82]">
                    <span className="h-2 w-2 rounded-full bg-[#00df82] animate-ping" />
                    ONLINE
                  </span>
                </div>

                {/* 3 Active Carriers Grid */}
                <div className="py-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-[#070d18] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
                        MTN
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">MTN Ghana 4G/5G</p>
                        <p className="text-[11px] text-slate-400">Non-Expiry Bundles</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00df82]">~1.1s</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-[#070d18] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black text-xs">
                        TEL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Telecel Ghana</p>
                        <p className="text-[11px] text-slate-400">Express Top-up</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00df82]">~1.4s</span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-sky-500/20 bg-[#070d18] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black text-xs">
                        AT
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">AirtelTigo</p>
                        <p className="text-[11px] text-slate-400">iShare &amp; Big Time</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00df82]">~0.9s</span>
                  </div>
                </div>

                {/* Bottom Stats Line */}
                <div className="pt-4 border-t border-[#162740] flex items-center justify-between text-xs text-slate-400">
                  <span>Zero Queue Backlog</span>
                  <span className="font-mono text-[#00df82] font-bold">100% Automated Clearing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wholesale Rates Section */}
        <section id="rates" className="border-t border-[#162740] bg-[#070d18]/60 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00df82]/30 bg-[#00df82]/10 px-3 py-1 text-xs font-bold text-[#00df82]">
                <Flame className="h-3.5 w-3.5 text-[#00df82]" />
                UNBEATABLE PRICING
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Live Wholesale Data Rates
              </h2>
              <p className="text-sm text-slate-400">
                Transparent wholesale pricing with no hidden commissions. Fulfill orders for yourself, friends, or retail buyers.
              </p>
            </div>

            {/* Rates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.slice(0, 8).map((pkg) => {
                const isMtn = pkg.network === "MTN";
                const isTelecel = pkg.network === "TELECEL";
                const badgeColor = isMtn
                  ? "bg-amber-400 text-slate-950"
                  : isTelecel
                  ? "bg-rose-500 text-white"
                  : "bg-sky-500 text-white";

                return (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border border-[#162740] bg-[#0b1322] p-5 space-y-4 hover:border-[#00df82]/40 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`h-8 w-8 rounded-xl ${badgeColor} font-black text-xs flex items-center justify-center`}>
                        {pkg.network.slice(0, 3)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        NON-EXPIRY
                      </span>
                    </div>

                    <div>
                      <p className="text-2xl font-black text-white group-hover:text-[#00df82] transition-colors">
                        {pkg.gbAmount} GB
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{pkg.name}</p>
                    </div>

                    <div className="pt-2 border-t border-[#162740] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Wholesale</span>
                        <span className="text-lg font-black text-[#00df82]">
                          GHS {(pkg.retailPriceGHS ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <Link
                        href="/login"
                        className="rounded-xl border border-[#00df82]/30 bg-[#00df82]/10 px-3 py-1.5 text-xs font-bold text-[#00df82] hover:bg-[#00df82] hover:text-[#041d14] transition"
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#00df82] hover:underline"
              >
                <span>View complete package catalog and tier discounts</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Asymmetrical Bento Platform Features Section */}
        <section id="features" className="py-20 border-t border-[#162740]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00df82]/30 bg-[#00df82]/10 px-3 py-1 text-xs font-bold text-[#00df82]">
                <Layers className="h-3.5 w-3.5 text-[#00df82]" />
                INFRASTRUCTURE SUITE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Engineered for Speed, Scale &amp; Automation
              </h2>
              <p className="text-sm text-slate-400">
                Everything you need to buy, distribute, resell, and automate mobile data delivery in Ghana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Single & Bulk Dispatch */}
              <div className="rounded-3xl border border-[#162740] bg-[#0b1322] p-7 space-y-4 hover:border-[#00df82]/40 transition">
                <div className="h-12 w-12 rounded-2xl bg-[#00df82]/10 text-[#00df82] flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">Single-Order Dispatch</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Pure single-order clarity. Enter recipient numbers directly or upload Excel templates for batch processing with instant status tracking per line.
                </p>
              </div>

              {/* Feature 2: Reseller Storefronts */}
              <div id="storefronts" className="rounded-3xl border border-[#162740] bg-[#0b1322] p-7 space-y-4 hover:border-[#00df82]/40 transition">
                <div className="h-12 w-12 rounded-2xl bg-[#00df82]/10 text-[#00df82] flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">White-Label Storefronts</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Start your own branded data business in 60 seconds. Set your own profit margins, accept MoMo directly via Paystack, and withdraw earnings on demand.
                </p>
                <div className="pt-2">
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00df82] hover:underline"
                  >
                    <span>Browse Live Merchant Stores</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Feature 3: Developer API */}
              <div id="api" className="rounded-3xl border border-[#162740] bg-[#0b1322] p-7 space-y-4 hover:border-[#00df82]/40 transition">
                <div className="h-12 w-12 rounded-2xl bg-[#00df82]/10 text-[#00df82] flex items-center justify-center">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">Developer REST API</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Integrate telecom fulfillment into your website, app, or bot. RESTful endpoints, HMAC SHA-256 signed webhooks, and live test playground.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pre-Footer Call to Action Banner */}
        <section className="border-t border-[#162740] bg-gradient-to-b from-[#070d18] to-[#060b13] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade Your Data Delivery?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Join thousands of users, resellers, and developers taking advantage of automated wholesale telecom delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-[#00df82] px-8 py-4 text-sm font-black text-[#041d14] shadow-[0_0_30px_rgba(0,223,130,0.4)] hover:bg-[#00c572] hover:scale-105 active:scale-95 transition-all"
              >
                <Zap className="h-4 w-4 fill-[#041d14]" />
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-[#162740] px-4 sm:px-8 py-8 backdrop-blur-md bg-[#060b13] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div className="flex flex-col">
              <span className="font-black text-white">Bundle Portal</span>
              <span className="text-[10px] text-slate-400">Stay Connected · Stay Ahead</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <a href="#features" className="hover:text-[#00df82] transition-colors">
              Features
            </a>
            <a href="#rates" className="hover:text-[#00df82] transition-colors">
              Wholesale Rates
            </a>
            <Link href="/store" className="hover:text-[#00df82] transition-colors">
              Storefronts
            </Link>
            <Link href="/terms" className="hover:text-[#00df82] transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-[#00df82] transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy" className="hover:text-[#00df82] transition-colors">
              Privacy Policy
            </Link>
          </div>

          <p className="text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} Bundle Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
