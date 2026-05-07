"use client";

import { useState, useRef, CSSProperties } from "react";

const STEPS = { INTRO: 0, INPUTS: 1, GAP_FILL: 2, GENERATING: 3, REPORT: 4 };

const C = {
  black: "#000000",
  card: "#0c0c0c",
  cardHover: "#111111",
  border: "#1e1e1e",
  borderLight: "#2a2a2a",
  cyan: "#48c2f9",
  coral: "#e8372d",
  white: "#ffffff",
  offWhite: "#e8e8e8",
  grey: "#777777",
  greyMid: "#555555",
  greyDark: "#2a2a2a",
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

// Step progress bar
function StepBar({ current }: { current: number }) {
  const steps = ["Brand Assets", "Self-Assessment", "Your Report"];
  return (
    <div style={{ display: "flex", gap: "4px", padding: "0 28px 0", marginTop: "0" }}>
      {steps.map((label, i) => {
        const active = i < current;
        const isCurrent = i === current - 1;
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{
              height: "2px",
              background: active ? C.coral : isCurrent ? C.coral : C.border,
              borderRadius: "2px",
              opacity: isCurrent ? 0.5 : 1,
            }} />
            <span style={{ fontSize: "9px", color: active ? C.coral : C.greyMid, fontFamily: "'Oswald',sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
          email: inp.email, website: inp.website, ig: inp.ig, li: inp.li,
          tw: inp.tw, fb: inp.fb, tt: inp.tt, copy: inp.copy,
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
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Oswald',Arial,sans-serif;background:#fff;color:#111;padding:48px;max-width:800px;margin:0 auto}
      h1{font-family:Georgia,serif;font-weight:400;font-size:36px;margin-bottom:4px}.subtitle{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.12em;margin-bottom:40px}
      .score-hero{text-align:center;padding:40px 32px;border:1px solid #eee;border-top:4px solid #e8372d;margin-bottom:28px;border-radius:6px}
      .grade-big{width:88px;height:88px;border-radius:50%;border:3px solid ${gc};color:${gc};font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
      .score-num{font-size:48px;font-weight:700;color:${gc};line-height:1}.score-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
      .summary{font-size:14px;color:#444;line-height:1.75;max-width:560px;margin:14px auto 22px;font-weight:300}
      .biggest-win{border-left:3px solid #48c2f9;padding-left:14px;text-align:left;max-width:500px;margin:0 auto}.bw-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:4px}.bw-text{font-size:13px;color:#0284c7;line-height:1.6}
      .section-title{font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:.14em;font-weight:700;margin:32px 0 12px;border-bottom:1px solid #eee;padding-bottom:8px}
      .cat-card{border:1px solid #eee;border-radius:6px;padding:24px;margin-bottom:16px}.cat-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
      .cat-name{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.cat-score{font-size:12px;color:#888;font-weight:300;margin-top:4px}
      .grade-circle{width:46px;height:46px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;flex-shrink:0}
      .cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{padding:12px 14px;border-radius:4px}
      .box.green{background:#f0fdf4;border:1px solid #bbf7d0}.box.red{background:#fff1f2;border:1px solid #fecdd3}.box.blue{background:#f0f9ff;border:1px solid #bae6fd}
      .box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
      .box.green .box-label{color:#16a34a}.box.red .box-label{color:#e8372d}.box.blue .box-label{color:#0284c7}
      .box-text{font-size:12px;line-height:1.65;font-weight:300;color:#333}
      .action{display:flex;gap:14px;margin-bottom:14px;align-items:flex-start}.action-num{width:24px;height:24px;border-radius:50%;background:#e8372d;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.action-text{font-size:13px;color:#333;line-height:1.65;font-weight:300}
      .closing{border-top:2px solid #e8372d;padding-top:24px;margin-top:32px;text-align:center}.closing-quote{font-family:Georgia,serif;font-size:22px;color:#111;margin-bottom:12px;line-height:1.45}.closing-byline{font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:.14em}
      @media print{body{padding:24px}}
    </style></head><body>
    <h1>Brand Audit Report</h1><p class="subtitle">${r.client_name} &nbsp;·&nbsp; Magnetic Media Labs</p>
    <div class="score-hero">
      <div class="grade-big">${r.overall_grade}</div>
      <p class="score-label">Overall Brand Score</p>
      <p class="score-num">${r.overall_score}<span style="font-size:20px;color:#bbb">/100</span></p>
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

  const wrap: CSSProperties = { fontFamily: "'Oswald','Arial Narrow',sans-serif", background: C.black, minHeight: "100vh", color: C.white };

  const Header = ({ subtitle, onBack }: { subtitle: string; onBack?: () => void }) => (
    <div style={{ background: C.black, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "stretch", justifyContent: "space-between", height: "60px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "3px", height: "24px", background: C.coral, borderRadius: "2px", flexShrink: 0 }} />
        <div>
          <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: "17px", fontWeight: 400, color: C.white, lineHeight: 1.2 }}>Magnetic Media Labs</p>
          <p style={{ margin: 0, fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 300 }}>{subtitle}</p>
        </div>
      </div>
      {onBack && (
        <button className="btn-ghost" onClick={onBack} style={{ background: "transparent", color: C.grey, border: "none", padding: "0 4px", fontSize: "12px", fontFamily: "'Oswald',sans-serif", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px", lineHeight: 1 }}>←</span> Back
        </button>
      )}
    </div>
  );

  const body: CSSProperties = { maxWidth: "720px", margin: "0 auto", padding: "36px 24px 60px" };

  const card: CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "32px", marginBottom: "16px" };

  const label: CSSProperties = { display: "block", fontSize: "10px", fontWeight: 600, color: C.grey, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" };

  const input: CSSProperties = { width: "100%", background: "#080808", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "12px 14px", color: C.offWhite, fontSize: "14px", fontFamily: "'Oswald',sans-serif", fontWeight: 300, outline: "none", transition: "border-color 0.15s ease" };

  const accentBar: CSSProperties = { width: "32px", height: "2px", background: C.coral, borderRadius: "2px", margin: "8px 0 20px" };

  const sectionTitle: CSSProperties = { margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: "0.06em" };

  const sectionSub: CSSProperties = { margin: "0 0 24px", fontSize: "13px", color: C.grey, lineHeight: 1.65, fontWeight: 300 };

  const btnPrimary = (active: boolean): CSSProperties => ({
    background: active ? C.coral : "#3a1210",
    color: active ? C.white : "#6a3330",
    border: "none", borderRadius: "4px", padding: "15px 24px",
    fontSize: "13px", fontWeight: 700, fontFamily: "'Oswald',sans-serif",
    letterSpacing: "0.1em", textTransform: "uppercase", cursor: active ? "pointer" : "not-allowed",
    width: "100%",
  });

  const btnGhost: CSSProperties = { background: "transparent", color: C.grey, border: `1px solid ${C.border}`, borderRadius: "4px", padding: "10px 18px", fontSize: "11px", fontFamily: "'Oswald',sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" };

  const optButton = (sel: boolean): CSSProperties => ({
    background: sel ? "#0e1a1f" : "#080808",
    border: `1px solid ${sel ? C.cyan : C.border}`,
    borderRadius: "4px", padding: "12px 16px",
    color: sel ? C.cyan : "#666666",
    fontSize: "13px", fontFamily: "'Oswald',sans-serif",
    fontWeight: sel ? 500 : 300, cursor: "pointer",
    textAlign: "left", marginBottom: "8px", width: "100%",
    display: "flex", alignItems: "center", gap: "12px",
    letterSpacing: "0.02em",
  });

  const gradeCircleStyle = (grade: string, sz = 80, fsz = 26): CSSProperties => ({
    width: sz, height: sz, borderRadius: "50%",
    background: `${gradeColor(grade)}12`,
    border: `2px solid ${gradeColor(grade)}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: fsz, fontWeight: 700, color: gradeColor(grade),
    flexShrink: 0, fontFamily: "'Oswald',sans-serif",
  });

  // ── INTRO ──
  if (step === STEPS.INTRO) return (
    <div style={wrap} className="audit-step">
      <div style={{ background: C.black, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "center", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "3px", height: "24px", background: C.coral, borderRadius: "2px" }} />
          <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: "17px", fontWeight: 400, color: C.white }}>Magnetic Media Labs</p>
        </div>
      </div>

      <div style={{ ...body, paddingTop: "56px" }}>
        <div style={{ marginBottom: "40px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "11px", color: C.coral, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em" }}>Brand Audit Tool</p>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: "52px", fontWeight: 400, color: C.white, margin: "0 0 16px", lineHeight: 1.1 }}>
            Know exactly where<br />your brand stands.
          </h1>
          <div style={{ width: "40px", height: "2px", background: C.coral, borderRadius: "2px", margin: "0 0 20px" }} />
          <p style={{ fontSize: "15px", color: "#999", lineHeight: 1.7, maxWidth: "540px", fontWeight: 300 }}>
            Drop in your brand assets and get an honest, scored audit of your voice, visual identity, and social presence. No fluff — just a clear-eyed look at what&apos;s working, what isn&apos;t, and exactly where to focus next.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", marginBottom: "40px" }}>
          {[
            { icon: "⏱", label: "Time", value: "5–7 minutes" },
            { icon: "📥", label: "Bring", value: "URLs, copy & logo" },
            { icon: "📊", label: "You get", value: "Grade + action plan" },
          ].map(({ icon, label: lbl, value }) => (
            <div key={lbl} style={{ background: C.card, padding: "20px 18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "18px" }}>{icon}</p>
              <p style={{ margin: "0 0 2px", fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{lbl}</p>
              <p style={{ margin: 0, fontSize: "13px", color: C.offWhite, fontWeight: 400 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: "32px" }}>
          <label style={label}>Your Email Address <span style={{ color: C.coral }}>*</span></label>
          <input
            className="audit-input"
            style={{ ...input, marginBottom: "20px", borderColor: inp.email && !validEmail ? C.coral : C.border }}
            type="email"
            placeholder="you@yourbrand.com"
            value={inp.email}
            onChange={(e) => upd("email", e.target.value)}
          />
          {inp.email && !validEmail && (
            <p style={{ margin: "-14px 0 16px", fontSize: "11px", color: C.coral }}>Please enter a valid email address.</p>
          )}
          <button className="btn-primary" style={btnPrimary(validEmail)} onClick={() => validEmail && setStep(STEPS.INPUTS)}>
            Start the Audit →
          </button>
          <p style={{ margin: "12px 0 0", fontSize: "11px", color: C.greyMid, textAlign: "center" }}>Free · No account required</p>
        </div>
      </div>
    </div>
  );

  // ── INPUTS ──
  if (step === STEPS.INPUTS) return (
    <div style={wrap} className="audit-step">
      <Header subtitle="Step 1 of 3 — Brand Assets" onBack={() => setStep(STEPS.INTRO)} />
      <StepBar current={1} />
      <div style={body}>
        <div style={{ ...card }}>
          <h2 style={sectionTitle}>Website & Socials</h2>
          <div style={accentBar} />
          <p style={sectionSub}>Add whatever you have. Nothing is required, but more input = sharper analysis.</p>
          {([
            { k: "website", lbl: "Website URL", ph: "https://yourbrand.com" },
            { k: "ig", lbl: "Instagram", ph: "https://instagram.com/yourbrand" },
            { k: "li", lbl: "LinkedIn", ph: "https://linkedin.com/company/yourbrand" },
            { k: "tw", lbl: "Twitter / X", ph: "https://twitter.com/yourbrand" },
            { k: "fb", lbl: "Facebook", ph: "https://facebook.com/yourbrand" },
            { k: "tt", lbl: "TikTok", ph: "https://tiktok.com/@yourbrand" },
          ] as { k: keyof typeof inp; lbl: string; ph: string }[]).map(({ k, lbl, ph }) => (
            <div key={k} style={{ marginBottom: "14px" }}>
              <label style={label}>{lbl}</label>
              <input className="audit-input" style={input} placeholder={ph} value={inp[k] as string} onChange={(e) => upd(k, e.target.value)} />
            </div>
          ))}
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Brand Copy</h2>
          <div style={accentBar} />
          <p style={sectionSub}>Paste your tagline, about page, bio, elevator pitch — anything that represents how you talk about your brand.</p>
          <textarea
            className="audit-input"
            style={{ ...input, resize: "vertical", minHeight: "110px" } as CSSProperties}
            rows={5}
            placeholder="Paste your core brand messaging here..."
            value={inp.copy}
            onChange={(e) => upd("copy", e.target.value)}
          />
        </div>

        <div style={card}>
          <h2 style={sectionTitle}>Logo</h2>
          <div style={accentBar} />
          <p style={sectionSub}>Upload your primary logo for visual analysis. Optional but worth it.</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
          {inp.logoB64 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "#080808", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "16px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:${inp.logoMime};base64,${inp.logoB64}`} alt="Logo" style={{ height: "48px", objectFit: "contain" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: C.cyan, fontSize: "13px", fontWeight: 600 }}>✓ Logo uploaded</p>
                <p style={{ margin: "2px 0 0", color: C.grey, fontSize: "12px", fontWeight: 300 }}>{inp.logoName}</p>
              </div>
              <button className="btn-ghost" style={btnGhost} onClick={() => setInp((p) => ({ ...p, logoB64: null, logoName: "" }))}>Remove</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} style={{ ...btnGhost, width: "100%", padding: "24px", borderStyle: "dashed", fontSize: "13px", color: C.greyMid }}>
              + Upload Logo File
            </button>
          )}
        </div>

        <button className="btn-primary" style={btnPrimary(!!hasInput)} onClick={() => hasInput && setStep(STEPS.GAP_FILL)} disabled={!hasInput}>
          Continue to Assessment →
        </button>
        <p style={{ textAlign: "center", fontSize: "11px", color: C.greyDark, marginTop: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>At least one input required</p>
      </div>
    </div>
  );

  // ── GAP FILL ──
  if (step === STEPS.GAP_FILL) return (
    <div style={wrap} className="audit-step">
      <Header subtitle="Step 2 of 3 — Self-Assessment" onBack={() => setStep(STEPS.INPUTS)} />
      <StepBar current={2} />
      <div style={body}>
        {err && (
          <div style={{ background: "#160808", border: `1px solid ${C.coral}30`, borderLeft: `3px solid ${C.coral}`, borderRadius: "4px", padding: "14px 16px", marginBottom: "20px", color: "#ff9999", fontSize: "13px", fontWeight: 300 }}>
            {err}
          </div>
        )}
        <div style={{ ...card, borderLeft: `3px solid ${C.coral}` }}>
          <h2 style={sectionTitle}>A few things only you know</h2>
          <div style={accentBar} />
          <p style={sectionSub}>These fill in the gaps that URLs and logos can&apos;t tell us. Answer honestly — there&apos;s no wrong answer, only a less accurate report.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ flex: 1, height: "3px", background: C.greyDark, borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(answered / GAP_QUESTIONS.length) * 100}%`, background: C.coral, borderRadius: "2px", transition: "width 0.3s ease" }} />
            </div>
            <span style={{ fontSize: "11px", color: C.grey, fontWeight: 600, whiteSpace: "nowrap", minWidth: "70px", textAlign: "right" }}>{answered} of {GAP_QUESTIONS.length}</span>
          </div>
        </div>

        {GAP_QUESTIONS.map((q, i) => (
          <div key={q.id} style={{ ...card, opacity: 1 }}>
            <p style={{ margin: "0 0 16px", color: C.offWhite, fontSize: "14px", lineHeight: 1.5, display: "flex", gap: "10px" }}>
              <span style={{ color: C.coral, fontWeight: 700, flexShrink: 0, fontSize: "13px" }}>0{i + 1}</span>
              <span style={{ fontWeight: 400 }}>{q.question}</span>
            </p>
            {q.options.map((opt) => {
              const sel = gaps[q.id] === opt;
              return (
                <button key={opt} className="opt-btn" style={optButton(sel)} onClick={() => setGaps((p) => ({ ...p, [q.id]: opt }))}>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${sel ? C.cyan : C.border}`, background: sel ? `${C.cyan}20` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {sel && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.cyan, display: "block" }} />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        ))}

        <button className="btn-primary" style={btnPrimary(allAnswered)} onClick={() => allAnswered && generate()} disabled={!allAnswered}>
          Generate Audit Report →
        </button>
      </div>
    </div>
  );

  // ── GENERATING ──
  if (step === STEPS.GENERATING) return (
    <div style={wrap}>
      <div style={{ background: C.black, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "center", height: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "3px", height: "24px", background: C.coral, borderRadius: "2px" }} />
          <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: "17px", fontWeight: 400, color: C.white }}>Magnetic Media Labs</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.coral}`, animation: "spin 1s linear infinite", marginBottom: "32px" }} />
        <p style={{ fontFamily: "Georgia,serif", fontSize: "36px", color: C.white, margin: "0 0 10px", fontWeight: 400 }}>Analyzing your brand</p>
        <div style={{ width: "32px", height: "2px", background: C.coral, borderRadius: "2px", margin: "0 auto 16px" }} />
        <p style={{ color: C.grey, fontSize: "14px", lineHeight: 1.7, maxWidth: "380px", fontWeight: 300 }}>
          Reviewing assets, cross-referencing your answers, and writing your audit. This takes about 20–30 seconds.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "40px 0" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`pulse-dot pulse-dot-${i}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.coral }} />
          ))}
        </div>
        <button className="btn-ghost" style={{ ...btnGhost, fontSize: "11px" }} onClick={() => { setErr("Request cancelled."); setStep(STEPS.GAP_FILL); }}>
          Cancel
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── REPORT ──
  if (step === STEPS.REPORT && report) {
    const gc = gradeColor(report.overall_grade);
    return (
      <div style={wrap} className="audit-step">
        <div style={{ background: C.black, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "3px", height: "24px", background: C.coral, borderRadius: "2px" }} />
            <div>
              <p style={{ margin: 0, fontFamily: "Georgia,serif", fontSize: "17px", fontWeight: 400, color: C.white, lineHeight: 1.2 }}>Magnetic Media Labs</p>
              <p style={{ margin: 0, fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 300 }}>{report.client_name}</p>
            </div>
          </div>
          <button className="btn-ghost" onClick={reset} style={btnGhost}>New Audit</button>
        </div>

        <div style={body}>
          {/* Hero score */}
          <div style={{ ...card, textAlign: "center", padding: "48px 32px 40px", borderTop: `3px solid ${C.coral}`, marginBottom: "24px" }}>
            <div style={{ ...gradeCircleStyle(report.overall_grade, 100, 36), margin: "0 auto 20px" }}>{report.overall_grade}</div>
            <p style={{ margin: "0 0 4px", fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600 }}>Overall Brand Score</p>
            <p style={{ margin: "0 0 20px", fontSize: "56px", fontWeight: 700, color: gc, letterSpacing: "-2px", lineHeight: 1 }}>
              {report.overall_score}<span style={{ fontSize: "22px", color: C.greyMid, letterSpacing: 0 }}>/100</span>
            </p>
            <p style={{ margin: "0 auto 24px", fontSize: "14px", color: "#aaa", lineHeight: 1.75, maxWidth: "520px", fontWeight: 300 }}>
              {report.summary}
            </p>
            <div style={{ display: "inline-flex", gap: "12px", background: "#080d10", border: `1px solid ${C.cyan}22`, borderLeft: `3px solid ${C.cyan}`, borderRadius: "4px", padding: "14px 18px", textAlign: "left" }}>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Biggest Win</p>
                <p style={{ margin: 0, fontSize: "13px", color: C.cyan, lineHeight: 1.55 }}>{report.biggest_win}</p>
              </div>
            </div>
          </div>

          {/* Category scores strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: C.border, borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
            {(report.categories || []).map((cat) => (
              <div key={cat.name} style={{ background: C.card, padding: "20px 18px", borderTop: `3px solid ${gradeColor(cat.grade)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <p style={{ margin: 0, fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, lineHeight: 1.4 }}>{cat.name}</p>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: gradeColor(cat.grade) }}>{cat.grade}</span>
                </div>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: gradeColor(cat.grade) }}>{cat.score}<span style={{ fontSize: "12px", color: C.grey, fontWeight: 300 }}>/100</span></p>
              </div>
            ))}
          </div>

          {/* Full category breakdowns */}
          <p style={{ fontSize: "10px", color: C.grey, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, marginBottom: "12px" }}>Category Breakdown</p>
          {(report.categories || []).map((cat) => (
            <div key={cat.name} className="cat-card-hover" style={{ ...card, borderLeft: `3px solid ${gradeColor(cat.grade)}`, marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: "0 0 3px", color: C.white, fontSize: "15px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat.name}</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: C.grey, fontWeight: 300 }}>{cat.score} / 100</p>
                </div>
                <div style={gradeCircleStyle(cat.grade, 52, 18)}>{cat.grade}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div style={{ background: "#060e08", border: `1px solid #1a2e1a`, borderRadius: "4px", padding: "14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em" }}>What&apos;s Working</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#a7f3c7", lineHeight: 1.65, fontWeight: 300 }}>{cat.whats_working}</p>
                </div>
                <div style={{ background: "#0e0606", border: `1px solid #2e1414`, borderRadius: "4px", padding: "14px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: C.coral, textTransform: "uppercase", letterSpacing: "0.1em" }}>Needs Work</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#fecaca", lineHeight: 1.65, fontWeight: 300 }}>{cat.needs_work}</p>
                </div>
              </div>
              <div style={{ background: "#060a0e", border: `1px solid #142030`, borderRadius: "4px", padding: "14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: C.cyan, textTransform: "uppercase", letterSpacing: "0.1em" }}>Top Recommendation</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#bae6fd", lineHeight: 1.65, fontWeight: 300 }}>{cat.recommendation}</p>
              </div>
            </div>
          ))}

          {/* Priority actions */}
          <div style={{ ...card, marginTop: "8px" }}>
            <h3 style={{ ...sectionTitle, marginBottom: "4px" }}>Priority Actions</h3>
            <div style={{ ...accentBar }} />
            {(report.priority_actions || []).map((action, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", marginBottom: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: C.coral, color: C.white, fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: "14px", color: "#bbbbbb", lineHeight: 1.65, fontWeight: 300, paddingTop: "3px" }}>{action}</p>
              </div>
            ))}
          </div>

          {/* Closing */}
          {report.closing_note && (
            <div style={{ ...card, background: "#080808", borderTop: `2px solid ${C.coral}`, textAlign: "center", padding: "36px 32px", marginTop: "12px" }}>
              <p style={{ fontFamily: "Georgia,serif", fontSize: "24px", color: C.white, margin: "0 0 16px", lineHeight: 1.45, fontStyle: "italic" }}>
                &ldquo;{report.closing_note}&rdquo;
              </p>
              <p style={{ margin: 0, fontSize: "10px", color: C.grey, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em" }}>Magnetic Media Labs</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button className="btn-ghost" style={{ ...btnGhost, flex: 1, padding: "14px" }} onClick={() => printReport(report)}>Print / Save PDF</button>
            <button className="btn-ghost" style={{ ...btnGhost, flex: 1, padding: "14px" }} onClick={reset}>Run Another Audit</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
