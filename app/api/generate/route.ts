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

Return this complete JSON — ALL fields required. IMPORTANT: Generate teachingPoints FIRST before all other sections:

{
  "title": "compelling sermon title",
  "theme": "one sentence core revelation",
  "anchorScripture": {
    "reference": "Book Chapter:Verse",
    "kjv": "Full KJV verse text",
    "nkjv": "Full NKJV verse text"
  },
  "teachingPoints": [
    {
      "title": "Point 1 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — full verse text", "Third scripture — full verse text"],
      "explanation": "Thorough explanation weaving all scriptures together",
      "application": "Practical application grounded in a scripture promise"
    },
    {
      "title": "Point 2 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — full verse text", "Third scripture — full verse text"],
      "explanation": "Thorough explanation weaving all scriptures together",
      "application": "Practical application grounded in a scripture promise"
    },
    {
      "title": "Point 3 title",
      "scripture": "Primary scripture — full verse text",
      "supportingScriptures": ["Second scripture — full verse text", "Third scripture — full verse text"],
      "explanation": "Thorough explanation weaving all scriptures together",
      "application": "Practical application grounded in a scripture promise"
    }
  ],
  "opening": {
    "greeting": "Warm opening greeting referencing the anchor scripture",
    "hook": "Relatable hook connecting to the theme"
  },
  "foundation": {
    "context": "Historical and spiritual context with supporting verse",
    "breakdown": "Verse-by-verse breakdown with cross-reference"
  },
  "foreword": {
    "whyItMatters": "Why this message matters today with scripture promise",
    "relatable": "Relatable illustration connecting to the scripture"
  },
  "ministryFlow": {
    "giftOfKnowledge": "Prophetic word with scripture reference",
    "impartation": "Impartation with scripture promise over the congregation",
    "edification": "Encouragement woven with scripture",
    "slowDown": "Reflective pause with a scripture read slowly",
    "returnToAnchor": "Return to anchor scripture showing the full circle"
  },
  "summary": {
    "keyTakeaways": [
      "Takeaway 1 with scripture reference",
      "Takeaway 2 with scripture reference",
      "Takeaway 3 with scripture reference"
    ]
  },
  "altarCall": {
    "invitation": "Heartfelt invitation with scripture promise",
    "prayer": "Guided salvation prayer woven with scripture"
  },
  "closingPrayer": "Blessing prayer with actual scripture verses woven in",
  "alternativeTitles": ["Alt title 1", "Alt title 2"]
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
        max_tokens: 2200,
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

    // ── Ensure ALL fields exist with proper fallbacks ──

    sermon.title = (sermon.title as string) || topic;
    sermon.alternativeTitles = (sermon.alternativeTitles as string[]) || [];
    sermon.theme = (sermon.theme as string) || `A message on ${topic} — rooted in the Word of God.`;

    // anchorScripture
    const anch = (sermon.anchorScripture as Record<string, string>) || {};
    sermon.anchorScripture = {
      reference: anch.reference || "John 3:16",
      kjv: anch.kjv || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      nkjv: anch.nkjv || "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
    };

    // opening
    const op = (sermon.opening as Record<string, string>) || {};
    sermon.opening = {
      greeting: op.greeting || `Beloved, we come together today around the Word of God on the subject of ${topic}.`,
      hook: op.hook || `The Word of God never returns void — and today's message on ${topic} is alive with purpose for your life.`,
    };

    // foundation
    const found = (sermon.foundation as Record<string, string>) || {};
    sermon.foundation = {
      context: found.context || `This scripture was written to anchor believers in the truth of ${topic}. Understanding its context deepens our appreciation of what God is saying to us today.`,
      breakdown: found.breakdown || `Every word of this passage carries weight. As Hebrews 4:12 declares — "For the word of God is quick, and powerful, and sharper than any twoedged sword." Let us receive it as such.`,
    };

    // foreword
    const fw = (sermon.foreword as Record<string, string>) || {};
    sermon.foreword = {
      whyItMatters: fw.whyItMatters || `In our world today, the subject of ${topic} matters more than ever. God's Word speaks directly to where we are.`,
      relatable: fw.relatable || `Think of how this truth applies to your everyday life. The Word of God is not distant — it is near, as Romans 10:8 declares: "The word is nigh thee, even in thy mouth, and in thy heart."`,
    };

    // teachingPoints — must have all 3
    const rawPoints = (sermon.teachingPoints as Record<string, unknown>[]) || [];
    const defaultPoints = [
      {
        title: `The Foundation of ${topic}`,
        scripture: `John 15:5 — "I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing."`,
        supportingScriptures: [`Psalm 119:105 — "Thy word is a lamp unto my feet, and a light unto my path."`, `Romans 8:28 — "And we know that all things work together for good to them that love God."`],
        explanation: `Scripture teaches us that ${topic} begins with our connection to Christ. Without Him we can do nothing — but with Him, all things are possible.`,
        application: `Apply this truth daily. Return to the Word, return to prayer, and watch God move in every area of your life.`,
      },
      {
        title: `The Promise of ${topic}`,
        scripture: `Jeremiah 29:11 — "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end."`,
        supportingScriptures: [`Isaiah 41:10 — "Fear thou not; for I am with thee: be not dismayed; for I am thy God."`, `Philippians 4:13 — "I can do all things through Christ which strengtheneth me."`],
        explanation: `God's promise regarding ${topic} is clear — He is for you and not against you. His plans are good, and His Word is sure.`,
        application: `Stand on the promise. Speak the Word over your situation and trust that God who promised is faithful.`,
      },
      {
        title: `Walking in ${topic}`,
        scripture: `Joshua 1:8 — "This book of the law shall not depart out of thy mouth; but thou shalt meditate therein day and night, that thou mayest observe to do according to all that is written therein."`,
        supportingScriptures: [`Proverbs 3:5-6 — "Trust in the Lord with all thine heart; and lean not unto thine own understanding."`, `2 Timothy 3:16-17 — "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness."`],
        explanation: `Living out ${topic} requires consistent meditation on the Word of God. It is the daily discipline of the believer that produces lasting fruit.`,
        application: `Make the Word your daily foundation. Let it guide your decisions, shape your character, and fuel your faith.`,
      },
    ];

    sermon.teachingPoints = rawPoints.length >= 3
      ? rawPoints.map((p, i) => ({
          title: (p.title as string) || defaultPoints[i].title,
          scripture: (p.scripture as string) || defaultPoints[i].scripture,
          supportingScriptures: (p.supportingScriptures as string[])?.length > 0 ? (p.supportingScriptures as string[]) : defaultPoints[i].supportingScriptures,
          explanation: (p.explanation as string) || defaultPoints[i].explanation,
          application: (p.application as string) || defaultPoints[i].application,
        }))
      : defaultPoints;

    // ministryFlow
    const mf = (sermon.ministryFlow as Record<string, string>) || {};
    sermon.ministryFlow = {
      giftOfKnowledge: mf.giftOfKnowledge || `There is someone here today who has been struggling with doubt about ${topic}. The Lord says: His Word is true and His promises are yes and amen. (2 Corinthians 1:20)`,
      impartation: mf.impartation || `Receive this word into your spirit right now. As Isaiah 40:31 declares — "They that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles."`,
      edification: mf.edification || `You are fearfully and wonderfully made. (Psalm 139:14) God is not finished with you — and this word on ${topic} is a turning point in your journey.`,
      slowDown: mf.slowDown || `"Be still, and know that I am God." (Psalm 46:10) Take a moment right now. Let the Word settle deep in your spirit.`,
      returnToAnchor: mf.returnToAnchor || `We return to where we began — the Word of God. Everything the Lord has spoken today comes back to this anchor scripture. Let it be the foundation of all He is building in your life regarding ${topic}.`,
    };

    // summary
    const sum = (sermon.summary as Record<string, unknown>) || {};
    sermon.summary = {
      keyTakeaways: ((sum.keyTakeaways as string[])?.length >= 3 ? sum.keyTakeaways as string[] : [
        `God's Word on ${topic} is alive and active — it is working in you right now. (Hebrews 4:12)`,
        `What you received today is meant to be lived, not just heard. "But be ye doers of the word." (James 1:22)`,
        `Go forward in faith — "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." (2 Timothy 1:7)`,
      ]),
    };

    // altarCall
    const ac = (sermon.altarCall as Record<string, string>) || {};
    sermon.altarCall = {
      invitation: ac.invitation || `If you have never surrendered your life to Jesus Christ, today is your day. "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." (Romans 10:9) Come to Him right now — He is waiting.`,
      prayer: ac.prayer || `Lord Jesus, I come to You just as I am. I confess that I am a sinner in need of Your grace. I believe You died for me and rose again. I receive You as my Lord and Saviour. Forgive me of all my sins and fill me with Your Holy Spirit. I am Yours from this day forward. Amen.`,
    };

    // closingPrayer
    sermon.closingPrayer = (sermon.closingPrayer as string) ||
      `"The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace." (Numbers 6:24-26) Go in the power of His Word. Walk in the truth of what you have received today. And may the God of all grace, who called you to His eternal glory in Christ, establish, strengthen, and settle you. To Him be the glory and the dominion for ever and ever. Amen. (1 Peter 5:10-11)`;

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
