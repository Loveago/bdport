/**
 * Client-safe storefront money and formatting utilities.
 * Free of server-only imports (like next/headers, prisma, auth).
 */

export function toPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}

export function fromPesewas(pesewas: number): number {
  return Math.round(pesewas) / 100;
}

export function formatGhs(pesewas: number): string {
  return `GHS ${fromPesewas(pesewas).toFixed(2)}`;
}

export function storefrontOrderCode(seq: number, reference?: string | null): string {
  if (
    reference &&
    (reference.startsWith("GH-") ||
      reference.startsWith("STF-") ||
      reference.startsWith("CDI-") ||
      reference.startsWith("CF-") ||
      reference.startsWith("TSK-"))
  ) {
    return reference;
  }
  return `CDI-ST-${String(seq).padStart(5, "0")}`;
}

export function withdrawalCode(seq: number): string {
  return `CDI-WD-${String(seq).padStart(5, "0")}`;
}

/**
 * Safely sanitizes a domain or host string by stripping any protocol (http://, https://, https//),
 * paths, trailing/leading slashes, and leading 'www.'
 *
 * Handles user configuration inputs such as:
 * - "https://cedistore.vercel.app" -> "cedistore.vercel.app"
 * - "https://https//cedistore.vercel.app/ctech" -> "cedistore.vercel.app"
 * - "http://localhost:3000" -> "localhost:3000"
 * - "cedistore.vercel.app/" -> "cedistore.vercel.app"
 */
export function cleanDomain(domain?: string | null, fallback: string = "localhost:3000"): string {
  if (!domain || typeof domain !== "string") return fallback;
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) return fallback;

  // Repeatedly strip protocols or protocol typos like https://, http://, https//, http//, //
  let cleaned = trimmed.replace(/^(?:https?:?\/?\/?)+/i, "");
  // Strip any trailing path or query
  cleaned = cleaned.split("/")[0].trim();
  // Strip leading www.
  cleaned = cleaned.replace(/^www\./, "");

  return cleaned || fallback;
}

/**
 * Builds a clean, safe storefront full URL without duplicate protocols.
 * Automatically adapts between local development (http://localhost:3000/store/:slug)
 * and custom domain deployment (https://bundleportalstore.com/:slug).
 */
export function buildStorefrontUrl(slug?: string | null, domain?: string | null, subpath: string = ""): string {
  let effectiveDomain = domain;

  // If in browser and on localhost, prioritize window host so testing always works
  if (typeof window !== "undefined") {
    const browserHost = window.location.host;
    if (browserHost.startsWith("localhost") || browserHost.startsWith("127.0.0.1")) {
      effectiveDomain = browserHost;
    }
  } else if (!effectiveDomain) {
    if (
      process.env.NODE_ENV !== "production" ||
      process.env.STOREFRONT_DOMAIN?.includes("localhost") ||
      process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN?.includes("localhost") ||
      process.env.MAIN_DOMAIN?.includes("localhost")
    ) {
      effectiveDomain =
        process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN ||
        process.env.STOREFRONT_DOMAIN ||
        process.env.MAIN_DOMAIN ||
        "localhost:3000";
    }
  }

  const host = cleanDomain(effectiveDomain, "localhost:3000");
  const cleanSub = subpath ? (subpath.startsWith("/") ? subpath : `/${subpath}`) : "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = isLocal ? "http" : "https";

  // In local dev, storefront is routed under /store/:slug
  const prefix = isLocal ? "/store" : "";
  const slugPart = slug ? `${prefix}/${slug.replace(/^\/+/, "")}` : (isLocal ? "/store" : "");
  return `${protocol}://${host}${slugPart}${cleanSub}`;
}
