"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = { id: string; email: string; isAdmin?: boolean };
type Credits = { balance: number; unlimited: boolean; is_free_tier: boolean };
type Sermon = { id: string; title: string; topic: string; tone: string; level: string; language: string; audience: string; created_at: string; content: Record<string, unknown> };
type Prayer = { id: string; title: string; prayer_type: string; topic: string; created_at: string; content: Record<string, unknown> };

const LEVELS = [
  { id: "beginner",     label: "Beginner",     sub: "Certificate in Ministry",  cost: 1 },
  { id: "intermediate", label: "Intermediate",  sub: "Diploma of Theology",      cost: 2 },
  { id: "advanced",     label: "Advanced",      sub: "Bachelor of Theology",     cost: 3 },
];
const TONES = ["Teaching", "Evangelistic", "Pastoral"];
const AUDIENCES = ["General Congregation", "Youth", "Men's Ministry", "Women's Ministry", "Outreach / Evangelism", "Leaders / Intercessors"];
const LANGUAGES = ["English","Español","Français","Português","Deutsch","Italiano","Nederlands","Afrikaans","IsiZulu","Kiswahili","Yorùbá","Igbo","Hausa","Amharic","Arabic","Hindi","Tamil","Telugu","Filipino","Bahasa Indonesia","Malay","中文","한국어","日本語","Русский","Українська","Română","Polski","Samoan","Fijian","Tok Pisin","Māori","Tongan","Bislama","South Sea Islander","Aboriginal English"];
const GENERAL_PRAYER_TOPICS = ["Healing & Health","Peace & Anxiety","Financial Provision","Family & Relationships","Salvation of Loved Ones","Grief & Loss","Strength & Encouragement","Guidance & Direction","Forgiveness & Restoration","Thanksgiving & Praise"];
const WARFARE_TOPICS = ["Fear & Anxiety","Generational Curses","Spiritual Oppression","Sickness & Infirmity","Addiction & Bondage","Marital & Family Warfare","Ministry Protection","Financial Breakthrough","Depression & Heaviness","Witchcraft & Occult"];

async function safeFetch(url: string, body?: Record<string, unknown>) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const r = await fetch(url, { method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    clearTimeout(timeout);
    return await r.json();
  } catch (e) {
    console.error("safeFetch error:", url, e);
    return { error: "Request failed. Please try again." };
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]     = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [tab, setTab]       = useState<"build"|"library"|"prayers">("build");
  const [activeMode, setActiveMode] = useState<"sermon"|"prayer">("sermon");

  // Sermon state
  const [topic, setTopic]     = useState("");
  const [level, setLevel]     = useState("beginner");
  const [tone, setTone]       = useState("Teaching");
  const [audience, setAudience] = useState("General Congregation");
  const [language, setLanguage] = useState("English");
  const [generating, setGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<Record<string, unknown> | null>(null);
  const [sermonError, setSermonError] = useState("");
  const [savingSermon, setSavingSermon] = useState(false);
  const [savedSermon, setSavedSermon] = useState(false);
  const [preachMode, setPreachMode] = useState(false);
  const [sermons, setSermons] = useState<Sermon[]>([]);

  // Prayer state
  const [prayerType, setPrayerType]   = useState("General Prayer");
  const [prayerTopic, setPrayerTopic] = useState("");
  const [prayerLang, setPrayerLang]   = useState("English");
  const [generatingPrayer, setGeneratingPrayer] = useState(false);
  const [generatedPrayer, setGeneratedPrayer]   = useState<Record<string, unknown> | null>(null);
  const [prayerError, setPrayerError] = useState("");
  const [savingPrayer, setSavingPrayer] = useState(false);
  const [savedPrayer, setSavedPrayer]   = useState(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);

  const loadCredits = useCallback(async () => {
    const d = await safeFetch("/api/credits/balance");
    if (d.credits) setCredits(d.credits);
  }, []);

  const loadSermons = useCallback(async () => {
    const d = await safeFetch("/api/sermons");
    if (d.sermons) setSermons(d.sermons);
  }, []);

  const loadPrayers = useCallback(async () => {
    const d = await safeFetch("/api/prayers");
    if (d.prayers) setPrayers(d.prayers);
  }, []);

  useEffect(() => {
    safeFetch("/api/auth/me").then(d => {
      if (!d.user?.id) { router.replace("/login"); return; }
      setUser(d.user);
      loadCredits();
      loadSermons();
      loadPrayers();
    });
    safeFetch("/api/track", { page: "/dashboard" }).catch(() => {});
  }, [router, loadCredits, loadSermons, loadPrayers]);

  const generateSermon = async () => {
    if (!topic.trim()) { setSermonError("Please enter a topic or scripture."); return; }
    setGenerating(true); setSermonError(""); setGeneratedSermon(null); setSavedSermon(false);
    const deduct = await safeFetch("/api/credits/deduct", { level, topic });
    if (deduct.error === "insufficient_credits") { setSermonError("Not enough credits. Please top up."); setGenerating(false); return; }
    const data = await safeFetch("/api/generate", { topic, audience, tone, level, language });
    setGenerating(false);
    if (data.error) { setSermonError(data.error); return; }
    if (!data.sermon) { setSermonError("No sermon returned — please try again."); return; }
    setGeneratedSermon(data.sermon);
    loadCredits();
  };

  const saveSermon = async () => {
    if (!generatedSermon || !user) return;
    setSavingSermon(true);
    await safeFetch("/api/sermons", { user_id: user.id, title: generatedSermon.title || topic, topic, audience, tone, level, language, content: generatedSermon });
    setSavingSermon(false); setSavedSermon(true);
    loadSermons();
  };

  const deleteSermon = async (id: string) => {
    await fetch("/api/sermons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadSermons();
  };

  const generatePrayer = async () => {
    setGeneratingPrayer(true); setPrayerError(""); setGeneratedPrayer(null); setSavedPrayer(false);
    const deduct = await safeFetch("/api/credits/deduct", { level: "prayer", topic: prayerTopic });
    if (deduct.error === "insufficient_credits") { setPrayerError("Not enough credits. Please top up."); setGeneratingPrayer(false); return; }
    const data = await safeFetch("/api/prayer", { type: prayerType, topic: prayerTopic, audience, language: prayerLang });
    setGeneratingPrayer(false);
    if (data.error) { setPrayerError(data.error); return; }
    if (!data.prayer) { setPrayerError("No prayer returned — please try again."); return; }
    setGeneratedPrayer(data.prayer);
    loadCredits();
  };

  const savePrayer = async () => {
    if (!generatedPrayer || !user) return;
    setSavingPrayer(true);
    await safeFetch("/api/prayers", { user_id: user.id, title: generatedPrayer.title || prayerType, prayer_type: prayerType, topic: prayerTopic, language: prayerLang, audience, content: generatedPrayer });
    setSavingPrayer(false); setSavedPrayer(true);
    loadPrayers();
  };

  const deletePrayer = async (id: string) => {
    await fetch("/api/prayers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadPrayers();
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const exportPDF = async () => {
    if (!generatedSermon) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF(); let y = 20;
    doc.setFontSize(18); doc.text((generatedSermon.title as string) || "Sermon", 20, y); y += 12;
    doc.setFontSize(10);
    const add = (heading: string, text: string) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.text(heading.toUpperCase(), 20, y); y += 6;
      doc.setFont("helvetica", "normal");
      doc.splitTextToSize(text, 170).forEach((l: string) => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 20, y); y += 5; });
      y += 6;
    };
    const anch = generatedSermon.anchorScripture as Record<string, string>;
    if (anch) add("Anchor Scripture", `${anch.reference}\n${anch.kjv}`);
    if (generatedSermon.theme) add("Theme", generatedSermon.theme as string);
    const op = generatedSermon.opening as Record<string, string>;
    if (op) add("Opening", `${op.greeting}\n${op.hook}`);
    (generatedSermon.teachingPoints as Record<string, string>[] || []).forEach((p, i) => add(`Point ${i + 1}: ${p.title}`, `${p.scripture}\n\n${p.explanation}\n\nApplication: ${p.application}`));
    const ac = generatedSermon.altarCall as Record<string, string>;
    if (ac) add("Altar Call", `${ac.invitation}\n\n${ac.prayer}`);
    if (generatedSermon.closingPrayer) add("Closing Prayer", generatedSermon.closingPrayer as string);
    doc.save(`${((generatedSermon.title as string) || "sermon").replace(/\s+/g, "_")}.pdf`);
  };

  if (!user) return <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#f59e0b" }}>Loading...</p></div>;

  const s = { card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "12px", padding: "20px" } as React.CSSProperties };

  // Preach Mode
  if (preachMode && generatedSermon) {
    const anch = generatedSermon.anchorScripture as Record<string, string>;
    return (
      <div style={{ minHeight: "100vh", background: "#080502", padding: "60px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
            <h1 style={{ color: "#f59e0b", fontSize: "26px", fontFamily: "Georgia,serif" }}>{generatedSermon.title as string}</h1>
            <button onClick={() => setPreachMode(false)} style={{ background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>✕ Exit</button>
          </div>
          {anch && <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "12px", padding: "28px", marginBottom: "32px" }}>
            <p style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>{anch.reference}</p>
            <p style={{ color: "#fde68a", fontSize: "22px", fontStyle: "italic", lineHeight: 1.7 }}>&ldquo;{anch.kjv}&rdquo;</p>
          </div>}
          {(generatedSermon.teachingPoints as Record<string, unknown>[] || []).map((p, i) => (
            <div key={i} style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid rgba(245,158,11,0.06)" }}>
              <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Point {i + 1}</p>
              <h3 style={{ color: "#fef3c7", fontSize: "26px", fontFamily: "Georgia,serif", marginBottom: "16px" }}>{p.title as string}</h3>
              <p style={{ color: "#fbbf24", marginBottom: "14px" }}>{p.scripture as string}</p>
              <p style={{ color: "#fef3c7", lineHeight: 1.9, marginBottom: "14px" }}>{p.explanation as string}</p>
              <p style={{ color: "#a8956e", lineHeight: 1.9 }}>{p.application as string}</p>
            </div>
          ))}
          {(() => { const ac = generatedSermon.altarCall as Record<string, string>; return ac ? (
            <div style={{ marginBottom: "32px" }}>
              <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>🕊️ Altar Call</p>
              <p style={{ color: "#fef3c7", lineHeight: 1.9, marginBottom: "16px" }}>{ac.invitation}</p>
              <p style={{ color: "#fde68a", fontStyle: "italic", fontSize: "18px", lineHeight: 1.9 }}>{ac.prayer}</p>
            </div>
          ) : null; })()}
          {generatedSermon.closingPrayer && <p style={{ color: "#a8956e", fontStyle: "italic", fontSize: "17px", lineHeight: 1.9 }}>{generatedSermon.closingPrayer as string}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid rgba(245,158,11,0.08)", position: "relative", zIndex: 20, flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "18px" }}>✝</span>
          <span style={{ color: "#f59e0b", fontSize: "16px", fontFamily: "Georgia,serif" }}>The Pastors Helper</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {credits && (
            <Link href="/credits" style={{ padding: "6px 12px", borderRadius: "20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: credits.unlimited ? "#10b981" : credits.balance < 3 ? "#f87171" : "#f59e0b", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
              {credits.unlimited ? "∞ Unlimited" : `${credits.balance} credits`}
            </Link>
          )}
          <span style={{ color: "#57534e", fontSize: "12px" }}>{user.email}</span>
          {user.isAdmin && <Link href="/admin" style={{ color: "#a78bfa", fontSize: "12px", textDecoration: "none" }}>Admin</Link>}
          <button onClick={signOut} style={{ background: "none", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "6px", color: "#78716c", padding: "6px 12px", cursor: "pointer", fontSize: "13px" }}>Sign Out</button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative", zIndex: 10 }}>
        {/* Sidebar */}
        <aside style={{ width: "200px", flexShrink: 0, borderRight: "1px solid rgba(245,158,11,0.08)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
          {[
            { id: "build",   label: "✦ Build", sub: "Sermon or Prayer" },
            { id: "library", label: "📚 Library", sub: `${sermons.length} sermons` },
            { id: "prayers", label: "🙏 Prayers", sub: `${prayers.length} saved` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{ padding: "10px 12px", borderRadius: "8px", border: "none", cursor: "pointer", textAlign: "left", background: tab === t.id ? "rgba(245,158,11,0.1)" : "transparent" }}>
              <p style={{ color: tab === t.id ? "#f59e0b" : "#78716c", fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</p>
              <p style={{ color: "#3d3326", fontSize: "11px" }}>{t.sub}</p>
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* BUILD TAB */}
          {tab === "build" && (
            <div style={{ maxWidth: "860px", margin: "0 auto" }}>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[{ id: "sermon", label: "✝ Sermon Builder" }, { id: "prayer", label: "🙏 Prayer Builder" }].map(m => (
                  <button key={m.id} onClick={() => { setActiveMode(m.id as "sermon"|"prayer"); setGeneratedSermon(null); setGeneratedPrayer(null); }} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid", borderColor: activeMode === m.id ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.15)", background: activeMode === m.id ? "rgba(245,158,11,0.1)" : "transparent", color: activeMode === m.id ? "#f59e0b" : "#78716c", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* SERMON BUILDER */}
              {activeMode === "sermon" && !generatedSermon && (
                <div style={s.card}>
                  <h2 style={{ color: "#fef3c7", fontSize: "18px", fontFamily: "Georgia,serif", marginBottom: "20px" }}>Build a Sermon</h2>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Topic or Scripture</label>
                    <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generateSermon()} placeholder="e.g. Faith, John 3:16, Healing..." style={{ width: "100%", padding: "12px 14px", fontSize: "15px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none" }} autoFocus />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Audience</label>
                      <select value={audience} onChange={e => setAudience(e.target.value)} style={{ width: "100%", padding: "11px 12px", fontSize: "14px", borderRadius: "8px", background: "#1a1209", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none" }}>
                        {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Language</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: "100%", padding: "11px 12px", fontSize: "14px", borderRadius: "8px", background: "#1a1209", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none" }}>
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Theological Level</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {LEVELS.map(l => (
                        <button key={l.id} onClick={() => setLevel(l.id)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid", borderColor: level === l.id ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.12)", background: level === l.id ? "rgba(245,158,11,0.1)" : "transparent", color: level === l.id ? "#f59e0b" : "#78716c", cursor: "pointer", fontSize: "13px" }}>
                          <span style={{ fontWeight: 600 }}>{l.label}</span> <span style={{ opacity: 0.6, fontSize: "11px" }}>({l.cost} cr)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Sermon Tone</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {TONES.map(t => (
                        <button key={t} onClick={() => setTone(t)} style={{ padding: "10px 18px", borderRadius: "20px", border: "1px solid", borderColor: tone === t ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.12)", background: tone === t ? "rgba(245,158,11,0.1)" : "transparent", color: tone === t ? "#f59e0b" : "#78716c", cursor: "pointer", fontSize: "14px", fontWeight: tone === t ? 600 : 400 }}>{t}</button>
                      ))}
                    </div>
                  </div>
                  {sermonError && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{sermonError}</p>}
                  <button onClick={generateSermon} disabled={generating} style={{ padding: "14px 32px", borderRadius: "8px", background: generating ? "rgba(245,158,11,0.3)" : "linear-gradient(135deg, #f59e0b, #d97706)", color: generating ? "#f59e0b" : "#0f0a05", fontWeight: 700, fontSize: "15px", border: generating ? "1px solid #f59e0b" : "none", cursor: generating ? "not-allowed" : "pointer" }}>
                    {generating ? "⏳ Building your sermon — this takes 20–30 seconds..." : "✦ Generate Sermon"}
                  </button>
                  {generating && <p style={{ color: "#78716c", fontSize: "13px", marginTop: "8px", fontStyle: "italic" }}>Please wait — Claude is writing your Scripture-anchored sermon...</p>}
                </div>
              )}

              {/* SERMON OUTPUT */}
              {activeMode === "sermon" && generatedSermon && !generating && (() => {
                const anch = generatedSermon.anchorScripture as Record<string, string>;
                const pts = generatedSermon.teachingPoints as Record<string, unknown>[] || [];
                const mf = generatedSermon.ministryFlow as Record<string, string> || {};
                const sum = generatedSermon.summary as Record<string, string[]> || {};
                const ac = generatedSermon.altarCall as Record<string, string> || {};
                const op = generatedSermon.opening as Record<string, string> || {};
                const fn = generatedSermon.foundation as Record<string, string> || {};
                const fw = generatedSermon.foreword as Record<string, string> || {};
                return (
                  <div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <button onClick={() => setPreachMode(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer" }}>🎤 Preach Mode</button>
                      <button onClick={saveSermon} disabled={savingSermon || savedSermon} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", border: `1px solid ${savedSermon ? "rgba(74,222,128,0.3)" : "rgba(245,158,11,0.2)"}`, color: savedSermon ? "#4ade80" : "#f59e0b", cursor: "pointer", fontSize: "14px" }}>{savingSermon ? "Saving..." : savedSermon ? "✓ Saved" : "💾 Save"}</button>
                      <button onClick={exportPDF} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#78716c", cursor: "pointer", fontSize: "14px" }}>📄 PDF</button>
                      <button onClick={() => { setGeneratedSermon(null); setSavedSermon(false); setSermonError(""); }} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(245,158,11,0.15)", color: "#57534e", cursor: "pointer", fontSize: "14px" }}>↺ New</button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(245,158,11,0.08)", color: "#f59e0b" }}>{level}</span>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(245,158,11,0.06)", color: "#78716c" }}>{tone}</span>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(245,158,11,0.06)", color: "#78716c" }}>{language}</span>
                    </div>
                    <h1 style={{ color: "#fef3c7", fontSize: "28px", fontFamily: "Georgia,serif", marginBottom: "20px", lineHeight: 1.2 }}>{generatedSermon.title as string}</h1>
                    {anch && <Sec label="✝ Anchor Scripture" gold><p style={{ color: "#f59e0b", fontWeight: 600, marginBottom: "10px" }}>{anch.reference}</p><p style={{ color: "#fde68a", fontStyle: "italic", fontSize: "17px", lineHeight: 1.8 }}>&ldquo;{anch.kjv}&rdquo;</p></Sec>}
                    {op.greeting && <Sec label="🙏 Opening"><p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px" }}>{op.greeting}</p><p style={{ color: "#a8956e", lineHeight: 1.8 }}>{op.hook}</p></Sec>}
                    {fn.context && <Sec label="📖 Foundation"><p style={{ color: "#a8956e", lineHeight: 1.8, marginBottom: "10px" }}>{fn.context}</p><p style={{ color: "#fef3c7", lineHeight: 1.8 }}>{fn.breakdown}</p></Sec>}
                    {fw.whyItMatters && <Sec label="💬 Foreword"><p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px" }}>{fw.whyItMatters}</p><p style={{ color: "#a8956e", lineHeight: 1.8 }}>{fw.relatable}</p></Sec>}
                    <Sec label="🔥 Core Teaching">
                      {pts.map((p, i) => (
                        <div key={i} style={{ marginBottom: i < pts.length - 1 ? "24px" : 0, paddingBottom: i < pts.length - 1 ? "24px" : 0, borderBottom: i < pts.length - 1 ? "1px solid rgba(245,158,11,0.07)" : "none" }}>
                          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>Point {i + 1}</p>
                          <h3 style={{ color: "#fef3c7", fontSize: "18px", fontFamily: "Georgia,serif", marginBottom: "8px" }}>{p.title as string}</h3>
                          <p style={{ color: "#fbbf24", fontSize: "13px", marginBottom: "10px" }}>{p.scripture as string}</p>
                          {(p.supportingScriptures as string[] || []).map((ss, j) => <p key={j} style={{ color: "#a8956e", fontSize: "12px", marginBottom: "6px", fontStyle: "italic" }}>↳ {ss}</p>)}
                          <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px" }}>{p.explanation as string}</p>
                          <div style={{ background: "rgba(245,158,11,0.05)", borderLeft: "3px solid rgba(245,158,11,0.3)", padding: "10px 14px", borderRadius: "0 6px 6px 0" }}>
                            <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Application</p>
                            <p style={{ color: "#fef3c7", fontSize: "14px", lineHeight: 1.7 }}>{p.application as string}</p>
                          </div>
                        </div>
                      ))}
                    </Sec>
                    {mf.giftOfKnowledge && <Sec label="✨ Ministry Flow">
                      {[["Gift of Knowledge", mf.giftOfKnowledge], ["Impartation", mf.impartation], ["Edification", mf.edification], ["Slow Down", mf.slowDown], ["Return to Anchor", mf.returnToAnchor]].map(([label, text]) => text ? (
                        <div key={label} style={{ marginBottom: "14px" }}>
                          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{label}</p>
                          <p style={{ color: "#fef3c7", lineHeight: 1.8 }}>{text}</p>
                        </div>
                      ) : null)}
                    </Sec>}
                    {sum.keyTakeaways?.length > 0 && <Sec label="📋 Summary"><ul style={{ listStyle: "none" }}>{sum.keyTakeaways.map((t, i) => <li key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}><span style={{ color: "#f59e0b" }}>→</span><span style={{ color: "#fef3c7", lineHeight: 1.7 }}>{t}</span></li>)}</ul></Sec>}
                    {ac.invitation && <Sec label="🕊️ Altar Call"><p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "16px" }}>{ac.invitation}</p><div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "8px", padding: "16px" }}><p style={{ color: "#a8956e", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px" }}>Guided Prayer</p><p style={{ color: "#fde68a", fontStyle: "italic", lineHeight: 1.9 }}>{ac.prayer}</p></div></Sec>}
                    {generatedSermon.closingPrayer && <Sec label="🙌 Closing Prayer"><p style={{ color: "#fef3c7", fontStyle: "italic", lineHeight: 1.9, fontFamily: "Georgia,serif", fontSize: "16px" }}>{generatedSermon.closingPrayer as string}</p></Sec>}
                  </div>
                );
              })()}

              {/* PRAYER BUILDER */}
              {activeMode === "prayer" && !generatedPrayer && (
                <div style={s.card}>
                  <h2 style={{ color: "#fef3c7", fontSize: "18px", fontFamily: "Georgia,serif", marginBottom: "20px" }}>Ministry Prayer Builder</h2>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>🙏 Prayer Help</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button onClick={() => { setPrayerType("General Prayer"); setPrayerTopic(""); }} style={{ flexShrink: 0, padding: "12px 18px", borderRadius: "10px", border: "1px solid", borderColor: prayerType === "General Prayer" ? "#a78bfa" : "rgba(139,92,246,0.2)", background: prayerType === "General Prayer" ? "rgba(139,92,246,0.15)" : "transparent", color: "#a78bfa", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>🙏 General Prayer</button>
                        <select value={prayerType === "General Prayer" ? prayerTopic : ""} onChange={e => { setPrayerType("General Prayer"); setPrayerTopic(e.target.value); }} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.2)", background: "#1a1209", color: "#fef3c7", fontSize: "14px", outline: "none" }}>
                          <option value="">All Areas</option>
                          {GENERAL_PRAYER_TOPICS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button onClick={() => { setPrayerType("Warfare"); setPrayerTopic(""); }} style={{ flexShrink: 0, padding: "12px 18px", borderRadius: "10px", border: "1px solid", borderColor: prayerType === "Warfare" ? "#a78bfa" : "rgba(139,92,246,0.2)", background: prayerType === "Warfare" ? "rgba(139,92,246,0.15)" : "transparent", color: "#a78bfa", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>⚔️ Warfare</button>
                        <select value={prayerType === "Warfare" ? prayerTopic : ""} onChange={e => { setPrayerType("Warfare"); setPrayerTopic(e.target.value); }} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.2)", background: "#1a1209", color: "#fef3c7", fontSize: "14px", outline: "none" }}>
                          <option value="">All Areas</option>
                          {WARFARE_TOPICS.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Audience</label>
                      <select value={audience} onChange={e => setAudience(e.target.value)} style={{ width: "100%", padding: "11px 12px", fontSize: "14px", borderRadius: "8px", background: "#1a1209", border: "1px solid rgba(139,92,246,0.2)", color: "#fef3c7", outline: "none" }}>
                        {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Language</label>
                      <select value={prayerLang} onChange={e => setPrayerLang(e.target.value)} style={{ width: "100%", padding: "11px 12px", fontSize: "14px", borderRadius: "8px", background: "#1a1209", border: "1px solid rgba(139,92,246,0.2)", color: "#fef3c7", outline: "none" }}>
                        {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  {prayerError && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{prayerError}</p>}
                  <button onClick={generatePrayer} disabled={generatingPrayer} style={{ padding: "14px 32px", borderRadius: "8px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: "15px", border: "none", cursor: generatingPrayer ? "not-allowed" : "pointer", opacity: generatingPrayer ? 0.7 : 1 }}>
                    {generatingPrayer ? "🙏 Generating prayer..." : `🙏 Generate ${prayerType === "Warfare" ? "Warfare" : "General"} Prayer`}
                  </button>
                </div>
              )}

              {/* PRAYER OUTPUT */}
              {activeMode === "prayer" && generatedPrayer && !generatingPrayer && (() => {
                const p = generatedPrayer as { title?: string; type?: string; openingDeclaration?: { text?: string; scripture?: string }; prayerSections?: { heading?: string; prayer?: string; scripture?: string; congregationalResponse?: string }[]; corporateDeclaration?: { instruction?: string; declaration?: string }; closingBlessing?: { text?: string; scripture?: string } };
                return (
                  <div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <button onClick={savePrayer} disabled={savingPrayer || savedPrayer} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", border: `1px solid ${savedPrayer ? "rgba(74,222,128,0.3)" : "rgba(139,92,246,0.3)"}`, color: savedPrayer ? "#4ade80" : "#a78bfa", cursor: "pointer", fontSize: "14px" }}>{savingPrayer ? "Saving..." : savedPrayer ? "✓ Saved" : "💾 Save Prayer"}</button>
                      <button onClick={() => { setGeneratedPrayer(null); setSavedPrayer(false); }} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(139,92,246,0.2)", color: "#57534e", cursor: "pointer", fontSize: "14px" }}>↺ New Prayer</button>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(139,92,246,0.1)", color: "#a78bfa" }}>{p.type}</span>
                      {prayerTopic && <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", background: "rgba(139,92,246,0.07)", color: "#78716c" }}>{prayerTopic}</span>}
                    </div>
                    <h1 style={{ color: "#fef3c7", fontSize: "24px", fontFamily: "Georgia,serif", marginBottom: "20px" }}>{p.title}</h1>
                    {p.openingDeclaration && <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: "12px", padding: "18px", marginBottom: "12px" }}>
                      <p style={{ color: "#a78bfa", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>Opening Declaration</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.85, marginBottom: "10px" }}>{p.openingDeclaration.text}</p>
                      {p.openingDeclaration.scripture && <p style={{ color: "#a78bfa", fontSize: "12px", fontStyle: "italic" }}>✝ {p.openingDeclaration.scripture}</p>}
                    </div>}
                    {(p.prayerSections || []).map((ps, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: "12px", padding: "18px", marginBottom: "10px" }}>
                        <p style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>{p.type === "Warfare" ? "⚔️" : "🙏"} {ps.heading}</p>
                        <p style={{ color: "#fef3c7", lineHeight: 1.9, marginBottom: "10px" }}>{ps.prayer}</p>
                        {ps.scripture && <p style={{ color: "#a78bfa", fontSize: "12px", fontStyle: "italic", marginBottom: "10px" }}>✝ {ps.scripture}</p>}
                        {ps.congregationalResponse && <div style={{ padding: "10px 14px", background: "rgba(139,92,246,0.1)", borderRadius: "8px", borderLeft: "3px solid #a78bfa" }}>
                          <p style={{ color: "#78716c", fontSize: "10px", textTransform: "uppercase", marginBottom: "4px" }}>Congregation</p>
                          <p style={{ color: "#c4b5fd", fontSize: "14px", fontWeight: 600 }}>&ldquo;{ps.congregationalResponse}&rdquo;</p>
                        </div>}
                      </div>
                    ))}
                    {p.corporateDeclaration && <div style={{ background: "rgba(139,92,246,0.1)", border: "2px solid rgba(139,92,246,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "10px", textAlign: "center" }}>
                      <p style={{ color: "#a78bfa", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Corporate Declaration</p>
                      <p style={{ color: "#78716c", fontSize: "12px", marginBottom: "12px", fontStyle: "italic" }}>{p.corporateDeclaration.instruction}</p>
                      <p style={{ color: "#fef3c7", fontSize: "16px", fontWeight: 700, lineHeight: 1.7, fontFamily: "Georgia,serif" }}>&ldquo;{p.corporateDeclaration.declaration}&rdquo;</p>
                    </div>}
                    {p.closingBlessing && <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "12px", padding: "18px" }}>
                      <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>Closing Blessing</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.85, marginBottom: "10px", fontFamily: "Georgia,serif" }}>{p.closingBlessing.text}</p>
                      {p.closingBlessing.scripture && <p style={{ color: "#a8956e", fontSize: "12px", fontStyle: "italic" }}>✝ {p.closingBlessing.scripture}</p>}
                    </div>}
                  </div>
                );
              })()}
            </div>
          )}

          {/* LIBRARY TAB */}
          {tab === "library" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ color: "#fef3c7", fontSize: "22px", fontFamily: "Georgia,serif", marginBottom: "24px" }}>Sermon Library</h2>
              {sermons.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: "48px" }}>
                  <p style={{ fontSize: "36px", marginBottom: "12px" }}>📚</p>
                  <p style={{ color: "#78716c" }}>No sermons saved yet.</p>
                  <button onClick={() => setTab("build")} style={{ marginTop: "16px", padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, border: "none", cursor: "pointer" }}>Build a Sermon →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {sermons.map(s2 => (
                    <div key={s2.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#fef3c7", fontSize: "16px", fontFamily: "Georgia,serif", marginBottom: "4px" }}>{s2.title}</h3>
                        <p style={{ color: "#57534e", fontSize: "12px" }}>{s2.tone} · {s2.level} · {s2.language} · {new Date(s2.created_at).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => { setGeneratedSermon(s2.content); setTopic(s2.topic); setTone(s2.tone); setLevel(s2.level); setAudience(s2.audience); setLanguage(s2.language); setTab("build"); setActiveMode("sermon"); }} style={{ padding: "7px 14px", borderRadius: "6px", background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", cursor: "pointer", fontSize: "13px" }}>Open</button>
                        <button onClick={() => deleteSermon(s2.id)} style={{ padding: "7px 14px", borderRadius: "6px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", fontSize: "13px" }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRAYERS TAB */}
          {tab === "prayers" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 style={{ color: "#fef3c7", fontSize: "22px", fontFamily: "Georgia,serif", marginBottom: "24px" }}>Prayer Library</h2>
              {prayers.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: "48px" }}>
                  <p style={{ fontSize: "36px", marginBottom: "12px" }}>🙏</p>
                  <p style={{ color: "#78716c" }}>No prayers saved yet.</p>
                  <button onClick={() => { setTab("build"); setActiveMode("prayer"); }} style={{ marginTop: "16px", padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Build a Prayer →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {prayers.map(pr => (
                    <div key={pr.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: "#fef3c7", fontSize: "16px", fontFamily: "Georgia,serif", marginBottom: "4px" }}>{pr.title}</h3>
                        <p style={{ color: "#57534e", fontSize: "12px" }}>{pr.prayer_type}{pr.topic ? ` · ${pr.topic}` : ""} · {new Date(pr.created_at).toLocaleDateString()}</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => { setGeneratedPrayer(pr.content); setPrayerType(pr.prayer_type); setPrayerTopic(pr.topic); setTab("build"); setActiveMode("prayer"); }} style={{ padding: "7px 14px", borderRadius: "6px", background: "transparent", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer", fontSize: "13px" }}>Open</button>
                        <button onClick={() => deletePrayer(pr.id)} style={{ padding: "7px 14px", borderRadius: "6px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", fontSize: "13px" }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Sec({ label, children, gold }: { label: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <div style={{ background: gold ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${gold ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.08)"}`, borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
      <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "14px" }}>{label}</p>
      {children}
    </div>
  );
}
