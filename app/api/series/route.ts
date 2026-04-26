import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    if (!body) return NextResponse.json({ series: [] });
    const { user_id } = JSON.parse(body);
    if (!user_id) return NextResponse.json({ series: [] });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: seriesList } = await supabase
      .from("series")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

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
  } catch (err) {
    console.error("Series error:", err);
    return NextResponse.json({ series: [] });
  }
}
