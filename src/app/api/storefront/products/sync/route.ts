import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { requireStorefront, syncStorefrontProducts } from "@/lib/storefront";
import { handleRouteError, apiError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const storefront = await requireStorefront(user.id);
    if (storefront.status !== "ENABLED") {
      return apiError(403, "Storefront is not active");
    }

    const result = await syncStorefrontProducts(storefront.id, { force: true });
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.count} package prices from your pricing profile`,
      result,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
