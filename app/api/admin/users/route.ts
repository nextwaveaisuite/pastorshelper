import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const users = await query(`
      SELECT u.id, u.email, u.created_at,
        COALESCE(uc.balance, 0) as balance,
        COALESCE(uc.unlimited, false) as unlimited,
        COALESCE(uc.total_purchased, 0) as total_purchased,
        COALESCE(uc.total_used, 0) as total_used,
        COALESCE(uc.is_free_tier, true) as is_free_tier,
        COUNT(DISTINCT s.id)::int as sermon_count,
        COUNT(DISTINCT p.id)::int as prayer_count
      FROM users u
      LEFT JOIN user_credits uc ON u.id = uc.user_id
      LEFT JOIN sermons s ON u.id = s.user_id
      LEFT JOIN prayers p ON u.id = p.user_id
      GROUP BY u.id, u.email, u.created_at, uc.balance, uc.unlimited, uc.total_purchased, uc.total_used, uc.is_free_tier
      ORDER BY u.created_at DESC
    `);
    return NextResponse.json({ users });
  } catch { return NextResponse.json({ users: [] }); }
}
