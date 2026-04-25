import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { sermon_id, series_id, user_id } = await req.json();
  if (!sermon_id || !user_id) return NextResponse.json({ error: "sermon_id and user_id required" }, { status: 400 });

  // series_id can be null to remove from series
  const { error } = await supabase
    .from("sermons")
    .update({ series_id: series_id || null })
    .eq("id", sermon_id)
    .eq("user_id", user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
