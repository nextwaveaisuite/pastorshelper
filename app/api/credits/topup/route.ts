import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email, user_id, amount, reason } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    if (!user_id || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: credits } = await supabase.from("user_credits").select("balance").eq("user_id", user_id).single();
    const currentBalance = credits?.balance || 0;
    await supabase.from("user_credits").upsert({ user_id, balance: currentBalance + amount });
    await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount, description: reason || "Admin top-up" });
    return NextResponse.json({ success: true, new_balance: currentBalance + amount });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
