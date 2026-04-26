"use client";

import Link from "next/link";
import Script from "next/script";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://thepastorshelper.com/#website",
        "url": "https://thepastorshelper.com",
        "name": "The Pastors Helper",
        "description": "Spirit-Led Sermon Builder for Pastors and Ministers",
        "inLanguage": "en-US",
      },
      {
        "@type": "Organization",
        "@id": "https://thepastorshelper.com/#organization",
        "name": "The Pastors Helper",
        "url": "https://thepastorshelper.com",
        "description": "A complete sermon building platform for pastors, ministers, and church leaders worldwide.",
        "sameAs": [],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://thepastorshelper.com/#app",
        "name": "The Pastors Helper",
        "applicationCategory": "ReligiousApplication",
        "operatingSystem": "Web, iOS, Android",
        "description": "Spirit-led sermon builder that generates complete Scripture-anchored sermons with teaching points, ministry flow, altar calls, and preach mode. Available in 33 languages for pastors at every level.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
        },
        "featureList": [
          "Anchor Scripture Engine",
          "9-Section Sermon Structure",
          "Ministry Flow Prompts",
          "Preach Mode",
          "Sermon Series Builder",
          "PDF Export",
          "33 Languages",
          "Beginner, Intermediate and Advanced levels",
          "Sermon Library",
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "ratingCount": "1",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is The Pastors Helper free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, The Pastors Helper is free to get started. Create an account with just your email — no password needed.",
            },
          },
          {
            "@type": "Question",
            "name": "Can The Pastors Helper generate sermons in different languages?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The Pastors Helper generates complete sermons in 33 languages including English, Spanish, French, Portuguese, Samoan, Tongan, Fijian, Te Reo Māori, Tok Pisin, Swahili, Yoruba, Arabic, Hindi, Mandarin, Korean, and many more.",
            },
          },
          {
            "@type": "Question",
            "name": "Are the sermons unique to each pastor?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Every sermon is generated fresh each time. Even if two pastors use the same topic, they receive completely different sermons with unique illustrations, teaching points, and ministry flow. All saved sermons are private to each user.",
            },
          },
          {
            "@type": "Question",
            "name": "What is included in a generated sermon?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Every sermon includes an Anchor Scripture, Opening, Foundation, Foreword, 3 Core Teaching Points with application, Ministry Flow (Gift of Knowledge, Impartation, Edification, Slow Down, Return to Anchor), Summary, Altar Call with guided prayer, and Closing Prayer.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I build a sermon series?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The Sermon Series Builder lets you create named series, assign individual sermons to each week, and view the full multi-week arc in one place.",
            },
          },
          {
            "@type": "Question",
            "name": "Is The Pastors Helper suitable for new pastors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. The Beginner level uses simple, clear language with relatable examples for new believers and new ministers. The tool also includes a library of over 300 sermon topics across 16 categories to help new pastors find the right direction.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main style={{ minHeight: "100vh", background: "#0f0a05", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 60%)", pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(245,158,11,0.08)", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>✝</span>
            <span className="font-serif" style={{ color: "#f59e0b", fontSize: "16px", fontWeight: 600 }}>The Pastors Helper</span>
          </div>
          <Link href="/login" className="btn-gold" style={{ padding: "8px 18px", borderRadius: "6px", fontSize: "13px", textDecoration: "none", display: "inline-block" }}>
            Get Started Free
          </Link>
        </nav>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "60px 20px 48px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "40px", padding: "5px 16px", marginBottom: "24px", fontSize: "11px", letterSpacing: "2px", color: "#f59e0b", textTransform: "uppercase" as const }}>
            Sermon Building for Every Pastor
          </div>

          <h1 className="font-serif" style={{ fontSize: "clamp(32px, 8vw, 68px)", lineHeight: 1.1, marginBottom: "20px" }}>
            <span style={{ color: "#fef3c7" }}>The Sermon Builder</span><br />
            <span style={{ color: "#fef3c7" }}>Every Pastor </span>
            <span className="text-gold-gradient">Needs.</span>
          </h1>

          <p style={{ color: "#a8956e", fontSize: "17px", lineHeight: 1.75, maxWidth: "520px", margin: "0 auto 12px" }}>
            Build complete, Scripture-anchored sermons in seconds — with teaching points, ministry flow, altar calls, and preach mode.
          </p>
          <p style={{ color: "#78716c", fontSize: "14px", marginBottom: "36px" }}>
            For pastors at every level · 33 languages · Beginner to Advanced
          </p>

          <Link href="/login" className="btn-gold" style={{ padding: "15px 36px", borderRadius: "8px", fontSize: "16px", textDecoration: "none", display: "block", maxWidth: "300px", margin: "0 auto 16px", textAlign: "center" as const }}>
            Start Building Free →
          </Link>
          <p style={{ color: "#57534e", fontSize: "12px" }}>No credit card · No password · Just your email</p>

          <p style={{ marginTop: "48px", color: "rgba(168,149,110,0.45)", fontSize: "13px", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            &ldquo;Preach the word; be ready in season and out of season.&rdquo; — 2 Timothy 4:2
          </p>
        </section>

        {/* Stats bar */}
        <section style={{ padding: "20px", position: "relative", zIndex: 10 }}>
          <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
            {[
              { num: "300+", label: "Sermon Topics" },
              { num: "33",   label: "Languages" },
              { num: "9",    label: "Sermon Sections" },
              { num: "3",    label: "Skill Levels" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p className="font-serif" style={{ color: "#f59e0b", fontSize: "26px", fontWeight: 700 }}>{s.num}</p>
                <p style={{ color: "#57534e", fontSize: "12px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: "48px 20px", maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div className="cross-divider" style={{ marginBottom: "40px", fontSize: "18px" }}>✝</div>
          <h2 className="font-serif" style={{ textAlign: "center", fontSize: "28px", color: "#fef3c7", marginBottom: "32px" }}>
            Everything You Need to Preach with Power
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { icon: "📖", title: "Anchor Scripture Engine",     desc: "ASE finds your primary verse, cross-references, and the core theme that ties the whole sermon together." },
              { icon: "🏗️", title: "9-Section Sermon Blueprint", desc: "Opening, Foundation, Foreword, 3 Teaching Points, Ministry Flow, Altar Call, and Closing Prayer — fully structured." },
              { icon: "🔥", title: "Deep Ministry Flow",          desc: "Gift of Knowledge, Impartation, Edification, Slow Down moments, and Return to Anchor — built for Spirit-led delivery." },
              { icon: "🎤", title: "Preach Mode",                 desc: "Full-screen delivery view designed for behind the pulpit. Large text, clean layout, section by section." },
              { icon: "📚", title: "Series Builder",              desc: "Create multi-week series, assign sermons week by week, and see your full teaching arc at a glance." },
              { icon: "🌍", title: "33 Languages",                desc: "Generate complete sermons in English, Spanish, French, Samoan, Tongan, Te Reo Māori, Swahili, Arabic, Mandarin and more." },
              { icon: "🌱", title: "3 Skill Levels",              desc: "Beginner, Intermediate, and Advanced — the sermon depth, language, and theology adjusts to match your congregation." },
              { icon: "📄", title: "PDF Export",                  desc: "Export your full sermon manuscript as a clean, formatted PDF. Print it, share it, archive it." },
            ].map((f, i) => (
              <div key={i} className="glass" style={{ padding: "18px 20px", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <h3 className="font-serif" style={{ color: "#fef3c7", fontSize: "15px", marginBottom: "4px" }}>{f.title}</h3>
                  <p style={{ color: "#78716c", fontSize: "13px", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <h2 className="font-serif" style={{ textAlign: "center", fontSize: "26px", color: "#fef3c7", marginBottom: "28px" }}>
            Built for Every Minister
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { icon: "🌱", title: "New Pastors",        desc: "Step-by-step structure and 300+ topic suggestions to help you find your voice." },
              { icon: "⛪", title: "Senior Ministers",   desc: "Deep theological content, Greek/Hebrew insights, and advanced doctrinal depth." },
              { icon: "👨‍👩‍👧", title: "Youth Leaders",    desc: "Engaging, relatable sermons shaped for a younger audience and tone." },
              { icon: "🌍", title: "Global Pastors",    desc: "Sermon content in 33 languages for ministry across the world." },
              { icon: "📖", title: "Bible Teachers",    desc: "Scripture-rich content with cross-references and foundational context." },
              { icon: "🔥", title: "Evangelists",       desc: "Powerful altar calls, salvation prayers, and outreach-focused sermon flow." },
            ].map((w, i) => (
              <div key={i} className="glass" style={{ padding: "16px", borderRadius: "12px" }}>
                <span style={{ fontSize: "20px", display: "block", marginBottom: "8px" }}>{w.icon}</span>
                <h3 style={{ color: "#fef3c7", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{w.title}</h3>
                <p style={{ color: "#57534e", fontSize: "12px", lineHeight: 1.5 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sermon flow */}
        <section style={{ padding: "40px 20px", maxWidth: "560px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <h2 className="font-serif" style={{ textAlign: "center", fontSize: "24px", color: "#fef3c7", marginBottom: "24px" }}>
            The Complete Sermon Flow
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              ["1", "Anchor Scripture",  "The verse everything returns to"],
              ["2", "Opening",           "Greeting, atmosphere, hook"],
              ["3", "Foundation",        "Scripture context and breakdown"],
              ["4", "Foreword",          "Why this message matters today"],
              ["5", "Core Teaching",     "3 points with scripture and application"],
              ["6", "Ministry Flow",     "Knowledge, impartation, reflection"],
              ["7", "Return to Anchor",  "Full circle — back to the Word"],
              ["8", "Altar Call",        "Invitation and guided prayer"],
              ["9", "Closing Prayer",    "Blessing and send-off"],
            ].map(([num, title, sub], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: i === 0 ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.05)"}`, borderRadius: "8px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: i === 0 ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#f59e0b", flexShrink: 0 }}>{num}</span>
                <div>
                  <span style={{ color: i === 0 ? "#fbbf24" : "#fef3c7", fontWeight: 500, fontSize: "14px" }}>{title}</span>
                  <span style={{ color: "#57534e", fontSize: "12px", marginLeft: "10px" }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ — SEO rich */}
        <section style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <h2 className="font-serif" style={{ textAlign: "center", fontSize: "24px", color: "#fef3c7", marginBottom: "28px" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { q: "Is The Pastors Helper free to use?",                              a: "Yes — free to get started with just your email address. No password, no credit card required." },
              { q: "Are the sermons unique to each pastor?",                          a: "Yes. Every sermon is freshly generated. Two pastors using the same topic will receive completely different sermons — different illustrations, angles, and ministry flow. All saved sermons are private to each user." },
              { q: "What languages does it support?",                                 a: "33 languages including English, Spanish, French, Portuguese, Samoan, Tongan, Fijian, Te Reo Māori, Tok Pisin, Swahili, Yoruba, Igbo, Arabic, Hindi, Mandarin, Korean, Japanese, Russian, and more." },
              { q: "Is it suitable for new pastors?",                                 a: "Absolutely. The Beginner level uses simple clear language with relatable examples. The 300+ topic library also helps new ministers find direction quickly." },
              { q: "Can I save and reuse my sermons?",                                a: "Yes. Every sermon can be saved to your personal library, re-opened any time, preached from in Preach Mode, exported as a PDF, and organised into multi-week series." },
              { q: "What is included in a generated sermon?",                         a: "Every sermon includes an Anchor Scripture, Opening, Foundation, Foreword, 3 Core Teaching Points with application, Ministry Flow (Gift of Knowledge, Impartation, Edification, Slow Down, Return to Anchor), Summary, Altar Call with guided prayer, and Closing Prayer." },
              { q: "Can I build a multi-week sermon series?",                         a: "Yes. The Sermon Series Builder lets you create named series, assign sermons week by week, and view the full arc at a glance." },
            ].map((faq, i) => (
              <details key={i} style={{ padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "10px", cursor: "pointer" }}>
                <summary style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  {faq.q}
                  <span style={{ color: "#f59e0b", fontSize: "16px", flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: "#a8956e", fontSize: "13px", lineHeight: 1.7, marginTop: "12px" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "40px 20px 100px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <div className="glass gold-glow" style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 24px", borderRadius: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>✝</div>
            <h2 className="font-serif" style={{ fontSize: "24px", color: "#fef3c7", marginBottom: "12px" }}>Ready to Preach the Word?</h2>
            <p style={{ color: "#a8956e", marginBottom: "28px", lineHeight: 1.7, fontSize: "14px" }}>
              Join pastors and ministers worldwide building Spirit-led sermons with The Pastors Helper.
            </p>
            <Link href="/login" className="btn-gold" style={{ padding: "14px 36px", borderRadius: "8px", fontSize: "15px", textDecoration: "none", display: "block", textAlign: "center" as const }}>
              Get Started Free →
            </Link>
            <p style={{ color: "#57534e", fontSize: "12px", marginTop: "14px" }}>No credit card · No password · Just your email</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: "24px 20px", borderTop: "1px solid rgba(245,158,11,0.07)", textAlign: "center", position: "relative", zIndex: 10 }}>
          <p style={{ color: "#57534e", fontSize: "13px", marginBottom: "6px" }}>✝ The Pastors Helper</p>
          <p style={{ color: "#3d3529", fontSize: "12px", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
            &ldquo;Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth.&rdquo; — 2 Timothy 2:15
          </p>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {["Sermon Builder", "Sermon Topics", "Preach Mode", "Series Builder", "33 Languages", "PDF Export"].map(l => (
              <span key={l} style={{ color: "#3d3529", fontSize: "11px" }}>{l}</span>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}
