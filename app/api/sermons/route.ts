import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ sermons: [] });
    const sermons = await query("SELECT * FROM sermons WHERE user_id = $1 ORDER BY created_at DESC", [session.id]);
    return NextResponse.json({ sermons });
  } catch { return NextResponse.json({ sermons: [] }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const body = await req.json();
    const { title, topic, audience, tone, level, language, content, series_id } = body;
    const rows = await query(
      "INSERT INTO sermons (user_id, title, topic, audience, tone, level, language, content, series_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [session.id, title || "Untitled Sermon", topic || "", audience || "", tone || "", level || "beginner", language || "English", JSON.stringify(content), series_id || null]
    );
    return NextResponse.json({ success: true, sermon: rows[0] });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const { id } = await req.json();
    await query("DELETE FROM sermons WHERE id = $1 AND user_id = $2", [id, session.id]);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
