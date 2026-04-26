import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: profiles } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false });
    const { data: sermonCounts } = await supabase.from("sermons").select("user_id");
    const counts: Record<string, number> = {};
    (sermonCounts || []).forEach((s: { user_id: string }) => { counts[s.user_id] = (counts[s.user_id] || 0) + 1; });
    const users = (profiles || []).map((p: Record<string, unknown>) => ({ ...p, sermon_count: counts[p.id as string] || 0 }));
    return NextResponse.json({ users });
  } catch (e) { console.error(e); return NextResponse.json({ users: [] }); }
}
