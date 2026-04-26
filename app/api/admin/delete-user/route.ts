import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email, user_id } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    await supabase.from("sermons").delete().eq("user_id", user_id);
    await supabase.from("series").delete().eq("user_id", user_id);
    await supabase.from("user_profiles").delete().eq("id", user_id);
    await supabase.auth.admin.deleteUser(user_id);
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
