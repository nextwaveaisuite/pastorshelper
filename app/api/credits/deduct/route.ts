import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

const COSTS: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, prayer: 1 };

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const body = await req.text();
    const { level, topic } = body ? JSON.parse(body) : {};
    const cost = COSTS[level || "beginner"] || 1;
    const credits = await queryOne<Record<string, unknown>>("SELECT * FROM user_credits WHERE user_id = $1", [session.id]);
    if (credits?.unlimited) return NextResponse.json({ success: true, cost: 0, new_balance: 99999, unlimited: true });
    const balance = (credits?.balance as number) || 0;
    if (balance < cost) return NextResponse.json({ error: "insufficient_credits", cost, balance }, { status: 402 });
    await query("UPDATE user_credits SET balance = balance - $1, total_used = total_used + $1 WHERE user_id = $2", [cost, session.id]);
    await query("INSERT INTO credit_transactions (user_id, type, amount, description) VALUES ($1, 'deduct', $2, $3)", [session.id, -cost, `Generated ${level || "beginner"}: ${topic || ""}`]);
    return NextResponse.json({ success: true, cost, new_balance: balance - cost });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
