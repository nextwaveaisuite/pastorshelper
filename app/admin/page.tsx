"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "chnomg@gmail.com";

async function safeFetch(url: string, body: Record<string, unknown>) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch { return {}; }
}

type UserRecord = {
  id: string; email: string; is_banned: boolean; ban_reason: string | null;
  sermon_count: number; created_at: string; last_seen: string;
  credits: { balance: number; total_purchased: number; total_used: number; unlimited: boolean };
  usage: { topics: string[]; levels: Record<string, number>; languages: string[]; lastActive: string | null };
};

type Stats = {
  totalUsers: number; totalSermons: number; totalSeries: number; activeUsers: number;
  totalCreditsIssued: number; totalCreditsUsed: number;
  viewsByDay: Record<string, number>;
  topTopics: [string, number][];
  levelCounts: Record<string, number>;
  topLanguages: [string, number][];
  toneCounts: Record<string, number>;
  recentUsers: { email: string; created_at: string; last_seen: string }[];
  recentSermons: { title: string; tone: string; audience: string; created_at: string }[];
  recentUsage: { topic: string; level: string; language: string; tone: string; created_at: string }[];
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "analytics">("dashboard");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [creditInput, setCreditInput] = useState<Record<string, string>>({});
  const [banReason, setBanReason] = useState("");
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const router = useRouter();

  const loadStats = useCallback(async (e: string) => {
    const data = await safeFetch("/api/admin/stats", { requester_email: e });
    if (data.stats) setStats(data.stats as Stats);
  }, []);

  const loadUsers = useCallback(async (e: string) => {
    const data = await safeFetch("/api/admin/users", { requester_email: e });
    if (data.users) setUsers(data.users as UserRecord[]);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      const userEmail = data.session.user.email || "";
      setEmail(userEmail);
      if (userEmail === ADMIN_EMAIL) {
        setAuthed(true);
        loadStats(userEmail);
        loadUsers(userEmail);
      }
      setLoading(false);
    });
  }, [router, loadStats, loadUsers]);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

  const topupCredits = async (userId: string, amount: number) => {
    await safeFetch("/api/credits/topup", { requester_email: email, user_id: userId, amount, reason: "Admin top-up" });
    showMsg(`✓ Added ${amount} credits`);
    loadUsers(email); loadStats(email);
  };

  const grantUnlimited = async (userId: string) => {
    await safeFetch("/api/credits/topup", { requester_email: email, user_id: userId, unlimited: true });
    showMsg("✓ Unlimited credits granted");
    loadUsers(email);
  };

  const revokeUnlimited = async (userId: string) => {
    // Reset to normal
    await safeFetch("/api/credits/topup", { requester_email: email, user_id: userId, amount: 50, reason: "Reset from unlimited" });
    showMsg("✓ Reset to 50 credits");
    loadUsers(email);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user and ALL their data?")) return;
    await safeFetch("/api/admin/delete-user", { requester_email: email, user_id: userId });
    showMsg("✓ User deleted");
    loadUsers(email); loadStats(email);
  };

  const banUser = async (userId: string, ban: boolean) => {
    await safeFetch("/api/admin/ban-user", { requester_email: email, user_id: userId, ban, reason: banReason });
    setBanTarget(null); setBanReason("");
    showMsg(ban ? "✓ User banned" : "✓ User unbanned");
    loadUsers(email);
  };

  const filtered = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const maxViews = stats ? Math.max(...Object.values(stats.viewsByDay), 1) : 1;
  const totalLevels = stats ? Object.values(stats.levelCounts).reduce((a, b) => a + b, 0) : 0;

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#f59e0b" }}>Loading...</p></div>;
  if (!authed) return <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><p style={{ color: "#f87171", fontSize: "18px" }}>Access Denied</p><p style={{ color: "#57534e", fontSize: "14px" }}>This area is restricted.</p></div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0704", color: "#fef3c7" }}>
      {/* Header */}
      <header style={{ background: "rgba(15,10,5,0.98)", borderBottom: "1px solid rgba(245,158,11,0.1)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>✝</span>
          <span style={{ color: "#f59e0b", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 600 }}>The Pastors Helper</span>
          <span style={{ color: "#57534e", fontSize: "12px", marginLeft: "8px" }}>Admin Console</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {actionMsg && <span style={{ color: "#4ade80", fontSize: "13px", padding: "4px 12px", background: "rgba(74,222,128,0.1)", borderRadius: "8px" }}>{actionMsg}</span>}
          <button onClick={() => router.push("/dashboard")} style={{ padding: "7px 14px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "transparent", color: "#a8956e", cursor: "pointer", fontSize: "12px" }}>→ Dashboard</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(245,158,11,0.08)", padding: "0 24px" }}>
        {[{ key: "dashboard", label: "📊 Overview" }, { key: "analytics", label: "📈 Analytics" }, { key: "users", label: "👥 Users" }].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key as typeof activeTab)} style={{ padding: "14px 20px", border: "none", background: "transparent", color: activeTab === key ? "#f59e0b" : "#57534e", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === key ? 600 : 400, borderBottom: activeTab === key ? "2px solid #f59e0b" : "2px solid transparent", marginBottom: "-1px" }}>
            {label}
          </button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "dashboard" && stats && (
          <div>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "24px" }}>
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#3b82f6" },
                { label: "Active (7 days)", value: stats.activeUsers, icon: "🔥", color: "#f59e0b" },
                { label: "Total Sermons", value: stats.totalSermons, icon: "📖", color: "#10b981" },
                { label: "Total Series", value: stats.totalSeries, icon: "📚", color: "#8b5cf6" },
                { label: "Credits Issued", value: stats.totalCreditsIssued, icon: "💳", color: "#f97316" },
                { label: "Credits Used", value: stats.totalCreditsUsed, icon: "⚡", color: "#ec4899" },
              ].map((s) => (
                <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: "12px", padding: "18px" }}>
                  <p style={{ fontSize: "22px", marginBottom: "8px" }}>{s.icon}</p>
                  <p style={{ color: s.color, fontSize: "26px", fontWeight: 700 }}>{s.value.toLocaleString()}</p>
                  <p style={{ color: "#57534e", fontSize: "11px" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Traffic chart */}
            <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>Page Views — Last 7 Days</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
                {Object.entries(stats.viewsByDay).map(([day, count]) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <p style={{ color: "#f59e0b", fontSize: "10px" }}>{count}</p>
                    <div style={{ width: "100%", background: "rgba(245,158,11,0.5)", borderRadius: "3px 3px 0 0", height: `${Math.max((count / maxViews) * 60, 3)}px` }} />
                    <p style={{ color: "#57534e", fontSize: "9px", whiteSpace: "nowrap" }}>{day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "18px" }}>
                <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Recent Sign-Ups</p>
                {stats.recentUsers.map((u, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "12px" }}>{u.email}</p>
                    <p style={{ color: "#57534e", fontSize: "11px" }}>{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "18px" }}>
                <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Recent Sermons Generated</p>
                {stats.recentUsage.slice(0, 8).map((u, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "12px", marginBottom: "2px" }}>{u.topic}</p>
                    <p style={{ color: "#57534e", fontSize: "10px" }}>{u.level} · {u.language} · {u.tone} · {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

              {/* Top Topics */}
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
                <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>🔍 Top Sermon Topics</p>
                {stats.topTopics.length === 0 ? <p style={{ color: "#57534e", fontSize: "13px" }}>No data yet</p> : stats.topTopics.map(([topic, count], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "12px", flex: 1, paddingRight: "8px" }}>{topic.length > 45 ? topic.slice(0, 43) + "…" : topic}</p>
                    <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "11px", flexShrink: 0 }}>{count}x</span>
                  </div>
                ))}
              </div>

              {/* Level breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
                  <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>📊 Sermon Levels Used</p>
                  {[
                    { key: "beginner", label: "Beginner", color: "#10b981" },
                    { key: "intermediate", label: "Intermediate", color: "#3b82f6" },
                    { key: "advanced", label: "Advanced", color: "#8b5cf6" },
                  ].map(({ key, label, color }) => {
                    const count = stats.levelCounts[key] || 0;
                    const pct = totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
                    return (
                      <div key={key} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <p style={{ color: "#fef3c7", fontSize: "12px" }}>{label}</p>
                          <p style={{ color, fontSize: "12px" }}>{count} ({pct}%)</p>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", transition: "width 0.5s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tone breakdown */}
                <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
                  <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>🎤 Sermon Tones</p>
                  {Object.entries(stats.toneCounts).sort((a, b) => b[1] - a[1]).map(([tone, count]) => (
                    <div key={tone} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                      <p style={{ color: "#fef3c7", fontSize: "12px" }}>{tone}</p>
                      <span style={{ color: "#f59e0b", fontSize: "11px" }}>{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>🌍 Top Languages Used</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {stats.topLanguages.map(([lang, count]) => (
                  <div key={lang} style={{ padding: "6px 14px", borderRadius: "20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <span style={{ color: "#fef3c7", fontSize: "13px" }}>{lang}</span>
                    <span style={{ color: "#f59e0b", fontSize: "11px", marginLeft: "8px" }}>{count}x</span>
                  </div>
                ))}
                {stats.topLanguages.length === 0 && <p style={{ color: "#57534e", fontSize: "13px" }}>No data yet</p>}
              </div>
            </div>

            {/* Full activity feed */}
            <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>⚡ Recent Activity Feed</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
                {stats.recentUsage.map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{u.level === "advanced" ? "🎓" : u.level === "intermediate" ? "📖" : "🌱"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fef3c7", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.topic}</p>
                      <p style={{ color: "#57534e", fontSize: "10px" }}>{u.level} · {u.language} · {u.tone}</p>
                    </div>
                    <p style={{ color: "#57534e", fontSize: "10px", flexShrink: 0 }}>{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
                {stats.recentUsage.length === 0 && <p style={{ color: "#57534e", fontSize: "13px" }}>No activity yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <p style={{ color: "#a8956e", fontSize: "14px" }}>{users.length} total users</p>
              <input type="text" placeholder="Search by email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: "9px 14px", borderRadius: "8px", fontSize: "13px", width: "240px" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map((u) => (
                <div key={u.id} style={{ background: u.is_banned ? "rgba(239,68,68,0.05)" : u.credits?.unlimited ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.03)", border: `1px solid ${u.is_banned ? "rgba(239,68,68,0.2)" : u.credits?.unlimited ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.08)"}`, borderRadius: "12px", overflow: "hidden" }}>

                  {/* User header row */}
                  <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)} style={{ cursor: "pointer", flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <p style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500 }}>{u.email}</p>
                        {u.is_banned && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px" }}>BANNED</span>}
                        {u.credits?.unlimited && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: "10px" }}>♾ UNLIMITED</span>}
                        {u.email === ADMIN_EMAIL && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "10px" }}>ADMIN</span>}
                      </div>
                      <p style={{ color: "#57534e", fontSize: "11px" }}>
                        {u.sermon_count} sermons · {u.credits?.balance ?? 0} credits · Joined {new Date(u.created_at).toLocaleDateString()} · {expandedUser === u.id ? "▲" : "▼ details"}
                      </p>
                    </div>

                    {u.email !== ADMIN_EMAIL && (
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
                        {u.credits?.unlimited
                          ? <button onClick={() => revokeUnlimited(u.id)} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", background: "transparent", border: "1px solid rgba(245,158,11,0.3)", color: "#a8956e", cursor: "pointer" }}>Revoke ♾</button>
                          : <button onClick={() => grantUnlimited(u.id)} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", cursor: "pointer" }}>♾ Unlimited</button>
                        }
                        {u.is_banned
                          ? <button onClick={() => banUser(u.id, false)} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", background: "transparent", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", cursor: "pointer" }}>Unban</button>
                          : <button onClick={() => setBanTarget(banTarget === u.id ? null : u.id)} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#a8956e", cursor: "pointer" }}>Ban</button>
                        }
                        <button onClick={() => deleteUser(u.id)} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", background: "transparent", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", cursor: "pointer" }}>Delete</button>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {expandedUser === u.id && (
                    <div style={{ borderTop: "1px solid rgba(245,158,11,0.07)", padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>

                      {/* Credits */}
                      <div>
                        <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Credits</p>
                        <p style={{ color: "#f59e0b", fontSize: "22px", fontWeight: 700 }}>{u.credits?.unlimited ? "♾" : u.credits?.balance ?? 0}</p>
                        <p style={{ color: "#57534e", fontSize: "11px", marginBottom: "12px" }}>Purchased: {u.credits?.total_purchased ?? 0} · Used: {u.credits?.total_used ?? 0}</p>
                        {u.email !== ADMIN_EMAIL && (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input type="number" placeholder="Amount" min="1" value={creditInput[u.id] || ""} onChange={(e) => setCreditInput(p => ({ ...p, [u.id]: e.target.value }))} style={{ width: "70px", padding: "6px 8px", borderRadius: "6px", fontSize: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.15)", color: "#fef3c7" }} />
                            <button onClick={() => { const amt = parseInt(creditInput[u.id] || "0"); if (amt > 0) { topupCredits(u.id, amt); setCreditInput(p => ({ ...p, [u.id]: "" })); } }} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", cursor: "pointer" }}>+ Add</button>
                          </div>
                        )}
                      </div>

                      {/* Usage */}
                      <div>
                        <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Usage</p>
                        <p style={{ color: "#57534e", fontSize: "11px", marginBottom: "6px" }}>Sermons generated: {u.sermon_count}</p>
                        {u.usage?.lastActive && <p style={{ color: "#57534e", fontSize: "11px", marginBottom: "8px" }}>Last active: {new Date(u.usage.lastActive).toLocaleDateString()}</p>}
                        {u.usage?.levels && Object.entries(u.usage.levels).map(([lvl, cnt]) => (
                          <p key={lvl} style={{ color: "#78716c", fontSize: "11px" }}>{lvl}: {cnt}x</p>
                        ))}
                      </div>

                      {/* Topics & Languages */}
                      <div>
                        <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Topics & Languages</p>
                        {u.usage?.topics?.slice(0, 4).map((t, i) => (
                          <p key={i} style={{ color: "#78716c", fontSize: "11px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📖 {t}</p>
                        ))}
                        {u.usage?.languages?.slice(0, 3).map((l, i) => (
                          <p key={i} style={{ color: "#78716c", fontSize: "11px", marginBottom: "3px" }}>🌍 {l}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ban reason input */}
                  {banTarget === u.id && (
                    <div style={{ borderTop: "1px solid rgba(245,158,11,0.07)", padding: "12px 18px", display: "flex", gap: "8px" }}>
                      <input type="text" placeholder="Reason for ban (optional)" value={banReason} onChange={(e) => setBanReason(e.target.value)} style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }} />
                      <button onClick={() => banUser(u.id, true)} style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer" }}>Confirm Ban</button>
                      <button onClick={() => setBanTarget(null)} style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", background: "transparent", border: "1px solid rgba(245,158,11,0.1)", color: "#57534e", cursor: "pointer" }}>Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
