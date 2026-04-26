import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { page } = text ? JSON.parse(text) : {};
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await supabase.from("page_views").insert({ page: page || "/" });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: true }); }
}
