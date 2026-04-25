"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { supabase, Sermon } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AUDIENCES = ["General Congregation", "Youth", "Outreach / Evangelism", "Men's Ministry", "Women's Ministry", "Leaders / Intercessors"];
const TONES = ["Teaching", "Prophetic", "Evangelistic", "Pastoral / Encouragement", "Conviction / Repentance"];

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loadingSermons, setLoadingSermons] = useState(true);

  // Generator state
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("General Congregation");
  const [tone, setTone] = useState("Teaching");
  const [generating, setGenerating] = useState(false);
  const [generatedSermon, setGeneratedSermon] = useState<Sermon["content"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preachMode, setPreachMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "library">("generate");
  const [activeSection, setActiveSection] = useState(0);

  const router = useRouter();

  const loadSermons = useCallback(async (userId: string) => {
    setLoadingSermons(true);
    const { data } = await supabase
      .from("sermons")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setSermons((data as Sermon[]) || []);
    setLoadingSermons(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setUser(data.session.user);
      loadSermons(data.session.user.id);
    });
  }, [router, loadSermons]);

  const generateSermon = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or scripture reference.");
      return;
    }
    setGenerating(true);
    setError("");
    setGeneratedSermon(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, tone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedSermon(data.sermon);
      setActiveSection(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate sermon. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveSermon = async () => {
    if (!generatedSermon || !user) return;
    setSaving(true);
    const res = await fetch("/api/save-sermon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        title: generatedSermon.title || topic,
        topic,
        audience,
        tone,
        content: generatedSermon,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setSaveSuccess(true);
      loadSermons(user.id);
    }
  };

  const deleteSermon = async (id: string) => {
    await fetch("/api/delete-sermon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, user_id: user?.id }),
    });
    loadSermons(user!.id);
  };

  const exportPDF = async () => {
    if (!generatedSermon) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(generatedSermon.title || "Sermon", 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${generatedSermon.anchorScripture?.reference || ""}  |  ${tone} • ${audience}`, 20, y);
    y += 16;

    doc.setFontSize(10);

    const addSection = (heading: string, text: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(heading.toUpperCase(), 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 8;
    };

    addSection("Anchor Scripture", `${generatedSermon.anchorScripture?.reference}\n${generatedSermon.anchorScripture?.kjv}`);
    addSection("Theme", generatedSermon.theme || "");
    addSection("Opening", `${generatedSermon.opening?.greeting}\n${generatedSermon.opening?.hook}`);
    addSection("Foundation", generatedSermon.foundation?.breakdown || "");

    generatedSermon.teachingPoints?.forEach((p, i) => {
      addSection(`Point ${i + 1}: ${p.title}`, `${p.scripture}\n\n${p.explanation}\n\nApplication: ${p.application}`);
    });

    addSection("Ministry Flow", `${generatedSermon.ministryFlow?.slowDown}\n\n${generatedSermon.ministryFlow?.returnToAnchor}`);
    addSection("Summary", (generatedSermon.summary?.keyTakeaways || []).join("\n"));
    addSection("Altar Call", `${generatedSermon.altarCall?.invitation}\n\n${generatedSermon.altarCall?.prayer}`);
    addSection("Closing Prayer", generatedSermon.closingPrayer || "");

    doc.save(`${(generatedSermon.title || "sermon").replace(/\s+/g, "_")}.pdf`);
  };

  const sections = generatedSermon
    ? [
        { key: "anchor", label: "✝ Anchor Scripture" },
        { key: "opening", label: "🙏 Opening" },
        { key: "foundation", label: "📖 Foundation" },
        { key: "foreword", label: "💬 Foreword" },
        { key: "teaching", label: "🔥 Core Teaching" },
        { key: "ministry", label: "✨ Ministry Flow" },
        { key: "summary", label: "📋 Summary" },
        { key: "altar", label: "🕊️ Altar Call" },
        { key: "closing", label: "🙌 Closing Prayer" },
      ]
    : [];

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#f59e0b" }}>Loading...</div>
      </div>
    );
  }

  if (preachMode && generatedSermon) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0704", padding: "60px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
            <h1 className="font-serif" style={{ color: "#f59e0b", fontSize: "28px" }}>
              {generatedSermon.title}
            </h1>
            <button onClick={() => setPreachMode(false)} className="btn-ghost" style={{ padding: "10px 20px", borderRadius: "6px", fontSize: "14px" }}>
              ✕ Exit
            </button>
          </div>

          <div className="preach-mode" style={{ color: "#fef3c7" }}>
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "32px", marginBottom: "48px" }}>
              <p style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "2px", marginBottom: "16px", textTransform: "uppercase" }}>
                Anchor Scripture — {generatedSermon.anchorScripture?.reference}
              </p>
              <p className="font-serif" style={{ fontSize: "22px", lineHeight: 1.7, fontStyle: "italic" }}>
                &ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;
              </p>
            </div>

            {generatedSermon.teachingPoints?.map((p, i) => (
              <div key={i} style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
                <p style={{ color: "#f59e0b", fontSize: "13px", letterSpacing: "2px", marginBottom: "12px", textTransform: "uppercase" }}>
                  Point {i + 1}
                </p>
                <h3 className="font-serif" style={{ fontSize: "28px", marginBottom: "24px", color: "#fef3c7" }}>
                  {p.title}
                </h3>
                <p style={{ color: "#fbbf24", marginBottom: "20px", fontSize: "16px" }}>{p.scripture}</p>
                <p style={{ lineHeight: 1.9, marginBottom: "20px" }}>{p.explanation}</p>
                <p style={{ color: "#a8956e", lineHeight: 1.9 }}>{p.application}</p>
              </div>
            ))}

            <div style={{ background: "rgba(245,158,11,0.04)", borderRadius: "12px", padding: "32px", marginBottom: "48px" }}>
              <p style={{ color: "#f59e0b", fontSize: "13px", letterSpacing: "2px", marginBottom: "16px", textTransform: "uppercase" }}>
                ✨ Ministry Moment
              </p>
              <p style={{ lineHeight: 1.9, marginBottom: "16px" }}>{generatedSermon.ministryFlow?.giftOfKnowledge}</p>
              <p style={{ lineHeight: 1.9, color: "#fbbf24" }}>{generatedSermon.ministryFlow?.impartation}</p>
            </div>

            <div>
              <p style={{ color: "#f59e0b", fontSize: "13px", letterSpacing: "2px", marginBottom: "16px", textTransform: "uppercase" }}>
                🕊️ Altar Call
              </p>
              <p style={{ lineHeight: 1.9, marginBottom: "16px" }}>{generatedSermon.altarCall?.invitation}</p>
              <p className="font-serif" style={{ lineHeight: 1.9, fontStyle: "italic", color: "#fde68a" }}>
                {generatedSermon.altarCall?.prayer}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", flexDirection: "column" }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(245,158,11,0.08)", position: "relative", zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <span style={{ fontSize: "20px" }}>✝</span>
            <span className="font-serif" style={{ color: "#f59e0b", fontSize: "17px" }}>The Pastors Helper</span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ color: "#57534e", fontSize: "13px" }}>{user.email}</span>
          <button onClick={signOut} className="btn-ghost" style={{ padding: "7px 16px", borderRadius: "6px", fontSize: "13px" }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 10 }}>
        {/* Sidebar */}
        <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(245,158,11,0.08)", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("generate")}
            style={{
              padding: "11px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              background: activeTab === "generate" ? "rgba(245,158,11,0.12)" : "transparent",
              color: activeTab === "generate" ? "#f59e0b" : "#78716c",
              fontWeight: activeTab === "generate" ? 500 : 400,
            }}
          >
            ✦ Build Sermon
          </button>
          <button
            onClick={() => setActiveTab("library")}
            style={{
              padding: "11px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              background: activeTab === "library" ? "rgba(245,158,11,0.12)" : "transparent",
              color: activeTab === "library" ? "#f59e0b" : "#78716c",
              fontWeight: activeTab === "library" ? 500 : 400,
            }}
          >
            📚 Library ({sermons.length})
          </button>

          {generatedSermon && (
            <div style={{ marginTop: "24px" }}>
              <p style={{ color: "#57534e", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px", padding: "0 4px" }}>
                Sections
              </p>
              {sections.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => { setActiveSection(i); setActiveTab("generate"); document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: activeSection === i ? "rgba(245,158,11,0.08)" : "transparent",
                    color: activeSection === i ? "#fbbf24" : "#57534e",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto", maxHeight: "calc(100vh - 65px)" }}>

          {activeTab === "generate" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Generator Form */}
              <div className="glass" style={{ borderRadius: "12px", padding: "32px", marginBottom: "28px" }}>
                <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "22px", marginBottom: "24px" }}>
                  Build a New Sermon
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>
                      Topic or Scripture
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && generateSermon()}
                      placeholder="e.g. Faith, John 3:16, Healing..."
                      style={{ width: "100%", padding: "12px 14px", fontSize: "14px", borderRadius: "8px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>
                      Audience
                    </label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", fontSize: "14px", borderRadius: "8px" }}
                    >
                      {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
                    Sermon Tone
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          border: "1px solid",
                          borderColor: tone === t ? "rgba(245,158,11,0.6)" : "rgba(245,158,11,0.15)",
                          background: tone === t ? "rgba(245,158,11,0.12)" : "transparent",
                          color: tone === t ? "#f59e0b" : "#78716c",
                          cursor: "pointer",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

                <button
                  onClick={generateSermon}
                  disabled={generating}
                  className="btn-gold"
                  style={{
                    padding: "14px 32px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    opacity: generating ? 0.7 : 1,
                    cursor: generating ? "not-allowed" : "pointer",
                  }}
                >
                  {generating ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#0f0a05", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Seeking the Word...
                    </span>
                  ) : (
                    "✦ Generate Sermon"
                  )}
                </button>
              </div>

              {/* Loading state */}
              {generating && (
                <div className="glass" style={{ borderRadius: "12px", padding: "48px", textAlign: "center" }}>
                  <div className="font-serif" style={{ color: "#f59e0b", fontSize: "20px", marginBottom: "12px" }}>
                    Seeking the Word...
                  </div>
                  <p style={{ color: "#78716c", fontSize: "14px" }}>Building your sermon structure</p>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: "8px", height: "8px", background: "#f59e0b", borderRadius: "50%", opacity: 0.6, animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Generated sermon */}
              {generatedSermon && !generating && (
                <div className="animate-fade-in">
                  {/* Actions bar */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <button onClick={() => setPreachMode(true)} className="btn-gold" style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px" }}>
                      🎤 Preach Mode
                    </button>
                    <button onClick={saveSermon} disabled={saving || saveSuccess} className="btn-ghost" style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px", color: saveSuccess ? "#4ade80" : undefined, borderColor: saveSuccess ? "rgba(74,222,128,0.3)" : undefined }}>
                      {saving ? "Saving..." : saveSuccess ? "✓ Saved!" : "💾 Save"}
                    </button>
                    <button onClick={exportPDF} className="btn-ghost" style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px" }}>
                      📄 Export PDF
                    </button>
                    <button onClick={() => { setGeneratedSermon(null); setSaveSuccess(false); }} className="btn-ghost" style={{ padding: "10px 22px", borderRadius: "8px", fontSize: "14px" }}>
                      ↺ New
                    </button>
                  </div>

                  {/* Title */}
                  <div style={{ marginBottom: "24px" }}>
                    <h1 className="font-serif" style={{ color: "#fef3c7", fontSize: "32px", lineHeight: 1.2, marginBottom: "8px" }}>
                      {generatedSermon.title}
                    </h1>
                    <p style={{ color: "#78716c", fontSize: "13px" }}>{tone} · {audience}</p>
                  </div>

                  {/* Section 0: Anchor Scripture */}
                  <SermonSection id="section-0" label="✝ Anchor Scripture" gold>
                    <p style={{ color: "#f59e0b", fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>
                      {generatedSermon.anchorScripture?.reference}
                    </p>
                    <p className="font-serif" style={{ fontSize: "17px", lineHeight: 1.8, fontStyle: "italic", color: "#fde68a", marginBottom: "16px" }}>
                      &ldquo;{generatedSermon.anchorScripture?.kjv}&rdquo;
                    </p>
                    {generatedSermon.anchorScripture?.nkjv && (
                      <p style={{ color: "#a8956e", fontSize: "14px", fontStyle: "italic" }}>
                        NKJV: &ldquo;{generatedSermon.anchorScripture?.nkjv}&rdquo;
                      </p>
                    )}
                    <div style={{ marginTop: "20px", padding: "16px", background: "rgba(245,158,11,0.06)", borderRadius: "8px" }}>
                      <p style={{ color: "#a8956e", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Core Theme</p>
                      <p style={{ color: "#fef3c7", fontSize: "15px" }}>{generatedSermon.theme}</p>
                    </div>
                  </SermonSection>

                  {/* Section 1: Opening */}
                  <SermonSection id="section-1" label="🙏 Opening">
                    <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "12px" }}>{generatedSermon.opening?.greeting}</p>
                    <p style={{ color: "#a8956e", lineHeight: 1.8, marginBottom: "12px" }}>{generatedSermon.opening?.atmosphere}</p>
                    <p style={{ color: "#fef3c7", lineHeight: 1.8 }}>{generatedSermon.opening?.hook}</p>
                  </SermonSection>

                  {/* Section 2: Foundation */}
                  <SermonSection id="section-2" label="📖 Foundation">
                    <p style={{ color: "#a8956e", lineHeight: 1.8, marginBottom: "16px" }}>{generatedSermon.foundation?.context}</p>
                    <p style={{ color: "#fef3c7", lineHeight: 1.8 }}>{generatedSermon.foundation?.breakdown}</p>
                  </SermonSection>

                  {/* Section 3: Foreword */}
                  <SermonSection id="section-3" label="💬 Foreword">
                    <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "12px" }}>{generatedSermon.foreword?.whyItMatters}</p>
                    <p style={{ color: "#a8956e", lineHeight: 1.8 }}>{generatedSermon.foreword?.relatable}</p>
                  </SermonSection>

                  {/* Section 4: Teaching Points */}
                  <SermonSection id="section-4" label="🔥 Core Teaching">
                    {generatedSermon.teachingPoints?.map((point, i) => (
                      <div key={i} style={{ marginBottom: i < generatedSermon.teachingPoints.length - 1 ? "28px" : 0, paddingBottom: i < generatedSermon.teachingPoints.length - 1 ? "28px" : 0, borderBottom: i < generatedSermon.teachingPoints.length - 1 ? "1px solid rgba(245,158,11,0.08)" : "none" }}>
                        <p style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>Point {i + 1}</p>
                        <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "20px", marginBottom: "10px" }}>{point.title}</h3>
                        <p style={{ color: "#fbbf24", fontSize: "13px", marginBottom: "12px" }}>{point.scripture}</p>
                        <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "12px" }}>{point.explanation}</p>
                        <div style={{ background: "rgba(245,158,11,0.05)", borderLeft: "3px solid rgba(245,158,11,0.3)", padding: "12px 16px", borderRadius: "0 6px 6px 0" }}>
                          <p style={{ color: "#a8956e", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Application</p>
                          <p style={{ color: "#fef3c7", lineHeight: 1.7, fontSize: "14px" }}>{point.application}</p>
                        </div>
                      </div>
                    ))}
                  </SermonSection>

                  {/* Section 5: Ministry Flow */}
                  <SermonSection id="section-5" label="✨ Ministry Flow">
                    {[
                      { label: "Gift of Knowledge", text: generatedSermon.ministryFlow?.giftOfKnowledge },
                      { label: "Impartation", text: generatedSermon.ministryFlow?.impartation },
                      { label: "Edification", text: generatedSermon.ministryFlow?.edification },
                      { label: "Slow Down Moment", text: generatedSermon.ministryFlow?.slowDown },
                      { label: "Return to Anchor", text: generatedSermon.ministryFlow?.returnToAnchor },
                    ].map((m) => m.text && (
                      <div key={m.label} style={{ marginBottom: "16px" }}>
                        <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>{m.label}</p>
                        <p style={{ color: "#fef3c7", lineHeight: 1.8 }}>{m.text}</p>
                      </div>
                    ))}
                  </SermonSection>

                  {/* Section 6: Summary */}
                  <SermonSection id="section-6" label="📋 Summary">
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {generatedSermon.summary?.keyTakeaways?.map((t, i) => (
                        <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <span style={{ color: "#f59e0b", marginTop: "2px" }}>→</span>
                          <span style={{ color: "#fef3c7", lineHeight: 1.7 }}>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </SermonSection>

                  {/* Section 7: Altar Call */}
                  <SermonSection id="section-7" label="🕊️ Altar Call">
                    <p style={{ color: "#fef3c7", lineHeight: 1.8, marginBottom: "20px" }}>{generatedSermon.altarCall?.invitation}</p>
                    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "8px", padding: "20px" }}>
                      <p style={{ color: "#a8956e", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Guided Prayer</p>
                      <p className="font-serif" style={{ color: "#fde68a", lineHeight: 1.9, fontSize: "16px", fontStyle: "italic" }}>{generatedSermon.altarCall?.prayer}</p>
                    </div>
                  </SermonSection>

                  {/* Section 8: Closing */}
                  <SermonSection id="section-8" label="🙌 Closing Prayer">
                    <p className="font-serif" style={{ color: "#fef3c7", lineHeight: 1.9, fontSize: "17px", fontStyle: "italic" }}>{generatedSermon.closingPrayer}</p>
                  </SermonSection>
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h2 className="font-serif" style={{ color: "#fef3c7", fontSize: "24px", marginBottom: "28px" }}>
                Sermon Library
              </h2>

              {loadingSermons ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#57534e" }}>Loading...</div>
              ) : sermons.length === 0 ? (
                <div className="glass" style={{ padding: "48px", textAlign: "center", borderRadius: "12px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>📖</div>
                  <p style={{ color: "#78716c" }}>No sermons saved yet. Build your first one!</p>
                  <button onClick={() => setActiveTab("generate")} className="btn-gold" style={{ marginTop: "20px", padding: "12px 28px", borderRadius: "8px", fontSize: "14px" }}>
                    Build a Sermon →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {sermons.map((s) => (
                    <div key={s.id} className="glass" style={{ padding: "24px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "18px", marginBottom: "4px" }}>{s.title}</h3>
                        <p style={{ color: "#78716c", fontSize: "13px" }}>
                          {s.tone} · {s.audience} · {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => { setGeneratedSermon(s.content); setTopic(s.topic); setAudience(s.audience); setTone(s.tone); setActiveTab("generate"); }}
                          className="btn-ghost"
                          style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px" }}
                        >
                          Open
                        </button>
                        <button
                          onClick={() => deleteSermon(s.id)}
                          style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );
}

function SermonSection({
  id,
  label,
  children,
  gold = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div
      id={id}
      style={{
        background: gold ? "rgba(245,158,11,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${gold ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.08)"}`,
        borderRadius: "12px",
        padding: "28px",
        marginBottom: "20px",
      }}
    >
      <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
        {label}
      </p>
      {children}
    </div>
  );
}
