import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  const { requester_email } = await req.json();

  if (requester_email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: totalUsers },
    { count: totalSermons },
    { count: totalSeries },
    { data: recentUsers },
    { data: recentSermons },
    { data: pageViews },
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("sermons").select("*", { count: "exact", head: true }),
    supabase.from("series").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("email, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("sermons").select("title, tone, audience, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("page_views").select("page, created_at").order("created_at", { ascending: false }).limit(100),
  ]);

  // Page view stats
  const viewsByPage: Record<string, number> = {};
  (pageViews || []).forEach((v) => {
    viewsByPage[v.page] = (viewsByPage[v.page] || 0) + 1;
  });

  // Views by day (last 7 days)
  const last7: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7[d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })] = 0;
  }
  (pageViews || []).forEach((v) => {
    const d = new Date(v.created_at);
    const key = d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
    if (key in last7) last7[key]++;
  });

  return NextResponse.json({
    stats: {
      totalUsers: totalUsers || 0,
      totalSermons: totalSermons || 0,
      totalSeries: totalSeries || 0,
      viewsByPage,
      viewsByDay: last7,
      recentUsers: recentUsers || [],
      recentSermons: recentSermons || [],
    },
  });
}
