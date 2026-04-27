import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topic, audience, tone, level, language } = await req.json();

  const user_id_header = req.headers.get("x-user-id") || "";
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const targetLanguage = language || "English";

  const levelInstructions: Record<string, string> = {

    beginner: `BEGINNER LEVEL — Certificate in Biblical Studies / Certificate in Ministry
This sermon is structured for a pastor or minister who is in the foundational stage of their theological training and ministry development. This aligns with Certificate-level Bible College curriculum.

THEOLOGICAL FRAMEWORK:
- Ground every point in clear, simple doctrinal truth — God, Jesus Christ, Holy Spirit, Salvation, Faith, Prayer
- Introduce the pastor to the concept of expository preaching — letting the scripture speak for itself
- Every teaching point must include 2 scripture references with the full verse text quoted
- Use simple biblical terminology — define any theological words used (e.g. "grace means undeserved favour")
- The Foundation section must explain WHO wrote the scripture, WHY it was written, and WHAT it means for us today
- The Foreword must connect the ancient text to a modern, relatable, everyday situation
- Ministry Flow must be gentle and pastoral — guide the congregation in a simple, heartfelt response to the Word
- Altar Call must include a clear salvation scripture (Romans 10:9, John 3:16) with the full verse text
- Closing Prayer must be a simple scripture-woven blessing the pastor can confidently speak aloud

PASTORAL DEVELOPMENT GOAL:
Help the emerging pastor learn to: (1) find a scripture, (2) understand its context, (3) explain it simply, (4) apply it practically, (5) invite a response. This is the foundation of every sermon they will ever preach.`,

    intermediate: `INTERMEDIATE LEVEL — Diploma of Theology / Diploma of Ministry
This sermon is structured for a pastor who has completed foundational training and is now growing in theological depth and ministerial confidence. This aligns with Diploma-level Bible College curriculum.

THEOLOGICAL FRAMEWORK:
- Build on foundational doctrine with deeper theological concepts — Covenant, Sanctification, Justification, Redemption, Kingdom of God
- Introduce expository AND topical preaching methodology — showing how both draw from scripture
- Every teaching point must include 2-3 scripture references with full verse text — connecting Old Testament to New Testament
- Include at least one Greek or Hebrew word study per sermon — explain the original meaning and why it deepens the text
- The Foundation section must provide historical, cultural, and covenant context — who was the original audience and what did this mean to them
- Cross-reference at least one prophetic fulfillment — how did the Old Testament point to Christ
- Ministry Flow must demonstrate gifts of the Spirit operating through the Word — knowledge, wisdom, faith
- Altar Call must include 2 scripture promises with verse text — one for salvation, one for believers responding to the message
- Closing Prayer must weave 2 scripture references into the blessing

PASTORAL DEVELOPMENT GOAL:
Help the developing pastor learn to: (1) study scripture in its original context, (2) trace themes across both Testaments, (3) understand the covenants, (4) preach with doctrinal precision, (5) lead their congregation into deeper encounters with God. This is the level where a pastor begins to truly understand WHY they believe what they preach.`,

    advanced: `ADVANCED LEVEL — Bachelor of Theology / Bachelor of Ministry
This sermon is structured for a mature, trained minister operating at a fully qualified theological level. This aligns with Degree-level Bible College curriculum — equivalent to the knowledge required to lead, plant, and govern a ministry.

THEOLOGICAL FRAMEWORK:
- Engage with systematic theology — Soteriology, Pneumatology, Ecclesiology, Eschatology, Christology, Hamartiology
- Demonstrate hermeneutical precision — correct interpretation of scripture using grammatical-historical method
- Every teaching point must include 3-4 scripture references with full verse text — covering OT type, NT fulfillment, Epistles application, and Revelation/prophetic scope
- Include Greek and Hebrew word studies for key terms in EVERY teaching point — with the original word, transliteration, Strong's category, and what it reveals
- The Foundation section must be a full biblical-theological treatment — historical setting, literary genre, covenant context, authorship, original audience, and theological significance
- Include typology — identify OT persons, events, or objects that foreshadow Christ and the New Covenant (e.g. the Tabernacle as a type of Christ, Isaac as a type of Christ's sacrifice)
- Ministry Flow must operate at prophetic and apostolic depth — the Word going forth with authority, healing declarations grounded in scripture, impartation of spiritual gifts
- The Return to Anchor must show the full redemptive-historical arc — how this text fits within the meta-narrative of Scripture from Genesis to Revelation
- Altar Call must include 3 scripture promises with verse text — covering salvation, healing/restoration, and commissioning
- Closing Prayer must be a fully scripture-woven apostolic blessing — weaving actual verse texts into the prayer so the congregation receives the Word as they are being blessed

PASTORAL DEVELOPMENT GOAL:
Equip the fully qualified minister to: (1) preach with theological authority and academic precision, (2) understand every major doctrine and its scriptural foundation, (3) trace the full redemptive narrative across all 66 books, (4) operate in all five-fold ministry gifts, (5) establish, lead, govern, and multiply a local church. This is the level at which a pastor can teach others to preach, plant churches, and equip the Body of Christ.`,
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


  // Tone-specific instructions
  const toneInstructions: Record<string, string> = {
    "Teaching": "TEACHING tone — systematic expository preaching. Break down scripture methodically. Build understanding and knowledge. Focus on clear application of God's Word.",
    "Evangelistic": "EVANGELISTIC tone — every point leads toward salvation. Speak to the lost and searching. Use scripture that calls people to repentance and faith in Christ.",
    "Pastoral": "PASTORAL tone — shepherding and nurturing the flock. Address real struggles with scriptural comfort and wisdom. Strengthen and care for the congregation.",
    "General Prayer": "GENERAL PRAYER ministry tone — build toward congregational prayer time. Include scripture promises covering healing, peace, restoration, provision, and breakthrough. The altar call invites ALL who need prayer — sick, broken, weary, lost — to come forward.",
    "Warfare": "SPIRITUAL WARFARE tone — equip the congregation to stand against spiritual attacks. Use Ephesians 6, Daniel, warfare Psalms. Build toward corporate declaration over darkness. The altar call is bold scriptural declaration over the congregation.",
  };
  const toneInstruction = toneInstructions[tone] || toneInstructions["Teaching"];

  const systemPrompt = `You are a Scripture-rich sermon builder. You output ONLY valid JSON. No markdown, no backticks, no explanation. Start with { and end with }. Every field must be complete. Scripture references must include the actual verse text, not just the reference.`;

  const userPrompt = `Create a unique, Scripture-rich sermon on: "${topic}"
Audience: ${audience} | Tone: ${tone}
${levelText}${langInstruction}

${toneInstruction}

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
