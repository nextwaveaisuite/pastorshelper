import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
    const [totalUsers, totalSermons, totalPrayers, topTopics, levelCounts, recentUsers, recentActivity] = await Promise.all([
      queryOne<{ count: number }>("SELECT COUNT(*)::int as count FROM users"),
      queryOne<{ count: number }>("SELECT COUNT(*)::int as count FROM sermons"),
      queryOne<{ count: number }>("SELECT COUNT(*)::int as count FROM prayers"),
      query<Record<string,unknown>>("SELECT topic, COUNT(*)::int as count FROM sermon_usage WHERE topic IS NOT NULL GROUP BY topic ORDER BY count DESC LIMIT 10"),
      query<Record<string,unknown>>("SELECT level, COUNT(*)::int as count FROM sermon_usage GROUP BY level"),
      query<Record<string,unknown>>("SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 8"),
      query<Record<string,unknown>>("SELECT topic, level, language, tone, created_at FROM sermon_usage ORDER BY created_at DESC LIMIT 20"),
    ]);
    const viewsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      viewsByDay[d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })] = 0;
    }
    const views = await query<Record<string,unknown>>("SELECT created_at FROM page_views WHERE created_at > NOW() - INTERVAL '7 days'");
    views.forEach(v => {
      const key = new Date(v.created_at as string).toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
      if (key in viewsByDay) viewsByDay[key]++;
    });
    return NextResponse.json({ stats: { totalUsers: totalUsers?.count || 0, totalSermons: totalSermons?.count || 0, totalPrayers: totalPrayers?.count || 0, topTopics: topTopics.map(t => [t.topic, t.count]), levelCounts: Object.fromEntries(levelCounts.map(l => [l.level, l.count])), viewsByDay, recentUsers, recentActivity } });
  } catch { return NextResponse.json({ stats: null }); }
}
