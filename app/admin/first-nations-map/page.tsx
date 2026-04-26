"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "chnomg@gmail.com";

type LanguagePin = {
  code: string;
  name: string;
  region: string;
  description: string;
  speakers: string;
  christianPresence: string;
  lat: number;
  lng: number;
  color: string;
};

const LANGUAGE_PINS: LanguagePin[] = [
  {
    code: "Pitjantjatjara",
    name: "Pitjantjatjara / Yankunytjatjara",
    region: "South Australia / NT / WA",
    description: "One of the largest Aboriginal language groups. The Bible has been translated into Pitjantjatjara. Strong Christian communities exist at Ernabella (Pukatja) and across the APY Lands.",
    speakers: "~3,000 speakers",
    christianPresence: "Strong — churches across APY Lands, Bible translated",
    lat: -27.5,
    lng: 132.0,
    color: "#f59e0b",
  },
  {
    code: "Kriol",
    name: "Kriol",
    region: "Northern Australia — NT, WA, QLD",
    description: "The most widely spoken Aboriginal language in Australia. An English-based Creole that developed on cattle stations across the north. Widely used in church ministry across remote communities.",
    speakers: "~20,000+ speakers",
    christianPresence: "Very strong — most widely used language for northern Aboriginal ministry",
    lat: -14.5,
    lng: 132.5,
    color: "#10b981",
  },
  {
    code: "Aboriginal English",
    name: "Aboriginal English",
    region: "Across Australia",
    description: "A distinct dialect of English spoken by Aboriginal Australians across the country. Differs from standard Australian English in vocabulary, grammar, and cultural expression. The most accessible variety for pan-Australian ministry.",
    speakers: "Hundreds of thousands",
    christianPresence: "Universal — spans all communities and regions",
    lat: -25.0,
    lng: 135.0,
    color: "#3b82f6",
  },
  {
    code: "Warlpiri",
    name: "Warlpiri",
    region: "Central NT — Yuendumu, Lajamanu",
    description: "One of the largest traditional language groups in the NT. Active Christian communities at Yuendumu and Lajamanu. Some Scripture portions translated.",
    speakers: "~2,500 speakers",
    christianPresence: "Active churches at Yuendumu and Lajamanu",
    lat: -19.9,
    lng: 131.8,
    color: "#8b5cf6",
  },
  {
    code: "Arrernte",
    name: "Arrernte (Eastern)",
    region: "Alice Springs region, NT",
    description: "The language of the Alice Springs region. One of the most documented Aboriginal languages. Strong church presence in and around Alice Springs.",
    speakers: "~1,700 speakers",
    christianPresence: "Strong — Alice Springs has significant Aboriginal church ministry",
    lat: -23.7,
    lng: 133.9,
    color: "#ef4444",
  },
  {
    code: "Yolngu Matha",
    name: "Yolŋu Matha",
    region: "Arnhem Land, NT",
    description: "A group of related languages spoken across northeast Arnhem Land. The Yolŋu people have a strong Christian heritage through early Methodist missions at Yirrkala and Galiwin'ku (Elcho Island).",
    speakers: "~6,000 speakers",
    christianPresence: "Very strong — deep revival history at Elcho Island (1979)",
    lat: -12.2,
    lng: 136.5,
    color: "#f97316",
  },
  {
    code: "Tiwi",
    name: "Tiwi",
    region: "Tiwi Islands, NT",
    description: "Spoken on Bathurst and Melville Islands north of Darwin. Catholic mission history since 1911. Strong community identity and active faith expression.",
    speakers: "~2,000 speakers",
    christianPresence: "Strong Catholic tradition — active on Bathurst and Melville Islands",
    lat: -11.4,
    lng: 130.9,
    color: "#ec4899",
  },
  {
    code: "Murrinh-Patha",
    name: "Murrinh-Patha",
    region: "Wadeye (Port Keats), NT",
    description: "Spoken at Wadeye in the NT — the largest remote Aboriginal community in Australia. Strong Catholic presence since early mission days.",
    speakers: "~2,000 speakers",
    christianPresence: "Strong — Catholic mission community at Wadeye",
    lat: -14.2,
    lng: 129.5,
    color: "#06b6d4",
  },
];

export default function FirstNationsMapPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LanguagePin | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace("/login"); return; }
      if (data.session.user.email === ADMIN_EMAIL) {
        setAuthed(true);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#f59e0b" }}>Loading...</p>
    </div>
  );

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#0a0704", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#f87171" }}>Access Denied</p>
    </div>
  );

  // Convert lat/lng to SVG coordinates for Australia bounding box
  // Australia bounds: lat -10 to -44, lng 113 to 154
  const toSVG = (lat: number, lng: number) => {
    const svgW = 800;
    const svgH = 560;
    const minLng = 113, maxLng = 154;
    const minLat = -44,  maxLat = -10;
    const x = ((lng - minLng) / (maxLng - minLng)) * svgW;
    const y = ((maxLat - lat)  / (maxLat - minLat)) * svgH;
    return { x, y };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0704", color: "#fef3c7" }}>
      {/* Header */}
      <header style={{ background: "rgba(15,10,5,0.98)", borderBottom: "1px solid rgba(245,158,11,0.1)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontSize: "16px" }}>←</button>
          <span style={{ fontSize: "16px" }}>🪃</span>
          <div>
            <p style={{ color: "#f59e0b", fontSize: "14px", fontWeight: 600 }}>First Nations Ministry</p>
            <p style={{ color: "#57534e", fontSize: "11px" }}>Language & Country Map — 🔒 Admin Only</p>
          </div>
        </div>
        <button onClick={() => router.push("/admin")} style={{ padding: "7px 14px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "transparent", color: "#a8956e", cursor: "pointer", fontSize: "12px" }}>
          Admin Console
        </button>
      </header>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: "1000px", margin: "0 auto", padding: "24px 20px" }}>

        <p style={{ color: "#78716c", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
          Tap a language pin to see details about the community, speaker population, and Christian presence in that region.
        </p>

        {/* Map container */}
        <div style={{ position: "relative", background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: "14px", overflow: "hidden", marginBottom: "20px" }}>
          <svg
            viewBox="0 0 800 560"
            style={{ width: "100%", display: "block" }}
          >
            {/* Australia outline — simplified path */}
            <path
              d="M 180,60 L 220,45 L 280,48 L 340,40 L 400,38 L 460,42 L 510,55 L 550,65 L 580,80 L 600,100 L 610,125 L 620,150 L 625,175 L 630,200 L 625,225 L 615,250 L 605,270 L 600,290 L 595,310 L 580,330 L 560,345 L 545,355 L 530,370 L 515,385 L 500,400 L 480,415 L 460,425 L 445,435 L 425,445 L 405,450 L 385,448 L 368,440 L 355,430 L 340,418 L 325,405 L 310,390 L 295,378 L 280,370 L 265,360 L 248,348 L 235,335 L 222,320 L 210,305 L 198,288 L 185,270 L 172,250 L 162,228 L 155,205 L 150,180 L 148,155 L 150,130 L 155,108 L 163,88 L 175,72 Z"
              fill="rgba(245,158,11,0.06)"
              stroke="rgba(245,158,11,0.25)"
              strokeWidth="1.5"
            />

            {/* Tasmania */}
            <path
              d="M 440,460 L 455,458 L 465,465 L 468,478 L 460,488 L 448,490 L 438,482 L 435,470 Z"
              fill="rgba(245,158,11,0.06)"
              stroke="rgba(245,158,11,0.2)"
              strokeWidth="1"
            />

            {/* State border lines — approximate */}
            {/* NT/QLD border ~138°E */}
            <line x1="487" y1="40" x2="487" y2="340" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            {/* SA/NSW/VIC ~141°E */}
            <line x1="536" y1="200" x2="536" y2="420" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            {/* WA/SA border ~129°E */}
            <line x1="390" y1="45" x2="390" y2="390" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="4,4" />
            {/* NT top horizontal */}
            <line x1="390" y1="195" x2="487" y2="195" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="4,4" />

            {/* State labels */}
            <text x="250" y="200" fill="rgba(245,158,11,0.18)" fontSize="13" fontFamily="Georgia, serif">WA</text>
            <text x="420" y="170" fill="rgba(245,158,11,0.18)" fontSize="13" fontFamily="Georgia, serif">NT</text>
            <text x="415" y="290" fill="rgba(245,158,11,0.18)" fontSize="13" fontFamily="Georgia, serif">SA</text>
            <text x="515" y="200" fill="rgba(245,158,11,0.18)" fontSize="13" fontFamily="Georgia, serif">QLD</text>
            <text x="540" y="340" fill="rgba(245,158,11,0.18)" fontSize="11" fontFamily="Georgia, serif">NSW</text>
            <text x="510" y="400" fill="rgba(245,158,11,0.18)" fontSize="11" fontFamily="Georgia, serif">VIC</text>

            {/* Language pins */}
            {LANGUAGE_PINS.map((pin) => {
              const { x, y } = toSVG(pin.lat, pin.lng);
              const isSelected = selected?.code === pin.code;
              return (
                <g key={pin.code} onClick={() => setSelected(isSelected ? null : pin)} style={{ cursor: "pointer" }}>
                  {/* Pulse ring when selected */}
                  {isSelected && (
                    <circle cx={x} cy={y} r="20" fill="none" stroke={pin.color} strokeWidth="2" opacity="0.4" />
                  )}
                  {/* Pin circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "10" : "8"}
                    fill={pin.color}
                    opacity={isSelected ? 1 : 0.85}
                  />
                  {/* Pin dot */}
                  <circle cx={x} cy={y} r="3" fill="white" opacity="0.9" />
                  {/* Label */}
                  <text
                    x={x + 13}
                    y={y + 4}
                    fill={isSelected ? pin.color : "#a8956e"}
                    fontSize="10"
                    fontFamily="Georgia, serif"
                    fontWeight={isSelected ? "bold" : "normal"}
                  >
                    {pin.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          {LANGUAGE_PINS.map((pin) => (
            <button
              key={pin.code}
              onClick={() => setSelected(selected?.code === pin.code ? null : pin)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 12px", borderRadius: "20px", border: "1px solid", borderColor: selected?.code === pin.code ? pin.color : "rgba(245,158,11,0.1)", background: selected?.code === pin.code ? `${pin.color}18` : "transparent", cursor: "pointer" }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: pin.color, flexShrink: 0 }} />
              <span style={{ color: selected?.code === pin.code ? pin.color : "#78716c", fontSize: "12px" }}>{pin.name.split(" /")[0]}</span>
            </button>
          ))}
        </div>

        {/* Info panel */}
        {selected && (
          <div style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}30`, borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: selected.color, marginBottom: "4px" }}>{selected.name}</h2>
                <p style={{ color: "#78716c", fontSize: "12px" }}>📍 {selected.region}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#57534e", cursor: "pointer", fontSize: "18px" }}>✕</button>
            </div>

            <p style={{ color: "#fef3c7", fontSize: "14px", lineHeight: 1.75, marginBottom: "16px" }}>{selected.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <p style={{ color: "#57534e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Estimated Speakers</p>
                <p style={{ color: "#fef3c7", fontSize: "13px" }}>{selected.speakers}</p>
              </div>
              <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <p style={{ color: "#57534e", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Christian Presence</p>
                <p style={{ color: "#fef3c7", fontSize: "13px" }}>{selected.christianPresence}</p>
              </div>
            </div>

            <button
              onClick={() => { router.push("/dashboard"); }}
              style={{ marginTop: "16px", padding: "10px 20px", borderRadius: "8px", border: `1px solid ${selected.color}50`, background: `${selected.color}15`, color: selected.color, cursor: "pointer", fontSize: "13px", fontWeight: 500 }}
            >
              Build a Sermon in {selected.name.split(" /")[0]} →
            </button>
          </div>
        )}

        {/* Note */}
        <div style={{ padding: "14px 18px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "10px" }}>
          <p style={{ color: "#a78bfa", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>🔒 Ministry Note</p>
          <p style={{ color: "#78716c", fontSize: "13px", lineHeight: 1.6 }}>
            These language options are provided with deep respect for First Nations communities. Always consult with local Elders and community leaders before beginning ministry in a new community. Language is sacred — use it with humility and permission.
          </p>
        </div>
      </div>
    </div>
  );
}
