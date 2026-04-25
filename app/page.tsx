"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0a05",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120,50,10,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 48px",
          borderBottom: "1px solid rgba(245,158,11,0.08)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>✝</span>
          <span
            className="font-serif"
            style={{ color: "#f59e0b", fontSize: "18px", fontWeight: 600 }}
          >
            The Pastors Helper
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link
            href="/login"
            style={{
              color: "#a8956e",
              textDecoration: "none",
              fontSize: "14px",
              padding: "8px 20px",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="btn-gold"
            style={{
              padding: "8px 24px",
              borderRadius: "6px",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="animate-fade-in"
          style={{
            display: "inline-block",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "40px",
            padding: "6px 20px",
            marginBottom: "32px",
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#f59e0b",
            textTransform: "uppercase",
          }}
        >
          Spirit-Led Sermon Building
        </div>

        <h1
          className="font-serif animate-slide-up"
          style={{
            fontSize: "clamp(42px, 7vw, 80px)",
            lineHeight: 1.08,
            marginBottom: "28px",
            maxWidth: "820px",
            margin: "0 auto 28px",
          }}
        >
          <span style={{ color: "#fef3c7" }}>Build Sermons Anchored</span>
          <br />
          <span className="text-gold-gradient">in Scripture.</span>
          <br />
          <span style={{ color: "#fef3c7" }}>Powered by the Spirit.</span>
        </h1>

        <p
          className="animate-fade-in delay-200"
          style={{
            color: "#a8956e",
            fontSize: "18px",
            lineHeight: 1.7,
            maxWidth: "560px",
            margin: "0 auto 48px",
          }}
        >
          From anchor verse to altar call — a complete sermon flow engine
          designed for pastors, ministers, and teachers of the Word.
        </p>

        <div
          className="animate-fade-in delay-300"
          style={{ display: "flex", gap: "16px", justifyContent: "center" }}
        >
          <Link
            href="/login"
            className="btn-gold"
            style={{
              padding: "16px 40px",
              borderRadius: "8px",
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Building →
          </Link>
          <a
            href="#features"
            className="btn-ghost"
            style={{
              padding: "16px 40px",
              borderRadius: "8px",
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            See How It Works
          </a>
        </div>

        {/* Scripture */}
        <p
          className="animate-fade-in delay-500"
          style={{
            marginTop: "64px",
            color: "rgba(168,149,110,0.5)",
            fontSize: "13px",
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
          }}
        >
          &ldquo;Preach the word; be ready in season and out of season.&rdquo; — 2
          Timothy 4:2
        </p>
      </section>

      {/* Feature cards */}
      <section
        id="features"
        style={{
          padding: "80px 48px",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="cross-divider"
          style={{ marginBottom: "64px", fontSize: "20px" }}
        >
          ✝
        </div>

        <h2
          className="font-serif"
          style={{
            textAlign: "center",
            fontSize: "36px",
            color: "#fef3c7",
            marginBottom: "56px",
          }}
        >
          Everything You Need to Preach with Power
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              icon: "📖",
              title: "Anchor Scripture Engine",
              desc: "Every sermon starts with the right verse. AI finds your primary scripture, cross-references, and the core theme that ties it all together.",
            },
            {
              icon: "🏗️",
              title: "Full Sermon Blueprint",
              desc: "Structured in 9 sections: Opening, Foundation, Foreword, 3–5 Teaching Points, Ministry Flow, Summary, Altar Call, and Closing Prayer.",
            },
            {
              icon: "🔥",
              title: "Deep Ministry Flow",
              desc: "Unique Spirit prompts — Gift of Knowledge moments, Impartation language, Slow Down pauses, and Return to Anchor points.",
            },
            {
              icon: "🎤",
              title: "Preach Mode",
              desc: "Full-screen delivery view with large text and section-by-section flow. Designed for behind-the-pulpit use.",
            },
            {
              icon: "📚",
              title: "Sermon Library & Series",
              desc: "Save every sermon. Build multi-week series. Your entire ministry archive in one place.",
            },
            {
              icon: "📄",
              title: "PDF Export",
              desc: "Export full manuscripts or preaching notes as clean, formatted PDFs ready to print.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glass animate-fade-in"
              style={{
                padding: "32px",
                borderRadius: "12px",
                animationDelay: `${i * 100}ms`,
                transition: "border-color 0.3s",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>
                {f.icon}
              </div>
              <h3
                className="font-serif"
                style={{
                  color: "#fef3c7",
                  fontSize: "20px",
                  marginBottom: "12px",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "#a8956e", lineHeight: 1.7, fontSize: "14px" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sermon flow visual */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "800px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h2
          className="font-serif"
          style={{
            textAlign: "center",
            fontSize: "32px",
            color: "#fef3c7",
            marginBottom: "48px",
          }}
        >
          The Complete Sermon Flow
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            ["1", "Anchor Scripture", "The foundation everything returns to"],
            ["2", "Opening", "Greeting, atmosphere, theme introduction"],
            ["3", "Foundation", "Scripture context, historical + spiritual"],
            ["4", "Foreword", "Why this message matters today"],
            ["5", "Core Teaching", "3–5 points with scripture + application"],
            ["6", "Ministry Flow", "Knowledge, impartation, reflection"],
            ["7", "Return to Anchor", "Full circle — back to the Word"],
            ["8", "Altar Call", "Invitation, salvation prayer, response"],
            ["9", "Closing Prayer", "Blessing and send-off"],
          ].map(([num, title, sub], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 24px",
                background:
                  i === 0
                    ? "rgba(245,158,11,0.08)"
                    : "rgba(255,255,255,0.02)",
                border:
                  i === 0
                    ? "1px solid rgba(245,158,11,0.2)"
                    : "1px solid rgba(245,158,11,0.06)",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background:
                    i === 0
                      ? "rgba(245,158,11,0.3)"
                      : "rgba(245,158,11,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#f59e0b",
                  flexShrink: 0,
                }}
              >
                {num}
              </span>
              <div>
                <div
                  style={{
                    color: i === 0 ? "#fbbf24" : "#fef3c7",
                    fontWeight: 500,
                    fontSize: "15px",
                  }}
                >
                  {title}
                </div>
                <div style={{ color: "#78716c", fontSize: "13px" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 24px 120px",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="glass gold-glow"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "64px 48px",
            borderRadius: "16px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "24px" }}>✝</div>
          <h2
            className="font-serif"
            style={{ fontSize: "32px", color: "#fef3c7", marginBottom: "16px" }}
          >
            Ready to Preach the Word?
          </h2>
          <p style={{ color: "#a8956e", marginBottom: "32px", lineHeight: 1.7 }}>
            Create your free account and build your first sermon in minutes.
          </p>
          <Link
            href="/login"
            className="btn-gold"
            style={{
              padding: "16px 48px",
              borderRadius: "8px",
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 48px",
          borderTop: "1px solid rgba(245,158,11,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#57534e",
          fontSize: "13px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <span>✝ The Pastors Helper</span>
        <span>
          &ldquo;Study to shew thyself approved&rdquo; — 2 Timothy 2:15
        </span>
      </footer>
    </main>
  );
}
