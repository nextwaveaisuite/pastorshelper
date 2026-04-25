"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // If already logged in, go to dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

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
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
      // Optionally send welcome email via our API
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "welcome" }),
      }).catch(() => {});
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0a05",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "48px",
          textDecoration: "none",
          position: "relative",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "24px" }}>✝</span>
        <span
          className="font-serif"
          style={{ color: "#f59e0b", fontSize: "20px" }}
        >
          The Pastors Helper
        </span>
      </Link>

      {/* Card */}
      <div
        className="glass animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "48px 40px",
          borderRadius: "16px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {!sent ? (
          <>
            <h1
              className="font-serif"
              style={{
                fontSize: "28px",
                color: "#fef3c7",
                marginBottom: "8px",
                textAlign: "center",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                color: "#78716c",
                textAlign: "center",
                marginBottom: "40px",
                fontSize: "14px",
              }}
            >
              Enter your email — we&apos;ll send a magic link
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  color: "#a8956e",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="pastor@yourchurch.com"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "15px",
                  borderRadius: "8px",
                }}
                autoFocus
              />
            </div>

            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-gold"
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "8px",
                fontSize: "15px",
                marginBottom: "24px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Sending..." : "Send Magic Link →"}
            </button>

            <p
              style={{
                textAlign: "center",
                color: "#57534e",
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              No password required. New users get an account automatically.
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>✉️</div>
            <h2
              className="font-serif"
              style={{
                fontSize: "24px",
                color: "#fef3c7",
                marginBottom: "12px",
              }}
            >
              Check Your Email
            </h2>
            <p
              style={{ color: "#a8956e", lineHeight: 1.7, fontSize: "15px" }}
            >
              We sent a magic link to{" "}
              <span style={{ color: "#f59e0b" }}>{email}</span>. Click it to
              sign in.
            </p>
            <p
              style={{
                color: "#57534e",
                marginTop: "24px",
                fontSize: "13px",
              }}
            >
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f59e0b",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                try again
              </button>
              .
            </p>
          </div>
        )}
      </div>

      <p
        style={{
          marginTop: "32px",
          color: "#57534e",
          fontSize: "12px",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          position: "relative",
          zIndex: 10,
        }}
      >
        &ldquo;Draw near to God, and he will draw near to you.&rdquo; — James 4:8
      </p>
    </main>
  );
}
