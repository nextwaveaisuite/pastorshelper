import { NextResponse } from "next/server";
import Stripe from "stripe";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
    catch { return NextResponse.json({ error: "Webhook error" }, { status: 400 }); }

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const { user_id, credits } = s.metadata || {};
      if (user_id && credits) {
        const c = parseInt(credits);
        await query("INSERT INTO user_credits (user_id, balance, total_purchased) VALUES ($1, $2, $2) ON CONFLICT (user_id) DO UPDATE SET balance = user_credits.balance + $2, total_purchased = user_credits.total_purchased + $2, is_free_tier = false", [user_id, c]);
        await query("INSERT INTO credit_transactions (user_id, type, amount, description, stripe_session_id) VALUES ($1, 'purchase', $2, $3, $4)", [user_id, c, `Purchased ${c} credits`, s.id]);
      }
    }
    return NextResponse.json({ received: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
