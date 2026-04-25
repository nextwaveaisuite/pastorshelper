import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { id, user_id } = await req.json();
  if (!id || !user_id) return NextResponse.json({ error: "id and user_id required" }, { status: 400 });

  // Remove series_id from all sermons in this series first
  await supabase.from("sermons").update({ series_id: null }).eq("series_id", id).eq("user_id", user_id);

  // Delete the series
  const { error } = await supabase.from("series").delete().eq("id", id).eq("user_id", user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
