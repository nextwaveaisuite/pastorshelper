"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "#0f0a05", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(245,158,11,0.08)", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>✝</span>
          <span className="font-serif" style={{ color: "#f59e0b", fontSize: "16px", fontWeight: 600 }}>The Pastors Helper</span>
        </div>
        <Link href="/login" className="btn-gold" style={{ padding: "8px 18px", borderRadius: "6px", fontSize: "13px", textDecoration: "none", display: "inline-block" }}>
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "56px 20px 48px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "40px", padding: "5px 16px", marginBottom: "24px", fontSize: "11px", letterSpacing: "2px", color: "#f59e0b", textTransform: "uppercase" as const }}>
          Spirit-Led Sermon Building
        </div>
        <h1 className="font-serif" style={{ fontSize: "clamp(34px, 9vw, 72px)", lineHeight: 1.1, marginBottom: "20px" }}>
          <span style={{ color: "#fef3c7" }}>Build Sermons<br />Anchored in </span>
          <span className="text-gold-gradient">Scripture.</span>
        </h1>
        <p style={{ color: "#a8956e", fontSize: "16px", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 36px" }}>
          From anchor verse to altar call — a complete sermon flow engine built for pastors and ministers.
        </p>
        <Link href="/login" className="btn-gold" style={{ padding: "15px 36px", borderRadius: "8px", fontSize: "16px", textDecoration: "none", display: "block", maxWidth: "320px", margin: "0 auto", textAlign: "center" as const }}>
          Start Building →
        </Link>
        <p style={{ marginTop: "40px", color: "rgba(168,149,110,0.5)", fontSize: "13px", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
          &ldquo;Preach the word; be ready in season and out of season.&rdquo; — 2 Timothy 4:2
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div className="cross-divider" style={{ marginBottom: "40px", fontSize: "18px" }}>✝</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { icon: "📖", title: "Anchor Scripture Engine", desc: "AI finds your anchor verse, cross-references and core theme." },
            { icon: "🏗️", title: "Full Sermon Blueprint", desc: "9 structured sections from Opening to Closing Prayer." },
            { icon: "🔥", title: "Deep Ministry Flow", desc: "Gift of Knowledge, Impartation, and Slow Down moments." },
            { icon: "🎤", title: "Preach Mode", desc: "Full-screen delivery view, built for behind the pulpit." },
            { icon: "📚", title: "Sermon Library", desc: "Save every sermon. Build multi-week series." },
            { icon: "📄", title: "PDF Export", desc: "Export full manuscripts ready to print." },
          ].map((f, i) => (
            <div key={i} className="glass" style={{ padding: "20px", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "24px", flexShrink: 0 }}>{f.icon}</span>
              <div>
                <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "16px", marginBottom: "4px" }}>{f.title}</h3>
                <p style={{ color: "#a8956e", fontSize: "13px", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 20px 80px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div className="glass gold-glow" style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 24px", borderRadius: "16px" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>✝</div>
          <h2 className="font-serif" style={{ fontSize: "26px", color: "#fef3c7", marginBottom: "12px" }}>Ready to Preach the Word?</h2>
          <p style={{ color: "#a8956e", marginBottom: "28px", lineHeight: 1.7, fontSize: "14px" }}>Create your free account and build your first sermon in minutes.</p>
          <Link href="/login" className="btn-gold" style={{ padding: "14px 36px", borderRadius: "8px", fontSize: "15px", textDecoration: "none", display: "block", textAlign: "center" as const }}>
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer style={{ padding: "20px", borderTop: "1px solid rgba(245,158,11,0.08)", textAlign: "center", color: "#57534e", fontSize: "12px", position: "relative", zIndex: 10 }}>
        <p>✝ The Pastors Helper</p>
        <p style={{ marginTop: "4px", fontStyle: "italic", fontFamily: "Georgia, serif" }}>&ldquo;Study to shew thyself approved&rdquo; — 2 Timothy 2:15</p>
      </footer>
    </main>
  );
}
