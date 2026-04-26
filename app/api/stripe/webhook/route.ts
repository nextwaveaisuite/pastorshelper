import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const { user_id, credits } = session.metadata || {};

    if (!user_id || !credits) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const creditsToAdd = parseInt(credits);

    // Get current balance
    const { data: existing } = await supabase
      .from("user_credits")
      .select("balance, total_purchased")
      .eq("user_id", user_id)
      .single();

    const currentBalance = existing?.balance || 0;
    const totalPurchased = (existing?.total_purchased || 0) + creditsToAdd;

    // Add credits and mark as non-free-tier
    await supabase
      .from("user_credits")
      .upsert({
        user_id,
        balance: currentBalance + creditsToAdd,
        total_purchased: totalPurchased,
        is_free_tier: false,
      });

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id,
      type: "purchase",
      amount: creditsToAdd,
      description: `Purchased ${creditsToAdd} credits`,
      stripe_session_id: session.id,
    });

    console.log(`✅ Added ${creditsToAdd} credits to user ${user_id}`);
  }

  return NextResponse.json({ received: true });
}
