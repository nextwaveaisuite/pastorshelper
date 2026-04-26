import { NextResponse } from "next/server";
import Stripe from "stripe";

const CREDIT_PACKS = [
  { id: "starter",    credits: 25,  price: 500,  name: "Starter Pack — 25 Credits" },
  { id: "ministry",   credits: 75,  price: 1200, name: "Ministry Pack — 75 Credits" },
  { id: "evangelist", credits: 200, price: 2500, name: "Evangelist Pack — 200 Credits" },
  { id: "church",     credits: 500, price: 5500, name: "Church Pack — 500 Credits" },
];

export async function POST(req: Request) {
  const { pack_id, user_id, user_email } = await req.json();

  const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: pack.name,
            description: `${pack.credits} sermon credits for The Pastors Helper`,
          },
          unit_amount: pack.price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?success=true&credits=${pack.credits}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/credits?cancelled=true`,
    customer_email: user_email,
    metadata: {
      user_id,
      pack_id,
      credits: pack.credits.toString(),
    },
  });

  return NextResponse.json({ url: session.url });
}
