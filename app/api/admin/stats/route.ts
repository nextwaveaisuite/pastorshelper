import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });

    const [totalUsers, totalSermons, totalPrayers, topTopics, levelCounts, recentUsers, recentActivity] = await Promise.all([
      queryOne<{ count: string }>("SELECT COUNT(*)::int as count FROM users"),
      queryOne<{ count: string }>("SELECT COUNT(*)::int as count FROM sermons"),
      queryOne<{ count: string }>("SELECT COUNT(*)::int as count FROM prayers"),
      query<Record<string, unknown>>("SELECT topic, COUNT(*)::int as count FROM sermon_usage WHERE topic IS NOT NULL GROUP BY topic ORDER BY count DESC LIMIT 10"),
      query<Record<string, unknown>>("SELECT level, COUNT(*)::int as count FROM sermon_usage GROUP BY level"),
      query<Record<string, unknown>>("SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 8"),
      query<Record<string, unknown>>("SELECT topic, level, language, tone, created_at FROM sermon_usage ORDER BY created_at DESC LIMIT 20"),
    ]);

    // Page views by day
    const viewsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
      viewsByDay[key] = 0;
    }
    const views = await query<Record<string, unknown>>("SELECT created_at FROM page_views WHERE created_at > NOW() - INTERVAL '7 days'");
    views.forEach((v) => {
      const key = new Date(v.created_at as string).toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
      if (key in viewsByDay) viewsByDay[key]++;
    });

    return NextResponse.json({
      stats: {
        totalUsers: parseInt(totalUsers?.count || "0"),
        totalSermons: parseInt(totalSermons?.count || "0"),
        totalPrayers: parseInt(totalPrayers?.count || "0"),
        topTopics: topTopics.map(t => [t.topic, t.count]),
        levelCounts: Object.fromEntries(levelCounts.map(l => [l.level, l.count])),
        viewsByDay,
        recentUsers,
        recentActivity,
      }
    });
  } catch (e) { console.error(e); return NextResponse.json({ stats: null }); }
}
