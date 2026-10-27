import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "mycedinet_session";
const secretString = process.env.AUTH_SECRET || "dev-insecure-secret-change-me-replace-in-prod";
const secret = new TextEncoder().encode(secretString);

const ADMIN_ONLY_PREFIXES = [
  "/admin/users",
  "/admin/settings",
  "/admin/api",
  "/admin/audit-logs",
  "/admin/pricing",
  "/admin/packages",
];

import { cleanDomain } from "@/lib/storefront-utils";

const STOREFRONT_DOMAIN = cleanDomain(
  process.env.STOREFRONT_DOMAIN || process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN,
  "commontechstore.com"
);
const MAIN_DOMAIN = cleanDomain(
  process.env.MAIN_DOMAIN || process.env.NEXT_PUBLIC_MAIN_DOMAIN,
  "commontech.com"
);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const host = cleanDomain(rawHost);
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const isStorefrontDomain = !isLocalhost && host === STOREFRONT_DOMAIN;

  // ---------------------------------------------------------------------------
  // 1. STOREFRONT DOMAIN ROUTING
  // ---------------------------------------------------------------------------
  if (isStorefrontDomain) {
    // Prevent access to management dashboard & admin panel on the storefront domain
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(`https://${MAIN_DOMAIN}/login`);
    }

    // Serve dedicated storefront favicon and app icons
    if (pathname === "/favicon.ico" || pathname === "/icon.svg" || pathname === "/apple-icon.png") {
      const url = request.nextUrl.clone();
      url.pathname = "/store/icon.svg";
      return NextResponse.rewrite(url);
    }

    // Allow API endpoints, internal assets, and static files to execute directly
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Allow legal policies and compliance pages to be served directly
    if (
      pathname === "/terms" ||
      pathname === "/terms-of-service" ||
      pathname === "/privacy" ||
      pathname === "/privacy-policy" ||
      pathname === "/refund-policy" ||
      pathname === "/refunds" ||
      pathname === "/cancellation-policy"
    ) {
      return NextResponse.next();
    }

    // Normalize legacy /store URLs to clean root URLs
    if (pathname === "/store" || pathname === "/store/") {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = "/";
      return NextResponse.redirect(cleanUrl);
    }
    if (pathname.startsWith("/store/")) {
      const cleanPath = pathname.replace(/^\/store/, "");
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = cleanPath || "/";
      return NextResponse.redirect(cleanUrl);
    }

    // Handle Storefront root (e.g. custom domain)
    // Rewrites to /store which renders the dedicated storefront homepage
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/store";
      return NextResponse.rewrite(url);
    }

    // Rewrite clean storefront paths:
    // /:slug -> /store/:slug
    // /:slug/mtn -> /store/:slug/mtn
    // /:slug/track -> /store/:slug/track
    // /:slug/order/:ref -> /store/:slug/order/:ref
    const url = request.nextUrl.clone();
    url.pathname = `/store${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---------------------------------------------------------------------------
  // 2. MAIN PLATFORM ROUTING (mycedinet.com / localhost)
  // ---------------------------------------------------------------------------

  // Friendly /@slug redirects to the dedicated storefront domain (or rewrites in local dev)
  if (pathname.startsWith("/@")) {
    const slug = pathname.slice(2).replace(/\/+$/, "");
    if (/^[a-z0-9-]{3,32}$/.test(slug)) {
      if (isLocalhost) {
        const url = request.nextUrl.clone();
        url.pathname = `/store/${slug}`;
        return NextResponse.rewrite(url);
      }
      return NextResponse.redirect(`https://${STOREFRONT_DOMAIN}/${slug}`);
    }
  }

  // On localhost, allow clean direct /:slug testing (e.g. http://localhost:3000/lofaq-data-hub)
  const RESERVED_PATHS = new Set([
    "admin",
    "dashboard",
    "api",
    "v1",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "store",
    "terms",
    "terms-of-service",
    "privacy",
    "privacy-policy",
    "refund-policy",
    "refunds",
    "cancellation-policy",
    "maintenance",
    "icon.svg",
    "apple-icon.png",
    "favicon.ico",
  ]);

  if (isLocalhost && pathname !== "/") {
    const firstSegment = pathname.slice(1).split("/")[0];
    if (
      !RESERVED_PATHS.has(firstSegment) &&
      !firstSegment.startsWith("_") &&
      !firstSegment.includes(".") &&
      /^[a-z0-9-]{3,32}$/.test(firstSegment)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/store${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // If in production on main domain and visitor accesses /store/slug, redirect to clean storefront domain
  if (!isLocalhost && pathname.startsWith("/store/")) {
    const cleanPath = pathname.replace(/^\/store/, "");
    return NextResponse.redirect(`https://${STOREFRONT_DOMAIN}${cleanPath}${search}`);
  }

  const token =
    request.cookies.get("commontech_session")?.value ||
    request.cookies.get(SESSION_COOKIE)?.value ||
    request.cookies.get("tskconnect_session")?.value;
  let payload: { role?: unknown; tv?: unknown } | null = null;
  if (token) {
    try {
      const { payload: verified } = await jwtVerify(token, secret, {
        issuer: ["commontech", "mycedinet", "tskconnect"],
      });
      payload = verified as { role?: unknown; tv?: unknown };
    } catch {
      payload = null;
    }
  }

  const role = typeof payload?.role === "string" ? payload.role : null;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && role) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Root URL redirection: authenticated users go to /dashboard, guests go to /login
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = role ? "/dashboard" : "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    if (isAuthPage) return NextResponse.next();
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN" && role !== "MANAGER") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // ADMIN-only sections (MANAGER is not allowed)
    if (
      role !== "ADMIN" &&
      ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static asset images (png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp)$).*)",
  ],
};
