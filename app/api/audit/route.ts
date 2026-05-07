import Anthropic from "@anthropic-ai/sdk";
import type { ImageBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GAP_QUESTIONS = [
  { id: "color_consistency", question: "Is your brand color palette consistent across your website, social profiles, and materials?" },
  { id: "brand_guide", question: "Do you have a documented brand guide (fonts, colors, tone of voice)?" },
  { id: "post_frequency", question: "How consistently are you posting on social media?" },
  { id: "visual_style", question: "How would you describe the visual style of your social content?" },
  { id: "audience_clarity", question: "How clearly defined is your target audience?" },
  { id: "cta_strength", question: "Does your website homepage have a clear, strong call-to-action?" },
  { id: "differentiator", question: "Can a first-time visitor understand what makes you different within 5 seconds?" },
  { id: "bio_consistency", question: "How consistent is your bio / description across all social platforms?" },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { website, ig, li, tw, fb, tt, copy, logoB64, logoMime, gaps } = body;

    const socials = [
      ig && `Instagram: ${ig}`,
      li && `LinkedIn: ${li}`,
      tw && `Twitter/X: ${tw}`,
      fb && `Facebook: ${fb}`,
      tt && `TikTok: ${tt}`,
    ]
      .filter(Boolean)
      .join("\n");

    const gapCtx = GAP_QUESTIONS.map(
      (q) => `Q: ${q.question}\nA: ${gaps?.[q.id] || "Not answered"}`
    ).join("\n\n");

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
    type AllowedMime = typeof allowedMimeTypes[number];
    const safeMime: AllowedMime = allowedMimeTypes.includes(logoMime as AllowedMime) ? logoMime as AllowedMime : "image/png";

    const msgContent: (ImageBlockParam | TextBlockParam)[] = [];

    if (logoB64) {
      msgContent.push({
        type: "image",
        source: { type: "base64", media_type: safeMime, data: logoB64 },
      });
    }

    msgContent.push({
      type: "text",
      text: `You are a senior brand strategist. Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Start with { and end with }.

BRAND INPUTS:
Website: ${website || "Not provided"}
${socials || "Social profiles: Not provided"}${copy ? `\nBrand Copy:\n${copy}` : ""}
${logoB64 ? "Logo: [attached]" : ""}

CLIENT SELF-ASSESSMENT:
${gapCtx}

JSON shape:
{"client_name":"string","overall_grade":"A-F","overall_score":0,"summary":"string","biggest_win":"string","categories":[{"name":"Brand Voice & Messaging","grade":"A","score":0,"whats_working":"string","needs_work":"string","recommendation":"string"},{"name":"Visual Identity","grade":"A","score":0,"whats_working":"string","needs_work":"string","recommendation":"string"},{"name":"Social Media Presence","grade":"A","score":0,"whats_working":"string","needs_work":"string","recommendation":"string"}],"priority_actions":["string","string","string"],"closing_note":"string"}`,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: msgContent }],
    });

    const raw = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return NextResponse.json({ error: "No JSON in response", raw }, { status: 500 });
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1));

    // Save to Supabase (non-blocking — don't fail the request if this errors)
    supabase.from("brand_audits").insert({
      client_email: body.email || null,
      client_name: parsed.client_name,
      overall_grade: parsed.overall_grade,
      overall_score: parsed.overall_score,
      report: parsed,
      inputs: { website, ig, li, tw, fb, tt, copy },
      gap_answers: gaps,
    }).then(({ error }) => {
      if (error) console.error("Supabase insert error:", error.message);
    });

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
