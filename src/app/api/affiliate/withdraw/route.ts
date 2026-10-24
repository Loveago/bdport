import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleRouteError, apiError } from "@/lib/api-helpers";
import { requestAffiliateWithdrawal } from "@/lib/affiliate";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();

    const withdrawal = await requestAffiliateWithdrawal(user.id, body);

    return NextResponse.json({
      success: true,
      withdrawal,
    });
  } catch (err: any) {
    if (err.message && err.message.includes("Insufficient")) {
      return apiError(400, err.message);
    }
    return handleRouteError(err);
  }
}
