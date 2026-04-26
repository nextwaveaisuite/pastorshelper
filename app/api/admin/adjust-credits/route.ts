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

    // Get current record — create it if it doesn't exist
    let { data: credits } = await supabase
      .from("user_credits")
      .select("balance, unlimited")
      .eq("user_id", user_id)
      .single();

    if (!credits) {
      await supabase.from("user_credits").insert({ user_id, balance: 0, is_free_tier: true });
      credits = { balance: 0, unlimited: false };
    }

    const currentBalance = credits?.balance || 0;

    // Handle unlimited actions
    if (action === "unlimited") {
      await supabase.from("user_credits").update({ unlimited: true, balance: 99999 }).eq("user_id", user_id);
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 99999, description: "Admin granted unlimited credits" }).catch(() => {});
      return NextResponse.json({ success: true, new_balance: 99999, unlimited: true });
    }

    if (action === "revoke_unlimited") {
      await supabase.from("user_credits").update({ unlimited: false, balance: 50 }).eq("user_id", user_id);
      await supabase.from("credit_transactions").insert({ user_id, type: "admin_topup", amount: 50, description: "Admin revoked unlimited — reset to 50" }).catch(() => {});
      return NextResponse.json({ success: true, new_balance: 50, unlimited: false });
    }

    // Calculate new balance
    let newBalance = currentBalance;
    let transactionAmount = 0;
    const amt = parseInt(amount) || 0;

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

    // Update balance
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: newBalance, unlimited: false })
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log transaction
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
