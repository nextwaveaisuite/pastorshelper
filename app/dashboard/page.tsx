"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase, Sermon } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUDIENCES = ["General Congregation", "Youth", "Outreach / Evangelism", "Men's Ministry", "Women's Ministry", "Leaders"];
const TONES = ["Teaching", "Prophetic", "Evangelistic", "Pastoral", "Conviction"];

function SermonSection({ id, label, children, gold = false }: { id: string; label: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <div id={id} style={{ background: gold ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${gold ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.08)"}`, borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
      <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "14px" }}>{label}</p>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loadingSermons, setLoadingSermons] = useState(true);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("General Congregation");
  const [tone, setTone] = useState("Teaching");
  const [generating, setGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<Sermon["content"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preachMode, setPreachMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "library" | "menu">("generate");
  const router = useRouter();

  const loadSermons = useCallback(async (userId: string) => {
    setLoadingSermons(true);
    const { data } = await supabase.from("sermons").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setSermons((data as Sermon[]) || []);
    setLoadingSermons(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      setUser(data.session.user);
      loadSermons(data.session.user.id);
    });
  }, [router, loadSermons]);

  const generateSermon = async () => {
    if (!topic.trim()) { setError("Please enter a topic or scripture reference."); return; }
    setGenerating(true); setError(""); setGeneratedSermon(null); setSaveSuccess(false);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, audience, tone }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedSermon(data.sermon);
      setActiveTab("generate");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate. Please try again.");
    } finally { setGenerating(false); }
  };

  const saveSermon = async () => {
    if (!generatedSermon || !user) return;
    setSaving(true);
    const res = await fetch("/api/save-sermon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, title: generatedSermon.title || topic, topic, audience, tone, content: generatedSermon }) });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setSaveSuccess(true); loadSermons(user.id); }
  };

  const deleteSermon = async (id: string) => {
    await fetch("/api/delete-sermon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, user_id: user?.id }) });
    loadSermons(user!.id);
  };

  const exportPDF = async () => {
    if (!generatedSermon) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(generatedSermon.title || "Sermon", 20, y); y += 10;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`${generatedSermon.anchorScripture?.reference || ""} | ${tone} · ${audience}`, 20, y); y += 14;
    const addSection = (heading: string, text: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.text(heading.toUpperCase(), 20, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(text, 170).forEach((line: string) => { if (y > 270) { doc.addPage(); y = 20; } doc.text(line, 20, y); y += 5; });
      y += 6;
    };
    addSection("Anchor Scripture", `${generatedSermon.anchorScripture?.reference}\n${generatedSermon.anchorScripture?.kjv}`);
    addSection("Theme", generatedSermon.theme || "");
    generatedSermon.teachingPoints?.forEach((p, i) => addSection(`Point ${i + 1}: ${p.title}`, `${p.scripture}\n\n${p.explanation}\n\nApplication: ${p.application}`));
    addSection("Altar Call", `${generatedSermon.altarCall?.invitation}\n\n${generatedSermon.altarCall?.prayer}`);
    addSection("Closing Prayer", generatedSermon.closingPrayer || "");
    doc.save(`${(generatedSermon.title || "sermon").replace(/\s+/g, "_")}.pdf`);
  };

  const signOut = async () => { await supabase.auth.signOut(); router.replace("/login"); };

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f59e0b" }}>Loading...</div>
    </div>
  );

  // PREACH MODE
  if (preachMode && generatedSermon) return (
    <div style={{ minHeight: "100vh", background: "#0a0704", padding: "0" }}>
      <div style={{ position: "sticky", top: 0, background: "#0a0704", borderBottom: "1px solid rgba(245,158,11,0.1)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20 }}>
        <h2 className="font-serif" style={{ color: "#f59e0b", fontSize: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{generatedSermon.title}</h2>
        <button onClick={() => setPreachMode(false)} className="btn-ghost" style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", flexShrink: 0 }}>✕ Exit</button>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>Anchor — {generatedSermon.anchorScripture?.reference}</p>
          <p className="font-serif" style={{ fontSize: "20px", lineHeight: 1.7, fontStyle: "italic", color: "#fde68a" }}>&ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;</p>
        </div>
        {generatedSermon.teachingPoints?.map((p, i) => (
          <div key={i} style={{ marginBottom: "36px", paddingBottom: "36px", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
            <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px", textTransform: "uppercase" as const }}>Point {i + 1}</p>
            <h3 className="font-serif" style={{ fontSize: "24px", marginBottom: "16px", color: "#fef3c7" }}>{p.title}</h3>
            <p style={{ color: "#fbbf24", marginBottom: "16px", fontSize: "15px" }}>{p.scripture}</p>
            <p style={{ lineHeight: 1.9, marginBottom: "16px", fontSize: "17px", color: "#fef3c7" }}>{p.explanation}</p>
            <p style={{ color: "#a8956e", lineHeight: 1.9, fontSize: "16px" }}>{p.application}</p>
          </div>
        ))}
        <div style={{ background: "rgba(245,158,11,0.05)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>✨ Ministry Moment</p>
          <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "17px", color: "#fef3c7" }}>{generatedSermon.ministryFlow?.giftOfKnowledge}</p>
          <p style={{ lineHeight: 1.9, color: "#fbbf24", fontSize: "17px" }}>{generatedSermon.ministryFlow?.impartation}</p>
        </div>
        <div style={{ marginBottom: "48px" }}>
          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>🕊️ Altar Call</p>
          <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "17px", color: "#fef3c7" }}>{generatedSermon.altarCall?.invitation}</p>
          <p className="font-serif" style={{ lineHeight: 1.9, fontStyle: "italic", color: "#fde68a", fontSize: "18px" }}>{generatedSermon.altarCall?.prayer}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", paddingBottom: "80px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Mobile Header */}
      <header style={{ position: "sticky", top: 0, background: "rgba(15,10,5,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(245,158,11,0.08)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "18px" }}>✝</span>
          <span className="font-serif" style={{ color: "#f59e0b", fontSize: "15px" }}>The Pastors Helper</span>
        </Link>
        <span style={{ color: "#57534e", fontSize: "12px", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
      </header>

      {/* Main Content */}
      <main style={{ padding: "20px", maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* GENERATE TAB */}
        {activeTab === "generate" && (
          <div>
            {/* Build form */}
            {!generatedSermon && (
              <div className="glass" style={{ borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "20px", marginBottom: "20px" }}>Build a Sermon</h2>

                <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" as const }}>Topic or Scripture</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Faith, John 3:16, Healing..."
                  style={{ width: "100%", padding: "13px 14px", fontSize: "16px", borderRadius: "8px", marginBottom: "16px" }}
                />

                <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" as const }}>Audience</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%", padding: "13px 14px", fontSize: "15px", borderRadius: "8px", marginBottom: "16px" }}>
                  {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
                </select>

                <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "10px", textTransform: "uppercase" as const }}>Tone</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {TONES.map((t) => (
                    <button key={t} onClick={() => setTone(t)} style={{ padding: "8px 14px", borderRadius: "20px", fontSize: "13px", border: "1px solid", borderColor: tone === t ? "rgba(245,158,11,0.6)" : "rgba(245,158,11,0.15)", background: tone === t ? "rgba(245,158,11,0.12)" : "transparent", color: tone === t ? "#f59e0b" : "#78716c", cursor: "pointer" }}>
                      {t}
                    </button>
                  ))}
                </div>

                {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

                <button onClick={generateSermon} disabled={generating} className="btn-gold" style={{ width: "100%", padding: "15px", borderRadius: "8px", fontSize: "16px", opacity: generating ? 0.7 : 1, cursor: generating ? "not-allowed" : "pointer" }}>
                  {generating ? "Seeking the Word..." : "✦ Generate Sermon"}
                </button>
              </div>
            )}

            {/* Loading */}
            {generating && (
              <div className="glass" style={{ borderRadius: "12px", padding: "40px 20px", textAlign: "center" }}>
                <div className="font-serif" style={{ color: "#f59e0b", fontSize: "18px", marginBottom: "10px" }}>Seeking the Word...</div>
                <p style={{ color: "#78716c", fontSize: "14px" }}>Building your sermon structure</p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "8px", height: "8px", background: "#f59e0b", borderRadius: "50%", opacity: 0.6, animation: `pulse 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {/* Generated Sermon */}
            {generatedSermon && !generating && (
              <div className="animate-fade-in">
                {/* Title */}
                <h1 className="font-serif" style={{ color: "#fef3c7", fontSize: "26px", lineHeight: 1.2, marginBottom: "4px" }}>{generatedSermon.title}</h1>
                <p style={{ color: "#78716c", fontSize: "12px", marginBottom: "20px" }}>{tone} · {audience}</p>

                {/* Action buttons - scrollable row */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
                  {[
                    { label: "🎤 Preach", action: () => setPreachMode(true) },
                    { label: saveSuccess ? "✓ Saved" : "💾 Save", action: saveSermon, disabled: saving || saveSuccess },
                    { label: "📄 PDF", action: exportPDF },
                    { label: "↺ New", action: () => { setGeneratedSermon(null); setSaveSuccess(false); setTopic(""); } },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} disabled={btn.disabled} className="btn-ghost" style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0, color: btn.label.includes("✓") ? "#4ade80" : undefined, borderColor: btn.label.includes("✓") ? "rgba(74,222,128,0.3)" : undefined }}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Anchor Scripture */}
                <SermonSection id="s0" label="✝ Anchor Scripture" gold>
                  <p style={{ color: "#f59e0b", fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>{generatedSermon.anchorScripture?.reference}</p>
                  <p className="font-serif" style={{ fontSize: "16px", lineHeight: 1.8, fontStyle: "italic", color: "#fde68a", marginBottom: "12px" }}>&ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;</p>
                  {generatedSermon.anchorScripture?.nkjv && <p style={{ color: "#a8956e", fontSize: "13px", fontStyle: "italic" }}>NKJV: &ldquo;{generatedSermon.anchorScripture?.nkjv}&rdquo;</p>}
                  <div style={{ marginTop: "16px", padding: "12px", background: "rgba(245,158,11,0.06)", borderRadius: "8px" }}>
                    <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "6px" }}>Core Theme</p>
                    <p style={{ color: "#fef3c7", fontSize: "14px" }}>{generatedSermon.theme}</p>
                  </div>
                </SermonSection>

                {/* Opening */}
                <SermonSection id="s1" label="🙏 Opening">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{generatedSermon.opening?.greeting}</p>
                  <p style={{ color: "#a8956e", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.opening?.hook}</p>
                </SermonSection>

                {/* Foundation */}
                <SermonSection id="s2" label="📖 Foundation">
                  <p style={{ color: "#a8956e", lineHeight: 1.8, marginBottom: "12px", fontSize: "14px" }}>{generatedSermon.foundation?.context}</p>
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.foundation?.breakdown}</p>
                </SermonSection>

                {/* Foreword */}
                <SermonSection id="s3" label="💬 Foreword">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{generatedSermon.foreword?.whyItMatters}</p>
                  <p style={{ color: "#a8956e", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.foreword?.relatable}</p>
                </SermonSection>

                {/* Teaching Points */}
                <SermonSection id="s4" label="🔥 Core Teaching">
                  {generatedSermon.teachingPoints?.map((point, i) => (
                    <div key={i} style={{ marginBottom: i < generatedSermon.teachingPoints.length - 1 ? "24px" : 0, paddingBottom: i < generatedSermon.teachingPoints.length - 1 ? "24px" : 0, borderBottom: i < generatedSermon.teachingPoints.length - 1 ? "1px solid rgba(245,158,11,0.08)" : "none" }}>
                      <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "4px" }}>Point {i + 1}</p>
                      <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "18px", marginBottom: "8px" }}>{point.title}</h3>
                      <p style={{ color: "#fbbf24", fontSize: "12px", marginBottom: "10px" }}>{point.scripture}</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{point.explanation}</p>
                      <div style={{ background: "rgba(245,158,11,0.05)", borderLeft: "3px solid rgba(245,158,11,0.3)", padding: "10px 14px", borderRadius: "0 6px 6px 0" }}>
                        <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "4px" }}>Application</p>
                        <p style={{ color: "#fef3c7", lineHeight: 1.7, fontSize: "13px" }}>{point.application}</p>
                      </div>
                    </div>
                  ))}
                </SermonSection>

                {/* Ministry Flow */}
                <SermonSection id="s5" label="✨ Ministry Flow">
                  {[
                    { label: "Gift of Knowledge", text: generatedSermon.ministryFlow?.giftOfKnowledge },
                    { label: "Impartation", text: generatedSermon.ministryFlow?.impartation },
                    { label: "Edification", text: generatedSermon.ministryFlow?.edification },
                    { label: "Slow Down Moment", text: generatedSermon.ministryFlow?.slowDown },
                    { label: "Return to Anchor", text: generatedSermon.ministryFlow?.returnToAnchor },
                  ].filter(m => m.text).map((m) => (
                    <div key={m.label} style={{ marginBottom: "14px" }}>
                      <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: "4px" }}>{m.label}</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.8, fontSize: "14px" }}>{m.text}</p>
                    </div>
                  ))}
                </SermonSection>

                {/* Summary */}
                <SermonSection id="s6" label="📋 Summary">
                  {generatedSermon.summary?.keyTakeaways?.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ color: "#f59e0b", marginTop: "2px", flexShrink: 0 }}>→</span>
                      <span style={{ color: "#fef3c7", lineHeight: 1.7, fontSize: "14px" }}>{t}</span>
                    </div>
                  ))}
                </SermonSection>

                {/* Altar Call */}
                <SermonSection id="s7" label="🕊️ Altar Call">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "16px", fontSize: "14px" }}>{generatedSermon.altarCall?.invitation}</p>
                  <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "16px" }}>
                    <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "8px" }}>Guided Prayer</p>
                    <p className="font-serif" style={{ color: "#fde68a", lineHeight: 1.9, fontSize: "15px", fontStyle: "italic" }}>{generatedSermon.altarCall?.prayer}</p>
                  </div>
                </SermonSection>

                {/* Closing Prayer */}
                <SermonSection id="s8" label="🙌 Closing Prayer">
                  <p className="font-serif" style={{ color: "#fef3c7", lineHeight: 1.9, fontSize: "16px", fontStyle: "italic" }}>{generatedSermon.closingPrayer}</p>
                </SermonSection>
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === "library" && (
          <div>
            <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px", marginBottom: "20px" }}>Sermon Library</h2>
            {loadingSermons ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#57534e" }}>Loading...</div>
            ) : sermons.length === 0 ? (
              <div className="glass" style={{ padding: "40px 20px", textAlign: "center", borderRadius: "12px" }}>
                <div style={{ fontSize: "36px", marginBottom: "14px" }}>📖</div>
                <p style={{ color: "#78716c", marginBottom: "20px" }}>No sermons saved yet.</p>
                <button onClick={() => setActiveTab("generate")} className="btn-gold" style={{ padding: "12px 24px", borderRadius: "8px", fontSize: "14px" }}>Build a Sermon →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sermons.map((s) => (
                  <div key={s.id} className="glass" style={{ padding: "18px", borderRadius: "12px" }}>
                    <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "17px", marginBottom: "4px" }}>{s.title}</h3>
                    <p style={{ color: "#78716c", fontSize: "12px", marginBottom: "14px" }}>{s.tone} · {s.audience} · {new Date(s.created_at).toLocaleDateString()}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setGeneratedSermon(s.content); setTopic(s.topic); setAudience(s.audience); setTone(s.tone); setActiveTab("generate"); }} className="btn-ghost" style={{ flex: 1, padding: "10px", borderRadius: "6px", fontSize: "13px" }}>Open</button>
                      <button onClick={() => deleteSermon(s.id)} style={{ flex: 1, padding: "10px", borderRadius: "6px", fontSize: "13px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div>
            <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px", marginBottom: "24px" }}>Account</h2>
            <div className="glass" style={{ borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
              <p style={{ color: "#a8956e", fontSize: "12px", marginBottom: "4px" }}>Signed in as</p>
              <p style={{ color: "#fef3c7", fontSize: "15px" }}>{user.email}</p>
            </div>
            <button onClick={signOut} style={{ width: "100%", padding: "14px", borderRadius: "8px", fontSize: "15px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer" }}>
              Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,10,5,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(245,158,11,0.1)", display: "flex", zIndex: 50 }}>
        {[
          { tab: "generate" as const, icon: "✦", label: "Build" },
          { tab: "library" as const, icon: "📚", label: "Library" },
          { tab: "menu" as const, icon: "☰", label: "Menu" },
        ].map(({ tab, icon, label }) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "12px 8px 10px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "18px", filter: activeTab === tab ? "none" : "grayscale(1) opacity(0.4)" }}>{icon}</span>
            <span style={{ fontSize: "11px", color: activeTab === tab ? "#f59e0b" : "#57534e", fontWeight: activeTab === tab ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );
}
