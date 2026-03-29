import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { adminDb, adminServerTimestamp } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" })
  : null;

async function markBookingPaid(session: Stripe.Checkout.Session) {
  const bookingDocId = session.metadata?.bookingDocId;
  if (!bookingDocId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await adminDb.collection("bookings").doc(bookingDocId).update({
    paymentStatus: "paid",
    paymentMethod: "card",
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntentId || "",
    updatedAt: adminServerTimestamp(),
  });
}

export async function POST(request: Request) {
  try {
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key not configured." },
        { status: 500 },
      );
    }

    if (!stripeWebhookSecret) {
      return NextResponse.json(
        { error: "Stripe webhook secret not configured." },
        { status: 500 },
      );
    }

    const headerList = await headers();
    const signature = headerList.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature." },
        { status: 400 },
      );
    }

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markBookingPaid(session);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook handler failed." },
      { status: 400 },
    );
  }
}
