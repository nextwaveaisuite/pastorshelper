import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level, language } = await req.json();

  const user_id_header = req.headers.get("x-user-id") || "";
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const targetLanguage = language || "English";

  const levelInstructions: Record<string, string> = {
    beginner: `BEGINNER LEVEL — Write for new believers and new pastors.
- Use simple everyday language. No theological jargon.
- Every teaching point MUST include at least 2 scripture references.
- Foundation and Foreword MUST each reference at least 1 scripture.
- Ministry Flow MUST reference the anchor scripture and at least 1 supporting scripture.
- Altar Call MUST include a scripture promise (e.g. Romans 10:9, John 3:16).
- Closing Prayer MUST include a scripture blessing (e.g. Numbers 6:24-26, Ephesians 3:20).
- Use KJV or NKJV scripture text. Format: "Reference — verse text".`,

    intermediate: `INTERMEDIATE LEVEL — Write for growing believers with some Bible knowledge.
- Every teaching point MUST include 2-3 scripture references with verse text quoted.
- Connect Old Testament to New Testament in at least one teaching point.
- Foundation MUST include historical context AND 2 scriptures.
- Ministry Flow MUST weave in 2-3 scriptures organically.
- Include at least one cross-reference that deepens the anchor scripture.
- Altar Call MUST include 2 scripture promises.
- Closing Prayer MUST include a scripture blessing.
- Reference Greek or Hebrew word meaning for at least one key word.`,

    advanced: `ADVANCED LEVEL — Write for mature ministers and theologians.
- Every teaching point MUST include 3-4 scripture references with verse text.
- Each point must show cross-testament connections (OT + NT).
- Include Greek or Hebrew word insights for key terms in each point.
- Foundation MUST be rich with historical, cultural and covenant context plus 3 scriptures.
- Ministry Flow MUST be deeply prophetic and grounded in 3-4 scriptures.
- The Return to Anchor must show how the whole Bible points to this truth.
- Altar Call MUST include 3 scripture promises with verse text.
- Closing Prayer MUST be a scripture-woven blessing (weave actual verses into the prayer).
- Reference at least one typological connection (e.g. OT foreshadowing NT).`,
  };

  const languageStyleMap: Record<string, string> = {
    "Bislama": "Write in Bislama — the Creole language of Vanuatu. Mix Bislama with English where needed.",
    "South Sea Islander": "Write in South Sea Islander English — warm, community-focused, deeply faith-rooted. Simple, heartfelt, communal tone.",
    "Pacific Islander English": "Write in Pacific Islander English — warm storytelling style, communal values, family-centred illustrations.",
    "Pitjantjatjara": "Write in Pitjantjatjara language where possible, mixing with English for scripture references.",
    "Kriol": "Write in Kriol — the Northern Australian Aboriginal Creole. Use Kriol vocabulary and structure.",
    "Aboriginal English": "Write in Aboriginal English — a distinct dialect with unique rhythm, vocabulary and cultural expression.",
  };

  const levelText = levelInstructions[level || "beginner"];
  const langInstruction = targetLanguage !== "English"
    ? languageStyleMap[targetLanguage]
      ? `\nLANGUAGE: ${languageStyleMap[targetLanguage]}`
      : `\nLANGUAGE: Write ALL sermon content in ${targetLanguage}. Scripture references stay in standard format (e.g. John 3:16) but all other text must be in ${targetLanguage}.`
    : "";

  const systemPrompt = `You are a Scripture-rich sermon builder. You output ONLY valid JSON. No markdown, no backticks, no explanation. Start with { and end with }. Every field must be complete. Scripture references must include the actual verse text, not just the reference.`;

  const userPrompt = `Create a unique, Scripture-rich sermon on: "${topic}"
Audience: ${audience} | Tone: ${tone}
${levelText}${langInstruction}

CRITICAL SCRIPTURE RULE: Every section must contain actual scripture verse text, not just references.
Format all scriptures as: "Book Chapter:Verse — verse text here"

Return this complete JSON — ALL fields required:

{
  "title": "compelling sermon title",
  "alternativeTitles": ["alt title 1", "alt title 2"],
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "Full KJV verse text",
    "nkjv": "Full NKJV verse text"
  },
  "theme": "one sentence core revelation rooted in the scripture",
  "opening": {
    "greeting": "warm opening greeting that references the anchor scripture",
    "hook": "relatable hook that connects to the theme with a scripture anchor"
  },
  "foundation": {
    "context": "historical and spiritual context of the scripture with supporting verse",
    "breakdown": "verse-by-verse breakdown with additional scripture cross-reference"
  },
  "foreword": {
    "whyItMatters": "why this message matters today, grounded in a scripture promise",
    "relatable": "relatable illustration that connects back to the scripture"
  },
  "teachingPoints": [
    {
      "title": "Point 1 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — verse text", "Third scripture — verse text"],
      "explanation": "explanation that weaves the scriptures together",
      "application": "practical application grounded in scripture promise"
    },
    {
      "title": "Point 2 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — verse text", "Third scripture — verse text"],
      "explanation": "explanation that weaves the scriptures together",
      "application": "practical application grounded in scripture promise"
    },
    {
      "title": "Point 3 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — verse text", "Third scripture — verse text"],
      "explanation": "explanation that weaves the scriptures together",
      "application": "practical application grounded in scripture promise"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "prophetic word grounded in a scripture (include reference)",
    "impartation": "impartation language with a scripture promise spoken over the congregation",
    "edification": "words of encouragement woven with scripture",
    "slowDown": "reflective pause — read a scripture slowly and let it settle",
    "returnToAnchor": "return to anchor scripture showing the full circle of the message"
  },
  "summary": {
    "keyTakeaways": [
      "Takeaway 1 with supporting scripture reference",
      "Takeaway 2 with supporting scripture reference",
      "Takeaway 3 with supporting scripture reference"
    ]
  },
  "altarCall": {
    "invitation": "heartfelt invitation grounded in a scripture promise",
    "prayer": "guided prayer that weaves scripture into the words spoken"
  },
  "closingPrayer": "blessing prayer that weaves actual scripture verses into the words"
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

    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const start = cleaned.indexOf("{");
    if (start === -1) {
      return NextResponse.json({ error: "No sermon content returned. Please try again." }, { status: 500 });
    }

    const end = cleaned.lastIndexOf("}");
    let jsonString = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);

    let sermon: Record<string, unknown> | null = null;
    try {
      sermon = JSON.parse(jsonString);
    } catch {
      console.warn("Parse failed — repairing JSON");
      const repaired = repairJson(jsonString);
      try {
        sermon = JSON.parse(repaired);
      } catch {
        return NextResponse.json({ error: "Sermon could not be read. Please try again." }, { status: 500 });
      }
    }

    if (!sermon) {
      return NextResponse.json({ error: "Empty sermon returned. Please try again." }, { status: 500 });
    }

    // Ensure all fields exist with fallbacks
    sermon.title = sermon.title || topic;
    sermon.alternativeTitles = (sermon.alternativeTitles as unknown[]) || [];
    sermon.theme = sermon.theme || "";

    // Ensure teaching points have supportingScriptures
    const points = (sermon.teachingPoints as Record<string, unknown>[]) || [];
    sermon.teachingPoints = points.map(p => ({
      ...p,
      supportingScriptures: (p.supportingScriptures as string[]) || [],
    }));

    const mf = (sermon.ministryFlow as Record<string, string>) || {};
    sermon.ministryFlow = {
      giftOfKnowledge: mf.giftOfKnowledge || "The Lord says: I know the plans I have for you — plans to prosper you and not to harm you. (Jeremiah 29:11)",
      impartation: mf.impartation || "Receive strength for your calling. As Isaiah 40:31 declares — they that wait upon the Lord shall renew their strength.",
      edification: mf.edification || "You are fearfully and wonderfully made. (Psalm 139:14) God is not finished with you.",
      slowDown: mf.slowDown || "Be still and know that I am God. (Psalm 46:10) Let that settle in your spirit right now.",
      returnToAnchor: mf.returnToAnchor || `Return to the Word — this is what God says about ${topic}.`,
    };

    const sum = (sermon.summary as Record<string, unknown>) || {};
    sermon.summary = {
      keyTakeaways: (sum.keyTakeaways as string[]) || [
        `God's Word on ${topic} is alive and active. (Hebrews 4:12)`,
        "What you received today is meant to be lived, not just heard. (James 1:22)",
        "Step out in faith — for God has not given us a spirit of fear. (2 Timothy 1:7)",
      ],
    };

    const ac = (sermon.altarCall as Record<string, string>) || {};
    sermon.altarCall = {
      invitation: ac.invitation || "If you confess with your mouth and believe in your heart that God raised Jesus from the dead, you will be saved. (Romans 10:9) Come to Him today.",
      prayer: ac.prayer || "Lord Jesus, I confess You as my Lord and Saviour. I believe You died for me and rose again. I receive Your forgiveness and the gift of eternal life. Amen.",
    };

    sermon.closingPrayer = (sermon.closingPrayer as string) ||
      "May the Lord bless you and keep you — may He make His face shine upon you and be gracious to you. (Numbers 6:24-25) Go in the peace and power of His Word. Amen.";

    // Log usage analytics
    if (topic && user_id_header) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
        await supabase.from("sermon_usage").insert({ user_id: user_id_header, topic, level: level || "beginner", language: targetLanguage, tone, audience });
        await supabase.from("user_profiles").update({ total_sermons_generated: supabase.rpc("increment", { x: 1 }), last_seen: new Date().toISOString() }).eq("id", user_id_header).catch(() => {});
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
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
