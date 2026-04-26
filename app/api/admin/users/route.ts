import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: sermonCounts } = await supabase.from("sermons").select("user_id");
    const { data: credits } = await supabase.from("user_credits").select("user_id, balance, total_purchased, total_used, unlimited");
    const { data: usageData } = await supabase.from("sermon_usage").select("user_id, topic, level, language, created_at").order("created_at", { ascending: false });

    const counts: Record<string, number> = {};
    (sermonCounts || []).forEach((s: { user_id: string }) => { counts[s.user_id] = (counts[s.user_id] || 0) + 1; });

    const creditMap: Record<string, { balance: number; total_purchased: number; total_used: number; unlimited: boolean }> = {};
    (credits || []).forEach((c: { user_id: string; balance: number; total_purchased: number; total_used: number; unlimited: boolean }) => { creditMap[c.user_id] = c; });

    // Build per-user usage summary
    const usageMap: Record<string, { topics: string[]; levels: Record<string, number>; languages: string[]; lastActive: string }> = {};
    (usageData || []).forEach((u: { user_id: string; topic: string; level: string; language: string; created_at: string }) => {
      if (!usageMap[u.user_id]) usageMap[u.user_id] = { topics: [], levels: {}, languages: [], lastActive: u.created_at };
      if (u.topic && !usageMap[u.user_id].topics.includes(u.topic)) usageMap[u.user_id].topics.push(u.topic);
      if (u.level) usageMap[u.user_id].levels[u.level] = (usageMap[u.user_id].levels[u.level] || 0) + 1;
      if (u.language && !usageMap[u.user_id].languages.includes(u.language)) usageMap[u.user_id].languages.push(u.language);
      if (u.created_at > usageMap[u.user_id].lastActive) usageMap[u.user_id].lastActive = u.created_at;
    });

    const users = (profiles || []).map((p: Record<string, unknown>) => ({
      ...p,
      sermon_count: counts[p.id as string] || 0,
      credits: creditMap[p.id as string] || { balance: 0, total_purchased: 0, total_used: 0, unlimited: false },
      usage: usageMap[p.id as string] || { topics: [], levels: {}, languages: [], lastActive: null },
    }));

    return NextResponse.json({ users });
  } catch (e) { console.error(e); return NextResponse.json({ users: [] }); }
}
