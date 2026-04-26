"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "chnomg@gmail.com";

type User = {
  id: string;
  email: string;
  is_banned: boolean;
  ban_reason: string | null;
  sermon_count: number;
  created_at: string;
  last_seen: string;
};

type Stats = {
  totalUsers: number;
  totalSermons: number;
  totalSeries: number;
  viewsByPage: Record<string, number>;
  viewsByDay: Record<string, number>;
  recentUsers: { email: string; created_at: string }[];
  recentSermons: { title: string; tone: string; audience: string; created_at: string }[];
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users">("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

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
  }, [router]);

  const loadStats = useCallback(async (adminEmail: string) => {
    const res = await fetch("/api/admin/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requester_email: adminEmail }),
    });
    const data = await res.json();
    if (data.stats) setStats(data.stats);
  }, []);

  const loadUsers = useCallback(async (adminEmail: string) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requester_email: adminEmail }),
    });
    const data = await res.json();
    if (data.users) setUsers(data.users);
  }, []);

  const deleteUser = async (userId: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requester_email: email, user_id: userId }),
    });
    loadUsers(email);
    loadStats(email);
  };

  const banUser = async (userId: string, ban: boolean) => {
    await fetch("/api/admin/ban-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requester_email: email, user_id: userId, ban, reason: banReason }),
    });
    setBanTarget(null);
    setBanReason("");
    loadUsers(email);
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#f59e0b" }}>Loading...</p>
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#f87171", fontSize: "18px", marginBottom: "8px" }}>Access Denied</p>
        <p style={{ color: "#57534e", fontSize: "14px" }}>This area is restricted.</p>
      </div>
    </div>
  );

  const maxViews = stats ? Math.max(...Object.values(stats.viewsByDay), 1) : 1;

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
          <span style={{ color: "#57534e", fontSize: "12px" }}>{email}</span>
          <button onClick={() => router.push("/dashboard")} style={{ padding: "7px 14px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "transparent", color: "#a8956e", cursor: "pointer", fontSize: "12px" }}>
            → Dashboard
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(245,158,11,0.08)", padding: "0 24px" }}>
        {[
          { key: "dashboard", label: "📊 Dashboard" },
          { key: "users",     label: "👥 Users" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key as "dashboard" | "users")} style={{ padding: "14px 20px", border: "none", background: "transparent", color: activeTab === key ? "#f59e0b" : "#57534e", cursor: "pointer", fontSize: "14px", fontWeight: activeTab === key ? 600 : 400, borderBottom: activeTab === key ? "2px solid #f59e0b" : "2px solid transparent", marginBottom: "-1px" }}>
            {label}
          </button>
        ))}
      </div>

      <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && stats && (
          <div>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              {[
                { label: "Total Users",   value: stats.totalUsers,   icon: "👥" },
                { label: "Total Sermons", value: stats.totalSermons, icon: "📖" },
                { label: "Total Series",  value: stats.totalSeries,  icon: "📚" },
                { label: "Page Views",    value: Object.values(stats.viewsByDay).reduce((a, b) => a + b, 0), icon: "👁", sub: "last 7 days" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "12px", padding: "20px" }}>
                  <p style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</p>
                  <p style={{ color: "#f59e0b", fontSize: "28px", fontWeight: 700 }}>{s.value}</p>
                  <p style={{ color: "#57534e", fontSize: "12px" }}>{s.label}</p>
                  {s.sub && <p style={{ color: "#3d3529", fontSize: "11px" }}>{s.sub}</p>}
                </div>
              ))}
            </div>

            {/* Traffic chart */}
            <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>Page Views — Last 7 Days</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px" }}>
                {Object.entries(stats.viewsByDay).map(([day, count]) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <p style={{ color: "#f59e0b", fontSize: "11px" }}>{count}</p>
                    <div style={{ width: "100%", background: "rgba(245,158,11,0.6)", borderRadius: "4px 4px 0 0", height: `${Math.max((count / maxViews) * 80, 4)}px`, transition: "height 0.3s" }} />
                    <p style={{ color: "#57534e", fontSize: "10px", whiteSpace: "nowrap" }}>{day}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Two columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Recent users */}
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
                <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>Recent Sign-Ups</p>
                {stats.recentUsers.map((u, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "13px" }}>{u.email}</p>
                    <p style={{ color: "#57534e", fontSize: "11px" }}>{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>

              {/* Recent sermons */}
              <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "20px" }}>
                <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" }}>Recent Sermons</p>
                {stats.recentSermons.map((s, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,0.05)" }}>
                    <p style={{ color: "#fef3c7", fontSize: "13px", marginBottom: "2px" }}>{s.title}</p>
                    <p style={{ color: "#57534e", fontSize: "11px" }}>{s.tone} · {s.audience} · {new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <p style={{ color: "#a8956e", fontSize: "14px" }}>{users.length} total users</p>
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: "8px", fontSize: "13px", width: "240px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredUsers.map((u) => (
                <div key={u.id} style={{ background: u.is_banned ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.03)", border: `1px solid ${u.is_banned ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.08)"}`, borderRadius: "10px", padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <p style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500 }}>{u.email}</p>
                        {u.is_banned && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(239,68,68,0.15)", color: "#f87171", fontSize: "11px" }}>BANNED</span>}
                        {u.email === ADMIN_EMAIL && <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "11px" }}>ADMIN</span>}
                      </div>
                      <p style={{ color: "#57534e", fontSize: "12px" }}>
                        {u.sermon_count} sermons · Joined {new Date(u.created_at).toLocaleDateString()}
                      </p>
                      {u.ban_reason && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>Reason: {u.ban_reason}</p>}
                    </div>

                    {/* Credit top-up */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input type="number" placeholder="Credits" min="1" max="500" id={`credits-${u.id}`} style={{ width: "80px", padding: "6px 8px", borderRadius: "6px", fontSize: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.15)", color: "#fef3c7" }} />
                      <button onClick={async () => {
                        const input = document.getElementById(`credits-${u.id}`) as HTMLInputElement;
                        const amount = parseInt(input.value);
                        if (!amount || amount < 1) return;
                        await fetch("/api/credits/topup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requester_email: email, user_id: u.id, amount, reason: "Admin top-up" }) });
                        input.value = "";
                        alert(`Added ${amount} credits`);
                      }} style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "12px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#4ade80", cursor: "pointer" }}>+ Credits</button>
                    </div>
                    {u.email !== ADMIN_EMAIL && (
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {u.is_banned ? (
                          <button onClick={() => banUser(u.id, false)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "12px", background: "transparent", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", cursor: "pointer" }}>
                            Unban
                          </button>
                        ) : (
                          <button onClick={() => setBanTarget(banTarget === u.id ? null : u.id)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "12px", background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#a8956e", cursor: "pointer" }}>
                            Ban
                          </button>
                        )}
                        <button onClick={() => deleteUser(u.id)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "12px", background: "transparent", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", cursor: "pointer" }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ban reason input */}
                  {banTarget === u.id && (
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Reason for ban (optional)"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", fontSize: "13px" }}
                      />
                      <button onClick={() => banUser(u.id, true)} style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", cursor: "pointer" }}>
                        Confirm Ban
                      </button>
                      <button onClick={() => setBanTarget(null)} style={{ padding: "8px 12px", borderRadius: "6px", fontSize: "13px", background: "transparent", border: "1px solid rgba(245,158,11,0.1)", color: "#57534e", cursor: "pointer" }}>
                        Cancel
                      </button>
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
