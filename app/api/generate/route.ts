import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const prompt = `You are a Spirit-led sermon builder. Create a sermon on "${topic}" for ${audience} in a ${tone} style.

You MUST return ONLY raw JSON. No markdown. No code fences. No backticks. No explanation before or after. Start your response with { and end with }.

{
  "title": "Sermon title here",
  "alternativeTitles": ["Alt title 1", "Alt title 2"],
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "KJV verse text here",
    "nkjv": "NKJV verse text here"
  },
  "theme": "One sentence core theme",
  "opening": {
    "greeting": "Opening greeting to congregation",
    "atmosphere": "Set the atmosphere",
    "hook": "Relatable opening hook"
  },
  "foundation": {
    "context": "Historical and spiritual context",
    "breakdown": "Breakdown of the scripture"
  },
  "foreword": {
    "whyItMatters": "Why this message matters",
    "relatable": "Relatable story or illustration"
  },
  "teachingPoints": [
    {
      "title": "Point 1",
      "scripture": "Scripture ref and text",
      "explanation": "Explanation",
      "application": "Application"
    },
    {
      "title": "Point 2",
      "scripture": "Scripture ref and text",
      "explanation": "Explanation",
      "application": "Application"
    },
    {
      "title": "Point 3",
      "scripture": "Scripture ref and text",
      "explanation": "Explanation",
      "application": "Application"
    }
  ],
  "ministryFlow": {
    "giftOfKnowledge": "Word of knowledge",
    "impartation": "Impartation language",
    "edification": "Words to build faith",
    "slowDown": "Reflective pause",
    "returnToAnchor": "Return to anchor scripture"
  },
  "summary": {
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
  },
  "altarCall": {
    "invitation": "Altar call invitation",
    "prayer": "Guided prayer text"
  },
  "closingPrayer": "Closing blessing and prayer"
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
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json(
        { error: `API error ${response.status} — check your API key.` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text || "";

    console.log("Raw response length:", rawText.length);
    console.log("Raw response start:", rawText.slice(0, 100));

    // Aggressively clean the response
    let cleaned = rawText
      .replace(/^```json\s*/gi, "")
      .replace(/^```\s*/gi, "")
      .replace(/```\s*$/gi, "")
      .trim();

    // Extract JSON object
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      console.error("No valid JSON braces found. Raw text:", rawText.slice(0, 500));
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
      console.error("JSON parse failed:", parseErr);
      console.error("JSON string attempted:", jsonString.slice(0, 500));
      return NextResponse.json(
        { error: "Sermon was generated but could not be read. Please try again." },
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
