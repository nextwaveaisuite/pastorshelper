"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase, Sermon, Series } from "@/lib/supabase";
import { TOPIC_CATEGORIES, getRandomTopics } from "@/lib/topics";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUDIENCES = ["General Congregation", "Youth", "Outreach / Evangelism", "Men's Ministry", "Women's Ministry", "Leaders"];
const TONES = ["Teaching", "Prophetic", "Evangelistic", "Pastoral", "Conviction"];

const LEVELS = [
  { key: "beginner",     label: "Beginner",     desc: "Simple language for new believers",          color: "#10b981", icon: "🌱" },
  { key: "intermediate", label: "Intermediate",  desc: "Deeper context for growing believers",       color: "#3b82f6", icon: "📖" },
  { key: "advanced",     label: "Advanced",      desc: "Deep theology for mature ministers",         color: "#8b5cf6", icon: "🎓" },
];

const LANGUAGES = [
  { code: "English",            label: "English",            flag: "🇬🇧" },
  { code: "Spanish",            label: "Español",            flag: "🇪🇸" },
  { code: "French",             label: "Français",           flag: "🇫🇷" },
  { code: "Portuguese",         label: "Português",          flag: "🇧🇷" },
  { code: "German",             label: "Deutsch",            flag: "🇩🇪" },
  { code: "Italian",            label: "Italiano",           flag: "🇮🇹" },
  { code: "Dutch",              label: "Nederlands",         flag: "🇳🇱" },
  { code: "Afrikaans",          label: "Afrikaans",          flag: "🇿🇦" },
  { code: "Zulu",               label: "IsiZulu",            flag: "🇿🇦" },
  { code: "Swahili",            label: "Kiswahili",          flag: "🇰🇪" },
  { code: "Yoruba",             label: "Yorùbá",             flag: "🇳🇬" },
  { code: "Igbo",               label: "Igbo",               flag: "🇳🇬" },
  { code: "Hausa",              label: "Hausa",              flag: "🇳🇬" },
  { code: "Amharic",            label: "Amharic",            flag: "🇪🇹" },
  { code: "Arabic",             label: "Arabic",             flag: "🇸🇦" },
  { code: "Hindi",              label: "Hindi",              flag: "🇮🇳" },
  { code: "Tamil",              label: "Tamil",              flag: "🇮🇳" },
  { code: "Telugu",             label: "Telugu",             flag: "🇮🇳" },
  { code: "Tagalog",            label: "Filipino",           flag: "🇵🇭" },
  { code: "Indonesian",         label: "Bahasa Indonesia",   flag: "🇮🇩" },
  { code: "Malay",              label: "Bahasa Melayu",      flag: "🇲🇾" },
  { code: "Mandarin Chinese",   label: "中文",               flag: "🇨🇳" },
  { code: "Korean",             label: "한국어",              flag: "🇰🇷" },
  { code: "Japanese",           label: "日本語",              flag: "🇯🇵" },
  { code: "Russian",            label: "Русский",            flag: "🇷🇺" },
  { code: "Ukrainian",          label: "Українська",         flag: "🇺🇦" },
  { code: "Romanian",           label: "Română",             flag: "🇷🇴" },
  { code: "Polish",             label: "Polski",             flag: "🇵🇱" },
  { code: "Samoan",             label: "Gagana Samoa",       flag: "🇼🇸" },
  { code: "Fijian",             label: "Vosa Vakaviti",      flag: "🇫🇯" },
  { code: "Tok Pisin",          label: "Tok Pisin (PNG)",    flag: "🇵🇬" },
  { code: "Maori",              label: "Te Reo Māori",       flag: "🇳🇿" },
  { code: "Tongan",             label: "Lea Faka-Tonga",     flag: "🇹🇴" },
];

type SeriesWithSermons = Series & { sermons: Partial<Sermon>[] };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: "10px", fontWeight: 500 }}>
      {children}
    </p>
  );
}

function SermonSection({ id, label, children, gold = false }: { id: string; label: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <div id={id} style={{ background: gold ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${gold ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.08)"}`, borderRadius: "12px", padding: "20px", marginBottom: "14px" }}>
      <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "14px", fontWeight: 600 }}>{label}</p>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesWithSermons[]>([]);
  const [loadingSermons, setLoadingSermons] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);

  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("General Congregation");
  const [tone, setTone] = useState("Teaching");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("English");
  const [generating, setGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<Sermon["content"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preachMode, setPreachMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "library" | "series" | "menu">("generate");
  const [showTopics, setShowTopics] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [randomTopics, setRandomTopics] = useState<string[]>([]);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [assigningSermon, setAssigningSermon] = useState<string | null>(null);

  const router = useRouter();

  const loadSermons = useCallback(async (userId: string) => {
    setLoadingSermons(true);
    const { data } = await supabase.from("sermons").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setSermons((data as Sermon[]) || []);
    setLoadingSermons(false);
  }, []);

  const loadSeries = useCallback(async (userId: string) => {
    setLoadingSeries(true);
    const res = await fetch("/api/series", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }) });
    const data = await res.json();
    setSeriesList(data.series || []);
    setLoadingSeries(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      setUser(data.session.user);
      loadSermons(data.session.user.id);
      loadSeries(data.session.user.id);
    });
    setRandomTopics(getRandomTopics(12));
  }, [router, loadSermons, loadSeries]);

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const generateSermon = async () => {
    if (!topic.trim()) { setError("Please enter or choose a topic."); return; }
    setGenerating(true); setError(""); setGeneratedSermon(null); setSaveSuccess(false);
    setShowTopics(false); setShowLangPicker(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone, level, language }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server error — please try again."); }
      if (data.error) throw new Error(data.error);
      setGeneratedSermon(data.sermon);
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
    loadSermons(user!.id); loadSeries(user!.id);
  };

  const createSeries = async () => {
    if (!newSeriesName.trim() || !user) return;
    setCreatingSeries(true);
    const res = await fetch("/api/create-series", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, name: newSeriesName, description: newSeriesDesc }) });
    const data = await res.json();
    setCreatingSeries(false);
    if (data.success) { setNewSeriesName(""); setNewSeriesDesc(""); setShowNewSeries(false); loadSeries(user.id); }
  };

  const deleteSeries = async (id: string) => {
    await fetch("/api/delete-series", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, user_id: user?.id }) });
    loadSeries(user!.id); loadSermons(user!.id);
  };

  const assignToSeries = async (sermonId: string, seriesId: string | null) => {
    await fetch("/api/assign-series", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sermon_id: sermonId, series_id: seriesId, user_id: user?.id }) });
    setAssigningSermon(null); loadSermons(user!.id); loadSeries(user!.id);
  };

  const exportPDF = async () => {
    if (!generatedSermon) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(generatedSermon.title || "Sermon", 20, y); y += 10;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`${generatedSermon.anchorScripture?.reference || ""} | ${tone} · ${audience} · ${level}`, 20, y); y += 14;
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
      <div style={{ color: "#f59e0b", fontFamily: "Georgia, serif" }}>Loading...</div>
    </div>
  );

  // ── PREACH MODE ──
  if (preachMode && generatedSermon) return (
    <div style={{ minHeight: "100vh", background: "#0a0704" }}>
      <div style={{ position: "sticky", top: 0, background: "rgba(10,7,4,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(245,158,11,0.1)", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 20 }}>
        <h2 className="font-serif" style={{ color: "#f59e0b", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{generatedSermon.title}</h2>
        <button onClick={() => setPreachMode(false)} style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", background: "transparent", border: "1px solid rgba(245,158,11,0.2)", color: "#a8956e", cursor: "pointer" }}>✕ Exit</button>
      </div>
      <div style={{ padding: "28px 20px", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>Anchor — {generatedSermon.anchorScripture?.reference}</p>
          <p className="font-serif" style={{ fontSize: "19px", lineHeight: 1.8, fontStyle: "italic", color: "#fde68a" }}>&ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;</p>
        </div>
        {generatedSermon.teachingPoints?.map((p, i) => (
          <div key={i} style={{ marginBottom: "36px", paddingBottom: "36px", borderBottom: "1px solid rgba(245,158,11,0.07)" }}>
            <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", marginBottom: "8px", textTransform: "uppercase" as const }}>Point {i + 1}</p>
            <h3 className="font-serif" style={{ fontSize: "22px", marginBottom: "14px", color: "#fef3c7" }}>{p.title}</h3>
            <p style={{ color: "#fbbf24", marginBottom: "14px", fontSize: "14px" }}>{p.scripture}</p>
            <p style={{ lineHeight: 1.9, marginBottom: "14px", fontSize: "16px", color: "#fef3c7" }}>{p.explanation}</p>
            <p style={{ color: "#a8956e", lineHeight: 1.9, fontSize: "15px" }}>{p.application}</p>
          </div>
        ))}
        <div style={{ background: "rgba(245,158,11,0.04)", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>✨ Ministry Moment</p>
          <p style={{ lineHeight: 1.9, marginBottom: "12px", fontSize: "16px", color: "#fef3c7" }}>{generatedSermon.ministryFlow?.giftOfKnowledge}</p>
          <p style={{ lineHeight: 1.9, color: "#fbbf24", fontSize: "16px" }}>{generatedSermon.ministryFlow?.impartation}</p>
        </div>
        <div style={{ marginBottom: "48px" }}>
          <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" as const }}>🕊️ Altar Call</p>
          <p style={{ lineHeight: 1.9, marginBottom: "12px", fontSize: "16px", color: "#fef3c7" }}>{generatedSermon.altarCall?.invitation}</p>
          <p className="font-serif" style={{ lineHeight: 1.9, fontStyle: "italic", color: "#fde68a", fontSize: "17px" }}>{generatedSermon.altarCall?.prayer}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", paddingBottom: "80px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.06) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header style={{ position: "sticky", top: 0, background: "rgba(15,10,5,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(245,158,11,0.08)", zIndex: 50 }}>
        <div style={{ padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "700px", margin: "0 auto" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span style={{ fontSize: "16px" }}>✝</span>
            <span className="font-serif" style={{ color: "#f59e0b", fontSize: "15px", fontWeight: 600 }}>The Pastors Helper</span>
          </Link>
          <span style={{ color: "#57534e", fontSize: "11px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
        </div>
      </header>

      <main style={{ padding: "20px", maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* ── BUILD TAB ── */}
        {activeTab === "generate" && (
          <div>
            {!generatedSermon && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Card: Topic */}
                <div className="glass" style={{ borderRadius: "14px", padding: "20px" }}>

                  {/* Step indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#f59e0b", fontSize: "11px", fontWeight: 700 }}>1</span>
                    </div>
                    <div>
                      <p style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 600 }}>What is your sermon about?</p>
                      <p style={{ color: "#57534e", fontSize: "11px", marginTop: "1px" }}>Type your own topic, or browse our library below</p>
                    </div>
                  </div>

                  {/* Input row */}
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateSermon()}
                    placeholder="e.g. Faith, Healing, John 3:16, Grace..."
                    style={{ width: "100%", padding: "13px 14px", fontSize: "15px", borderRadius: "8px", marginBottom: "12px" }}
                  />

                  {/* Browse toggle */}
                  <button
                    onClick={() => { setShowTopics(!showTopics); setShowLangPicker(false); setSelectedCategory(null); }}
                    style={{ width: "100%", padding: "11px 16px", borderRadius: "8px", border: "1px solid", borderColor: showTopics ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.12)", background: showTopics ? "rgba(245,158,11,0.07)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "15px" }}>📚</span>
                      <span style={{ color: showTopics ? "#f59e0b" : "#a8956e", fontSize: "13px", fontWeight: 500 }}>
                        Browse 300+ sermon topics
                      </span>
                    </div>
                    <span style={{ color: "#57534e", fontSize: "11px" }}>{showTopics ? "▲ Close" : "▼ Open"}</span>
                  </button>

                  {/* Topic Browser Panel */}
                  {showTopics && (
                    <div style={{ marginTop: "10px", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "10px", overflow: "hidden" }}>

                      {/* Mode tabs */}
                      {!selectedCategory ? (
                        <>
                          {/* Random suggestions */}
                          <div style={{ padding: "14px", background: "rgba(245,158,11,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" as const, fontWeight: 600 }}>✦ Quick Picks — tap one to use it</p>
                              <button onClick={() => setRandomTopics(getRandomTopics(12))} style={{ background: "none", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "12px", color: "#78716c", cursor: "pointer", fontSize: "11px", padding: "3px 10px" }}>↺ Shuffle</button>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {randomTopics.map((t) => (
                                <button key={t} onClick={() => { setTopic(t); setShowTopics(false); }} style={{ padding: "6px 11px", borderRadius: "16px", fontSize: "12px", border: "1px solid rgba(245,158,11,0.14)", background: "transparent", color: "#a8956e", cursor: "pointer" }}>
                                  {t.length > 38 ? t.slice(0, 36) + "…" : t}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Divider */}
                          <div style={{ borderTop: "1px solid rgba(245,158,11,0.07)", padding: "12px 14px" }}>
                            <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" as const, fontWeight: 600, marginBottom: "10px" }}>Browse by Category</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                              {TOPIC_CATEGORIES.map((cat) => (
                                <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} style={{ padding: "7px 13px", borderRadius: "18px", fontSize: "12px", border: "1px solid rgba(245,158,11,0.12)", background: "transparent", color: "#78716c", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                                  <span>{cat.icon}</span>
                                  <span>{cat.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Category drill-down */
                        <div>
                          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(245,158,11,0.07)", display: "flex", alignItems: "center", gap: "10px" }}>
                            <button onClick={() => setSelectedCategory(null)} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontSize: "13px", padding: 0, display: "flex", alignItems: "center", gap: "5px" }}>
                              ← Back
                            </button>
                            <span style={{ color: "#57534e", fontSize: "12px" }}>
                              {TOPIC_CATEGORIES.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
                            </span>
                          </div>
                          <div style={{ maxHeight: "240px", overflowY: "auto", padding: "8px" }}>
                            {TOPIC_CATEGORIES.find(c => c.name === selectedCategory)?.topics.map((t) => (
                              <button key={t} onClick={() => { setTopic(t); setShowTopics(false); setSelectedCategory(null); }} style={{ display: "block", width: "100%", padding: "10px 12px", marginBottom: "2px", borderRadius: "7px", fontSize: "13px", border: "none", background: topic === t ? "rgba(245,158,11,0.08)" : "transparent", color: topic === t ? "#f59e0b" : "#a8956e", cursor: "pointer", textAlign: "left" as const }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmation of selected topic */}
                  {topic && (
                    <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <p style={{ color: "#fbbf24", fontSize: "13px", flex: 1 }}>✓ {topic}</p>
                      <button onClick={() => setTopic("")} style={{ background: "none", border: "none", color: "#57534e", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>✕ Clear</button>
                    </div>
                  )}
                </div>

                {/* Card: Audience + Tone */}
                <div className="glass" style={{ borderRadius: "14px", padding: "20px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <Label>Audience</Label>
                    <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%", padding: "12px 14px", fontSize: "14px", borderRadius: "8px" }}>
                      {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Sermon Tone</Label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {TONES.map((t) => (
                        <button key={t} onClick={() => setTone(t)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", border: "1px solid", borderColor: tone === t ? "rgba(245,158,11,0.55)" : "rgba(245,158,11,0.13)", background: tone === t ? "rgba(245,158,11,0.1)" : "transparent", color: tone === t ? "#f59e0b" : "#78716c", cursor: "pointer", fontWeight: tone === t ? 500 : 400 }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card: Level */}
                <div className="glass" style={{ borderRadius: "14px", padding: "20px" }}>
                  <Label>Sermon Level</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {LEVELS.map((l) => (
                      <button key={l.key} onClick={() => setLevel(l.key)} style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid", borderColor: level === l.key ? l.color : "rgba(245,158,11,0.1)", background: level === l.key ? `${l.color}14` : "transparent", cursor: "pointer", textAlign: "left" as const, display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "18px" }}>{l.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: level === l.key ? l.color : "#fef3c7", fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>{l.label}</p>
                          <p style={{ color: "#57534e", fontSize: "12px" }}>{l.desc}</p>
                        </div>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${level === l.key ? l.color : "rgba(245,158,11,0.15)"}`, background: level === l.key ? l.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {level === l.key && <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>✓</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card: Language */}
                <div className="glass" style={{ borderRadius: "14px", padding: "20px" }}>
                  <Label>Language</Label>
                  <button onClick={() => { setShowLangPicker(!showLangPicker); setShowTopics(false); }} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid", borderColor: showLangPicker ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.12)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>{selectedLang.flag}</span>
                      <span style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500 }}>{selectedLang.label}</span>
                    </div>
                    <span style={{ color: "#57534e", fontSize: "12px" }}>{showLangPicker ? "▲" : "▼"}</span>
                  </button>

                  {showLangPicker && (
                    <div style={{ marginTop: "10px", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "10px", overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
                      {LANGUAGES.map((l) => (
                        <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangPicker(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "11px 14px", border: "none", borderBottom: "1px solid rgba(245,158,11,0.05)", background: language === l.code ? "rgba(245,158,11,0.07)" : "transparent", cursor: "pointer" }}>
                          <span style={{ fontSize: "20px", flexShrink: 0 }}>{l.flag}</span>
                          <span style={{ color: language === l.code ? "#f59e0b" : "#a8956e", fontSize: "14px", flex: 1, textAlign: "left" as const }}>{l.label}</span>
                          {language === l.code && <span style={{ color: "#f59e0b", fontSize: "12px" }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p style={{ color: "#f87171", fontSize: "13px" }}>{error}</p>
                  </div>
                )}

                {/* Generate button */}
                <button onClick={generateSermon} disabled={generating} className="btn-gold" style={{ width: "100%", padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: 600, opacity: generating ? 0.7 : 1, cursor: generating ? "not-allowed" : "pointer" }}>
                  {generating ? "Seeking the Word…" : "✦ Generate Sermon"}
                </button>
              </div>
            )}

            {/* Loading */}
            {generating && (
              <div className="glass" style={{ borderRadius: "14px", padding: "48px 20px", textAlign: "center", marginTop: "14px" }}>
                <div className="font-serif" style={{ color: "#f59e0b", fontSize: "18px", marginBottom: "8px" }}>Seeking the Word…</div>
                <p style={{ color: "#57534e", fontSize: "13px", marginBottom: "24px" }}>Building your sermon</p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: "8px", height: "8px", background: "#f59e0b", borderRadius: "50%", animation: `pulse 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}

            {/* Generated Sermon */}
            {generatedSermon && !generating && (
              <div className="animate-fade-in">
                {/* Sermon header */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: level === "beginner" ? "rgba(16,185,129,0.12)" : level === "intermediate" ? "rgba(59,130,246,0.12)" : "rgba(139,92,246,0.12)", color: level === "beginner" ? "#10b981" : level === "intermediate" ? "#3b82f6" : "#8b5cf6" }}>
                      {LEVELS.find(l => l.key === level)?.icon} {level}
                    </span>
                    {language !== "English" && (
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                        {selectedLang.flag} {selectedLang.label}
                      </span>
                    )}
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", background: "rgba(255,255,255,0.04)", color: "#78716c" }}>{tone}</span>
                  </div>
                  <h1 className="font-serif" style={{ color: "#fef3c7", fontSize: "24px", lineHeight: 1.25, marginBottom: "4px" }}>{generatedSermon.title}</h1>
                  <p style={{ color: "#57534e", fontSize: "12px" }}>{audience}</p>
                </div>

                {/* Action row */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "2px" }}>
                  {[
                    { label: "🎤 Preach",                   action: () => setPreachMode(true) },
                    { label: saveSuccess ? "✓ Saved" : "💾 Save", action: saveSermon, saved: saveSuccess },
                    { label: "📄 PDF",                       action: exportPDF },
                    { label: "↺ New",                        action: () => { setGeneratedSermon(null); setSaveSuccess(false); setTopic(""); } },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} disabled={saving && !btn.saved} style={{ padding: "9px 16px", borderRadius: "8px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0, background: "transparent", border: "1px solid", borderColor: btn.saved ? "rgba(74,222,128,0.3)" : "rgba(245,158,11,0.15)", color: btn.saved ? "#4ade80" : "#a8956e", cursor: "pointer", fontWeight: 500 }}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                <SermonSection id="s0" label="✝ Anchor Scripture" gold>
                  <p style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>{generatedSermon.anchorScripture?.reference}</p>
                  <p className="font-serif" style={{ fontSize: "15px", lineHeight: 1.8, fontStyle: "italic", color: "#fde68a", marginBottom: "10px" }}>&ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;</p>
                  {generatedSermon.anchorScripture?.nkjv && <p style={{ color: "#78716c", fontSize: "12px", fontStyle: "italic", marginBottom: "14px" }}>NKJV: &ldquo;{generatedSermon.anchorScripture.nkjv}&rdquo;</p>}
                  <div style={{ padding: "12px", background: "rgba(245,158,11,0.05)", borderRadius: "8px" }}>
                    <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "5px" }}>Core Theme</p>
                    <p style={{ color: "#fef3c7", fontSize: "14px", lineHeight: 1.6 }}>{generatedSermon.theme}</p>
                  </div>
                </SermonSection>

                <SermonSection id="s1" label="🙏 Opening">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{generatedSermon.opening?.greeting}</p>
                  <p style={{ color: "#a8956e", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.opening?.hook}</p>
                </SermonSection>

                <SermonSection id="s2" label="📖 Foundation">
                  <p style={{ color: "#a8956e", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{generatedSermon.foundation?.context}</p>
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.foundation?.breakdown}</p>
                </SermonSection>

                <SermonSection id="s3" label="💬 Foreword">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{generatedSermon.foreword?.whyItMatters}</p>
                  <p style={{ color: "#a8956e", lineHeight: 1.8, fontSize: "14px" }}>{generatedSermon.foreword?.relatable}</p>
                </SermonSection>

                <SermonSection id="s4" label="🔥 Core Teaching">
                  {generatedSermon.teachingPoints?.map((point, i) => (
                    <div key={i} style={{ marginBottom: i < generatedSermon.teachingPoints.length - 1 ? "22px" : 0, paddingBottom: i < generatedSermon.teachingPoints.length - 1 ? "22px" : 0, borderBottom: i < generatedSermon.teachingPoints.length - 1 ? "1px solid rgba(245,158,11,0.07)" : "none" }}>
                      <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "4px" }}>Point {i + 1}</p>
                      <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "17px", marginBottom: "8px" }}>{point.title}</h3>
                      <p style={{ color: "#fbbf24", fontSize: "12px", marginBottom: "10px" }}>{point.scripture}</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "10px", fontSize: "14px" }}>{point.explanation}</p>
                      <div style={{ background: "rgba(245,158,11,0.04)", borderLeft: "2px solid rgba(245,158,11,0.3)", padding: "10px 14px", borderRadius: "0 6px 6px 0" }}>
                        <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "4px" }}>Application</p>
                        <p style={{ color: "#fef3c7", lineHeight: 1.7, fontSize: "13px" }}>{point.application}</p>
                      </div>
                    </div>
                  ))}
                </SermonSection>

                <SermonSection id="s5" label="✨ Ministry Flow">
                  {[
                    { label: "Gift of Knowledge", text: generatedSermon.ministryFlow?.giftOfKnowledge },
                    { label: "Impartation",        text: generatedSermon.ministryFlow?.impartation },
                    { label: "Edification",        text: generatedSermon.ministryFlow?.edification },
                    { label: "Slow Down",          text: generatedSermon.ministryFlow?.slowDown },
                    { label: "Return to Anchor",   text: generatedSermon.ministryFlow?.returnToAnchor },
                  ].filter(m => m.text).map((m) => (
                    <div key={m.label} style={{ marginBottom: "14px" }}>
                      <p style={{ color: "#f59e0b", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase" as const, marginBottom: "4px" }}>{m.label}</p>
                      <p style={{ color: "#fef3c7", lineHeight: 1.8, fontSize: "14px" }}>{m.text}</p>
                    </div>
                  ))}
                </SermonSection>

                <SermonSection id="s6" label="📋 Summary">
                  {generatedSermon.summary?.keyTakeaways?.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ color: "#f59e0b", marginTop: "3px", flexShrink: 0, fontSize: "12px" }}>→</span>
                      <span style={{ color: "#fef3c7", lineHeight: 1.7, fontSize: "14px" }}>{t}</span>
                    </div>
                  ))}
                </SermonSection>

                <SermonSection id="s7" label="🕊️ Altar Call">
                  <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "14px", fontSize: "14px" }}>{generatedSermon.altarCall?.invitation}</p>
                  <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: "8px", padding: "14px" }}>
                    <p style={{ color: "#a8956e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "8px" }}>Guided Prayer</p>
                    <p className="font-serif" style={{ color: "#fde68a", lineHeight: 1.9, fontSize: "14px", fontStyle: "italic" }}>{generatedSermon.altarCall?.prayer}</p>
                  </div>
                </SermonSection>

                <SermonSection id="s8" label="🙌 Closing Prayer">
                  <p className="font-serif" style={{ color: "#fef3c7", lineHeight: 1.9, fontSize: "15px", fontStyle: "italic" }}>{generatedSermon.closingPrayer}</p>
                </SermonSection>
              </div>
            )}
          </div>
        )}

        {/* ── LIBRARY TAB ── */}
        {activeTab === "library" && (
          <div>
            <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px", marginBottom: "20px" }}>Sermon Library</h2>
            {loadingSermons ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#57534e" }}>Loading...</div>
            ) : sermons.length === 0 ? (
              <div className="glass" style={{ padding: "40px 20px", textAlign: "center", borderRadius: "14px" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📖</div>
                <p style={{ color: "#78716c", marginBottom: "20px" }}>No sermons saved yet.</p>
                <button onClick={() => setActiveTab("generate")} className="btn-gold" style={{ padding: "12px 24px", borderRadius: "8px", fontSize: "14px" }}>Build a Sermon →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sermons.map((s) => (
                  <div key={s.id} className="glass" style={{ padding: "16px 18px", borderRadius: "12px" }}>
                    <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "16px", marginBottom: "4px" }}>{s.title}</h3>
                    <p style={{ color: "#57534e", fontSize: "12px", marginBottom: s.series_id ? "6px" : "12px" }}>{s.tone} · {s.audience} · {new Date(s.created_at).toLocaleDateString()}</p>
                    {s.series_id && <p style={{ color: "#f59e0b", fontSize: "11px", marginBottom: "12px" }}>📚 {seriesList.find(sr => sr.id === s.series_id)?.name || "In a series"}</p>}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setGeneratedSermon(s.content); setTopic(s.topic); setAudience(s.audience); setTone(s.tone); setActiveTab("generate"); }} style={{ flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", background: "transparent", border: "1px solid rgba(245,158,11,0.15)", color: "#a8956e", cursor: "pointer" }}>Open</button>
                      <button onClick={() => setAssigningSermon(assigningSermon === s.id ? null : s.id)} style={{ flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", background: "transparent", border: "1px solid rgba(245,158,11,0.15)", color: "#a8956e", cursor: "pointer" }}>📚 Series</button>
                      <button onClick={() => deleteSermon(s.id)} style={{ flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", background: "transparent", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", cursor: "pointer" }}>Delete</button>
                    </div>
                    {assigningSermon === s.id && (
                      <div style={{ marginTop: "12px", padding: "12px", background: "rgba(245,158,11,0.04)", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.08)" }}>
                        <p style={{ color: "#a8956e", fontSize: "11px", marginBottom: "10px", letterSpacing: "1px", textTransform: "uppercase" as const }}>Assign to Series</p>
                        {seriesList.length === 0
                          ? <p style={{ color: "#57534e", fontSize: "13px" }}>No series yet — create one in the Series tab.</p>
                          : <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {seriesList.map(sr => (
                                <button key={sr.id} onClick={() => assignToSeries(s.id, sr.id)} style={{ padding: "9px 12px", borderRadius: "7px", fontSize: "13px", border: "1px solid", borderColor: s.series_id === sr.id ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.1)", background: s.series_id === sr.id ? "rgba(245,158,11,0.08)" : "transparent", color: s.series_id === sr.id ? "#f59e0b" : "#a8956e", cursor: "pointer", textAlign: "left" as const }}>
                                  {s.series_id === sr.id ? "✓ " : ""}{sr.name}
                                </button>
                              ))}
                              {s.series_id && <button onClick={() => assignToSeries(s.id, null)} style={{ padding: "9px 12px", borderRadius: "7px", fontSize: "13px", border: "1px solid rgba(239,68,68,0.18)", background: "transparent", color: "#f87171", cursor: "pointer", textAlign: "left" as const }}>Remove from series</button>}
                            </div>
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SERIES TAB ── */}
        {activeTab === "series" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px" }}>Sermon Series</h2>
              <button onClick={() => setShowNewSeries(!showNewSeries)} className="btn-gold" style={{ padding: "9px 16px", borderRadius: "8px", fontSize: "13px" }}>{showNewSeries ? "Cancel" : "+ New"}</button>
            </div>

            {showNewSeries && (
              <div className="glass" style={{ borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
                <Label>Series Name</Label>
                <input type="text" value={newSeriesName} onChange={(e) => setNewSeriesName(e.target.value)} placeholder="e.g. Walking by Faith" style={{ width: "100%", padding: "11px 14px", fontSize: "14px", borderRadius: "8px", marginBottom: "12px" }} />
                <Label>Description (optional)</Label>
                <textarea value={newSeriesDesc} onChange={(e) => setNewSeriesDesc(e.target.value)} placeholder="What is this series about?" rows={2} style={{ width: "100%", padding: "11px 14px", fontSize: "13px", borderRadius: "8px", marginBottom: "14px", resize: "none" as const }} />
                <button onClick={createSeries} disabled={creatingSeries || !newSeriesName.trim()} className="btn-gold" style={{ width: "100%", padding: "12px", borderRadius: "8px", fontSize: "14px", opacity: !newSeriesName.trim() ? 0.5 : 1 }}>
                  {creatingSeries ? "Creating…" : "Create Series"}
                </button>
              </div>
            )}

            {loadingSeries ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#57534e" }}>Loading...</div>
            ) : seriesList.length === 0 ? (
              <div className="glass" style={{ padding: "40px 20px", textAlign: "center", borderRadius: "14px" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📚</div>
                <p style={{ color: "#78716c", marginBottom: "6px" }}>No series yet.</p>
                <p style={{ color: "#57534e", fontSize: "13px", marginBottom: "20px" }}>Group sermons into multi-week series.</p>
                <button onClick={() => setShowNewSeries(true)} className="btn-gold" style={{ padding: "11px 22px", borderRadius: "8px", fontSize: "13px" }}>+ Create First Series</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {seriesList.map((sr) => (
                  <div key={sr.id} className="glass" style={{ borderRadius: "12px", overflow: "hidden" }}>
                    <div onClick={() => setExpandedSeries(expandedSeries === sr.id ? null : sr.id)} style={{ padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "17px", marginBottom: "3px" }}>{sr.name}</h3>
                        {sr.description && <p style={{ color: "#57534e", fontSize: "12px", marginBottom: "4px" }}>{sr.description}</p>}
                        <p style={{ color: "#f59e0b", fontSize: "11px" }}>{sr.sermons.length} sermon{sr.sermons.length !== 1 ? "s" : ""}</p>
                      </div>
                      <span style={{ color: "#57534e" }}>{expandedSeries === sr.id ? "▲" : "▼"}</span>
                    </div>
                    {expandedSeries === sr.id && (
                      <div style={{ borderTop: "1px solid rgba(245,158,11,0.07)", padding: "12px 18px 18px" }}>
                        {sr.sermons.length === 0
                          ? <p style={{ color: "#57534e", fontSize: "13px", padding: "10px 0" }}>No sermons assigned yet. Go to Library → 📚 Series to assign.</p>
                          : <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                              {sr.sermons.map((s, i) => (
                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: "rgba(245,158,11,0.04)", borderRadius: "8px" }}>
                                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ color: "#f59e0b", fontSize: "11px", fontWeight: 600 }}>W{i+1}</span>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ color: "#fef3c7", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                                    <p style={{ color: "#57534e", fontSize: "11px" }}>{s.tone} · {new Date(s.created_at!).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                        }
                        <button onClick={() => deleteSeries(sr.id)} style={{ padding: "9px 14px", borderRadius: "7px", fontSize: "12px", background: "transparent", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", cursor: "pointer" }}>Delete Series</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MENU TAB ── */}
        {activeTab === "menu" && (
          <div>
            <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px", marginBottom: "20px" }}>Account</h2>
            <div className="glass" style={{ borderRadius: "12px", padding: "18px", marginBottom: "12px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", marginBottom: "4px" }}>Signed in as</p>
              <p style={{ color: "#fef3c7", fontSize: "14px" }}>{user.email}</p>
            </div>
            <div className="glass" style={{ borderRadius: "12px", padding: "18px", marginBottom: "12px" }}>
              <p style={{ color: "#a8956e", fontSize: "11px", marginBottom: "14px", letterSpacing: "1px", textTransform: "uppercase" as const }}>Your Stats</p>
              <div style={{ display: "flex", gap: "32px" }}>
                <div><p style={{ color: "#f59e0b", fontSize: "28px", fontWeight: 700 }}>{sermons.length}</p><p style={{ color: "#57534e", fontSize: "12px" }}>Sermons</p></div>
                <div><p style={{ color: "#f59e0b", fontSize: "28px", fontWeight: 700 }}>{seriesList.length}</p><p style={{ color: "#57534e", fontSize: "12px" }}>Series</p></div>
              </div>
            </div>
            <button onClick={signOut} style={{ width: "100%", padding: "13px", borderRadius: "10px", fontSize: "14px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer" }}>Sign Out</button>
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,10,5,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(245,158,11,0.08)", display: "flex", zIndex: 50 }}>
        {[
          { tab: "generate" as const, icon: "✦", label: "Build" },
          { tab: "library"  as const, icon: "📖", label: "Library" },
          { tab: "series"   as const, icon: "📚", label: "Series" },
          { tab: "menu"     as const, icon: "☰",  label: "Menu" },
        ].map(({ tab, icon, label }) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "12px 4px 10px", border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <span style={{ fontSize: "15px", opacity: activeTab === tab ? 1 : 0.3 }}>{icon}</span>
            <span style={{ fontSize: "10px", color: activeTab === tab ? "#f59e0b" : "#57534e", fontWeight: activeTab === tab ? 600 : 400, letterSpacing: "0.5px" }}>{label}</span>
          </button>
        ))}
      </nav>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }`}</style>
    </div>
  );
}
