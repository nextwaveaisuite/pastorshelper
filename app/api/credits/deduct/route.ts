import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const COSTS: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { user_id, level, topic } = text ? JSON.parse(text) : {};
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const cost = COSTS[level || "beginner"] || 1;
    const { data: credits } = await supabase.from("user_credits").select("balance").eq("user_id", user_id).single();
    const balance = credits?.balance ?? 0;
    if (balance < cost) return NextResponse.json({ error: "insufficient_credits", cost, balance }, { status: 402 });
    await supabase.from("user_credits").update({ balance: balance - cost }).eq("user_id", user_id);
    await supabase.from("credit_transactions").insert({ user_id, type: "deduct", amount: -cost, description: `Generated ${level || "beginner"} sermon: ${topic || ""}` });
    return NextResponse.json({ success: true, cost, new_balance: balance - cost });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
