"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main style={{ background: "#05030a", color: "#f0e6d3", fontFamily: "'Georgia', serif", overflowX: "hidden" }}>

      {/* Sticky nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrolled ? "rgba(5,3,10,0.97)" : "transparent", borderBottom: scrolled ? "1px solid rgba(212,175,90,0.1)" : "none", transition: "all 0.4s ease", backdropFilter: scrolled ? "blur(16px)" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#d4af5a", fontSize: "18px" }}>✝</span>
          <span style={{ color: "#d4af5a", fontSize: "15px", fontWeight: 700, letterSpacing: "0.5px" }}>The Pastors Helper</span>
        </div>
        <Link href="/" style={{ padding: "10px 24px", borderRadius: "6px", background: "rgba(212,175,90,0.12)", border: "1px solid rgba(212,175,90,0.35)", color: "#d4af5a", fontSize: "13px", fontWeight: 600, textDecoration: "none", letterSpacing: "0.5px" }}>
          Begin Free →
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 80px", textAlign: "center", position: "relative" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212,175,90,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 50% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

        <p style={{ color: "#d4af5a", fontSize: "12px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "28px", opacity: 0.8 }}>For Pastors · Evangelists · Teachers</p>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 700, lineHeight: 1.1, marginBottom: "28px", maxWidth: "820px", color: "#f5ead8" }}>
          You Answered the Call.<br />
          <span style={{ color: "#d4af5a" }}>Now Preach with Power.</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "#9a8a72", lineHeight: 1.8, maxWidth: "620px", marginBottom: "20px" }}>
          Every Sunday, thousands of pastors face a blank page. The calling is real. The congregation is waiting. But nobody taught you how to build a sermon that moves heaven and earth.
        </p>

        <p style={{ fontSize: "clamp(16px, 2.5vw, 20px)", color: "#d4af5a", lineHeight: 1.8, maxWidth: "580px", marginBottom: "48px", fontStyle: "italic" }}>
          &ldquo;Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.&rdquo;
          <span style={{ display: "block", color: "#6b5d47", fontSize: "14px", marginTop: "8px", fontStyle: "normal" }}>— 2 Timothy 2:15</span>
        </p>

        <Link href="/" style={{ padding: "18px 48px", borderRadius: "8px", background: "linear-gradient(135deg, #d4af5a, #b8943f)", color: "#05030a", fontSize: "18px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.5px", boxShadow: "0 0 40px rgba(212,175,90,0.25)" }}>
          Start Free — No Password Required →
        </Link>
        <p style={{ color: "#3d3326", fontSize: "13px", marginTop: "16px" }}>Free forever · No credit card · Just your email</p>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <p style={{ color: "#3d3326", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" }}>Scroll</p>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #d4af5a, transparent)" }} />
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{ padding: "100px 24px", maxWidth: "760px", margin: "0 auto" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "40px", textAlign: "center" }}>The Reality</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {[
            { icon: "📖", text: "You answered the call but no one handed you a seminary degree with it. Most pastors start preaching before they finish studying." },
            { icon: "⏰", text: "Saturday night at 11pm. The congregation arrives in 9 hours. The page is blank. The pressure is real." },
            { icon: "🌍", text: "Your congregation speaks Samoan, Fijian, Kriol, or Māori — but the tools were built for English-speaking Western churches." },
            { icon: "🪙", text: "Bible college costs tens of thousands. Most emerging pastors in developing nations, Pacific communities, and Indigenous ministries cannot access it." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", alignItems: "flex-start", padding: "28px", background: "rgba(212,175,90,0.03)", border: "1px solid rgba(212,175,90,0.08)", borderRadius: "12px" }}>
              <span style={{ fontSize: "28px", flexShrink: 0 }}>{item.icon}</span>
              <p style={{ color: "#9a8a72", fontSize: "17px", lineHeight: 1.8, fontFamily: "Georgia, serif" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ textAlign: "center", padding: "20px", color: "#d4af5a", fontSize: "24px", opacity: 0.4 }}>✝</div>

      {/* THE SOLUTION */}
      <section style={{ padding: "80px 24px", maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "24px" }}>The Answer</p>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "24px", color: "#f5ead8" }}>
          A Ministry Preparation Platform<br />Built on the Word of God
        </h2>
        <p style={{ color: "#9a8a72", fontSize: "18px", lineHeight: 1.8, marginBottom: "0" }}>
          The Pastors Helper doesn&apos;t write generic content. It builds Scripture-anchored sermons and ministry prayers structured the way trained theologians build them — from Certificate level all the way to Bachelor of Theology.
        </p>
      </section>

      {/* 9 SECTIONS */}
      <section style={{ padding: "60px 24px 100px", maxWidth: "680px", margin: "0 auto" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "32px", textAlign: "center" }}>The Sermon Structure</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            ["1", "Anchor Scripture",  "The verse everything returns to — your foundation"],
            ["2", "Opening",           "Greeting, atmosphere and the hook that draws them in"],
            ["3", "Foundation",        "Historical, cultural and covenant context of the scripture"],
            ["4", "Foreword",          "Why this message matters in the world they live in today"],
            ["5", "Core Teaching",     "Three points with primary and supporting scriptures"],
            ["6", "Ministry Flow",     "Gift of Knowledge · Impartation · Edification · Slow Down"],
            ["7", "Summary",           "Three scripture-grounded takeaways they carry home"],
            ["8", "Altar Call",        "Invitation and guided salvation prayer"],
            ["9", "Closing Prayer",    "Scripture-woven apostolic blessing over the congregation"],
          ].map(([num, title, sub], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "18px", padding: "16px 20px", background: i === 4 ? "rgba(212,175,90,0.07)" : "rgba(255,255,255,0.015)", border: `1px solid ${i === 4 ? "rgba(212,175,90,0.2)" : "rgba(212,175,90,0.06)"}`, borderRadius: "10px" }}>
              <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: i === 4 ? "rgba(212,175,90,0.2)" : "rgba(212,175,90,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#d4af5a", flexShrink: 0, marginTop: "2px", fontWeight: 700 }}>{num}</span>
              <div>
                <p style={{ color: i === 4 ? "#d4af5a" : "#f0e6d3", fontSize: "15px", fontWeight: 600, marginBottom: "3px" }}>{title}</p>
                <p style={{ color: "#6b5d47", fontSize: "13px", lineHeight: 1.5 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THREE LEVELS */}
      <section style={{ padding: "80px 24px", background: "rgba(212,175,90,0.03)", borderTop: "1px solid rgba(212,175,90,0.07)", borderBottom: "1px solid rgba(212,175,90,0.07)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>Theological Depth</p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, textAlign: "center", marginBottom: "12px", color: "#f5ead8" }}>Three Levels. One Journey.</h2>
          <p style={{ color: "#6b5d47", textAlign: "center", fontSize: "16px", marginBottom: "48px", lineHeight: 1.7 }}>Aligned with certified Bible College curriculum — from first sermon to leading your own ministry.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "🌱", level: "Beginner", cert: "Certificate in Ministry", color: "#10b981", desc: "Foundational doctrine in simple language. Teaches the emerging pastor how to find a scripture, understand it, explain it simply, apply it practically, and invite a response. The building blocks of every sermon ever preached." },
              { icon: "📖", level: "Intermediate", cert: "Diploma of Theology", color: "#3b82f6", desc: "Old Testament to New Testament connections. Greek and Hebrew word studies. Covenant context. Prophetic fulfillment. The pastor begins to understand not just what they preach — but why it is true." },
              { icon: "🎓", level: "Advanced", cert: "Bachelor of Theology", color: "#8b5cf6", desc: "Systematic theology. Full exegesis. Typology. Christology. Greek and Hebrew in every teaching point. The complete redemptive arc from Genesis to Revelation. The knowledge to establish, lead and govern a local church." },
            ].map((l, i) => (
              <div key={i} style={{ padding: "28px", background: "rgba(5,3,10,0.6)", border: `1px solid ${l.color}25`, borderRadius: "14px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "32px", flexShrink: 0 }}>{l.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <p style={{ color: l.color, fontSize: "18px", fontWeight: 700 }}>{l.level}</p>
                    <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "11px", background: `${l.color}15`, color: l.color, letterSpacing: "0.5px" }}>{l.cert}</span>
                  </div>
                  <p style={{ color: "#9a8a72", fontSize: "15px", lineHeight: 1.8 }}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MINISTRY PRAYERS */}
      <section style={{ padding: "100px 24px", maxWidth: "760px", margin: "0 auto" }}>
        <p style={{ color: "#a78bfa", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>Ministry Prayers</p>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, textAlign: "center", marginBottom: "12px", color: "#f5ead8" }}>Not a Sermon. A Prayer.</h2>
        <p style={{ color: "#6b5d47", textAlign: "center", fontSize: "16px", marginBottom: "48px", lineHeight: 1.7, maxWidth: "580px", margin: "0 auto 48px" }}>Completely separate from sermons. Structured for congregational ministry — the kind of prayer that moves people from their seats to the altar.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { icon: "🙏", title: "General Prayer", color: "#a78bfa", items: ["Healing & Health", "Peace & Anxiety", "Financial Provision", "Salvation of Loved Ones", "Family & Relationships", "Grief & Loss", "Guidance & Direction", "Forgiveness & Restoration"] },
            { icon: "⚔️", title: "Warfare Prayer", color: "#f87171", items: ["Fear & Anxiety", "Generational Curses", "Spiritual Oppression", "Sickness & Infirmity", "Addiction & Bondage", "Depression & Heaviness", "Marital Warfare", "Ministry Protection"] },
          ].map((pt, i) => (
            <div key={i} style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${pt.color}20`, borderRadius: "14px" }}>
              <p style={{ fontSize: "28px", marginBottom: "10px" }}>{pt.icon}</p>
              <p style={{ color: pt.color, fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>{pt.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {pt.items.map(item => (
                  <p key={item} style={{ color: "#6b5d47", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: pt.color, fontSize: "10px" }}>✓</span> {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: "#6b5d47", fontSize: "14px", textAlign: "center", marginTop: "24px", lineHeight: 1.7 }}>
          Each prayer includes an Opening Declaration, Prayer Sections with Congregational Responses,<br />a Corporate Declaration the whole church speaks aloud, and a Closing Blessing with scripture.
        </p>
      </section>

      {/* GLOBAL */}
      <section style={{ padding: "80px 24px", background: "rgba(212,175,90,0.03)", borderTop: "1px solid rgba(212,175,90,0.07)", borderBottom: "1px solid rgba(212,175,90,0.07)", textAlign: "center" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px" }}>Global Ministry</p>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, marginBottom: "16px", color: "#f5ead8" }}>36+ Languages. All Free.</h2>
        <p style={{ color: "#6b5d47", fontSize: "16px", lineHeight: 1.8, maxWidth: "560px", margin: "0 auto 32px" }}>
          Language should never be a barrier to the Word of God. Every language is free — no extra cost for missionaries, Pacific Island ministers, African church planters, or Indigenous ministry leaders.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "600px", margin: "0 auto" }}>
          {["English","Español","Français","Português","Deutsch","Italiano","Nederlands","Afrikaans","IsiZulu","Kiswahili","Yorùbá","Igbo","Hausa","Amharic","Arabic","Hindi","Tamil","Telugu","Filipino","Bahasa","Malay","中文","한국어","日本語","Русский","Українська","Română","Polski","Samoan","Fijian","Tok Pisin","Māori","Tongan","Bislama","S. Sea Islander","Aboriginal English"].map(l => (
            <span key={l} style={{ padding: "5px 12px", borderRadius: "16px", background: "rgba(212,175,90,0.07)", border: "1px solid rgba(212,175,90,0.15)", color: "#9a8a72", fontSize: "12px" }}>{l}</span>
          ))}
        </div>
      </section>

      {/* BUILT FOR */}
      <section style={{ padding: "100px 24px", maxWidth: "760px", margin: "0 auto" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>Ephesians 4:11</p>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 700, textAlign: "center", marginBottom: "12px", color: "#f5ead8" }}>Built for the Five-Fold Ministry</h2>
        <p style={{ color: "#6b5d47", textAlign: "center", fontSize: "16px", marginBottom: "48px", lineHeight: 1.7, fontStyle: "italic" }}>
          &ldquo;And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers.&rdquo;
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
          {[
            { icon: "⛪", title: "Pastors",      desc: "Weekly sermon preparation, congregational care messages, and ministry prayer leadership" },
            { icon: "🔥", title: "Evangelists",  desc: "Salvation-focused sermons, outreach messages, and altar call prayer guides" },
            { icon: "📖", title: "Teachers",     desc: "Expository Bible teaching, systematic theology, and deep scripture breakdown" },
            { icon: "🌱", title: "New Ministers", desc: "First sermons, certificate-level structure, and 300+ topic suggestions to find your voice" },
            { icon: "🌍", title: "Missionaries", desc: "36+ languages, cultural sensitivity, and ministry prayers for diverse congregations" },
            { icon: "👨‍👩‍👧", title: "Youth Leaders", desc: "Engaging relatable messages shaped for younger audiences and youth ministry tones" },
          ].map((w, i) => (
            <div key={i} style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,90,0.08)", borderRadius: "12px" }}>
              <span style={{ fontSize: "24px", display: "block", marginBottom: "10px" }}>{w.icon}</span>
              <p style={{ color: "#d4af5a", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>{w.title}</p>
              <p style={{ color: "#6b5d47", fontSize: "12px", lineHeight: 1.6 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLKIT */}
      <section style={{ padding: "60px 24px 100px", maxWidth: "760px", margin: "0 auto" }}>
        <p style={{ color: "#d4af5a", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "40px", textAlign: "center" }}>Full Ministry Toolkit</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: "🎤", f: "Preach Mode",      d: "Full-screen delivery view designed for behind the pulpit" },
            { icon: "📚", f: "Series Builder",   d: "Multi-week arc planning with sermon assignments" },
            { icon: "📄", f: "PDF Export",       d: "Print-ready sermon manuscripts to take to the pulpit" },
            { icon: "📖", f: "Sermon Library",   d: "Every sermon saved privately — accessible anytime" },
            { icon: "🌿", f: "Free Tier",        d: "10 credits monthly — free forever for struggling ministers" },
            { icon: "💳", f: "Credit Packs",     d: "Starter $5 · Ministry $12 · Evangelist $25 · Church $55" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "14px", padding: "18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,90,0.07)", borderRadius: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "22px", flexShrink: 0 }}>{t.icon}</span>
              <div>
                <p style={{ color: "#f0e6d3", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{t.f}</p>
                <p style={{ color: "#6b5d47", fontSize: "12px", lineHeight: 1.5 }}>{t.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "100px 24px 120px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,90,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "620px", margin: "0 auto" }}>
          <span style={{ fontSize: "40px", display: "block", marginBottom: "24px", color: "#d4af5a" }}>✝</span>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.2, marginBottom: "20px", color: "#f5ead8" }}>
            The Pulpit is Waiting.<br />
            <span style={{ color: "#d4af5a" }}>The Word is Ready.</span>
          </h2>
          <p style={{ color: "#9a8a72", fontSize: "18px", lineHeight: 1.8, marginBottom: "16px" }}>
            From the first-time preacher holding a Bible, to the seasoned theologian preparing a doctrinally deep expository sermon in Samoan for a Pacific congregation — this platform covers it completely.
          </p>
          <p style={{ color: "#d4af5a", fontStyle: "italic", fontSize: "16px", marginBottom: "48px", lineHeight: 1.7 }}>
            &ldquo;For the word of God is quick, and powerful, and sharper than any twoedged sword.&rdquo;<br />
            <span style={{ color: "#6b5d47", fontSize: "13px", fontStyle: "normal" }}>— Hebrews 4:12</span>
          </p>

          <Link href="/" style={{ display: "inline-block", padding: "20px 56px", borderRadius: "8px", background: "linear-gradient(135deg, #d4af5a, #b8943f)", color: "#05030a", fontSize: "20px", fontWeight: 700, textDecoration: "none", letterSpacing: "0.5px", boxShadow: "0 0 60px rgba(212,175,90,0.3)" }}>
            Begin Your Ministry — Free →
          </Link>
          <p style={{ color: "#3d3326", fontSize: "13px", marginTop: "16px" }}>No password · No credit card · Just your email</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid rgba(212,175,90,0.07)", textAlign: "center" }}>
        <p style={{ color: "#3d3326", fontSize: "13px", marginBottom: "6px" }}>✝ The Pastors Helper · thepastorshelper.com</p>
        <p style={{ color: "#2a2018", fontSize: "12px", fontStyle: "italic" }}>Built for the Body of Christ</p>
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          {["Sermon Builder", "Ministry Prayers", "36+ Languages", "Preach Mode", "Series Builder", "Free to Start"].map(l => (
            <span key={l} style={{ color: "#2a2018", fontSize: "11px" }}>{l}</span>
          ))}
        </div>
      </footer>
    </main>
  );
}
