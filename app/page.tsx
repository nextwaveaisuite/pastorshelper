"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: "/" }) }).catch(() => {});
  }, []);

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
            For pastors at every level · 36+ languages · Beginner to Advanced
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
              { num: "36+",  label: "Languages" },
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

        {/* Languages strip — flags only */}
        <section style={{ padding: "8px 20px 32px", maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          <p style={{ color: "#57534e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", textAlign: "center", marginBottom: "16px" }}>Ministry Languages — All Free</p>
          <p style={{ textAlign: "center", fontSize: "28px", lineHeight: 2, letterSpacing: "4px" }}>
            🇬🇧🇪🇸🇫🇷🇧🇷🇩🇪🇮🇹🇳🇱🇿🇦🇿🇦🇰🇪🇳🇬🇳🇬🇳🇬🇪🇹🇸🇦🇮🇳🇮🇳🇮🇳🇵🇭🇮🇩🇲🇾🇨🇳🇰🇷🇯🇵🇷🇺🇺🇦🇷🇴🇵🇱🇼🇸🇫🇯🇵🇬🇳🇿🇹🇴🇻🇺🌊🇦🇺
          </p>
        </section>
