import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ prayers: [] });
    const prayers = await query("SELECT * FROM prayers WHERE user_id = $1 ORDER BY created_at DESC", [session.id]);
    return NextResponse.json({ prayers });
  } catch { return NextResponse.json({ prayers: [] }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const body = await req.json();
    const { title, prayer_type, topic, audience, language, content } = body;
    const rows = await query(
      "INSERT INTO prayers (user_id, title, prayer_type, topic, audience, language, content) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [session.id, title || `${prayer_type} — ${topic || "General"}`, prayer_type || "General Prayer", topic || "", audience || "", language || "English", JSON.stringify(content)]
    );
    return NextResponse.json({ success: true, prayer: rows[0] });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const { id } = await req.json();
    await query("DELETE FROM prayers WHERE id = $1 AND user_id = $2", [id, session.id]);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
