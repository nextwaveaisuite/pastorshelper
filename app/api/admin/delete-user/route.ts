import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const { user_id } = await req.json();
    await query("DELETE FROM users WHERE id = $1", [user_id]);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
