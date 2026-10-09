import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Pastors Helper — Scripture-Anchored Sermon & Prayer Builder",
  description: "Build complete Scripture-anchored sermons and ministry prayers for pastors, evangelists and teachers. Three theological levels, 36+ languages.",
};

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0f0a05", color: "#fef3c7", fontFamily: "Georgia, serif" }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15,10,5,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>✝</span>
          <span style={{ color: "#f59e0b", fontSize: "17px", fontWeight: 600 }}>The Pastors Helper</span>
        </div>
        <Link href="/login" style={{ padding: "10px 24px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
          Sign In →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative", zIndex: 10 }}>
        <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "24px", opacity: 0.8 }}>For Pastors · Evangelists · Teachers</p>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 700, lineHeight: 1.1, marginBottom: "24px", maxWidth: "800px" }}>
          Scripture-Anchored<br />
          <span style={{ color: "#f59e0b" }}>Sermon & Prayer Builder</span>
        </h1>
        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#9a8a72", lineHeight: 1.8, maxWidth: "580px", marginBottom: "16px" }}>
          Build complete 9-section sermons and full ministry prayers — in 36+ languages, at three theological levels.
        </p>
        <p style={{ fontSize: "16px", color: "#f59e0b", fontStyle: "italic", marginBottom: "48px" }}>
          &ldquo;Study to shew thyself approved unto God.&rdquo; — 2 Timothy 2:15
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/login" style={{ padding: "18px 48px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, fontSize: "18px", textDecoration: "none", boxShadow: "0 0 40px rgba(245,158,11,0.25)" }}>
            Start Free →
          </Link>
          <Link href="/sales" style={{ padding: "18px 32px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 600, fontSize: "16px", textDecoration: "none" }}>
            Learn More
          </Link>
        </div>
        <p style={{ color: "#3d3326", fontSize: "13px", marginTop: "16px" }}>Free forever · No credit card · Just your email</p>
      </section>

      {/* Three pillars */}
      <section style={{ padding: "80px 24px", maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {[
            { icon: "✝", title: "9-Section Sermon Builder", desc: "Anchor Scripture → Opening → Foundation → Core Teaching (3 points) → Ministry Flow → Summary → Altar Call → Closing Prayer" },
            { icon: "🙏", title: "Ministry Prayer Builder", desc: "General Prayer and Warfare Prayer — with congregational responses, corporate declarations, and closing blessings" },
            { icon: "🌍", title: "36+ Languages", desc: "English, Español, Français, Samoan, Fijian, Tok Pisin, Māori, Aboriginal English and many more — all free" },
          ].map((p, i) => (
            <div key={i} style={{ padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "14px" }}>
              <span style={{ fontSize: "28px", display: "block", marginBottom: "14px" }}>{p.icon}</span>
              <h3 style={{ color: "#f59e0b", fontSize: "16px", fontWeight: 700, marginBottom: "10px" }}>{p.title}</h3>
              <p style={{ color: "#6b5d47", fontSize: "14px", lineHeight: 1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section style={{ padding: "60px 24px 100px", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        <p style={{ color: "#f59e0b", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", textAlign: "center", marginBottom: "40px" }}>Three Theological Levels</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { color: "#10b981", label: "Beginner", cert: "Certificate in Ministry", desc: "Foundational doctrine, simple language, structured scripture teaching" },
            { color: "#3b82f6", label: "Intermediate", cert: "Diploma of Theology", desc: "OT/NT connections, Greek/Hebrew word studies, covenant context" },
            { color: "#8b5cf6", label: "Advanced", cert: "Bachelor of Theology", desc: "Full exegesis, typology, systematic theology, apostolic ministry flow" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${l.color}20`, borderRadius: "12px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              <div>
                <span style={{ color: l.color, fontWeight: 700 }}>{l.label}</span>
                <span style={{ color: "#57534e", fontSize: "13px" }}> — {l.cert}</span>
                <p style={{ color: "#6b5d47", fontSize: "13px", marginTop: "2px" }}>{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid rgba(245,158,11,0.07)", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ color: "#2a2018", fontSize: "13px" }}>✝ The Pastors Helper · thepastorshelper.com</p>
        <p style={{ color: "#1a1209", fontSize: "12px", marginTop: "6px", fontStyle: "italic" }}>Built for the Body of Christ</p>
      </footer>
    </main>
  );
}
