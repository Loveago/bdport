import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PriceMask } from "@/components/price-mask";
import { NetworkPackageGrid, type PackageGroup } from "@/components/packages/network-package-grid";
import { BadgeCheck, Layers, Package, ShieldCheck } from "lucide-react";
import { formatGHS } from "@/lib/types";
import { getEffectivePricingProfileForUser } from "@/lib/orders";

export default async function PackagesPage() {
  const user = await getCurrentUser();

  const profile = user ? await getEffectivePricingProfileForUser(user) : null;
  const profileId = profile?.id ?? null;
  const tiers = profileId
    ? await prisma.priceTier.findMany({ where: { profileId }, orderBy: { gbAmount: "asc" } })
    : [];
  const profileName = profile?.name ?? "Standard";

  // Available packages grouped by network, with the user's profile price attached
  const packages = await prisma.dataPackage.findMany({
    where: { active: true },
    orderBy: [{ network: "asc" }, { gbAmount: "asc" }],
  });
  const priceMap = new Map(tiers.map((t) => [t.gbAmount, t.priceGHS]));
  const { getSetting } = await import("@/lib/orders");
  const showPricesSetting = await getSetting("show_package_prices_to_users", "true");
  const showPrices = showPricesSetting !== "false";

  const isCustomProfile = profile && !profile.isDefault;

  // Check if custom profile has distinct per-network rates
  let profileNetworkRates: Record<string, Array<{ gbAmount: number; priceGHS: number }>> | null = null;
  if (isCustomProfile && profileId) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `pricing_profile_network_rates:${profileId}` },
    });
    if (setting?.value) {
      try {
        profileNetworkRates = JSON.parse(setting.value);
      } catch {
        // ignore
      }
    }
  }

  const groups: PackageGroup[] = (["MTN", "TELECEL", "AIRTELTIGO", "AIRTELTIGO_BIGTIME"] as const)
    .map((network) => ({
      network,
      packages: packages
        .filter((p) => p.network === network)
        .map((p) => {
          let distinctPrice: number | null = null;
          if (profileNetworkRates && Array.isArray(profileNetworkRates[network])) {
            const match = profileNetworkRates[network].find((t) => t.gbAmount === p.gbAmount);
            if (match && typeof match.priceGHS === "number" && match.priceGHS > 0) {
              distinctPrice = match.priceGHS;
            }
          }
          if (distinctPrice == null && isCustomProfile && priceMap.has(p.gbAmount)) {
            distinctPrice = priceMap.get(p.gbAmount)!;
          }
          if (distinctPrice == null) {
            distinctPrice = p.retailPriceGHS ?? (priceMap.has(p.gbAmount) ? priceMap.get(p.gbAmount)! : null);
          }

          return {
            id: p.id,
            name: p.name,
            gbAmount: p.gbAmount,
            price: showPrices ? distinctPrice : null,
          };
        }),
    }))
    .filter((g) => g.packages.length > 0);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#162740] bg-white dark:bg-[#0b1322] p-5 sm:p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00df82]/30 bg-[#00df82]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#00df82]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00df82] animate-pulse" />
                Data Bundles &amp; Wholesale Rates
              </span>
              <span className="text-[10px] font-bold text-slate-400">· Multi-Carrier Catalog</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Products &amp; Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore your active wholesale pricing tier and package availability across MTN, Telecel, and AT networks.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-[#162740] bg-slate-50 dark:bg-[#070d18] px-3.5 py-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#00df82]" />
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Your Tier Profile</p>
              <p className="font-black text-slate-900 dark:text-white">{profileName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available packages by network with neon cards & interactive carriers */}
      <NetworkPackageGrid groups={groups} />
    </div>
  );
}

