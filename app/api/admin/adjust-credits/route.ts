import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const { user_id, action, amount, reason } = await req.json();
    if (!user_id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const credits = await queryOne<Record<string,unknown>>("SELECT * FROM user_credits WHERE user_id = $1", [user_id]);
    const current = (credits?.balance as number) || 0;
    if (action === "unlimited") {
      await query("INSERT INTO user_credits (user_id, balance, unlimited) VALUES ($1, 99999, true) ON CONFLICT (user_id) DO UPDATE SET unlimited = true, balance = 99999", [user_id]);
      return NextResponse.json({ success: true, new_balance: 99999, unlimited: true });
    }
    if (action === "revoke_unlimited") {
      await query("UPDATE user_credits SET unlimited = false, balance = 50 WHERE user_id = $1", [user_id]);
      return NextResponse.json({ success: true, new_balance: 50, unlimited: false });
    }
    const amt = parseInt(amount) || 0;
    let newBalance = current;
    if (action === "add") newBalance = current + amt;
    if (action === "remove") newBalance = Math.max(0, current - amt);
    if (action === "set") newBalance = amt;
    if (action === "reset") newBalance = 0;
    await query("INSERT INTO user_credits (user_id, balance) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET balance = $2, unlimited = false", [user_id, newBalance]);
    await query("INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)", [user_id, newBalance >= current ? "admin_topup" : "deduct", newBalance - current, reason || `Admin ${action}: ${current} → ${newBalance}`]);
    return NextResponse.json({ success: true, previous_balance: current, new_balance: newBalance });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
