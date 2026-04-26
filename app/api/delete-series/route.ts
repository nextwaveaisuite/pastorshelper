import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { id, user_id } = text ? JSON.parse(text) : {};
    if (!id || !user_id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await supabase.from("sermons").update({ series_id: null }).eq("series_id", id).eq("user_id", user_id);
    await supabase.from("series").delete().eq("id", id).eq("user_id", user_id);
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
