import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level, language } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const targetLanguage = language || "English";

  const levelInstructions: Record<string, string> = {
    beginner:     "Beginner level — simple everyday words, no jargon, short relatable sentences, one clear idea per point. Perfect for new believers and new pastors.",
    intermediate: "Intermediate level — include historical context, reference original word meanings simply, connect Old and New Testament. For growing believers.",
    advanced:     "Advanced level — use theological precision, include one key Greek or Hebrew word insight per point, make cross-testament connections. For mature ministers.",
  };

  const levelText = levelInstructions[level || "beginner"];
  // Special handling for Pacific/Islander varieties
  const languageStyleMap: Record<string, string> = {
    "Bislama": "Bislama — the Creole language of Vanuatu. Use simple Bislama phrases and structure where possible, mixing with English where needed.",
    "South Sea Islander": "South Sea Islander English — warm, community-focused, deeply faith-rooted language style used by South Sea Islander communities in Australia and the Pacific. Simple, heartfelt, communal tone.",
    "Pacific Islander English": "Pacific Islander English — warm, storytelling style, deeply rooted in faith and community. Use accessible English with Pacific cultural references, communal values, and family-centred illustrations.",
  };

  const langInstruction = targetLanguage !== "English"
    ? languageStyleMap[targetLanguage]
      ? `\n${languageStyleMap[targetLanguage]}`
      : `\nWrite ALL sermon content in ${targetLanguage}. Scripture references stay in standard format (e.g. John 3:16) but all other content must be in ${targetLanguage}.`
    : "";

  const systemPrompt = `You are a Spirit-led sermon builder. Output ONLY valid JSON — no markdown, no backticks, no explanation. Start with { and end with }. CRITICAL: Every single field in the JSON must be completed. Never stop generating before the closing brace. Keep every field to exactly 1-2 sentences so the full sermon fits within the response.`;

  const userPrompt = `Create a unique Spirit-led sermon on: "${topic}"
Audience: ${audience} | Tone: ${tone} | ${levelText}${langInstruction}

IMPORTANT: Keep EVERY field to 1-2 SHORT sentences. This ensures all sections complete fully.

Return this complete JSON — all fields required, none can be empty:

{
  "title": "sermon title",
  "alternativeTitles": ["alt 1", "alt 2"],
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "KJV verse text",
    "nkjv": "NKJV verse text"
  },
  "theme": "one sentence core theme",
  "opening": {
    "greeting": "1 sentence greeting",
    "hook": "1 sentence relatable hook"
  },
  "foundation": {
    "context": "1-2 sentences context",
    "breakdown": "1-2 sentences breakdown"
  },
  "foreword": {
    "whyItMatters": "1-2 sentences",
    "relatable": "1-2 sentences illustration"
  },
  "teachingPoints": [
    {
      "title": "Point 1 title",
      "scripture": "scripture ref — verse text",
      "explanation": "1-2 sentences explanation",
      "application": "1 sentence application"
    },
    {
      "title": "Point 2 title",
      "scripture": "scripture ref — verse text",
      "explanation": "1-2 sentences explanation",
      "application": "1 sentence application"
    },
    {
      "title": "Point 3 title",
      "scripture": "scripture ref — verse text",
      "explanation": "1-2 sentences explanation",
      "application": "1 sentence application"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "1 sentence prophetic word",
    "impartation": "1 sentence activation",
    "edification": "1 sentence encouragement",
    "slowDown": "1 sentence reflective pause",
    "returnToAnchor": "1 sentence return to anchor scripture"
  },
  "summary": {
    "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
  },
  "altarCall": {
    "invitation": "1-2 sentences invitation",
    "prayer": "1-2 sentences guided prayer"
  },
  "closingPrayer": "1-2 sentences closing blessing"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1800,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      let userError = "Generation failed — please try again.";
      if (response.status === 429 || errText.includes("usage_exceeded") || errText.includes("rate_limit")) {
        userError = "API usage limit reached. Please wait a moment and try again.";
      } else if (response.status === 401) {
        userError = "API key error — please contact support.";
      } else if (response.status === 402) {
        userError = "API billing issue — please contact support.";
      }
      return NextResponse.json({ error: userError }, { status: 500 });
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    console.log("Raw length:", rawText.length);
    console.log("Stop reason:", data.stop_reason);
    console.log("First 80:", rawText.slice(0, 80));
    console.log("Last 80:", rawText.slice(-80));

    // Clean markdown fences
    let cleaned = rawText
      .replace(/^```json\s*/gi, "")
      .replace(/^```\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();

    const start = cleaned.indexOf("{");
    if (start === -1) {
      console.error("No opening brace. Raw:", rawText.slice(0, 400));
      return NextResponse.json(
        { error: "No sermon content returned. Please try again." },
        { status: 500 }
      );
    }

    const end = cleaned.lastIndexOf("}");
    let jsonString = end > start
      ? cleaned.slice(start, end + 1)
      : cleaned.slice(start);

    // Attempt parse
    let sermon: Record<string, unknown> | null = null;

    try {
      sermon = JSON.parse(jsonString);
    } catch {
      // Repair truncated JSON
      console.warn("Parse failed — repairing JSON");
      const repaired = repairJson(jsonString);
      try {
        sermon = JSON.parse(repaired);
        console.log("Repair succeeded");
      } catch {
        console.error("Repair failed. JSON:", jsonString.slice(0, 800));
        return NextResponse.json(
          { error: "Sermon could not be read. Please try again." },
          { status: 500 }
        );
      }
    }

    if (!sermon) {
      return NextResponse.json(
        { error: "Empty sermon returned. Please try again." },
        { status: 500 }
      );
    }

    // Fill any missing sections with fallbacks so nothing renders empty
    sermon.title = sermon.title || topic;
    sermon.alternativeTitles = (sermon.alternativeTitles as unknown[]) || [];
    sermon.theme = sermon.theme || "";

    const mf = (sermon.ministryFlow as Record<string, string>) || {};
    sermon.ministryFlow = {
      giftOfKnowledge: mf.giftOfKnowledge || "The Spirit is moving — receive what God has for you right now.",
      impartation:     mf.impartation     || "Receive fresh fire and anointing for your calling.",
      edification:     mf.edification     || "You are loved, chosen, and equipped by God for this season.",
      slowDown:        mf.slowDown        || "Take a moment — let the Word settle deep in your spirit.",
      returnToAnchor:  mf.returnToAnchor  || `Return to the anchor — this is what God says about ${topic}.`,
    };

    const sum = (sermon.summary as Record<string, unknown>) || {};
    sermon.summary = {
      keyTakeaways: (sum.keyTakeaways as string[]) || [
        `God's Word on ${topic} is alive and active today.`,
        "What you received today is meant to be lived, not just heard.",
        "Take one step of faith this week based on this message.",
      ],
    };

    const ac = (sermon.altarCall as Record<string, string>) || {};
    sermon.altarCall = {
      invitation: ac.invitation || "If this Word has touched your heart today, respond to God right now.",
      prayer:     ac.prayer     || "Lord, I receive Your Word into my heart. Transform me by Your truth. In Jesus' name, Amen.",
    };

    sermon.closingPrayer = (sermon.closingPrayer as string) ||
      "May the God of peace sanctify you wholly — spirit, soul, and body — until the coming of our Lord Jesus Christ. Amen.";

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

function repairJson(str: string): string {
  let result = str.replace(/,\s*$/, "");
  let braces = 0, brackets = 0;
  let inString = false, escape = false;

  for (const ch of result) {
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") braces++;
    if (ch === "}") braces--;
    if (ch === "[") brackets++;
    if (ch === "]") brackets--;
  }

  if (inString) result += '"';
  for (let i = 0; i < brackets; i++) result += "]";
  for (let i = 0; i < braces; i++) result += "}";

  return result;
}
