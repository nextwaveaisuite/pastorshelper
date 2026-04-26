import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get or create credit record
  let { data: credits } = await supabase
    .from("user_credits")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (!credits) {
    const { data: newCredits } = await supabase
      .from("user_credits")
      .insert({ user_id, balance: 10, last_free_topup: new Date().toISOString().split("T")[0] })
      .select()
      .single();
    credits = newCredits;

    // Log welcome credits
    await supabase.from("credit_transactions").insert({
      user_id,
      type: "free_topup",
      amount: 10,
      description: "Welcome credits — free tier",
    });
  }

  // Check if monthly free top-up is due (1st of each month)
  if (credits) {
    const today = new Date();
    const lastTopup = credits.last_free_topup ? new Date(credits.last_free_topup) : null;
    const isNewMonth =
      !lastTopup ||
      today.getMonth() !== lastTopup.getMonth() ||
      today.getFullYear() !== lastTopup.getFullYear();

    if (isNewMonth && credits.is_free_tier) {
      const topupAmount = 10;
      await supabase
        .from("user_credits")
        .update({
          balance: credits.balance + topupAmount,
          last_free_topup: today.toISOString().split("T")[0],
        })
        .eq("user_id", user_id);

      await supabase.from("credit_transactions").insert({
        user_id,
        type: "free_topup",
        amount: topupAmount,
        description: `Monthly free credits — ${today.toLocaleString("default", { month: "long", year: "numeric" })}`,
      });

      credits.balance += topupAmount;
    }
  }

  return NextResponse.json({ credits });
}
