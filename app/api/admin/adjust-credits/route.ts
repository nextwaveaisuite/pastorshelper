import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email, user_id, amount, action, reason } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    if (!user_id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current record
    const { data: existing } = await supabase
      .from("user_credits")
      .select("balance, unlimited")
      .eq("user_id", user_id)
      .maybeSingle();

    const currentBalance = existing?.balance || 0;

    // If no row exists, create it first
    if (!existing) {
      await supabase.from("user_credits").insert({
        user_id,
        balance: 0,
        is_free_tier: true,
        unlimited: false,
        total_purchased: 0,
        total_used: 0,
        last_free_topup: new Date().toISOString().split("T")[0],
      });
    }

    if (action === "unlimited") {
      await supabase.from("user_credits").upsert({ user_id, unlimited: true, balance: 99999 });
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 99999, description: "Admin granted unlimited credits" }).catch(() => {});
      return NextResponse.json({ success: true, previous_balance: currentBalance, new_balance: 99999, unlimited: true });
    }

    if (action === "revoke_unlimited") {
      await supabase.from("user_credits").upsert({ user_id, unlimited: false, balance: 50 });
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 50, description: "Admin revoked unlimited — reset to 50" }).catch(() => {});
      return NextResponse.json({ success: true, previous_balance: currentBalance, new_balance: 50, unlimited: false });
    }

    const amt = parseInt(amount) || 0;
    let newBalance = currentBalance;
    let transactionAmount = 0;

    if (action === "add") {
      newBalance = currentBalance + amt;
      transactionAmount = amt;
    } else if (action === "remove") {
      newBalance = Math.max(0, currentBalance - amt);
      transactionAmount = -(currentBalance - newBalance);
    } else if (action === "set") {
      newBalance = amt;
      transactionAmount = newBalance - currentBalance;
    } else if (action === "reset") {
      newBalance = 0;
      transactionAmount = -currentBalance;
    }

    // Use upsert so it works whether row exists or not
    const { error } = await supabase
      .from("user_credits")
      .upsert({ user_id, balance: newBalance, unlimited: false });

    if (error) {
      console.error("Upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("credit_transactions").insert({
      user_id,
      type: transactionAmount >= 0 ? "admin_topup" : "deduct",
      amount: transactionAmount,
      description: reason || `Admin ${action}: ${currentBalance} → ${newBalance}`,
    }).catch(() => {});

    return NextResponse.json({ success: true, previous_balance: currentBalance, new_balance: newBalance });

  } catch (e) {
    console.error("adjust-credits error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
