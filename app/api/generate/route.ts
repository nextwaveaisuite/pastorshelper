import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const systemPrompt = `You are a Spirit-led sermon builder. You MUST respond with valid JSON only. No markdown. No code fences. No backticks. No explanation. Just raw JSON.`;

  const prompt = `Create a complete structured sermon on: "${topic}"
Audience: ${audience}
Tone: ${tone}

Respond with ONLY this JSON structure, no other text:

{
  "title": "Sermon title",
  "alternativeTitles": ["Title 2", "Title 3"],
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "Full KJV verse text",
    "nkjv": "Full NKJV verse text"
  },
  "theme": "One sentence core theme",
  "opening": {
    "greeting": "Warm greeting to congregation",
    "atmosphere": "Set the atmosphere",
    "hook": "Relatable opening hook"
  },
  "foundation": {
    "context": "Historical and spiritual context",
    "breakdown": "Initial breakdown of the scripture"
  },
  "foreword": {
    "whyItMatters": "Why this message matters today",
    "relatable": "Relatable story or illustration"
  },
  "teachingPoints": [
    {
      "title": "Point 1 title",
      "scripture": "Supporting scripture and text",
      "explanation": "Explanation of this point",
      "application": "Practical application"
    },
    {
      "title": "Point 2 title",
      "scripture": "Supporting scripture and text",
      "explanation": "Explanation of this point",
      "application": "Practical application"
    },
    {
      "title": "Point 3 title",
      "scripture": "Supporting scripture and text",
      "explanation": "Explanation of this point",
      "application": "Practical application"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "Word of knowledge for the congregation",
    "impartation": "Activation and impartation language",
    "edification": "Words to build up faith",
    "slowDown": "Reflective pause moment",
    "returnToAnchor": "Bring message back to anchor scripture"
  },
  "summary": {
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
  },
  "altarCall": {
    "invitation": "Heartfelt altar call invitation",
    "prayer": "Full guided prayer text"
  },
  "closingPrayer": "Blessing and send-off prayer"
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json(
        { error: `API error: ${response.status}. Check your API key.` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    // Strip any markdown fences, whitespace, or extra characters
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Find the JSON object — start from first { to last }
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      console.error("No JSON object found in response:", cleaned.slice(0, 200));
      return NextResponse.json(
        { error: "Could not find sermon data in response. Please try again." },
        { status: 500 }
      );
    }

    const jsonString = cleaned.slice(start, end + 1);

    let sermon;
    try {
      sermon = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      console.error("Attempted to parse:", jsonString.slice(0, 300));
      return NextResponse.json(
        { error: "Failed to parse sermon. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ sermon });
  } catch (err) {
    console.error("Generate route error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
