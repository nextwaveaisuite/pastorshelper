"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"detect"|"login"|"signup">("detect");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user?.id) router.replace("/dashboard");
    }).catch(() => {});
  }, [router]);

  const checkEmail = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email."); return; }
    setChecking(true); setError("");
    try {
      const res = await fetch("/api/auth/check-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase() }) });
      const data = await res.json();
      setMode(data.exists ? "login" : "signup");
    } catch { setError("Something went wrong. Please try again."); }
    setChecking(false);
  };

  const handleSubmit = async () => {
    if (!password) { setError("Please enter a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (mode === "signup" && password !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "EMAIL_EXISTS") setError("An account with this email already exists. Please sign in.");
        else if (data.error === "NO_ACCOUNT") setError("No account found. Please sign up.");
        else if (data.error === "WRONG_PASSWORD") setError("Incorrect password. Please try again.");
        else setError(data.error || "Something went wrong. Please try again.");
      } else {
        router.replace("/dashboard");
      }
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const reset = () => { setMode("detect"); setPassword(""); setConfirmPassword(""); setError(""); };

  return (
    <main style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,158,11,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px", textDecoration: "none", position: "relative", zIndex: 10 }}>
        <span style={{ fontSize: "22px" }}>✝</span>
        <span style={{ color: "#f59e0b", fontSize: "18px", fontFamily: "Georgia, serif" }}>The Pastors Helper</span>
      </Link>

      <div style={{ width: "100%", maxWidth: "420px", padding: "36px 28px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.12)", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", color: "#fef3c7", fontFamily: "Georgia, serif", marginBottom: "6px" }}>
            {mode === "signup" ? "Create Your Account" : mode === "login" ? "Welcome Back" : "Get Started"}
          </h1>
          <p style={{ color: "#57534e", fontSize: "13px" }}>
            {mode === "signup" ? "Join pastors and ministers worldwide" : mode === "login" ? "Sign in to your account" : "Enter your email to continue"}
          </p>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" as const }}>Email Address</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (mode !== "detect") reset(); }} onKeyDown={e => e.key === "Enter" && mode === "detect" && checkEmail()} placeholder="pastor@yourchurch.com" disabled={mode !== "detect"}
              style={{ flex: 1, padding: "13px 14px", fontSize: "15px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none", opacity: mode !== "detect" ? 0.75 : 1 }} autoFocus />
            {mode !== "detect" && <button onClick={reset} style={{ padding: "0 12px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(245,158,11,0.15)", color: "#57534e", cursor: "pointer", fontSize: "14px" }}>✕</button>}
          </div>
        </div>

        {mode === "detect" && (
          <button onClick={checkEmail} disabled={checking} style={{ width: "100%", padding: "14px", borderRadius: "8px", fontSize: "15px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, border: "none", cursor: checking ? "not-allowed" : "pointer", opacity: checking ? 0.7 : 1, marginBottom: "8px" }}>
            {checking ? "Checking..." : "Continue →"}
          </button>
        )}

        {(mode === "login" || mode === "signup") && (
          <>
            <div style={{ padding: "8px 14px", borderRadius: "8px", background: mode === "signup" ? "rgba(74,222,128,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${mode === "signup" ? "rgba(74,222,128,0.2)" : "rgba(245,158,11,0.2)"}`, marginBottom: "16px" }}>
              <p style={{ color: mode === "signup" ? "#4ade80" : "#f59e0b", fontSize: "13px" }}>
                {mode === "signup" ? "✦ New account — create your password below" : "✦ Welcome back — enter your password"}
              </p>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" as const }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && mode === "login" && handleSubmit()} placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Enter your password"}
                style={{ width: "100%", padding: "13px 14px", fontSize: "15px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none" }} autoFocus />
            </div>
            {mode === "signup" && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", color: "#a8956e", fontSize: "11px", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" as const }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Repeat your password"
                  style={{ width: "100%", padding: "13px 14px", fontSize: "15px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.2)", color: "#fef3c7", outline: "none" }} />
              </div>
            )}
            {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "14px" }}><p style={{ color: "#f87171", fontSize: "13px" }}>{error}</p></div>}
            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "8px", fontSize: "16px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0f0a05", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : mode === "signup" ? "Create Account →" : "Sign In →"}
            </button>
          </>
        )}

        {mode === "detect" && error && <p style={{ color: "#f87171", fontSize: "13px", marginTop: "8px", textAlign: "center" }}>{error}</p>}
        <p style={{ textAlign: "center", color: "#3d3326", fontSize: "12px", marginTop: "20px", lineHeight: 1.6 }}>Your sermons and prayers are saved privately and securely.</p>
      </div>

      <p style={{ marginTop: "28px", color: "#3d3326", fontSize: "12px", fontStyle: "italic", fontFamily: "Georgia, serif", textAlign: "center", position: "relative", zIndex: 10 }}>
        &ldquo;Study to shew thyself approved unto God.&rdquo; — 2 Timothy 2:15
      </p>
    </main>
  );
}
