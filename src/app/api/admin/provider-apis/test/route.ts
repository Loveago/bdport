import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ClickyfiedClient, generateClickyfiedReference } from "@/lib/provider-apis/clickyfied";
import { TskconnectClient, resolveTskconnectPackageId, generateTskconnectReference } from "@/lib/provider-apis/tskconnect";
import { getProviderRoutingConfig } from "@/lib/provider-apis/router";
import { handleRouteError, apiError } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { action, provider = "TSKCONNECT", recipient = "0241234567", gbAmount = 1, network = "MTN" } = body;

    const config = await getProviderRoutingConfig();

    if (action === "test_tskconnect_balance") {
      const client = new TskconnectClient({
        ...config.tskconnect,
        apiKey: body.apiKey || config.tskconnect.apiKey,
        baseUrl: body.baseUrl || config.tskconnect.baseUrl,
      });
      const balanceRes = await client.getBalance();
      return NextResponse.json({ success: true, balance: balanceRes.data, raw: balanceRes });
    }

    if (action === "test_tskconnect_verify") {
      const client = new TskconnectClient({
        ...config.tskconnect,
        apiKey: body.apiKey || config.tskconnect.apiKey,
        baseUrl: body.baseUrl || config.tskconnect.baseUrl,
      });
      const res = await client.verifyNumbers([recipient]);
      return NextResponse.json({ success: true, verification: res });
    }

    if (action === "test_tskconnect_packages") {
      const client = new TskconnectClient({
        ...config.tskconnect,
        apiKey: body.apiKey || config.tskconnect.apiKey,
        baseUrl: body.baseUrl || config.tskconnect.baseUrl,
      });
      const res = await client.getPackages(network);
      return NextResponse.json({ success: true, packages: res.data });
    }

    if (action === "test_clickyfied_billing") {
      const client = new ClickyfiedClient(config.clickyfied);
      const billing = await client.getCurrentBilling(body.date);
      return NextResponse.json({ success: true, billing });
    }

    if (action === "test_clickyfied_verify") {
      const client = new ClickyfiedClient(config.clickyfied);
      const res = await client.verifyNumbers([recipient]);
      return NextResponse.json({ success: true, verification: res });
    }

    if (action === "test_order") {
      if (provider === "TSKCONNECT") {
        const client = new TskconnectClient({
          ...config.tskconnect,
          apiKey: body.apiKey || config.tskconnect.apiKey,
          baseUrl: body.baseUrl || config.tskconnect.baseUrl,
        });
        const packageId = resolveTskconnectPackageId(network, gbAmount);
        const reference = generateTskconnectReference(`TEST-${Date.now()}`);
        const order = await client.submitOrder({
          network,
          packageId,
          recipient,
          reference,
          idempotencyKey: reference,
        });
        return NextResponse.json({ success: true, provider: "TSKCONNECT", order });
      }

      if (provider === "CLICKYFIED") {
        const client = new ClickyfiedClient(config.clickyfied);
        const externalReference = generateClickyfiedReference();
        const order = await client.submitOrder({
          externalReference,
          entries: [{ number: recipient, allocationGB: gbAmount }],
          idempotencyKey: externalReference,
        });
        return NextResponse.json({ success: true, provider: "CLICKYFIED", order });
      }

      return apiError(400, "Unsupported provider for test order");
    }

    return apiError(400, `Unknown action: ${action}`);
  } catch (err: any) {
    return handleRouteError(err);
  }
}
