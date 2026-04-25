import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { user_id, name, description } = await req.json();
  if (!user_id || !name) return NextResponse.json({ error: "user_id and name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("series")
    .insert({ user_id, name, description: description || "" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, series: data });
}
