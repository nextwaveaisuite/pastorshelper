"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Handle magic link callback — Supabase puts tokens in the URL hash
    const handleSession = async () => {
      // Give Supabase a moment to process the hash
      await new Promise((r) => setTimeout(r, 300));

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      // Try exchanging code if present in URL (PKCE flow)
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);

        if (hash.includes("access_token") || params.get("code")) {
          // Let Supabase handle it automatically
          await new Promise((r) => setTimeout(r, 800));
          const { data: refreshed } = await supabase.auth.getSession();
          if (refreshed.session) {
            router.replace("/dashboard");
            return;
          }
        }
      }

      setChecking(false);
    };

    handleSession();
  }, [router]);

  const OWNER = "chnomg@gmail.com";

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: "https://thepastorshelper.com/dashboard",
      },
    });

    setLoading(false);

    if (authError) {
      // Owner bypass — if rate limited, show special message
      if (email.trim() === OWNER) {
        setError("Rate limited — please check your existing session or wait 60 seconds and try again.");
      } else {
        setError(authError.message);
      }
    } else {
      setSent(true);
    }
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#f59e0b", fontFamily: "Georgia, serif", fontSize: "16px", marginBottom: "8px" }}>Signing you in...</p>
        <p style={{ color: "#57534e", fontSize: "13px" }}>Please wait</p>
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px", textDecoration: "none", position: "relative", zIndex: 10 }}>
        <span style={{ fontSize: "22px" }}>✝</span>
        <span className="font-serif" style={{ color: "#f59e0b", fontSize: "18px" }}>The Pastors Helper</span>
      </Link>

      <div className="glass animate-slide-up" style={{ width: "100%", maxWidth: "400px", padding: "36px 28px", borderRadius: "16px", position: "relative", zIndex: 10 }}>
        {!sent ? (
          <>
            <h1 className="font-serif" style={{ fontSize: "26px", color: "#fef3c7", marginBottom: "8px", textAlign: "center" }}>Welcome Back</h1>
            <p style={{ color: "#78716c", textAlign: "center", marginBottom: "32px", fontSize: "14px" }}>Enter your email — we&apos;ll send a magic link</p>

            <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" as const }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="pastor@yourchurch.com"
              style={{ width: "100%", padding: "14px 16px", fontSize: "16px", borderRadius: "8px", marginBottom: "8px" }}
              autoFocus
            />
            {error && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

            <button onClick={handleLogin} disabled={loading} className="btn-gold" style={{ width: "100%", padding: "15px", borderRadius: "8px", fontSize: "16px", marginTop: "8px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Sending..." : "Send Magic Link →"}
            </button>

            <p style={{ textAlign: "center", color: "#57534e", fontSize: "12px", marginTop: "20px", lineHeight: 1.6 }}>
              No password required. New users get an account automatically.
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉️</div>
            <h2 className="font-serif" style={{ fontSize: "22px", color: "#fef3c7", marginBottom: "12px" }}>Check Your Email</h2>
            <p style={{ color: "#a8956e", lineHeight: 1.7, fontSize: "15px" }}>
              We sent a magic link to <span style={{ color: "#f59e0b" }}>{email}</span>. Click it to sign in.
            </p>
            <p style={{ color: "#57534e", marginTop: "20px", fontSize: "13px" }}>
              Didn&apos;t receive it?{" "}
              <button onClick={() => setSent(false)} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontSize: "13px" }}>try again</button>
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: "28px", color: "#57534e", fontSize: "12px", fontStyle: "italic", fontFamily: "Georgia, serif", textAlign: "center", position: "relative", zIndex: 10 }}>
        &ldquo;Draw near to God, and he will draw near to you.&rdquo; — James 4:8
      </p>
    </main>
  );
}
