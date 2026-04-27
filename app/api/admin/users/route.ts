import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const ADMIN_EMAIL = "chnomg@gmail.com";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const { requester_email } = text ? JSON.parse(text) : {};
    if (requester_email !== ADMIN_EMAIL) return NextResponse.json({ error: "Unauthorised" }, { status: 403 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all auth users (most reliable source)
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    // Get sermon counts
    const { data: sermonData } = await supabase.from("sermons").select("user_id");
    const sermonCounts: Record<string, number> = {};
    (sermonData || []).forEach((s: { user_id: string }) => {
      sermonCounts[s.user_id] = (sermonCounts[s.user_id] || 0) + 1;
    });

    // Get credits
    const { data: creditsData } = await supabase.from("user_credits").select("*");
    const creditsMap: Record<string, { balance: number; total_purchased: number; total_used: number; unlimited: boolean }> = {};
    (creditsData || []).forEach((c: { user_id: string; balance: number; total_purchased: number; total_used: number; unlimited: boolean }) => {
      creditsMap[c.user_id] = c;
    });

    // Get ban status from profiles
    const { data: profileData } = await supabase.from("user_profiles").select("id, is_banned, ban_reason");
    const profileMap: Record<string, { is_banned: boolean; ban_reason: string | null }> = {};
    (profileData || []).forEach((p: { id: string; is_banned: boolean; ban_reason: string | null }) => {
      profileMap[p.id] = p;
    });

    // Get usage
    const { data: usageData } = await supabase.from("sermon_usage").select("user_id, topic, level, language, created_at").order("created_at", { ascending: false });
    const usageMap: Record<string, { topics: string[]; levels: Record<string, number>; languages: string[]; lastActive: string | null }> = {};
    (usageData || []).forEach((u: { user_id: string; topic: string; level: string; language: string; created_at: string }) => {
      if (!usageMap[u.user_id]) usageMap[u.user_id] = { topics: [], levels: {}, languages: [], lastActive: null };
      if (u.topic && !usageMap[u.user_id].topics.includes(u.topic)) usageMap[u.user_id].topics.push(u.topic);
      if (u.level) usageMap[u.user_id].levels[u.level] = (usageMap[u.user_id].levels[u.level] || 0) + 1;
      if (u.language && !usageMap[u.user_id].languages.includes(u.language)) usageMap[u.user_id].languages.push(u.language);
      if (!usageMap[u.user_id].lastActive) usageMap[u.user_id].lastActive = u.created_at;
    });

    const users = authUsers.map(u => ({
      id: u.id,
      email: u.email || "",
      created_at: u.created_at,
      last_seen: u.last_sign_in_at || u.created_at,
      is_banned: profileMap[u.id]?.is_banned || false,
      ban_reason: profileMap[u.id]?.ban_reason || null,
      sermon_count: sermonCounts[u.id] || 0,
      credits: creditsMap[u.id] || { balance: 0, total_purchased: 0, total_used: 0, unlimited: false },
      usage: usageMap[u.id] || { topics: [], levels: {}, languages: [], lastActive: null },
    }));

    // Ensure all users have a credit record
    for (const u of authUsers) {
      if (!creditsMap[u.id]) {
        await supabase.from("user_credits").upsert({ user_id: u.id, balance: 10, is_free_tier: true }).catch(() => {});
      }
      // Ensure profile exists
      await supabase.from("user_profiles").upsert({ id: u.id, email: u.email }).catch(() => {});
    }

    return NextResponse.json({ users });
  } catch (e) {
    console.error("admin users error:", e);
    return NextResponse.json({ users: [] });
  }
}
