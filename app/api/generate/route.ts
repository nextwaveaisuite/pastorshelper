import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level, language } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const targetLanguage = language || "English";

  const levelInstructions: Record<string, string> = {
    beginner: "Write for NEW BELIEVERS and new pastors. Use simple everyday words. No theological jargon. One clear idea per point. Short relatable sentences.",
    intermediate: "Write for GROWING BELIEVERS. Include some historical context. Reference the original meaning of key words. Connect Old and New Testament. Challenge the audience to go deeper.",
    advanced: "Write for MATURE MINISTERS. Use theological precision. Include Greek or Hebrew word insights. Make cross-testament connections. Add doctrinal depth and prophetic weight.",
  };

  const levelText = levelInstructions[level || "beginner"];
  const inLanguage = targetLanguage !== "English" ? `Write ALL sermon content in ${targetLanguage}. Scripture references stay in standard format (e.g. John 3:16) but all other text must be in ${targetLanguage}.` : "";

  // Separated system prompt forces JSON mode cleanly
  const systemPrompt = `You are a Spirit-led sermon builder. You output ONLY valid JSON — no markdown, no backticks, no explanation, no text before or after. Your response must start with { and end with }. Every string value must be properly escaped. Never truncate your response mid-sentence.`;

  const userPrompt = `Create a unique, Spirit-led sermon on this topic: "${topic}"
Audience: ${audience}
Tone: ${tone}
Level: ${levelText}
${inLanguage}

Respond with this exact JSON structure. Keep EVERY field to 1-2 sentences — short and powerful:

{
  "title": "compelling sermon title",
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "KJV verse text",
    "nkjv": "NKJV verse text"
  },
  "theme": "one sentence core revelation",
  "opening": {
    "greeting": "warm opening to congregation",
    "hook": "relatable hook or story opener"
  },
  "foundation": {
    "context": "historical or spiritual context",
    "breakdown": "initial scripture breakdown"
  },
  "foreword": {
    "whyItMatters": "why this message matters today",
    "relatable": "relatable illustration"
  },
  "teachingPoints": [
    {
      "title": "Point 1 title",
      "scripture": "supporting scripture reference and text",
      "explanation": "explanation of this point",
      "application": "practical application"
    },
    {
      "title": "Point 2 title",
      "scripture": "supporting scripture reference and text",
      "explanation": "explanation of this point",
      "application": "practical application"
    },
    {
      "title": "Point 3 title",
      "scripture": "supporting scripture reference and text",
      "explanation": "explanation of this point",
      "application": "practical application"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "prophetic word of knowledge",
    "impartation": "impartation and activation language",
    "edification": "words to build faith",
    "slowDown": "reflective pause moment",
    "returnToAnchor": "return to anchor scripture"
  },
  "summary": {
    "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
  },
  "altarCall": {
    "invitation": "heartfelt altar call invitation",
    "prayer": "guided prayer for congregation"
  },
  "closingPrayer": "closing blessing and send-off",
  "alternativeTitles": ["alt title 1", "alt title 2"]
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
        max_tokens: 1600,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json(
        { error: `API error ${response.status} — please try again.` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    console.log("Raw length:", rawText.length);
    console.log("Stop reason:", data.stop_reason);
    console.log("First 100:", rawText.slice(0, 100));

    // Clean any accidental markdown fences
    let cleaned = rawText
      .replace(/^```json\s*/gi, "")
      .replace(/^```\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();

    // Find the JSON boundaries
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1) {
      console.error("No opening brace found. Raw:", rawText.slice(0, 400));
      return NextResponse.json(
        { error: "Could not find sermon content. Please try again." },
        { status: 500 }
      );
    }

    // If truncated (no closing brace), attempt to repair
    let jsonString = end !== -1 && end > start
      ? cleaned.slice(start, end + 1)
      : cleaned.slice(start);

    // Attempt 1: parse as-is
    let sermon: Record<string, unknown> | null = null;
    try {
      sermon = JSON.parse(jsonString);
    } catch {
      // Attempt 2: try to close any unclosed JSON by appending closing braces
      console.warn("Initial parse failed — attempting JSON repair");
      const repaired = repairJson(jsonString);
      try {
        sermon = JSON.parse(repaired);
        console.log("JSON repair succeeded");
      } catch {
        console.error("JSON repair also failed. String:", jsonString.slice(0, 600));
        return NextResponse.json(
          { error: "Sermon was generated but couldn't be saved. Please try again." },
          { status: 500 }
        );
      }
    }

    // Ensure critical fields exist with fallbacks
    if (!sermon) {
      return NextResponse.json({ error: "Empty sermon returned. Please try again." }, { status: 500 });
    }

    sermon.title = sermon.title || topic;
    sermon.theme = sermon.theme || "";
    sermon.alternativeTitles = sermon.alternativeTitles || [];
    sermon.teachingPoints = (sermon.teachingPoints as unknown[]) || [];
    sermon.summary = (sermon.summary as Record<string, unknown>) || { keyTakeaways: [] };

    return NextResponse.json({ sermon });

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

// Attempt to close unclosed JSON by counting braces and brackets
function repairJson(str: string): string {
  let result = str;

  // Remove trailing comma before attempting close
  result = result.replace(/,\s*$/, "");

  // Count unclosed structures
  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

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

  // Close any open strings first (if truncated mid-string)
  if (inString) result += '"';

  // Close open arrays and objects
  for (let i = 0; i < brackets; i++) result += "]";
  for (let i = 0; i < braces; i++) result += "}";

  return result;
}
