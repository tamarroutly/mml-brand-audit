import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFY_EMAIL = "alysse.bryson@thesobercurator.com";

interface Category {
  name: string;
  grade: string;
  score: number;
  whats_working: string;
  needs_work: string;
  recommendation: string;
}

interface Report {
  client_name: string;
  overall_grade: string;
  overall_score: number;
  summary: string;
  biggest_win: string;
  categories: Category[];
  priority_actions: string[];
  closing_note: string;
}

export async function POST(req: NextRequest) {
  try {
    const { report, clientEmail }: { report: Report; clientEmail: string } = await req.json();

    const catText = (report.categories || [])
      .map(
        (cat) =>
          `${cat.name} — ${cat.grade} (${cat.score}/100)\nWhat's Working: ${cat.whats_working}\nNeeds Work: ${cat.needs_work}\nRecommendation: ${cat.recommendation}`
      )
      .join("\n\n");

    const actions = (report.priority_actions || [])
      .map((a, i) => `${i + 1}. ${a}`)
      .join("\n");

    const body = `New Brand Audit Submission

Client Email: ${clientEmail}
Brand: ${report.client_name}
Overall Grade: ${report.overall_grade} (${report.overall_score}/100)

Summary:
${report.summary}

Biggest Win: ${report.biggest_win}

--- CATEGORIES ---

${catText}

--- PRIORITY ACTIONS ---

${actions}

--- CLOSING ---
${report.closing_note}`;

    await resend.emails.send({
      from: "MML Brand Audit <onboarding@resend.dev>",
      to: NOTIFY_EMAIL,
      subject: `Brand Audit Report — ${report.client_name} (${report.overall_grade})`,
      text: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Email send failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
