"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PACKS = [
  {
    id: "starter",
    name: "Starter",
    credits: 25,
    price: "$5 AUD",
    priceNum: 5,
    color: "#10b981",
    icon: "🌱",
    desc: "Perfect for occasional preachers and lay ministers",
    sermons: { beginner: 25, intermediate: 12, advanced: 8 },
  },
  {
    id: "ministry",
    name: "Ministry",
    credits: 75,
    price: "$12 AUD",
    priceNum: 12,
    color: "#3b82f6",
    icon: "📖",
    desc: "Ideal for weekly pastors and youth leaders",
    sermons: { beginner: 75, intermediate: 37, advanced: 25 },
    popular: true,
  },
  {
    id: "evangelist",
    name: "Evangelist",
    credits: 200,
    price: "$25 AUD",
    priceNum: 25,
    color: "#f59e0b",
    icon: "🌍",
    desc: "For church planters, missionaries, and active ministers",
    sermons: { beginner: 200, intermediate: 100, advanced: 66 },
  },
  {
    id: "church",
    name: "Church",
    credits: 500,
    price: "$55 AUD",
    priceNum: 55,
    color: "#8b5cf6",
    icon: "⛪",
    desc: "Multiple ministers, church staff teams",
    sermons: { beginner: 500, intermediate: 250, advanced: 166 },
  },
];

const CREDIT_COSTS = { beginner: 1, intermediate: 2, advanced: 3 };

function CreditsInner() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [credits, setCredits] = useState<{ balance: number; total_purchased: number; total_used: number; is_free_tier: boolean } | null>(null);
  const [transactions, setTransactions] = useState<{ type: string; amount: number; description: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      setUser(data.session.user);

      // Load credits
      const res = await fetch("/api/credits/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: data.session.user.id }),
      });
      const cData = await res.json();
      if (cData.credits) setCredits(cData.credits);

      setLoading(false);
    });
  }, [router]);

  const purchase = async (packId: string) => {
    if (!user) return;
    setPurchasing(packId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack_id: packId, user_id: user.id, user_email: user.email }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setPurchasing(null);
      alert("Could not start checkout. Please try again.");
    }
  };

  const applyPromo = () => {
    const codes: Record<string, number> = {
      "MISSION50": 50,
      "PASTOR2024": 20,
      "FIRSTNATIONS": 30,
    };
    const upper = promoCode.toUpperCase().trim();
    if (codes[upper]) {
      setPromoMsg(`✓ Code applied — ${codes[upper]} bonus credits will be added on purchase.`);
    } else {
      setPromoMsg("Invalid code. Please check and try again.");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#f59e0b" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a05", color: "#fef3c7", paddingBottom: "60px" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, background: "rgba(15,10,5,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(245,158,11,0.08)", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 50 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "16px" }}>✝</span>
          <span style={{ color: "#f59e0b", fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 600 }}>The Pastors Helper</span>
        </Link>
        <Link href="/dashboard" style={{ color: "#a8956e", fontSize: "13px", textDecoration: "none" }}>← Dashboard</Link>
      </header>

      <main style={{ padding: "24px 20px", maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        {/* Success / cancelled messages */}
        {success && (
          <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", marginBottom: "20px" }}>
            <p style={{ color: "#4ade80", fontWeight: 600, marginBottom: "4px" }}>✓ Payment successful!</p>
            <p style={{ color: "#78716c", fontSize: "13px" }}>Your credits have been added. Happy preaching!</p>
          </div>
        )}
        {cancelled && (
          <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "20px" }}>
            <p style={{ color: "#f87171", fontSize: "14px" }}>Payment cancelled — no charge was made.</p>
          </div>
        )}

        {/* Current balance */}
        <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "14px", padding: "24px", marginBottom: "24px" }}>
          <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>Your Credit Balance</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
            <p style={{ color: "#f59e0b", fontSize: "52px", fontWeight: 700, lineHeight: 1, fontFamily: "Georgia, serif" }}>
              {credits?.balance ?? 0}
            </p>
            <p style={{ color: "#78716c", fontSize: "14px", paddingBottom: "8px" }}>credits remaining</p>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Total Purchased", value: credits?.total_purchased ?? 0 },
              { label: "Total Used", value: credits?.total_used ?? 0 },
              { label: "Plan", value: credits?.is_free_tier ? "Free Tier" : "Credit User" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ color: "#57534e", fontSize: "11px", marginBottom: "2px" }}>{s.label}</p>
                <p style={{ color: "#fef3c7", fontSize: "14px", fontWeight: 500 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {credits?.is_free_tier && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
              <p style={{ color: "#a8956e", fontSize: "12px" }}>
                🌱 Free tier — 10 credits added on the 1st of each month. Upgrade anytime with a credit pack below.
              </p>
            </div>
          )}
        </div>

        {/* Credit costs explained */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "18px", marginBottom: "24px" }}>
          <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Credit Cost Per Sermon</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {Object.entries(CREDIT_COSTS).map(([level, cost]) => (
              <div key={level} style={{ flex: 1, minWidth: "100px", padding: "12px", borderRadius: "8px", background: "rgba(245,158,11,0.04)", textAlign: "center" }}>
                <p style={{ color: "#f59e0b", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>{cost}</p>
                <p style={{ color: "#fef3c7", fontSize: "13px", fontWeight: 500, textTransform: "capitalize", marginBottom: "2px" }}>{level}</p>
                <p style={{ color: "#57534e", fontSize: "11px" }}>credit{cost > 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
          <p style={{ color: "#57534e", fontSize: "12px", marginTop: "12px" }}>
            All 33+ languages included at no extra cost. ✝
          </p>
        </div>

        {/* Credit packs */}
        <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Top Up Your Credits</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {PACKS.map((pack) => (
            <div key={pack.id} style={{ position: "relative", background: pack.popular ? `${pack.color}08` : "rgba(255,255,255,0.02)", border: `1px solid ${pack.popular ? `${pack.color}40` : "rgba(245,158,11,0.08)"}`, borderRadius: "14px", padding: "20px" }}>
              {pack.popular && (
                <div style={{ position: "absolute", top: "-10px", left: "20px", padding: "2px 12px", borderRadius: "10px", background: pack.color, color: "#fff", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "20px" }}>{pack.icon}</span>
                    <div>
                      <p style={{ color: "#fef3c7", fontSize: "16px", fontWeight: 600, fontFamily: "Georgia, serif" }}>{pack.name} Pack</p>
                      <p style={{ color: pack.color, fontSize: "13px", fontWeight: 700 }}>{pack.credits} credits · {pack.price}</p>
                    </div>
                  </div>
                  <p style={{ color: "#78716c", fontSize: "13px", marginBottom: "10px" }}>{pack.desc}</p>

                  {/* Sermon equivalents */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.entries(pack.sermons).map(([level, count]) => (
                      <span key={level} style={{ padding: "3px 10px", borderRadius: "12px", background: "rgba(245,158,11,0.06)", color: "#a8956e", fontSize: "11px" }}>
                        {count} {level} sermons
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => purchase(pack.id)}
                  disabled={purchasing === pack.id}
                  style={{ flexShrink: 0, padding: "12px 20px", borderRadius: "10px", border: "none", background: pack.popular ? pack.color : `${pack.color}20`, color: pack.popular ? "#fff" : pack.color, fontWeight: 700, fontSize: "14px", cursor: purchasing ? "not-allowed" : "pointer", opacity: purchasing === pack.id ? 0.7 : 1, minWidth: "100px" }}
                >
                  {purchasing === pack.id ? "..." : `Buy ${pack.price.split(" ")[0]}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.08)", borderRadius: "12px", padding: "18px", marginBottom: "24px" }}>
          <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>Missionary / Ministry Code</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter your code"
              style={{ flex: 1, padding: "11px 14px", borderRadius: "8px", fontSize: "14px", letterSpacing: "1px" }}
            />
            <button onClick={applyPromo} style={{ padding: "11px 20px", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.3)", background: "transparent", color: "#f59e0b", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
              Apply
            </button>
          </div>
          {promoMsg && (
            <p style={{ color: promoMsg.startsWith("✓") ? "#4ade80" : "#f87171", fontSize: "13px", marginTop: "10px" }}>{promoMsg}</p>
          )}
        </div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <div>
            <p style={{ color: "#a8956e", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Transaction History</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {transactions.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                  <div>
                    <p style={{ color: "#fef3c7", fontSize: "13px" }}>{t.description}</p>
                    <p style={{ color: "#57534e", fontSize: "11px" }}>{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <p style={{ color: t.amount > 0 ? "#4ade80" : "#f87171", fontSize: "14px", fontWeight: 600 }}>
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div style={{ marginTop: "24px", padding: "14px 18px", borderRadius: "10px", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.08)" }}>
          <p style={{ color: "#57534e", fontSize: "12px", lineHeight: 1.7 }}>
            Credits never expire. Free tier users receive 10 credits on the 1st of every month.
            Purchased credits carry over indefinitely. All languages included at no extra cost. ✝
          </p>
        </div>
      </main>
    </div>
  );
}

function CreditsContent() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#f59e0b" }}>Loading...</p>
      </div>
    }>
      <CreditsInner />
    </Suspense>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0f0a05", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#f59e0b" }}>Loading...</p>
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
