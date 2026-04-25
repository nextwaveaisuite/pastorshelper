import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { user_id } = await req.json();
  if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  // Get all series for user
  const { data: seriesList, error } = await supabase
    .from("series")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For each series, get its sermons
  const seriesWithSermons = await Promise.all(
    (seriesList || []).map(async (s) => {
      const { data: sermons } = await supabase
        .from("sermons")
        .select("id, title, topic, tone, audience, created_at")
        .eq("series_id", s.id)
        .order("created_at", { ascending: true });
      return { ...s, sermons: sermons || [] };
    })
  );

  return NextResponse.json({ series: seriesWithSermons });
}
