import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CREDIT_COSTS: Record<string, number> = {
  beginner:     1,
  intermediate: 2,
  advanced:     3,
};

export async function POST(req: Request) {
  const { user_id, level, topic } = await req.json();
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cost = CREDIT_COSTS[level || "beginner"] || 1;

  const { data: credits } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (!credits || credits.balance < cost) {
    return NextResponse.json(
      { error: "insufficient_credits", cost, balance: credits?.balance || 0 },
      { status: 402 }
    );
  }

  const { error } = await supabase
    .from("user_credits")
    .update({
      balance: credits.balance - cost,
      total_used: supabase.from("user_credits").select("total_used"),
    })
    .eq("user_id", user_id);

  // Update total_used separately
  await supabase.rpc("increment_credits_used", { uid: user_id, amount: cost }).catch(() => {
    // Fallback if RPC doesn't exist
    supabase
      .from("user_credits")
      .update({ total_used: (credits.balance || 0) + cost })
      .eq("user_id", user_id);
  });

  await supabase.from("credit_transactions").insert({
    user_id,
    type: "deduct",
    amount: -cost,
    description: `Generated ${level || "beginner"} sermon: ${topic || "untitled"}`,
  });

  return NextResponse.json({ success: true, cost, new_balance: credits.balance - cost });
}
