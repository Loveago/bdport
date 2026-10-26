import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { changeOrderStatus } from "@/lib/orders";
import { recordOrderApiLog } from "@/lib/order-api-logs";
import { getProviderRoutingConfig, normalizePhoneLast9 } from "@/lib/provider-apis/router";
import { TskconnectClient, mapTskconnectStatus } from "@/lib/provider-apis/tskconnect";
import { parseOrderCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const rawBody = await request.text();
    let payload: any;
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const config = await getProviderRoutingConfig();
    const signatureHeader =
      request.headers.get("x-tskconnect-signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("signature") ||
      "";
    const timestampHeader =
      request.headers.get("x-tskconnect-timestamp") ||
      request.headers.get("x-timestamp") ||
      "";

    const secret = (config.tskconnect.webhookSecret || process.env.TSKCONNECT_WEBHOOK_SECRET || "").trim();

    // Verify HMAC-SHA256 signature if secret is configured
    if (secret && signatureHeader) {
      const client = new TskconnectClient(config.tskconnect);
      const isValid = client.verifyWebhookSignature(rawBody, signatureHeader, timestampHeader, secret);
      if (!isValid) {
        console.warn(`[TskconnectWebhook] Signature verification failed for payload (sig: ${signatureHeader.slice(0, 16)}...)`);
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const event = (payload?.event || request.headers.get("x-tskconnect-event") || "").toLowerCase();
    const data = payload?.data || payload;

    const orderId = data?.orderId || payload?.orderId;
    const reference = data?.reference || payload?.reference || data?.externalReference;
    const batchCode = data?.batchCode || payload?.batchCode;
    const phoneNumber = data?.phoneNumber || data?.recipient || data?.number;
    const rawStatus = data?.status || event;
    const failureReason = data?.failureReason || data?.error?.message || data?.error;

    // Search for the matching Order in our database
    let orders: any[] = [];
    const searchKeys = [orderId, reference, batchCode].filter(Boolean).map(String);

    if (searchKeys.length > 0) {
      orders = await prisma.order.findMany({
        where: {
          OR: [
            ...searchKeys.map((k) => ({ providerReference: `TSKCONNECT:${k}` })),
            ...searchKeys.map((k) => ({ providerReference: { startsWith: `TSKCONNECT:${k}` } })),
            ...searchKeys.map((k) => ({ providerReference: { contains: k } })),
            ...searchKeys.map((k) => ({ externalReference: k })),
            ...searchKeys
              .map((k) => parseOrderCode(k))
              .filter((id): id is number => typeof id === "number" && id > 0)
              .map((id) => ({ id })),
          ],
        },
      });
    }

    // Fallback: match by phone number if in PENDING/PROCESSING status
    if (orders.length === 0 && phoneNumber) {
      const last9 = normalizePhoneLast9(String(phoneNumber));
      if (last9) {
        orders = await prisma.order.findMany({
          where: {
            phoneNumber: { contains: last9 },
            status: { in: ["PENDING", "PROCESSING"] },
            providerReference: { startsWith: "TSKCONNECT" },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });
      }
    }

    const targetStatus = mapTskconnectStatus(rawStatus);

    let updatedCount = 0;
    for (const ord of orders) {
      if (ord.status !== targetStatus && ["SUCCESS", "FAILED", "PROCESSING", "CANCELLED"].includes(targetStatus)) {
        const reason =
          targetStatus === "FAILED"
            ? failureReason || `Tskconnect marked order as failed (${rawStatus})`
            : `Tskconnect webhook: ${event || rawStatus}`;

        await changeOrderStatus(
          ord.id,
          targetStatus,
          reason,
          { id: "system", label: "Tskconnect Webhook" },
          { force: true }
        );
        updatedCount++;
      }

      // Record Order API Log
      await recordOrderApiLog({
        orderId: ord.id,
        provider: "TSKCONNECT",
        action: `WEBHOOK_${(event || "EVENT").toUpperCase().replace(/\./g, "_")}`,
        endpoint: "/api/webhooks/providers/tskconnect",
        method: "POST",
        requestPayload: payload,
        responsePayload: { success: true, targetStatus, event },
        statusCode: 200,
        success: true,
        providerReference: ord.providerReference || (orderId ? `TSKCONNECT:${orderId}` : null),
        durationMs: Date.now() - startTime,
      });
    }

    return NextResponse.json({
      success: true,
      event,
      matchedOrders: orders.length,
      updatedOrders: updatedCount,
      targetStatus,
    });
  } catch (err: any) {
    console.error("[TskconnectWebhook] Error handling webhook:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
