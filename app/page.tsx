"use client";

import { useState, useRef, CSSProperties } from "react";

const STEPS = { INTRO: 0, INPUTS: 1, GAP_FILL: 2, GENERATING: 3, REPORT: 4 };

const C = {
  black: "#000000",
  card: "#0f0f0f",
  border: "#222222",
  cyan: "#48c2f9",
  coral: "#e8372d",
  white: "#ffffff",
  grey: "#888888",
  greyDark: "#333333",
};

const GAP_QUESTIONS = [
  {
    id: "color_consistency",
    question: "Is your brand color palette consistent across your website, social profiles, and materials?",
    options: ["Yes — fully consistent", "Mostly consistent, some variation", "Pretty inconsistent", "No defined palette"],
  },
  {
    id: "brand_guide",
    question: "Do you have a documented brand guide (fonts, colors, tone of voice)?",
    options: ["Yes, fully documented", "Partial / informal notes", "No — it's all in my head", "Working on it"],
  },
  {
    id: "post_frequency",
    question: "How consistently are you posting on social media?",
    options: ["Daily or near-daily", "3–5x per week", "1–2x per week", "Sporadically / no real cadence"],
  },
  {
    id: "visual_style",
    question: "How would you describe the visual style of your social content?",
    options: ["Highly consistent (templates, defined aesthetic)", "Somewhat consistent", "Varies a lot", "No real visual strategy"],
  },
  {
    id: "audience_clarity",
    question: "How clearly defined is your target audience?",
    options: ["Specific and documented", "I know them, informally", "Somewhat vague", "Trying to reach everyone"],
  },
  {
    id: "cta_strength",
    question: "Does your website homepage have a clear, strong call-to-action?",
    options: ["Yes — crystal clear CTA above the fold", "There's a CTA but it's easy to miss", "Weak or competing CTAs", "No clear CTA"],
  },
  {
    id: "differentiator",
    question: "Can a first-time visitor understand what makes you different within 5 seconds?",
    options: ["Absolutely", "Probably, with some reading", "Probably not", "Definitely not"],
  },
  {
    id: "bio_consistency",
    question: "How consistent is your bio / description across all social platforms?",
    options: ["Identical or very similar", "Same core message, adapted per platform", "Pretty different across platforms", "Outdated on some / all"],
  },
];

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

const gradeColor = (g?: string) => {
  if (!g) return C.grey;
  const c = g[0].toUpperCase();
  if (c === "A") return C.cyan;
  if (c === "B") return "#4ade80";
  if (c === "C") return "#ff9683";
  if (c === "D") return "#f59e0b";
  return C.coral;
};

const ss: Record<string, CSSProperties> = {
  wrap: { fontFamily: "'Oswald','Arial Narrow',sans-serif", background: C.black, minHeight: "100vh", color: C.white },
  hdr: { background: C.black, borderBottom: `2px solid ${C.coral}`, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  hdrTitle: { margin: 0, fontFamily: "Georgia,serif", fontSize: "22px", fontWeight: 400, color: C.white } as CSSProperties,
  hdrSub: { margin: "2px 0 0", fontSize: "11px", color: C.grey, textTransform: "uppercase" as const, letterSpacing: "0.12em", fontWeight: 300 },
  body: { maxWidth: "660px", margin: "0 auto", padding: "32px 20px" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "28px", marginBottom: "18px" },
  lbl: { display: "block", fontSize: "11px", fontWeight: 600, color: C.grey, textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "6px" },
  inp: { width: "100%", background: "#0a0a0a", border: `1px solid ${C.border}`, borderRadius: "3px", padding: "11px 13px", color: C.white, fontSize: "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 300, outline: "none" } as CSSProperties,
  ta: { width: "100%", background: "#0a0a0a", border: `1px solid ${C.border}`, borderRadius: "3px", padding: "11px 13px", color: C.white, fontSize: "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 300, outline: "none", resize: "vertical" as const, minHeight: "90px" },
  fg: { marginBottom: "16px" },
  btn: { background: C.coral, color: C.white, border: "none", borderRadius: "3px", padding: "14px 24px", fontSize: "14px", fontWeight: 700, fontFamily: "'Oswald',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" as const, cursor: "pointer", width: "100%" },
  btnGhost: { background: "transparent", color: C.grey, border: `1px solid ${C.border}`, borderRadius: "3px", padding: "9px 16px", fontSize: "11px", fontFamily: "'Oswald',sans-serif", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.08em", cursor: "pointer" },
  h2: { margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: C.white, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  sub: { margin: "0 0 22px", fontSize: "13px", color: C.grey, lineHeight: 1.6, fontWeight: 300 },
  accentBar: { width: "36px", height: "3px", background: C.coral, borderRadius: "2px", margin: "10px 0 18px" },
};

const optBtn = (sel: boolean): CSSProperties => ({
  background: sel ? "#1a1a1a" : "#0a0a0a",
  border: `1px solid ${sel ? C.cyan : C.border}`,
  borderRadius: "3px",
  padding: "11px 14px",
  color: sel ? C.cyan : C.grey,
  fontSize: "13px",
  fontFamily: "'Oswald',sans-serif",
  fontWeight: sel ? 500 : 300,
  cursor: "pointer",
  textAlign: "left",
  marginBottom: "7px",
  width: "100%",
  display: "block",
  letterSpacing: "0.02em",
});

const gradeCircle = (grade: string, sz = 80, fsz = 26): CSSProperties => ({
  width: sz,
  height: sz,
  borderRadius: "50%",
  background: `${gradeColor(grade)}15`,
  border: `2.5px solid ${gradeColor(grade)}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: fsz,
  fontWeight: 700,
  color: gradeColor(grade),
  flexShrink: 0,
  fontFamily: "'Oswald',sans-serif",
});

export default function BrandAudit() {
  const [step, setStep] = useState(STEPS.INTRO);
  const [inp, setInp] = useState({
    email: "", website: "", ig: "", li: "", tw: "", fb: "", tt: "", copy: "",
    logoB64: null as string | null, logoMime: "image/png", logoName: "",
  });
  const [gaps, setGaps] = useState<Record<string, string>>({});
  const [report, setReport] = useState<Report | null>(null);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upd = (k: string, v: string) => setInp((p) => ({ ...p, [k]: v }));
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.email);
  const hasInput = inp.website || inp.ig || inp.li || inp.tw || inp.fb || inp.tt || inp.copy || inp.logoB64;
  const allAnswered = GAP_QUESTIONS.every((q) => gaps[q.id]);
  const answered = GAP_QUESTIONS.filter((q) => gaps[q.id]).length;

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) =>
      setInp((p) => ({
        ...p,
        logoB64: (ev.target?.result as string).split(",")[1],
        logoMime: f.type || "image/png",
        logoName: f.name,
      }));
    r.readAsDataURL(f);
  };

  const reset = () => {
    setStep(STEPS.INTRO);
    setInp({ email: "", website: "", ig: "", li: "", tw: "", fb: "", tt: "", copy: "", logoB64: null, logoMime: "image/png", logoName: "" });
    setGaps({});
    setReport(null);
    setErr("");
  };

  const sendReportEmail = async (r: Report) => {
    try {
      await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: r, clientEmail: inp.email }),
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
  };

  const generate = async () => {
    setStep(STEPS.GENERATING);
    setErr("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inp.email,
          website: inp.website, ig: inp.ig, li: inp.li, tw: inp.tw,
          fb: inp.fb, tt: inp.tt, copy: inp.copy,
          logoB64: inp.logoB64, logoMime: inp.logoMime, gaps,
        }),
        signal: AbortSignal.timeout(65000),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `API ${res.status}`);
      }
      const parsed: Report = await res.json();
      setReport(parsed);
      sendReportEmail(parsed);
      setStep(STEPS.REPORT);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setErr(`Something went wrong: ${msg}. Please try again.`);
      setStep(STEPS.GAP_FILL);
    }
  };

  const printReport = (r: Report) => {
    const gc = gradeColor(r.overall_grade);
    const catRows = (r.categories || []).map((cat) => `
      <div class="cat-card" style="border-left:4px solid ${gradeColor(cat.grade)}">
        <div class="cat-header">
          <div><h3 class="cat-name">${cat.name}</h3><p class="cat-score">${cat.score}/100</p></div>
          <div class="grade-circle" style="border-color:${gradeColor(cat.grade)};color:${gradeColor(cat.grade)}">${cat.grade}</div>
        </div>
        <div class="cat-grid">
          <div class="box green"><p class="box-label">What's Working</p><p class="box-text">${cat.whats_working}</p></div>
          <div class="box red"><p class="box-label">Needs Work</p><p class="box-text">${cat.needs_work}</p></div>
        </div>
        <div class="box blue" style="margin-top:8px"><p class="box-label">Top Recommendation</p><p class="box-text">${cat.recommendation}</p></div>
      </div>`).join("");
    const actions = (r.priority_actions || []).map((a, i) =>
      `<div class="action"><span class="action-num">${i + 1}</span><p class="action-text">${a}</p></div>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Brand Audit — ${r.client_name}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Oswald',Arial,sans-serif;background:#fff;color:#111;padding:40px;max-width:760px;margin:0 auto}
      h1{font-family:Georgia,serif;font-weight:400;font-size:32px;margin-bottom:4px}.subtitle{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:32px}
      .score-hero{text-align:center;padding:32px;border:1px solid #eee;border-top:4px solid #e8372d;margin-bottom:24px;border-radius:4px}
      .grade-big{width:80px;height:80px;border-radius:50%;border:3px solid ${gc};color:${gc};font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
      .score-num{font-size:42px;font-weight:700;color:${gc};line-height:1}.score-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
      .summary{font-size:13px;color:#444;line-height:1.7;max-width:540px;margin:12px auto 18px;font-weight:300}
      .biggest-win{border-left:3px solid #48c2f9;padding-left:12px;text-align:left;max-width:480px;margin:0 auto}.bw-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px}.bw-text{font-size:13px;color:#0284c7;line-height:1.5}
      .section-title{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin:28px 0 10px}
      .cat-card{border:1px solid #eee;border-radius:4px;padding:20px;margin-bottom:14px}.cat-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}
      .cat-name{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.cat-score{font-size:12px;color:#888;font-weight:300;margin-top:3px}
      .grade-circle{width:42px;height:42px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;flex-shrink:0}
      .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.box{padding:10px 12px;border-radius:3px}
      .box.green{background:#f0fdf4;border:1px solid #bbf7d0}.box.red{background:#fff1f2;border:1px solid #fecdd3}.box.blue{background:#f0f9ff;border:1px solid #bae6fd}
      .box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
      .box.green .box-label{color:#16a34a}.box.red .box-label{color:#e8372d}.box.blue .box-label{color:#0284c7}
      .box-text{font-size:12px;line-height:1.6;font-weight:300;color:#333}
      .action{display:flex;gap:12px;margin-bottom:12px;align-items:flex-start}.action-num{width:22px;height:22px;border-radius:50%;background:#e8372d;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}.action-text{font-size:13px;color:#333;line-height:1.6;font-weight:300;padding-top:2px}
      .closing{border-top:2px solid #e8372d;padding-top:20px;margin-top:28px;text-align:center}.closing-quote{font-family:Georgia,serif;font-size:20px;color:#111;margin-bottom:10px;line-height:1.4}.closing-byline{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.12em}
      @media print{body{padding:20px}}
    </style></head><body>
    <h1>Brand Audit Report</h1><p class="subtitle">${r.client_name} · Magnetic Media Labs</p>
    <div class="score-hero">
      <div class="grade-big">${r.overall_grade}</div>
      <p class="score-label">Overall Brand Score</p>
      <p class="score-num">${r.overall_score}<span style="font-size:18px;color:#aaa">/100</span></p>
      <p class="summary">${r.summary}</p>
      <div class="biggest-win"><p class="bw-label">Biggest Win</p><p class="bw-text">${r.biggest_win}</p></div>
    </div>
    <p class="section-title">Category Breakdown</p>${catRows}
    <p class="section-title">Priority Actions</p>${actions}
    ${r.closing_note ? `<div class="closing"><p class="closing-quote">"${r.closing_note}"</p><p class="closing-byline">Magnetic Media Labs</p></div>` : ""}
    <script>window.onload=()=>window.print();<\/script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // INTRO
  if (step === STEPS.INTRO) return (
    <div style={ss.wrap} className="audit-step">
      <div style={ss.hdr}>
        <div>
          <p style={ss.hdrTitle}>Magnetic Media Labs</p>
          <p style={ss.hdrSub}>Brand Audit Tool</p>
        </div>
      </div>
      <div style={ss.body}>
        <div style={ss.card}>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "38px", fontWeight: 400, color: C.white, margin: "0 0 4px" }}>Brand Audit</h1>
          <div style={ss.accentBar} />
          <p style={{ ...ss.sub, marginBottom: "24px" }}>
            Drop in your brand assets and get an honest, scored audit of your voice, visual identity, and social presence.
            No fluff. No vanity grades. Just a clear-eyed look at what&apos;s working, what isn&apos;t, and exactly where to focus next.
          </p>
          <div style={{ borderLeft: `3px solid ${C.cyan}`, paddingLeft: "16px", marginBottom: "28px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: C.grey, lineHeight: 1.8, fontWeight: 300 }}>
              ⏱ &nbsp;About 5–7 minutes<br />
              📥 &nbsp;Bring: website URL, social links, brand copy, and/or logo<br />
              📊 &nbsp;You&apos;ll get: an overall grade, category scores, and a prioritized action list
            </p>
          </div>
          <div style={ss.fg}>
            <label style={ss.lbl}>Your Email Address <span style={{ color: C.coral }}>*</span></label>
            <input
              style={{ ...ss.inp, borderColor: inp.email && !validEmail ? C.coral : C.border }}
              type="email"
              placeholder="you@yourbrand.com"
              value={inp.email}
              onChange={(e) => upd("email", e.target.value)}
            />
            {inp.email && !validEmail && (
              <p style={{ margin: "5px 0 0", fontSize: "11px", color: C.coral }}>Please enter a valid email address.</p>
            )}
          </div>
          <button
            style={{ ...ss.btn, opacity: validEmail ? 1 : 0.35, cursor: validEmail ? "pointer" : "not-allowed" }}
            onClick={() => validEmail && setStep(STEPS.INPUTS)}
          >
            Start the Audit →
          </button>
        </div>
      </div>
    </div>
  );

  // INPUTS
  if (step === STEPS.INPUTS) return (
    <div style={ss.wrap} className="audit-step">
      <div style={ss.hdr}>
        <div>
          <p style={ss.hdrTitle}>Magnetic Media Labs</p>
          <p style={ss.hdrSub}>Step 1 of 3 — Brand Assets</p>
        </div>
        <button style={ss.btnGhost} onClick={() => setStep(STEPS.INTRO)}>← Back</button>
      </div>
      <div style={ss.body}>
        <div style={ss.card}>
          <h2 style={ss.h2}>Website & Socials</h2>
          <div style={ss.accentBar} />
          <p style={ss.sub}>Add whatever you have. Nothing is required, but more input = sharper analysis.</p>
          {([
            { k: "website", lbl: "Website URL", ph: "https://yourbrand.com" },
            { k: "ig", lbl: "Instagram", ph: "https://instagram.com/yourbrand" },
            { k: "li", lbl: "LinkedIn", ph: "https://linkedin.com/company/yourbrand" },
            { k: "tw", lbl: "Twitter / X", ph: "https://twitter.com/yourbrand" },
            { k: "fb", lbl: "Facebook", ph: "https://facebook.com/yourbrand" },
            { k: "tt", lbl: "TikTok", ph: "https://tiktok.com/@yourbrand" },
          ] as { k: keyof typeof inp; lbl: string; ph: string }[]).map(({ k, lbl, ph }) => (
            <div key={k} style={ss.fg}>
              <label style={ss.lbl}>{lbl}</label>
              <input style={ss.inp} placeholder={ph} value={inp[k] as string} onChange={(e) => upd(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div style={ss.card}>
          <h2 style={ss.h2}>Brand Copy</h2>
          <div style={ss.accentBar} />
          <p style={ss.sub}>Paste your tagline, about page, bio, elevator pitch — anything that represents how you talk about your brand.</p>
          <textarea style={ss.ta} rows={5} placeholder="Paste your core brand messaging here..." value={inp.copy} onChange={(e) => upd("copy", e.target.value)} />
        </div>
        <div style={ss.card}>
          <h2 style={ss.h2}>Logo</h2>
          <div style={ss.accentBar} />
          <p style={ss.sub}>Upload your primary logo for visual analysis. Optional but worth it.</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
          {inp.logoB64 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:${inp.logoMime};base64,${inp.logoB64}`} alt="Uploaded logo" style={{ height: "52px", objectFit: "contain" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: C.cyan, fontSize: "13px", fontWeight: 600 }}>✓ Logo uploaded</p>
                <p style={{ margin: "2px 0 0", color: C.grey, fontSize: "12px" }}>{inp.logoName}</p>
              </div>
              <button style={ss.btnGhost} onClick={() => setInp((p) => ({ ...p, logoB64: null, logoName: "" }))}>Remove</button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{ ...ss.btnGhost, width: "100%", padding: "18px", borderStyle: "dashed", color: C.grey, fontSize: "13px" }}
            >
              + Upload Logo File
            </button>
          )}
        </div>
        <button
          style={{ ...ss.btn, opacity: hasInput ? 1 : 0.35, cursor: hasInput ? "pointer" : "not-allowed" }}
          onClick={() => hasInput && setStep(STEPS.GAP_FILL)}
          disabled={!hasInput}
        >
          Continue to Assessment →
        </button>
        <p style={{ textAlign: "center", fontSize: "11px", color: C.greyDark, marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          At least one input required
        </p>
      </div>
    </div>
  );

  // GAP FILL
  if (step === STEPS.GAP_FILL) return (
    <div style={ss.wrap} className="audit-step">
      <div style={ss.hdr}>
        <div>
          <p style={ss.hdrTitle}>Magnetic Media Labs</p>
          <p style={ss.hdrSub}>Step 2 of 3 — Self-Assessment</p>
        </div>
        <button style={ss.btnGhost} onClick={() => setStep(STEPS.INPUTS)}>← Back</button>
      </div>
      <div style={ss.body}>
        {err && (
          <div style={{ background: "#1a0a0a", border: `1px solid ${C.coral}`, borderRadius: "3px", padding: "14px", marginBottom: "16px", color: C.coral, fontSize: "13px" }}>
            {err}
          </div>
        )}
        <div style={ss.card}>
          <h2 style={ss.h2}>A few things only you know</h2>
          <div style={ss.accentBar} />
          <p style={ss.sub}>These fill in the gaps that URLs and logos can&apos;t tell us. Answer honestly — there&apos;s no wrong answer, only a less accurate report.</p>
        </div>
        {GAP_QUESTIONS.map((q, i) => (
          <div key={q.id} style={ss.card}>
            <p style={{ margin: "0 0 14px", fontWeight: 500, color: C.white, fontSize: "14px", lineHeight: 1.5 }}>
              <span style={{ color: C.coral, marginRight: "8px", fontWeight: 700 }}>{i + 1}.</span>
              {q.question}
            </p>
            {q.options.map((opt) => (
              <button key={opt} style={optBtn(gaps[q.id] === opt)} onClick={() => setGaps((p) => ({ ...p, [q.id]: opt }))}>
                <span style={{ marginRight: "10px", fontSize: "10px" }}>{gaps[q.id] === opt ? "●" : "○"}</span>
                {opt}
              </button>
            ))}
          </div>
        ))}
        <button
          style={{ ...ss.btn, opacity: allAnswered ? 1 : 0.35, cursor: allAnswered ? "pointer" : "not-allowed" }}
          onClick={() => allAnswered && generate()}
          disabled={!allAnswered}
        >
          Generate Audit Report →
        </button>
        <p style={{ textAlign: "center", fontSize: "11px", color: C.greyDark, marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {answered} of {GAP_QUESTIONS.length} answered
        </p>
      </div>
    </div>
  );

  // GENERATING
  if (step === STEPS.GENERATING) return (
    <div style={ss.wrap}>
      <div style={ss.hdr}>
        <div>
          <p style={ss.hdrTitle}>Magnetic Media Labs</p>
          <p style={ss.hdrSub}>Building Your Report</p>
        </div>
      </div>
      <div style={{ ...ss.body, textAlign: "center", paddingTop: "72px" }}>
        <p style={{ fontFamily: "Georgia,serif", fontSize: "42px", color: C.white, margin: "0 0 8px" }}>Analyzing</p>
        <div style={{ ...ss.accentBar, margin: "0 auto 18px" }} />
        <p style={{ color: C.grey, fontSize: "13px", lineHeight: 1.6, maxWidth: "360px", margin: "0 auto 40px", fontWeight: 300 }}>
          Reviewing assets, cross-referencing your answers, and writing your audit. Give it a moment.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "9px", marginBottom: "32px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`pulse-dot pulse-dot-${i}`} style={{ width: "9px", height: "9px", borderRadius: "50%", background: C.coral }} />
          ))}
        </div>
        <button
          style={{ ...ss.btnGhost, fontSize: "12px" }}
          onClick={() => { setErr("Request cancelled. Please try again."); setStep(STEPS.GAP_FILL); }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // REPORT
  if (step === STEPS.REPORT && report) {
    const gc = gradeColor(report.overall_grade);
    return (
      <div style={ss.wrap} className="audit-step">
        <div style={ss.hdr}>
          <div>
            <p style={ss.hdrTitle}>Magnetic Media Labs</p>
            <p style={ss.hdrSub}>Brand Audit — {report.client_name}</p>
          </div>
          <button style={ss.btnGhost} onClick={reset}>New Audit</button>
        </div>
        <div style={ss.body}>
          <div style={{ ...ss.card, textAlign: "center", padding: "40px 28px", borderTop: `3px solid ${C.coral}` }}>
            <div style={{ ...gradeCircle(report.overall_grade, 90, 32), margin: "0 auto 16px" }}>{report.overall_grade}</div>
            <p style={{ margin: "0 0 2px", fontSize: "11px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Overall Brand Score</p>
            <p style={{ margin: "0 0 16px", fontSize: "48px", fontWeight: 700, color: gc, letterSpacing: "-1px", lineHeight: 1 }}>
              {report.overall_score}<span style={{ fontSize: "20px", color: C.grey }}>/100</span>
            </p>
            <p style={{ margin: "0 auto 22px", fontSize: "14px", color: "#cccccc", lineHeight: 1.65, maxWidth: "500px", fontWeight: 300 }}>
              {report.summary}
            </p>
            <div style={{ borderLeft: `3px solid ${C.cyan}`, paddingLeft: "14px", textAlign: "left", maxWidth: "440px", margin: "0 auto" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Biggest Win</p>
              <p style={{ margin: 0, fontSize: "13px", color: C.cyan, lineHeight: 1.5 }}>{report.biggest_win}</p>
            </div>
          </div>

          <p style={{ fontSize: "11px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "10px" }}>Category Breakdown</p>
          {(report.categories || []).map((cat) => (
            <div key={cat.name} style={{ ...ss.card, borderLeft: `3px solid ${gradeColor(cat.grade)}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: 0, color: C.white, fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.name}</h3>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: C.grey, fontWeight: 300 }}>{cat.score}/100</p>
                </div>
                <div style={gradeCircle(cat.grade, 48, 17)}>{cat.grade}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div style={{ background: "#0a1208", border: "1px solid #1a2e14", borderRadius: "3px", padding: "12px" }}>
                  <p style={{ margin: "0 0 5px", fontSize: "10px", fontWeight: 600, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s Working</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#bbf7d0", lineHeight: 1.6, fontWeight: 300 }}>{cat.whats_working}</p>
                </div>
                <div style={{ background: "#120808", border: "1px solid #2e1414", borderRadius: "3px", padding: "12px" }}>
                  <p style={{ margin: "0 0 5px", fontSize: "10px", fontWeight: 600, color: C.coral, textTransform: "uppercase", letterSpacing: "0.08em" }}>Needs Work</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#fecaca", lineHeight: 1.6, fontWeight: 300 }}>{cat.needs_work}</p>
                </div>
              </div>
              <div style={{ background: "#080d12", border: "1px solid #142030", borderRadius: "3px", padding: "12px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 600, color: C.cyan, textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Recommendation</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#bae6fd", lineHeight: 1.6, fontWeight: 300 }}>{cat.recommendation}</p>
              </div>
            </div>
          ))}

          <div style={ss.card}>
            <h3 style={{ ...ss.h2, marginBottom: "4px" }}>Priority Actions</h3>
            <div style={ss.accentBar} />
            {(report.priority_actions || []).map((action, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "14px", alignItems: "flex-start" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: C.coral, color: C.white, fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#cccccc", lineHeight: 1.6, fontWeight: 300, paddingTop: "3px" }}>{action}</p>
              </div>
            ))}
          </div>

          {report.closing_note && (
            <div style={{ ...ss.card, background: "#0a0a0a", borderTop: `2px solid ${C.coral}`, textAlign: "center", padding: "28px" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: "22px", color: C.white, margin: "0 0 14px", lineHeight: 1.4 }}>
                &ldquo;{report.closing_note}&rdquo;
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: C.grey, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Magnetic Media Labs</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button style={{ ...ss.btnGhost, flex: 1 }} onClick={() => printReport(report)}>Print / Save PDF</button>
            <button style={{ ...ss.btnGhost, flex: 1 }} onClick={reset}>Run Another Audit</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
