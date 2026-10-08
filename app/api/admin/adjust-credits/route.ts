import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });

    const text = await req.text();
    const { user_id, action, amount, reason } = text ? JSON.parse(text) : {};
    if (!user_id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const credits = await queryOne<Record<string, unknown>>("SELECT * FROM user_credits WHERE user_id = $1", [user_id]);
    const currentBalance = (credits?.balance as number) || 0;

    if (action === "unlimited") {
      await query("UPDATE user_credits SET unlimited = true, balance = 99999 WHERE user_id = $1", [user_id]);
      await query("INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, 'admin_topup', 99999, 'Admin granted unlimited')", [user_id]);
      return NextResponse.json({ success: true, new_balance: 99999, unlimited: true });
    }

    if (action === "revoke_unlimited") {
      await query("UPDATE user_credits SET unlimited = false, balance = 50 WHERE user_id = $1", [user_id]);
      return NextResponse.json({ success: true, new_balance: 50, unlimited: false });
    }

    const amt = parseInt(amount) || 0;
    let newBalance = currentBalance;
    if (action === "add")    newBalance = currentBalance + amt;
    if (action === "remove") newBalance = Math.max(0, currentBalance - amt);
    if (action === "set")    newBalance = amt;
    if (action === "reset")  newBalance = 0;

    await query("UPDATE user_credits SET balance = $1, unlimited = false WHERE user_id = $2", [newBalance, user_id]);
    await query(
      "INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)",
      [user_id, newBalance >= currentBalance ? "admin_topup" : "deduct", newBalance - currentBalance, reason || `Admin ${action}: ${currentBalance} → ${newBalance}`]
    );

    return NextResponse.json({ success: true, previous_balance: currentBalance, new_balance: newBalance });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
