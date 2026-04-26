import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email, user_id, amount, action, reason } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    if (!user_id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: credits } = await supabase.from("user_credits").select("balance").eq("user_id", user_id).single();
    const currentBalance = credits?.balance || 0;

    if (action === "unlimited") {
      await supabase.from("user_credits").upsert({ user_id, unlimited: true, balance: 99999 });
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 99999, description: "Admin granted unlimited credits" });
      return NextResponse.json({ success: true, new_balance: 99999, unlimited: true });
    }

    if (action === "revoke_unlimited") {
      await supabase.from("user_credits").update({ unlimited: false, balance: 50 }).eq("user_id", user_id);
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 50, description: "Admin revoked unlimited — reset to 50" });
      return NextResponse.json({ success: true, new_balance: 50, unlimited: false });
    }

    let newBalance = currentBalance;
    let transactionAmount = 0;

    if (action === "add") {
      newBalance = currentBalance + (amount || 0);
      transactionAmount = amount || 0;
    } else if (action === "remove") {
      newBalance = Math.max(0, currentBalance - (amount || 0));
      transactionAmount = -(Math.min(amount || 0, currentBalance));
    } else if (action === "set") {
      newBalance = amount || 0;
      transactionAmount = newBalance - currentBalance;
    } else if (action === "reset") {
      newBalance = 0;
      transactionAmount = -currentBalance;
    }

    await supabase.from("user_credits").upsert({ user_id, balance: newBalance, unlimited: false });
    await supabase.from("credit_transactions").insert({
      user_id,
      type: transactionAmount >= 0 ? "admin_topup" : "deduct",
      amount: transactionAmount,
      description: reason || `Admin ${action} — balance: ${currentBalance} → ${newBalance}`,
    });

    return NextResponse.json({ success: true, previous_balance: currentBalance, new_balance: newBalance });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
