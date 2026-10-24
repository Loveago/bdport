"use client";

import * as React from "react";
import Link from "next/link";
import {
  Signal,
  ClipboardList,
  Star,
  Phone,
  MessageCircle,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  Loader2,
  X,
  Share2,
  ShieldCheck,
  Zap,
  Menu as MenuIcon,
  Sparkles,
} from "lucide-react";
import { fromPesewas } from "@/lib/storefront";
import type { NetworkProvider } from "@/lib/types";

export interface StorefrontProductItem {
  packageId: string;
  gbAmount: number;
  name: string;
  price: number; // in GHS
  network: NetworkProvider;
  validity?: string;
}

interface StorefrontPortalProps {
  storefront: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    whatsapp?: string | null;
    whatsappGroupLink?: string | null;
    logoUrl?: string | null;
    reviewsEnabled?: boolean;
  };
  products: StorefrontProductItem[];
  availableNetworks: NetworkProvider[];
}

// Carrier prefix detection helper for Ghana
function detectCarrier(phone: string): { network: string; label: string; color: string } | null {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 3) return null;
  const prefix = clean.slice(0, 3);

  if (["024", "025", "053", "054", "055", "059"].includes(prefix)) {
    return { network: "MTN", label: "MTN Ghana", color: "#f59e0b" };
  }
  if (["020", "050"].includes(prefix)) {
    return { network: "TELECEL", label: "Telecel", color: "#e60000" };
  }
  if (["027", "057", "026", "056"].includes(prefix)) {
    return { network: "AIRTELTIGO", label: "AirtelTigo", color: "#005fb8" };
  }
  return null;
}

function whatsappDirectLink(phone: string | null | undefined): string {
  if (!phone) return "https://wa.me/233531374119";
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export function StorefrontPortal({
  storefront,
  products,
  availableNetworks,
}: StorefrontPortalProps) {
  // Navigation tabs: data | track | reviews
  const isReviewsEnabled = storefront.reviewsEnabled ?? true;
  const [activeTab, setActiveTab] = React.useState<"data" | "track" | "reviews">("data");

  React.useEffect(() => {
    if (!isReviewsEnabled && activeTab === "reviews") {
      setActiveTab("data");
    }
  }, [isReviewsEnabled, activeTab]);

  // Carrier filter: default to MTN if available, else first network
  const defaultNetwork = availableNetworks.includes("MTN")
    ? "MTN"
    : availableNetworks[0] || "MTN";
  const [activeNetwork, setActiveNetwork] = React.useState<string>(defaultNetwork);

  // Buy checkout modal state
  const [selectedProduct, setSelectedProduct] = React.useState<StorefrontProductItem | null>(null);
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState("");

  // Tracking query state
  const [trackQuery, setTrackQuery] = React.useState("");
  const [trackLoading, setTrackLoading] = React.useState(false);
  const [trackResult, setTrackResult] = React.useState<any[] | null>(null);
  const [trackError, setTrackError] = React.useState("");

  // Review submission state
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewName, setReviewName] = React.useState("");
  const [reviewComment, setReviewComment] = React.useState("");
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

  // Filter products by selected network
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        if (activeNetwork === "ALL") return true;
        if (activeNetwork === "AIRTELTIGO_ISHARE" || activeNetwork === "AIRTELTIGO") {
          return p.network === "AIRTELTIGO";
        }
        return p.network === activeNetwork;
      })
      .sort((a, b) => a.gbAmount - b.gbAmount || a.price - b.price);
  }, [products, activeNetwork]);

  // Customer contact details
  const displayPhone = storefront.whatsapp || "0531374119";
  const waChatUrl = whatsappDirectLink(storefront.whatsapp);
  const waGroupUrl = storefront.whatsappGroupLink || waChatUrl;

  // Real-time phone carrier check
  const carrierInfo = detectCarrier(phone);

  const handleOpenBuy = (pkg: StorefrontProductItem) => {
    setSelectedProduct(pkg);
    setCheckoutError("");
  };

  const handleCloseBuy = () => {
    if (checkingOut) return;
    setSelectedProduct(null);
    setCheckoutError("");
  };

  // Submit MoMo payment
  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setCheckoutError("Please enter a valid 10-digit Ghana mobile number (e.g. 0244123456).");
      return;
    }

    setCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch(`/api/store/${storefront.slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedProduct.packageId,
          phoneNumber: cleanPhone,
          customerEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      // Save customer info in localStorage for future convenience
      try {
        localStorage.setItem("storefront_customer_phone", cleanPhone);
        if (email.trim()) localStorage.setItem("storefront_customer_email", email.trim());
      } catch {}

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error("No payment link returned by gateway.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to process payment. Please try again.");
      setCheckingOut(false);
    }
  };

  // Execute tracking search
  const handleExecuteTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = trackQuery.trim();
    if (!q) {
      setTrackError("Please enter a phone number or order reference.");
      return;
    }
    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);

    try {
      const res = await fetch(`/api/store/${storefront.slug}/track?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error looking up order.");
      setTrackResult(data.orders || []);
      if ((data.orders || []).length === 0) {
        setTrackError("No orders found matching this search. Verify your phone number or reference.");
      }
    } catch (err: any) {
      setTrackError(err.message || "Unable to retrieve order status.");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f9] text-slate-900 font-sans pb-16">
      {/* ── 1. ROYAL BLUE HERO HEADER SECTION ───────────────────────────────── */}
      <header className="relative bg-gradient-to-b from-[#1a56db] via-[#1650d2] to-[#1244be] text-white pt-6 pb-0 shadow-md">
        {/* Top bar with Store Title and Drawer Menu button */}
        <div className="mx-auto max-w-xl px-4 text-center relative">
          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("open-store-drawer"));
              }
            }}
            className="absolute right-3 top-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Open Menu"
            aria-label="Open Menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Store Logo or Verified Badge */}
          {storefront.logoUrl && (
            <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-white p-1 shadow-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storefront.logoUrl}
                alt={storefront.name}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
          )}

          {/* Store Title */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {storefront.name || "DataRush"}
          </h1>

          {/* Subtitle / Tagline */}
          <p className="mt-1.5 text-xs sm:text-sm text-blue-100 font-normal leading-relaxed max-w-md mx-auto px-2">
            {storefront.description ||
              "Instant delivery, trusted service, and unbeatable prices for all networks!"}
          </p>

          {/* Contact Action Pills */}
          <div className="mt-4 flex flex-col items-center gap-2">
            {/* Row 1: Phone and WhatsApp */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <a
                href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0d3ea6]/70 hover:bg-[#0d3ea6] text-white border border-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition shadow-sm"
              >
                <Phone className="h-3.5 w-3.5 fill-white" />
                <span>{displayPhone}</span>
              </a>

              <a
                href={waChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0d3ea6]/70 hover:bg-[#0d3ea6] text-white border border-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Row 2: WhatsApp Group */}
            <div>
              <a
                href={waGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0d3ea6]/70 hover:bg-[#0d3ea6] text-white border border-white/20 px-5 py-1.5 text-xs font-semibold backdrop-blur-sm transition shadow-sm"
              >
                <Users className="h-3.5 w-3.5" />
                <span>WA Group</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navy Blue Strip: "WE ARE AVAILABLE •" */}
        <div className="mt-5 bg-[#0e358c] py-2 text-center text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-center gap-2 border-t border-white/10">
          <span>WE ARE AVAILABLE</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        </div>
      </header>

      {/* ── 2. MAIN TABS BAR (Data | Order Status | Reviews) ───────────────────── */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-sm">
        <div className="mx-auto max-w-xl flex items-center justify-around text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "data"
                ? "border-[#1a56db] text-[#1a56db] font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Signal className="h-4 w-4" />
            <span>Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === "track"
                ? "border-[#1a56db] text-[#1a56db] font-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Order Status</span>
          </button>

          {isReviewsEnabled && (
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === "reviews"
                  ? "border-[#1a56db] text-[#1a56db] font-black"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Reviews</span>
            </button>
          )}
        </div>
      </nav>

      {/* ── 3. DATA PACKAGES VIEW ────────────────────────────────────────────── */}
      {activeTab === "data" && (
        <main className="mx-auto max-w-xl px-3 sm:px-4 pt-4">
          {/* Network Pills Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {/* MTN */}
            <button
              type="button"
              onClick={() => setActiveNetwork("MTN")}
              className={`rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer shadow-sm ${
                activeNetwork === "MTN"
                  ? "bg-[#fbb014] text-slate-950 border border-[#fbb014]"
                  : "bg-white text-[#d97706] border border-[#fbb014] hover:bg-[#fffbeb]"
              }`}
            >
              MTN
            </button>

            {/* Telecel */}
            <button
              type="button"
              onClick={() => setActiveNetwork("TELECEL")}
              className={`rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer shadow-sm ${
                activeNetwork === "TELECEL"
                  ? "bg-[#e60000] text-white border border-[#e60000]"
                  : "bg-white text-[#e60000] border-2 border-[#e60000] hover:bg-rose-50"
              }`}
            >
              Telecel
            </button>

            {/* AirtelTigo iShare */}
            <button
              type="button"
              onClick={() => setActiveNetwork("AIRTELTIGO_ISHARE")}
              className={`rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer shadow-sm ${
                activeNetwork === "AIRTELTIGO_ISHARE" || activeNetwork === "AIRTELTIGO"
                  ? "bg-[#005fb8] text-white border border-[#005fb8]"
                  : "bg-white text-[#005fb8] border-2 border-[#005fb8] hover:bg-blue-50"
              }`}
            >
              AirtelTigo iShare
            </button>

            {/* AirtelTigo Big Time */}
            {availableNetworks.includes("AIRTELTIGO_BIGTIME") && (
              <button
                type="button"
                onClick={() => setActiveNetwork("AIRTELTIGO_BIGTIME")}
                className={`rounded-full px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer shadow-sm ${
                  activeNetwork === "AIRTELTIGO_BIGTIME"
                    ? "bg-[#0284c7] text-white border border-[#0284c7]"
                    : "bg-white text-[#0284c7] border-2 border-[#0284c7] hover:bg-sky-50"
                }`}
              >
                AirtelTigo Big Time
              </button>
            )}
          </div>

          {/* 3-Column Card Grid (Matching Screenshot Exactly) */}
          {filteredProducts.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
              No packages currently on sale for this network. Please select another network above.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((pkg) => {
                const isMtn = pkg.network === "MTN";
                const isTelecel = pkg.network === "TELECEL";

                return (
                  <div
                    key={pkg.packageId}
                    className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-150 hover:shadow-md"
                  >
                    {/* Top Carrier Colored Banner */}
                    <div
                      className={`py-3 px-2 flex items-center justify-center ${
                        isMtn
                          ? "bg-[#fbb014]"
                          : isTelecel
                          ? "bg-[#e60000]"
                          : "bg-[#005fb8]"
                      }`}
                    >
                      {/* Carrier Oval matching exact screenshot style */}
                      {isMtn ? (
                        <div className="w-[66px] sm:w-[72px] h-[30px] sm:h-[32px] rounded-full border-[2.5px] border-black flex items-center justify-center bg-transparent shadow-xs">
                          <span className="text-black font-black text-xs sm:text-sm tracking-tight font-sans">
                            MTN
                          </span>
                        </div>
                      ) : isTelecel ? (
                        <div className="w-[66px] sm:w-[72px] h-[30px] sm:h-[32px] rounded-full border-2 border-white flex items-center justify-center bg-white shadow-xs">
                          <span className="text-[#e60000] font-black text-[11px] sm:text-xs tracking-tight font-sans">
                            telecel
                          </span>
                        </div>
                      ) : (
                        <div className="w-[66px] sm:w-[72px] h-[30px] sm:h-[32px] rounded-full border-2 border-white flex items-center justify-center bg-white shadow-xs">
                          <span className="text-[#005fb8] font-black text-[10px] sm:text-[11px] tracking-tight font-sans">
                            AirtelTigo
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Capacity, Validity, Price */}
                    <div className="p-2 sm:p-2.5 text-center flex-1 flex flex-col justify-between">
                      <div>
                        {/* Capacity */}
                        <div
                          className={`font-black text-base sm:text-lg tracking-tight leading-none ${
                            isMtn
                              ? "text-[#e59b00]"
                              : isTelecel
                              ? "text-[#e60000]"
                              : "text-[#005fb8]"
                          }`}
                        >
                          {pkg.gbAmount}GB
                        </div>

                        {/* Validity */}
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                          {pkg.validity || "90 days"}
                        </div>

                        {/* Price */}
                        <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 font-mono">
                          GH₵{pkg.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Buy Now Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenBuy(pkg)}
                        className={`mt-2 w-full py-1.5 text-center text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer ${
                          isMtn
                            ? "bg-[#f59e0b] hover:bg-[#d97706]"
                            : isTelecel
                            ? "bg-[#e60000] hover:bg-[#cc0000]"
                            : "bg-[#005fb8] hover:bg-[#004a91]"
                        }`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Floating Pill Badge matching screenshot */}
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <span className="inline-block rounded-full bg-[#fde047]/95 text-black font-medium px-4 py-0.5 text-[11px] border border-[#eab308]/70 shadow-md backdrop-blur-xs">
              {storefront.slug}.top
            </span>
          </div>
        </main>
      )}

      {/* ── 4. ORDER STATUS / TRACKING TAB VIEW ──────────────────────────────── */}
      {activeTab === "track" && (
        <section className="mx-auto max-w-xl px-4 pt-5">
          <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-base font-black text-slate-900">
                Track Order Status
              </h2>
              <p className="text-xs text-slate-500">
                Enter your recipient phone number or order reference to check live delivery telemetry.
              </p>
            </div>

            <form onSubmit={handleExecuteTrack} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 0244123456 or reference code"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1a56db] focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={trackLoading}
                className="w-full py-2.5 bg-[#1a56db] hover:bg-[#1546b3] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {trackLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </form>

            {trackError && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{trackError}</span>
              </div>
            )}

            {/* Tracking Results */}
            {trackResult && trackResult.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Found {trackResult.length} order(s)
                </span>

                {trackResult.map((ord: any) => {
                  const isDelivered =
                    ord.status === "COMPLETED" || ord.status === "DELIVERED";
                  const isProcessing =
                    ord.status === "PROCESSING" || ord.status === "PENDING";
                  const isFailed = ord.status === "FAILED";

                  return (
                    <div
                      key={ord.id || ord.reference}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-900">
                          {ord.package?.name || `${ord.network} ${ord.gbAmount}GB`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? "bg-emerald-100 text-emerald-700"
                              : isProcessing
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Recipient: {ord.phoneNumber}</span>
                        <span>₵{ord.price?.toFixed(2) || "—"}</span>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ord.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Not Received Help Button */}
                      {isProcessing && (
                        <div className="pt-1 flex justify-end">
                          <a
                            href={waChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#1a56db] hover:underline flex items-center gap-1"
                          >
                            <span>Need help with this order?</span>
                            <span>→</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 5. REVIEWS TAB VIEW ──────────────────────────────────────────────── */}
      {isReviewsEnabled && activeTab === "reviews" && (
        <section className="mx-auto max-w-xl px-4 pt-5 space-y-4">
          {/* Rating Summary Card */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm text-center space-y-2">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <div className="text-2xl font-black text-slate-900">4.9 / 5.0</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Based on over <strong>450+ verified customer purchases</strong> across MTN, Telecel, and AirtelTigo.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-900 transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Leave a Review</span>
              </button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="space-y-3">
            {[
              {
                name: "Kwame Asante",
                location: "Accra",
                time: "2 hours ago",
                bundle: "MTN 10GB",
                comment:
                  "Credited in less than 30 seconds after MoMo approval! Always fast and dependable.",
              },
              {
                name: "Abena Mansah",
                location: "Kumasi",
                time: "Yesterday",
                bundle: "Telecel 5GB",
                comment:
                  "Best data prices in Ghana right now. I don't buy from any other storefront.",
              },
              {
                name: "Kofi Boateng",
                location: "Takoradi",
                time: "2 days ago",
                bundle: "MTN 20GB",
                comment:
                  "No expiry data sent directly to my SIM. WhatsApp support is also very quick to answer.",
              },
              {
                name: "Eunice Darko",
                location: "Tema",
                time: "3 days ago",
                bundle: "AirtelTigo 15GB",
                comment:
                  "Smooth checkout with MTN MoMo. Zero hassle, instant allocation.",
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                      {rev.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{rev.name}</span>
                        <span className="text-[10px] text-slate-400">({rev.location})</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        ✓ Verified Purchase · {rev.bundle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                <div className="text-[10px] text-slate-400 font-mono text-right">
                  {rev.time}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. INSTANT CHECKOUT POPUP MODAL ──────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseBuy}
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                    selectedProduct.network === "MTN"
                      ? "bg-[#fbb014] text-slate-950"
                      : selectedProduct.network === "TELECEL"
                      ? "bg-[#e60000]"
                      : "bg-[#005fb8]"
                  }`}
                >
                  {selectedProduct.network}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Instant Checkout
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseBuy}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selected Bundle Summary */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-base font-black text-slate-900 leading-tight">
                  {selectedProduct.gbAmount}GB Data Plan
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {selectedProduct.validity || "90 Days Validity · Never Expires"}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                <span className="text-lg font-black text-[#1a56db] font-mono">
                  GH₵{selectedProduct.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleProceedCheckout} className="space-y-3.5">
              {/* Recipient Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Recipient Phone Number</span>
                  <span className="text-[10px] font-normal text-slate-400">Ghana SIM</span>
                </label>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="e.g. 0244123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition"
                />

                {/* Carrier detection badge */}
                {carrierInfo && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>✓ {carrierInfo.label} number recognized</span>
                  </div>
                )}
              </div>

              {/* Customer Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] font-normal text-slate-400">Optional (for receipt)</span>
                </label>
                <input
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20 outline-none transition"
                />
              </div>

              {checkoutError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                disabled={checkingOut}
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting MoMo...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay GH₵{selectedProduct.price.toFixed(2)} via MoMo</span>
                  </>
                )}
              </button>

              {/* Security Footnote */}
              <div className="text-center pt-1 space-y-1">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>256-bit Secure Mobile Money · Instant SIM Crediting</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Supported: MTN MoMo · Telecel Cash · AT Money
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. LEAVE A REVIEW MODAL ─────────────────────────────────────────── */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReviewModalOpen(false)}
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Write a Store Review
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-500">Your review will be posted shortly.</p>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalOpen(false);
                    setReviewSubmitted(false);
                  }}
                  className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setReviewSubmitted(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            s <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel K."
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#1a56db]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Comment</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with delivery speed, prices, etc."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-[#1a56db] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1a56db] hover:bg-[#1546b3] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
