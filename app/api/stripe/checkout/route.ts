import { NextResponse } from "next/server";
import Stripe from "stripe";
import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

const PACKS = [
  { id: "starter",    credits: 25,  price: 500,  name: "Starter Pack — 25 Credits" },
  { id: "ministry",   credits: 75,  price: 1200, name: "Ministry Pack — 75 Credits" },
  { id: "evangelist", credits: 200, price: 2500, name: "Evangelist Pack — 200 Credits" },
  { id: "church",     credits: 500, price: 5500, name: "Church Pack — 500 Credits" },
];

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const { pack_id } = await req.json();
    const pack = PACKS.find(p => p.id === pack_id);
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "aud", product_data: { name: pack.name, description: `${pack.credits} sermon credits` }, unit_amount: pack.price }, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/credits?success=true&credits=${pack.credits}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/credits?cancelled=true`,
      customer_email: session.email,
      metadata: { user_id: session.id, pack_id, credits: pack.credits.toString() },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Checkout failed" }, { status: 500 }); }
}
