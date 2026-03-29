import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb, adminServerTimestamp } from "@/lib/firebase-admin";

const HOURLY_RATE_AED = 35;
const DEFAULT_CURRENCY = "aed";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" })
  : null;

export async function POST(request: Request) {
  try {
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key not configured." },
        { status: 500 },
      );
    }

    const { bookingDocId } = await request.json();

    if (!bookingDocId) {
      return NextResponse.json(
        { error: "Booking document id is required." },
        { status: 400 },
      );
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingDocId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    const booking = bookingSnap.data() || {};
    const duration = Number(booking.serviceDuration || booking.duration || 0);

    if (!duration || Number.isNaN(duration)) {
      return NextResponse.json(
        { error: "Invalid service duration for booking." },
        { status: 400 },
      );
    }

    const amountInAed = Math.max(1, duration * HOURLY_RATE_AED);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.email || booking.clientEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: DEFAULT_CURRENCY,
            unit_amount: Math.round(amountInAed * 100),
            product_data: {
              name: booking.serviceName || "Service Booking",
              description: booking.propertyType
                ? `Property: ${booking.propertyType}`
                : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingDocId,
        bookingRef: booking.bookingId || "",
        clientName: booking.name || booking.clientName || "",
      },
      payment_intent_data: {
        metadata: {
          bookingDocId,
          bookingRef: booking.bookingId || "",
        },
      },
      success_url: `${baseUrl}/book-service?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book-service?checkout=cancelled`,
    });

    await bookingRef.update({
      paymentMethod: "card",
      paymentStatus: "pending",
      stripeSessionId: session.id,
      updatedAt: adminServerTimestamp(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
