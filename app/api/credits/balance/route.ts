import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

const ADMIN_EMAIL = "chnomg@gmail.com";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ credits: { balance: 0, unlimited: false } });

    if (session.email === ADMIN_EMAIL) {
      await query("INSERT INTO user_credits (user_id, balance, unlimited, is_free_tier) VALUES ($1, 99999, true, false) ON CONFLICT (user_id) DO UPDATE SET unlimited = true, balance = 99999", [session.id]);
      return NextResponse.json({ credits: { balance: 99999, unlimited: true, total_purchased: 0, total_used: 0, is_free_tier: false } });
    }

    let credits = await queryOne<Record<string, unknown>>("SELECT * FROM user_credits WHERE user_id = $1", [session.id]);
    if (!credits) {
      const rows = await query("INSERT INTO user_credits (user_id, balance, is_free_tier) VALUES ($1, 10, true) RETURNING *", [session.id]);
      credits = rows[0] as Record<string, unknown>;
    }

    if (credits?.is_free_tier && !credits?.unlimited) {
      const last = credits.last_free_topup ? new Date(credits.last_free_topup as string) : null;
      const now = new Date();
      if (!last || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
        await query("UPDATE user_credits SET balance = balance + 10, last_free_topup = CURRENT_DATE WHERE user_id = $1", [session.id]);
        credits = await queryOne<Record<string, unknown>>("SELECT * FROM user_credits WHERE user_id = $1", [session.id]);
      }
    }

    return NextResponse.json({ credits });
  } catch { return NextResponse.json({ credits: { balance: 10, unlimited: false, is_free_tier: true } }); }
}
