import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { user_id } = text ? JSON.parse(text) : {};
    if (!user_id) return NextResponse.json({ sermons: [] });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data } = await supabase.from("sermons").select("*").eq("user_id", user_id).order("created_at", { ascending: false });
    return NextResponse.json({ sermons: data || [] });
  } catch (e) { console.error(e); return NextResponse.json({ sermons: [] }); }
}
