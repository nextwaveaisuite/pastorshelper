import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const [
      { count: totalUsers },
      { count: totalSermons },
      { count: totalSeries },
      { data: recentUsers },
      { data: recentSermons },
      { data: pageViews },
      { data: sermonUsage },
      { data: creditData },
    ] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("sermons").select("*", { count: "exact", head: true }),
      supabase.from("series").select("*", { count: "exact", head: true }),
      supabase.from("user_profiles").select("email, created_at, last_seen, total_sermons_generated, is_banned").order("created_at", { ascending: false }).limit(10),
      supabase.from("sermons").select("title, tone, audience, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("page_views").select("page, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("sermon_usage").select("topic, level, language, tone, audience, created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_credits").select("user_id, balance, total_purchased, total_used, unlimited"),
    ]);

    // Page views by day
    const last7: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      last7[d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })] = 0;
    }
    (pageViews || []).forEach((v: { created_at: string }) => {
      const key = new Date(v.created_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
      if (key in last7) last7[key]++;
    });

    // Top topics
    const topicCounts: Record<string, number> = {};
    (sermonUsage || []).forEach((u: { topic: string }) => {
      if (u.topic) topicCounts[u.topic] = (topicCounts[u.topic] || 0) + 1;
    });
    const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Level breakdown
    const levelCounts: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0 };
    (sermonUsage || []).forEach((u: { level: string }) => { if (u.level) levelCounts[u.level] = (levelCounts[u.level] || 0) + 1; });

    // Language breakdown
    const langCounts: Record<string, number> = {};
    (sermonUsage || []).forEach((u: { language: string }) => { if (u.language) langCounts[u.language] = (langCounts[u.language] || 0) + 1; });
    const topLanguages = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Tone breakdown
    const toneCounts: Record<string, number> = {};
    (sermonUsage || []).forEach((u: { tone: string }) => { if (u.tone) toneCounts[u.tone] = (toneCounts[u.tone] || 0) + 1; });

    // Active users (used in last 7 days)
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUserIds = new Set((sermonUsage || []).filter((u: { created_at: string }) => new Date(u.created_at) > sevenDaysAgo).map((u: { topic: string }) => u));
    const activeUsers = activeUserIds.size;

    // Credit stats
    const totalCreditsIssued = (creditData || []).reduce((sum: number, c: { total_purchased: number }) => sum + (c.total_purchased || 0), 0);
    const totalCreditsUsed = (creditData || []).reduce((sum: number, c: { total_used: number }) => sum + (c.total_used || 0), 0);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalSermons: totalSermons || 0,
        totalSeries: totalSeries || 0,
        activeUsers,
        totalCreditsIssued,
        totalCreditsUsed,
        viewsByDay: last7,
        topTopics,
        levelCounts,
        topLanguages,
        toneCounts,
        recentUsers: recentUsers || [],
        recentSermons: recentSermons || [],
        recentUsage: (sermonUsage || []).slice(0, 20),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ stats: { totalUsers: 0, totalSermons: 0, totalSeries: 0, activeUsers: 0, totalCreditsIssued: 0, totalCreditsUsed: 0, viewsByDay: {}, topTopics: [], levelCounts: {}, topLanguages: [], toneCounts: {}, recentUsers: [], recentSermons: [], recentUsage: [] } });
  }
}
