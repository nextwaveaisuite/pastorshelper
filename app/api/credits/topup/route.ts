import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  const { requester_email, user_id, amount, reason } = await req.json();

  if (requester_email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: credits } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  const currentBalance = credits?.balance || 0;

  const { error } = await supabase
    .from("user_credits")
    .upsert({
      user_id,
      balance: currentBalance + amount,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("credit_transactions").insert({
    user_id,
    type: "admin_topup",
    amount,
    description: reason || "Admin top-up",
  });

  return NextResponse.json({ success: true, new_balance: currentBalance + amount });
}
