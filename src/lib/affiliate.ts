import { prisma } from "@/lib/prisma";
import { resolveUserWholesalePrice } from "@/lib/orders";

/**
 * Generate a clean, attractive affiliate referral code.
 * e.g. "FELIX482" or "AGENT7192"
 */
export function generateAffiliateCode(name?: string): string {
  let prefix = "AGT";
  if (name) {
    const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (clean.length >= 3) {
      prefix = clean.slice(0, 5);
    }
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSuffix}`;
}

/**
 * Ensure a user has an affiliate code assigned.
 * If not, generates a unique code and persists it.
 */
export async function ensureUserAffiliateCode(
  userId: string,
  name?: string,
  client: any = prisma
): Promise<string> {
  const existing = await client.user.findUnique({
    where: { id: userId },
    select: { affiliateCode: true, name: true },
  });

  if (existing?.affiliateCode) {
    return existing.affiliateCode;
  }

  let code = generateAffiliateCode(name || existing?.name);
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const check = await client.user.findUnique({
      where: { affiliateCode: code },
      select: { id: true },
    });
    if (!check) {
      isUnique = true;
    } else {
      code = generateAffiliateCode(name || existing?.name);
      attempts++;
    }
  }

  await client.user.update({
    where: { id: userId },
    data: { affiliateCode: code },
  });

  return code;
}

export interface DistributeCommissionInput {
  originOrderId: number;
  userId: string; // The user whose account placed or originated the order
  packageId?: string | null;
  gbAmount: number;
  network: string;
  amount: number; // Wholesale/settlement amount paid by this user
}

/**
 * Distribute cascading affiliate commissions up the referrer hierarchy.
 *
 * Example:
 * Base Platform Cost = 10 GHS
 * Main Agent sets Sub-Agent A price = 12 GHS
 * Sub-Agent A sets Sub-Agent B price = 13 GHS
 *
 * Sub-Agent B buys at 13 GHS:
 * - Tier 1: Sub-Agent A cost is 12 GHS -> A gets 13 - 12 = 1 GHS profit.
 * - Tier 2: Main Agent cost is 10 GHS -> Main Agent gets 12 - 10 = 2 GHS profit.
 * - Platform retains 10 GHS.
 */
export async function distributeAffiliateCommissions(
  tx: any,
  input: DistributeCommissionInput
): Promise<Array<{ beneficiaryId: string; amount: number; tierLevel: number }>> {
  if (!input.userId || !input.amount || input.amount <= 0) {
    return [];
  }

  // 1. Resolve package
  let pkg: { id: string; gbAmount: number; network: string; retailPriceGHS?: number | null } | null = null;
  if (input.packageId) {
    pkg = await tx.dataPackage.findUnique({
      where: { id: input.packageId },
      select: { id: true, gbAmount: true, network: true, retailPriceGHS: true },
    });
  }
  if (!pkg && input.network && input.gbAmount) {
    pkg = await tx.dataPackage.findUnique({
      where: {
        network_gbAmount: {
          network: input.network.toUpperCase(),
          gbAmount: input.gbAmount,
        },
      },
      select: { id: true, gbAmount: true, network: true, retailPriceGHS: true },
    });
  }

  if (!pkg) {
    return [];
  }

  // 2. Fetch origin user to check parent referrer
  const originUser = await tx.user.findUnique({
    where: { id: input.userId },
    select: { id: true, referredById: true },
  });

  if (!originUser?.referredById) {
    return []; // No upline agent
  }

  const distributed: Array<{ beneficiaryId: string; amount: number; tierLevel: number }> = [];
  let currentParentId: string | null = originUser.referredById;
  let childCost = input.amount;
  let tierLevel = 1;
  const visited = new Set<string>([input.userId]);

  // Walk up referrer tree (max 10 tiers to prevent any cycle)
  while (currentParentId && tierLevel <= 10) {
    if (visited.has(currentParentId)) {
      console.warn(`[Affiliate] Referral cycle detected for user ${currentParentId}`);
      break;
    }
    visited.add(currentParentId);

    const parent = await tx.user.findUnique({
      where: { id: currentParentId },
      select: { id: true, name: true, email: true, balance: true, referredById: true },
    });

    if (!parent) break;

    // What is parent agent's wholesale cost for this package?
    const parentCost = await resolveUserWholesalePrice(parent.id, pkg);

    // Parent's profit is the margin between what the downline was charged and parent's cost
    const profit = Math.round((childCost - parentCost) * 100) / 100;

    if (profit > 0) {
      // 1. Credit parent balance
      await tx.user.update({
        where: { id: parent.id },
        data: { balance: { increment: profit } },
      });

      // 2. Record AffiliateCommission
      await tx.affiliateCommission.create({
        data: {
          beneficiaryId: parent.id,
          sourceUserId: input.userId,
          originOrderId: input.originOrderId,
          packageId: pkg.id,
          amount: profit,
          subAgentCost: childCost,
          agentCost: parentCost,
          tierLevel,
          status: "PAID",
        },
      });

      // 3. Record WalletTransaction ledger item
      await tx.walletTransaction.create({
        data: {
          userId: parent.id,
          type: "COMMISSION",
          amount: profit,
          status: "APPROVED",
          reference: `affiliate:${input.originOrderId}:tier${tierLevel}`,
          note: `Affiliate Commission (Tier ${tierLevel}) from Order #${input.originOrderId} (${pkg.network} ${pkg.gbAmount}GB)`,
        },
      });

      distributed.push({
        beneficiaryId: parent.id,
        amount: profit,
        tierLevel,
      });
    }

    // Step up to grandparent:
    // The next ancestor gets profit = (parentCost - grandParentCost)
    childCost = parentCost;
    currentParentId = parent.referredById;
    tierLevel++;
  }

  return distributed;
}

/**
 * Reverse affiliate commissions when an order is cancelled or refunded.
 */
export async function reverseAffiliateCommissions(
  tx: any,
  originOrderId: number
): Promise<number> {
  const commissions = await tx.affiliateCommission.findMany({
    where: { originOrderId, status: "PAID" },
  });

  if (!commissions || commissions.length === 0) return 0;

  let totalReversed = 0;

  for (const c of commissions) {
    // Deduct the credited commission from beneficiary balance
    await tx.user.update({
      where: { id: c.beneficiaryId },
      data: { balance: { decrement: c.amount } },
    });

    // Mark commission as REVERSED
    await tx.affiliateCommission.update({
      where: { id: c.id },
      data: { status: "REVERSED" },
    });

    // Record ledger reversal
    await tx.walletTransaction.create({
      data: {
        userId: c.beneficiaryId,
        type: "ADJUSTMENT",
        amount: -c.amount,
        status: "APPROVED",
        reference: `affiliate_reversal:${originOrderId}:${c.tierLevel}`,
        note: `Reversal of Affiliate Commission (Tier ${c.tierLevel}) for cancelled/refunded Order #${originOrderId}`,
      },
    });

    totalReversed += c.amount;
  }

  return totalReversed;
}

/**
 * Fetch overview data for agent's affiliate dashboard.
 */
export async function getAgentAffiliateOverview(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, affiliateCode: true },
  });

  if (!user) throw new Error("User not found");

  const affiliateCode = await ensureUserAffiliateCode(userId, user.name);

  // Direct sub-agents
  const subAgents = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      role: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Total commissions earned
  const commissionAgg = await prisma.affiliateCommission.aggregate({
    where: {
      beneficiaryId: userId,
      status: "PAID",
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  // Recent commission transactions
  const recentCommissions = await prisma.affiliateCommission.findMany({
    where: { beneficiaryId: userId },
    include: {
      sourceUser: {
        select: { name: true, email: true },
      },
      originOrder: {
        select: { id: true, network: true, gbAmount: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return {
    affiliateCode,
    directSubAgentsCount: subAgents.length,
    totalCommissionsEarned: commissionAgg._sum.amount ?? 0,
    totalCommissionsCount: commissionAgg._count.id ?? 0,
    subAgents: subAgents.map((sa) => ({
      id: sa.id,
      name: sa.name,
      email: sa.email,
      phone: sa.phone,
      joinedAt: sa.createdAt,
      orderCount: sa._count.orders,
    })),
    recentCommissions: recentCommissions.map((c) => ({
      id: c.id,
      amount: c.amount,
      subAgentCost: c.subAgentCost,
      agentCost: c.agentCost,
      tierLevel: c.tierLevel,
      status: c.status,
      createdAt: c.createdAt,
      sourceUserName: c.sourceUser?.name || "Sub-agent",
      orderId: c.originOrderId,
      network: c.originOrder?.network,
      gbAmount: c.originOrder?.gbAmount,
    })),
  };
}

/**
 * Fetch the agent's wholesale price sheet and configured sub-agent markup.
 */
export async function getAgentAffiliatePricingSheet(userId: string) {
  const packages = await prisma.dataPackage.findMany({
    where: { active: true },
    orderBy: [{ network: "asc" }, { gbAmount: "asc" }],
  });

  const customPrices = await prisma.affiliatePackagePrice.findMany({
    where: { agentId: userId },
  });

  const priceMap = new Map(customPrices.map((cp) => [cp.packageId, cp.priceGHS]));

  const pricingSheet = await Promise.all(
    packages.map(async (pkg) => {
      // What the agent themselves pays for this package
      const agentCost = await resolveUserWholesalePrice(userId, pkg);
      const configuredPrice = priceMap.get(pkg.id) ?? null;
      const subAgentWholesalePrice = configuredPrice ?? agentCost;
      const profitMargin = Math.round((subAgentWholesalePrice - agentCost) * 100) / 100;

      return {
        packageId: pkg.id,
        network: pkg.network,
        name: pkg.name,
        gbAmount: pkg.gbAmount,
        retailPriceGHS: pkg.retailPriceGHS,
        agentCost,
        subAgentWholesalePrice,
        profitMargin,
        isCustomized: configuredPrice !== null,
      };
    })
  );

  return pricingSheet;
}

/**
 * Save custom wholesale pricing for direct sub-agents.
 */
export async function saveAgentAffiliatePricingSheet(
  userId: string,
  prices: Array<{ packageId: string; priceGHS: number }>
) {
  const results: any[] = [];

  for (const item of prices) {
    if (typeof item.priceGHS !== "number" || isNaN(item.priceGHS)) continue;

    // Verify package exists
    const pkg = await prisma.dataPackage.findUnique({
      where: { id: item.packageId },
    });
    if (!pkg) continue;

    const agentCost = await resolveUserWholesalePrice(userId, pkg);

    // Ensure price is at least agent's wholesale cost to prevent selling at a loss
    const safePrice = Math.max(agentCost, Math.round(item.priceGHS * 100) / 100);

    const upserted = await prisma.affiliatePackagePrice.upsert({
      where: {
        agentId_packageId: {
          agentId: userId,
          packageId: item.packageId,
        },
      },
      update: {
        priceGHS: safePrice,
      },
      create: {
        agentId: userId,
        packageId: item.packageId,
        priceGHS: safePrice,
      },
    });

    results.push(upserted);
  }

  return results;
}
