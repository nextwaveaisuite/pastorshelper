"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "chnomg@gmail.com";

async function sf(url: string, body: Record<string, unknown>) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch { return {}; }
}

type CreditRecord = { balance: number; total_purchased: number; total_used: number; unlimited: boolean };
type UsageRecord = { topics: string[]; levels: Record<string, number>; languages: string[]; lastActive: string | null };
type UserRecord = { id: string; email: string; is_banned: boolean; ban_reason: string | null; sermon_count: number; created_at: string; last_seen: string; credits: CreditRecord; usage: UsageRecord; };
type Stats = { totalUsers: number; totalSermons: number; totalSeries: number; activeUsers: number; totalCreditsIssued: number; totalCreditsUsed: number; viewsByDay: Record<string, number>; topTopics: [string, number][]; levelCounts: Record<string, number>; topLanguages: [string, number][]; toneCounts: Record<string, number>; recentUsers: { email: string; created_at: string }[]; recentUsage: { topic: string; level: string; language: string; tone: string; created_at: string }[]; };

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "analytics">("overview");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);

  // Add user
  const [newEmail, setNewEmail] = useState("");
  const [newCredits, setNewCredits] = useState("10");
  const [addingUser, setAddingUser] = useState(false);

  // Credit management per user
  const [creditAmt, setCreditAmt] = useState<Record<string, string>>({});
  const [creditAction, setCreditAction] = useState<Record<string, string>>({});
  const [creditReason, setCreditReason] = useState<Record<string, string>>({});
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const router = useRouter();

  const flash = (m: string, ok = true) => { setMsg(m); setMsgOk(ok); setTimeout(() => setMsg(""), 4000); };

  const loadStats = useCallback(async (e: string) => {
    const d = await sf("/api/admin/stats", { requester_email: e });
    if (d.stats) setStats(d.stats as Stats);
  }, []);

  const loadUsers = useCallback(async (e: string) => {
    const d = await sf("/api/admin/users", { requester_email: e });
    if (d.users) setUsers(d.users as UserRecord[]);
  }, []);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 400));
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.replace("/login"); return; }
      const ue = data.session.user.email || "";
      setEmail(ue);
      if (ue === ADMIN_EMAIL) {
        setAuthed(true);
        loadStats(ue);
        loadUsers(ue);
      }
      setLoading(false);
    };
    init();
  }, [router, loadStats, loadUsers]);

  const addUser = async () => {
    if (!newEmail.trim()) return;
    setAddingUser(true);
    const d = await sf("/api/admin/add-user", { requester_email: email, email: newEmail.trim(), starting_credits: parseInt(newCredits) || 10 });
    setAddingUser(false);
    if (d.success) { flash(`✓ Invitation sent to ${newEmail}`); setNewEmail(""); loadUsers(email); loadStats(email); }
    else flash(`✗ ${d.error || "Failed"}`, false);
  };

  const deleteUser = async (uid: string, uemail: string) => {
    if (!confirm(`Delete ${uemail} permanently?\n\nThis removes all their sermons, series and data.`)) return;
    await sf("/api/admin/delete-user", { requester_email: email, user_id: uid });
    flash(`✓ Deleted ${uemail}`);
    loadUsers(email); loadStats(email);
  };

  const adjustCredits = async (uid: string) => {
    const action = creditAction[uid] || "add";
    const amount = parseInt(creditAmt[uid] || "0");
    const reason = creditReason[uid] || "";
    if (["add", "remove", "set"].includes(action) && !amount) { flash("✗ Enter an amount", false); return; }
    const d = await sf("/api/admin/adjust-credits", { requester_email: email, user_id: uid, action, amount, reason });
    if (d.success) {
      flash(d.unlimited ? "♾ Unlimited granted" : `✓ Credits updated: ${d.previous_balance} → ${d.new_balance}`);
      setCreditAmt(p => ({ ...p, [uid]: "" }));
      setCreditReason(p => ({ ...p, [uid]: "" }));
      loadUsers(email);
    } else flash(`✗ ${d.error || "Failed"}`, false);
  };

  const banUser = async (uid: string, ban: boolean) => {
    await sf("/api/admin/ban-user", { requester_email: email, user_id: uid, ban, reason: banReason });
    setBanTarget(null); setBanReason("");
    flash(ban ? "✓ User banned" : "✓ User unbanned");
    loadUsers(email);
  };

  const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()));
  const maxViews = stats ? Math.max(...Object.values(stats.viewsByDay), 1) : 1;
  const totalLevels = stats ? Object.values(stats.levelCounts).reduce((a, b) => a + b, 0) : 0;

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#f59e0b" }}>Loading...</p></div>;
  if (!authed) return <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ textAlign: "center" }}><p style={{ color: "#f87171", fontSize: "20px", marginBottom: "8px" }}>Access Denied</p><p style={{ color: "#57534e", fontSize: "13px" }}>Admin access only</p></div></div>;

  const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: "16px", fontWeight: 600 }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0704", color: "#fef3c7" }}>
      {/* Header */}
      <header style={{ background: "rgba(15,10,5,0.98)", borderBottom: "1px solid rgba(245,158,11,0.1)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>✝</span>
          <span style={{ color: "#f59e0b", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 600 }}>The Pastors Helper</span>
          <span style={{ color: "#57534e", fontSize: "12px" }}>· Admin Console</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {msg && <span style={{ color: msgOk ? "#4ade80" : "#f87171", fontSize: "13px", padding: "4px 12px", background: msgOk ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)", borderRadius: "8px" }}>{msg}</span>}
          <button onClick={() => router.push("/dashboard")} style={{ padding: "7px 14px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "transparent", color: "#a8956e", cursor: "pointer", fontSize: "12px" }}>→ Dashboard</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(245,158,11,0.08)", padding: "0 24px", background: "rgba(15,10,5,0.5)" }}>
        {[{ k: "overview", l: "📊 Overview" }, { k: "users", l: "👥 Users" }, { k: "analytics", l: "📈 Analytics" }].map(({ k, l }) => (
          <button key={k} onClick={() => setActiveTab(k as typeof activeTab)} style={{ padding: "14px 20px", border: "none", background: "transparent", color: activeTab === k ? "#f59e0b" : "#57534e", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === k ? 600 : 400, borderBottom: activeTab === k ? "2px solid #f59e0b" : "2px solid transparent", marginBottom: "-1px" }}>{l}</button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { l: "Total Users",     v: stats.totalUsers,         icon: "👥", c: "#3b82f6" },
                { l: "Active (7 days)", v: stats.activeUsers,        icon: "🔥", c: "#f59e0b" },
                { l: "Sermons",         v: stats.totalSermons,       icon: "📖", c: "#10b981" },
                { l: "Series",          v: stats.totalSeries,        icon: "📚", c: "#8b5cf6" },
                { l: "Credits Issued",  v: stats.totalCreditsIssued, icon: "💳", c: "#f97316" },
                { l: "Credits Used",    v: stats.totalCreditsUsed,   icon: "⚡", c: "#ec4899" },
              ].map(s => (
                <div key={s.l} style={{ background: `${s.c}10`, border: `1px solid ${s.c}25`, borderRadius: "12px", padding: "16px" }}>
                  <p style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</p>
                  <p style={{ color: s.c, fontSize: "24px", fontWeight: 700 }}>{s.v.toLocaleString()}</p>
                  <p style={{ color: "#57534e", fontSize: "11px" }}>{s.l}</p>
                </div>
              ))}
            </div>
            <Box title="Page Views — Last 7 Days">
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px" }}>
                {Object.entries(stats.viewsByDay).map(([day, count]) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <p style={{ color: "#f59e0b", fontSize: "10px" }}>{count}</p>
                    <div style={{ width: "100%", background: "rgba(245,158,11,0.5)", borderRadius: "3px 3px 0 0", height: `${Math.max((count / maxViews) * 60, 3)}px` }} />
                    <p style={{ color: "#57534e", fontSize: "9px", whiteSpace: "nowrap" }}>{day}</p>
                  </div>
                ))}
              </div>
            </Box>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Box title="Recent Sign-Ups">
                {stats.recentUsers.map((u, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "12px" }}>{u.email}</p>
                    <p style={{ color: "#57534e", fontSize: "11px" }}>{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </Box>
              <Box title="Recent Sermon Activity">
                {stats.recentUsage.slice(0, 8).map((u, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "12px" }}>{u.topic}</p>
                    <p style={{ color: "#57534e", fontSize: "10px" }}>{u.level} · {u.language} · {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </Box>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div>
            {/* ADD USER */}
            <Box title="➕ Add New User">
              <p style={{ color: "#78716c", fontSize: "13px", marginBottom: "14px" }}>Invite a pastor by email. They receive a magic link to sign in immediately.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 2, minWidth: "200px" }}>
                  <p style={{ color: "#a8956e", fontSize: "11px", marginBottom: "6px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>Email Address</p>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && addUser()} placeholder="pastor@church.com" style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", fontSize: "14px" }} />
                </div>
                <div style={{ width: "130px" }}>
                  <p style={{ color: "#a8956e", fontSize: "11px", marginBottom: "6px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>Starting Credits</p>
                  <input type="number" value={newCredits} onChange={e => setNewCredits(e.target.value)} min="0" style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", fontSize: "14px" }} />
                </div>
                <button onClick={addUser} disabled={addingUser || !newEmail.trim()} style={{ padding: "11px 24px", borderRadius: "8px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", cursor: "pointer", fontSize: "14px", fontWeight: 600, opacity: addingUser || !newEmail.trim() ? 0.5 : 1 }}>
                  {addingUser ? "Sending..." : "➕ Add User"}
                </button>
              </div>
            </Box>

            {/* USER LIST */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <p style={{ color: "#a8956e", fontSize: "13px" }}>{filtered.length} of {users.length} users</p>
              <input type="text" placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "9px 14px", borderRadius: "8px", fontSize: "13px", width: "240px" }} />
            </div>

            {users.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#57534e" }}>
                <p style={{ fontSize: "32px", marginBottom: "12px" }}>👥</p>
                <p>Loading users...</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map(u => (
                <div key={u.id} style={{ background: u.is_banned ? "rgba(239,68,68,0.04)" : u.credits?.unlimited ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${u.is_banned ? "rgba(239,68,68,0.2)" : u.credits?.unlimited ? "rgba(245,158,11,0.25)" : "rgba(245,158,11,0.08)"}`, borderRadius: "12px", overflow: "hidden" }}>

                  {/* User header */}
                  <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setExpanded(expanded === u.id ? null : u.id)}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                        <p style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500 }}>{u.email}</p>
                        {u.credits?.unlimited && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "10px", fontWeight: 600 }}>♾ UNLIMITED</span>}
                        {u.is_banned && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "10px", fontWeight: 600 }}>BANNED</span>}
                        {u.email === ADMIN_EMAIL && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "10px", fontWeight: 600 }}>ADMIN</span>}
                      </div>
                      <p style={{ color: "#57534e", fontSize: "11px" }}>
                        {u.sermon_count} sermons · <strong style={{ color: u.credits?.unlimited ? "#f59e0b" : "#fef3c7" }}>{u.credits?.unlimited ? "♾" : (u.credits?.balance ?? 0)} credits</strong> · Joined {new Date(u.created_at).toLocaleDateString()} · {expanded === u.id ? "▲ collapse" : "▼ manage"}
                      </p>
                    </div>
                    {u.email !== ADMIN_EMAIL && (
                      <button onClick={() => deleteUser(u.id, u.email)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "12px", background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer", flexShrink: 0 }}>
                        🗑 Delete
                      </button>
                    )}
                  </div>

                  {/* Expanded — Credit Controls + User Info */}
                  {expanded === u.id && (
                    <div style={{ borderTop: "1px solid rgba(245,158,11,0.08)", padding: "18px", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                        {/* CREDIT MANAGEMENT */}
                        <div>
                          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: "14px" }}>💳 Credit Management</p>

                          {/* Balance display */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(245,158,11,0.07)", borderRadius: "10px", marginBottom: "14px" }}>
                            <div>
                              <p style={{ color: "#a8956e", fontSize: "10px", marginBottom: "2px" }}>Current Balance</p>
                              <p style={{ color: "#f59e0b", fontSize: "28px", fontWeight: 700, lineHeight: 1 }}>{u.credits?.unlimited ? "♾" : (u.credits?.balance ?? 0)}</p>
                            </div>
                            <div style={{ textAlign: "right" as const }}>
                              <p style={{ color: "#57534e", fontSize: "11px" }}>Purchased: {u.credits?.total_purchased ?? 0}</p>
                              <p style={{ color: "#57534e", fontSize: "11px" }}>Used: {u.credits?.total_used ?? 0}</p>
                            </div>
                          </div>

                          {u.email !== ADMIN_EMAIL && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {/* Action buttons */}
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {[
                                  { a: "add",              l: "➕ Add" },
                                  { a: "remove",           l: "➖ Remove" },
                                  { a: "set",              l: "🎯 Set to" },
                                  { a: "reset",            l: "🔄 Zero" },
                                  { a: "unlimited",        l: "♾ Unlimited" },
                                  { a: "revoke_unlimited", l: "✕ Revoke ♾" },
                                ].map(({ a, l }) => (
                                  <button key={a} onClick={() => setCreditAction(p => ({ ...p, [u.id]: a }))} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", border: "1px solid", borderColor: (creditAction[u.id] || "add") === a ? "#f59e0b" : "rgba(245,158,11,0.15)", background: (creditAction[u.id] || "add") === a ? "rgba(245,158,11,0.15)" : "transparent", color: (creditAction[u.id] || "add") === a ? "#f59e0b" : "#78716c", cursor: "pointer" }}>
                                    {l}
                                  </button>
                                ))}
                              </div>

                              {/* Amount + reason */}
                              {["add", "remove", "set"].includes(creditAction[u.id] || "add") && (
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <input type="number" placeholder="Amount" min="1" value={creditAmt[u.id] || ""} onChange={e => setCreditAmt(p => ({ ...p, [u.id]: e.target.value }))} style={{ width: "90px", padding: "9px 10px", borderRadius: "7px", fontSize: "13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7" }} />
                                  <input type="text" placeholder="Reason (optional)" value={creditReason[u.id] || ""} onChange={e => setCreditReason(p => ({ ...p, [u.id]: e.target.value }))} style={{ flex: 1, padding: "9px 10px", borderRadius: "7px", fontSize: "13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.1)", color: "#fef3c7" }} />
                                </div>
                              )}

                              {/* Apply button */}
                              <button onClick={() => adjustCredits(u.id)} style={{ padding: "11px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", cursor: "pointer" }}>
                                ✓ Apply Credit Change
                              </button>
                            </div>
                          )}
                        </div>

                        {/* USER DETAILS + BAN */}
                        <div>
                          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: "14px" }}>👤 User Details</p>

                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                            {[
                              { l: "Sermons generated", v: `${u.sermon_count}` },
                              { l: "Last active",        v: u.usage?.lastActive ? new Date(u.usage.lastActive).toLocaleDateString() : u.last_seen ? new Date(u.last_seen).toLocaleDateString() : "No activity" },
                              { l: "Member since",       v: new Date(u.created_at).toLocaleDateString() },
                            ].map(({ l, v }) => (
                              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "7px" }}>
                                <p style={{ color: "#a8956e", fontSize: "12px" }}>{l}</p>
                                <p style={{ color: "#fef3c7", fontSize: "12px" }}>{v}</p>
                              </div>
                            ))}
                            {Object.entries(u.usage?.levels || {}).map(([lvl, cnt]) => (
                              <div key={lvl} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "7px" }}>
                                <p style={{ color: "#57534e", fontSize: "11px", textTransform: "capitalize" as const }}>{lvl} sermons</p>
                                <p style={{ color: "#78716c", fontSize: "11px" }}>{cnt}x</p>
                              </div>
                            ))}
                          </div>

                          {/* Topics */}
                          {u.usage?.topics?.length > 0 && (
                            <div style={{ marginBottom: "14px" }}>
                              <p style={{ color: "#57534e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "6px" }}>Topics searched</p>
                              {u.usage.topics.slice(0, 4).map((t, i) => (
                                <p key={i} style={{ color: "#78716c", fontSize: "11px", marginBottom: "3px" }}>· {t.length > 48 ? t.slice(0, 46) + "…" : t}</p>
                              ))}
                            </div>
                          )}

                          {/* Ban controls */}
                          {u.email !== ADMIN_EMAIL && (
                            <div>
                              {u.is_banned ? (
                                <div>
                                  {u.ban_reason && <p style={{ color: "#f87171", fontSize: "11px", marginBottom: "8px" }}>Reason: {u.ban_reason}</p>}
                                  <button onClick={() => banUser(u.id, false)} style={{ width: "100%", padding: "9px", borderRadius: "7px", fontSize: "13px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", cursor: "pointer" }}>✓ Unban User</button>
                                </div>
                              ) : (
                                <div>
                                  <button onClick={() => setBanTarget(banTarget === u.id ? null : u.id)} style={{ width: "100%", padding: "9px", borderRadius: "7px", fontSize: "13px", background: "transparent", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", cursor: "pointer" }}>
                                    {banTarget === u.id ? "Cancel" : "⛔ Ban User"}
                                  </button>
                                  {banTarget === u.id && (
                                    <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                                      <input type="text" placeholder="Reason (optional)" value={banReason} onChange={e => setBanReason(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", fontSize: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.2)", color: "#fef3c7" }} />
                                      <button onClick={() => banUser(u.id, true)} style={{ padding: "8px 14px", borderRadius: "6px", fontSize: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer" }}>Ban</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === "analytics" && stats && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <Box title="🔍 Top Sermon Topics">
                {stats.topTopics.length === 0
                  ? <p style={{ color: "#57534e", fontSize: "13px" }}>No data yet — generate sermons to see topics here</p>
                  : stats.topTopics.map(([topic, count], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                      <p style={{ color: "#fef3c7", fontSize: "12px", flex: 1, paddingRight: "8px" }}>{topic.length > 45 ? topic.slice(0, 43) + "…" : topic}</p>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "11px" }}>{count}x</span>
                    </div>
                  ))}
              </Box>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Box title="📊 Levels Used">
                  {[{ k: "beginner", l: "Beginner", c: "#10b981" }, { k: "intermediate", l: "Intermediate", c: "#3b82f6" }, { k: "advanced", l: "Advanced", c: "#8b5cf6" }].map(({ k, l, c }) => {
                    const count = stats.levelCounts[k] || 0;
                    const pct = totalLevels > 0 ? Math.round((count / totalLevels) * 100) : 0;
                    return (
                      <div key={k} style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <p style={{ color: "#fef3c7", fontSize: "12px" }}>{l}</p>
                          <p style={{ color: c, fontSize: "12px" }}>{count} ({pct}%)</p>
                        </div>
                        <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: "3px" }} />
                        </div>
                      </div>
                    );
                  })}
                </Box>

                <Box title="🎤 Tones Used">
                  {Object.entries(stats.toneCounts).sort((a, b) => b[1] - a[1]).map(([tone, count]) => (
                    <div key={tone} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                      <p style={{ color: "#fef3c7", fontSize: "12px" }}>{tone}</p>
                      <span style={{ color: "#f59e0b", fontSize: "11px" }}>{count}x</span>
                    </div>
                  ))}
                </Box>
              </div>
            </div>

            <Box title="🌍 Languages Used">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {stats.topLanguages.length === 0
                  ? <p style={{ color: "#57534e", fontSize: "13px" }}>No data yet</p>
                  : stats.topLanguages.map(([lang, count]) => (
                    <div key={lang} style={{ padding: "6px 14px", borderRadius: "20px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ color: "#fef3c7", fontSize: "13px" }}>{lang}</span>
                      <span style={{ color: "#f59e0b", fontSize: "11px" }}>{count}x</span>
                    </div>
                  ))}
              </div>
            </Box>

            <Box title="⚡ Activity Feed">
              <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                {stats.recentUsage.length === 0
                  ? <p style={{ color: "#57534e", fontSize: "13px" }}>No activity logged yet — generate sermons to see data here</p>
                  : stats.recentUsage.map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "7px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "7px" }}>
                      <span style={{ fontSize: "13px", flexShrink: 0 }}>{u.level === "advanced" ? "🎓" : u.level === "intermediate" ? "📖" : "🌱"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#fef3c7", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.topic}</p>
                        <p style={{ color: "#57534e", fontSize: "10px" }}>{u.level} · {u.language} · {u.tone}</p>
                      </div>
                      <p style={{ color: "#57534e", fontSize: "10px", flexShrink: 0 }}>{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
              </div>
            </Box>
          </div>
        )}
      </main>
    </div>
  );
}
