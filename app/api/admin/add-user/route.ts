import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const { email, starting_credits } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    // Create user with temp password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPassword, 12);
    const rows = await query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING *",
      [email.toLowerCase(), hash]
    );
    if (rows[0]) {
      await query("INSERT INTO user_credits (user_id, balance, is_free_tier) VALUES ($1, $2, true) ON CONFLICT DO NOTHING",
        [rows[0].id, starting_credits || 10]);
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
