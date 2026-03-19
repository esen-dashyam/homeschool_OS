"use client";

import { useState, useRef, useEffect } from "react";
import { mockChildren, mockCourses, mockScheduleBlocks } from "@/lib/mockData";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type PanelId = "chat" | "upload" | "roadmap" | "quiz";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  highlights?: { label: string; value: string; color: string }[];
}

interface UploadFile {
  id: string;
  name: string;
  ext: "pdf" | "docx" | "txt";
  status: "processing" | "done" | "error";
  size: string;
  concepts?: string[];
  summary?: string;
}

interface QuizItem {
  id: string;
  topic: string;
  bloom: 1 | 2 | 3 | 4 | 5 | 6;
  type: "mc" | "open";
  question: string;
  options?: string[];
  correct?: number;
  rubric?: string[];
  source: string;
}

// ── Roadmap data ───────────────────────────────────────────────────────────────
const ROADMAP_UNITS = [
  {
    id: "u1", num: 1, name: "Cell biology",
    weeks: "1–7", hours: "~52h", credit: "0.5",
    rows: [
      { label: "Week 1: Cell theory — history, three principles, Robert Hooke", status: "done" as const, hours: "6h" },
      { label: "Week 2: Cell types — prokaryotic vs. eukaryotic structure",      status: "active" as const, hours: "7h" },
      { label: "Week 3: Organelles — structure and function of each",             status: "upcoming" as const, hours: "8h" },
      { label: "Weeks 4–5: Cell membrane — structure, transport, osmosis",        status: "upcoming" as const, hours: "12h" },
      { label: "Weeks 6–7: Cell division — mitosis, meiosis, cell cycle",         status: "upcoming" as const, hours: "14h + 5h assessment" },
    ],
  },
  {
    id: "u2", num: 2, name: "Genetics",
    weeks: "8–16", hours: "~67h", credit: "0.5",
    rows: [
      { label: "Week 8: DNA structure and nucleotide base pairing", status: "upcoming" as const, hours: "6h" },
      { label: "Week 9: DNA replication and proofreading",          status: "upcoming" as const, hours: "6h" },
      { label: "Week 10–11: Transcription and translation",         status: "upcoming" as const, hours: "10h" },
      { label: "Week 12–13: Mendelian genetics and Punnett squares",status: "upcoming" as const, hours: "10h" },
      { label: "Weeks 14–16: Mutations, chromosomal disorders, review", status: "upcoming" as const, hours: "14h + 5h assessment" },
    ],
  },
  {
    id: "u3", num: 3, name: "Ecology",
    weeks: "17–23", hours: "~52h", credit: "0.5",
    rows: [
      { label: "Week 17–18: Ecosystems and biomes",              status: "upcoming" as const, hours: "10h" },
      { label: "Week 19–20: Food webs and energy transfer",      status: "upcoming" as const, hours: "10h" },
      { label: "Week 21–22: Human impact and conservation",      status: "upcoming" as const, hours: "10h" },
      { label: "Week 23: Review and assessment",                 status: "upcoming" as const, hours: "7h + 5h assessment" },
    ],
  },
  {
    id: "u4", num: 4, name: "Evolution",
    weeks: "24–30", hours: "~53h", credit: "0.5",
    rows: [
      { label: "Week 24–25: Natural selection and adaptation",   status: "upcoming" as const, hours: "10h" },
      { label: "Week 26–27: Speciation and fossil record",       status: "upcoming" as const, hours: "10h" },
      { label: "Week 28–29: Evidence for evolution",             status: "upcoming" as const, hours: "10h" },
      { label: "Week 30: Final review and exam",                 status: "upcoming" as const, hours: "8h + 5h assessment" },
    ],
  },
];

const BLOOM_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "#e0f2fe", text: "#0369a1", label: "Remember" },
  2: { bg: "#dcfce7", text: "#166534", label: "Understand" },
  3: { bg: "#fef9c3", text: "#854d0e", label: "Apply" },
  4: { bg: "#fce7f3", text: "#9d174d", label: "Analyze" },
  5: { bg: "#ede9fe", text: "#5b21b6", label: "Evaluate" },
  6: { bg: "#ffedd5", text: "#9a3412", label: "Create" },
};

const QUIZ_ITEMS: QuizItem[] = [
  { id: "q1", topic: "Cell Biology", bloom: 1, type: "mc",
    question: "Which organelle produces ATP through cellular respiration?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correct: 2,
    source: "Campbell Biology Ch. 6" },
  { id: "q2", topic: "Genetics", bloom: 2, type: "mc",
    question: "Homologous chromosomes separate during which phase?",
    options: ["Mitosis Anaphase", "Meiosis I Anaphase", "Meiosis II Anaphase", "S Phase"], correct: 1,
    source: "Khan Academy — Meiosis" },
  { id: "q3", topic: "Cell Biology", bloom: 3, type: "open",
    question: "A plant cell placed in hypertonic solution shrinks. Explain using osmosis and predict what happens in hypotonic solution.",
    rubric: ["Defines osmosis correctly", "Explains plasmolysis in hypertonic solution", "Predicts turgor pressure in hypotonic solution", "Uses correct vocabulary"],
    source: "Course materials — Week 3" },
  { id: "q4", topic: "Genetics", bloom: 4, type: "open",
    question: "Compare mRNA and tRNA in protein synthesis. How would a tRNA anticodon mutation affect the resulting protein?",
    rubric: ["Describes mRNA as genetic code template", "Describes tRNA as amino acid adaptor", "Explains anticodon-codon pairing", "Predicts missense or truncation effect"],
    source: "Transcription & Translation notes" },
  { id: "q5", topic: "Ecology", bloom: 6, type: "open",
    question: "Design a controlled experiment to test whether CO₂ levels affect photosynthesis rate in aquatic plants.",
    rubric: ["States clear hypothesis", "Identifies IV and DV", "Describes control group", "Lists ≥2 controlled variables", "Proposes measurable outcome"],
    source: "Chapter 8 — Photosynthesis" },
];

const INITIAL_FILES: UploadFile[] = [
  { id: "f1", name: "campbell_biology_ch6.pdf", ext: "pdf", status: "done", size: "4.2 MB",
    concepts: ["cell membrane", "phospholipid bilayer", "osmosis", "ATP", "mitochondria"],
    summary: "Chapter 6 covers eukaryotic cell structure and membrane transport. Key focus: fluid mosaic model and selective permeability." },
  { id: "f2", name: "genetics_worksheet.docx", ext: "docx", status: "done", size: "0.8 MB",
    concepts: ["Mendelian genetics", "Punnett square", "dominant/recessive", "codominance"],
    summary: "Practice worksheet with 12 Punnett square problems and 4 inheritance pattern questions." },
  { id: "f3", name: "ecology_notes.pdf", ext: "pdf", status: "processing", size: "2.1 MB" },
];

const SAVED_COURSES = ["Biology Unit 1", "Algebra II — Fall"];

// ── AI progress chat engine ───────────────────────────────────────────────────
function getAIReply(input: string, childName: string): ChatMsg {
  const q = input.toLowerCase();
  const id = Date.now().toString();
  if (q.includes("how is") || q.includes("overall") || q.includes("doing")) {
    return { id, role: "assistant",
      content: `${childName} is doing really well. Strong grades across all five courses — highest is English Literature at 96%, Biology Honors at 94%. She's averaging 5.8h/week and is 2 weeks ahead of pace in Biology.\n\nOne area worth watching: Spanish II at 88%, with a couple of shorter sessions recently.`,
      highlights: [{ label: "Avg grade", value: "91.6%", color: "#059669" }, { label: "Hrs/week", value: "5.8h", color: "#4f46e5" }, { label: "Active courses", value: "5", color: "#0ea5e9" }] };
  }
  if (q.includes("struggl") || q.includes("weak") || q.includes("difficult")) {
    return { id, role: "assistant",
      content: `Main challenge right now is Algebra II — completing the square and quadratic functions. Her last two sessions were shorter than usual (~45 min vs normal 90 min). Spanish II also needs more conversational practice.`,
      highlights: [{ label: "Watch: Algebra II", value: "89%", color: "#d97706" }, { label: "Watch: Spanish II", value: "88%", color: "#d97706" }] };
  }
  if (q.includes("pace") || q.includes("on track") || q.includes("behind")) {
    return { id, role: "assistant",
      content: `${childName} is ahead of pace in 3/5 courses. Biology and AP World History are 2 weeks ahead. Algebra II is on track. English Literature and Spanish II are about 5 hours behind scheduled hours each — not critical but worth an extra session per week.`,
      highlights: [{ label: "Ahead", value: "3/5", color: "#059669" }, { label: "On track", value: "1/5", color: "#4f46e5" }, { label: "Slight gap", value: "2/5", color: "#d97706" }] };
  }
  if (q.includes("this week") || q.includes("today") || q.includes("recent")) {
    return { id, role: "assistant",
      content: `This week: Monday — Algebra II + English Lit. Tuesday — Biology cell division (90 min, one of her longest this month) + AP History + essay draft. Today she's already done Biology and AP History, with English Lit still to go this afternoon.`,
      highlights: [{ label: "Done today", value: "2 sessions", color: "#059669" }, { label: "Remaining", value: "1 session", color: "#6366f1" }] };
  }
  if (q.includes("focus") || q.includes("recommend") || q.includes("what should")) {
    return { id, role: "assistant",
      content: `This week's priorities:\n\n1. **Algebra II** — Quiz review on Friday. A 30-min session on completing the square would help lock it in.\n2. **Spanish II** — Add a 30-min conversation practice session.\n3. **Biology** — She's in a great flow. Keep going.`,
      highlights: [{ label: "Priority 1", value: "Algebra II", color: "#d97706" }, { label: "Priority 2", value: "Spanish speaking", color: "#d97706" }, { label: "Maintain", value: "Biology", color: "#059669" }] };
  }
  return { id, role: "assistant",
    content: `I can look into that for ${childName}. Could you be a bit more specific — a particular subject, overall pace, recent work, or what to prioritize next?` };
}

const SUGGESTIONS = [
  { icon: "👋", text: "How is Emma doing overall?" },
  { icon: "📈", text: "Is Emma on pace for Biology?" },
  { icon: "⚠️", text: "What is Emma struggling with?" },
  { icon: "📅", text: "What has Emma been working on this week?" },
  { icon: "💡", text: "What should we focus on this week?" },
];

// ── Panel: Progress & AI Chat ─────────────────────────────────────────────────
function ChatPanel({ childId, childName }: { childId: string; childName: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    id: "init", role: "assistant",
    content: `Hi Sarah! Ask me anything about ${childName}'s learning — grades, pace, what she's been working on, or what to focus on next.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const courses = mockCourses.filter((c) => c.childId === childId);
  const today = new Date().toISOString().split("T")[0];
  const todayBlocks = mockScheduleBlocks.filter((b) => b.childId === childId && b.date === today && b.type === "academic");
  const totalHours = courses.reduce((s, c) => s + c.hoursLogged, 0);
  const avgGrade = courses.length ? Math.round(courses.reduce((s, c) => s + (c.grade ?? 0), 0) / courses.length) : 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    setMessages([{ id: "init-" + childId, role: "assistant",
      content: `Hi Sarah! Ask me anything about ${childName}'s learning — grades, pace, what she's been working on, or what to focus on next.` }]);
    setInput("");
  }, [childId, childName]);

  function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    setTimeout(() => { setMessages((m) => [...m, getAIReply(msg, childName)]); setLoading(false); }, 850);
  }

  const subjectDotColor: Record<string, string> = { Science: "#059669", Math: "#4f46e5", History: "#d97706", Literature: "#db2777", "Foreign Language": "#0ea5e9" };

  return (
    <div className="flex flex-1 min-h-0 gap-0">
      {/* Chat */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" ? (
                <div className="flex gap-2.5 max-w-lg w-full">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="white"/></svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground leading-relaxed bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 whitespace-pre-line shadow-sm">{msg.content}</div>
                    {msg.highlights && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card shadow-sm" style={{ borderColor: h.color + "30" }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                            <span className="text-xs text-muted-foreground">{h.label}:</span>
                            <span className="text-xs font-semibold" style={{ color: h.color }}>{h.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-sm text-sm text-white rounded-2xl rounded-tr-sm px-4 py-3 bg-blue-500">{msg.content}</div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="white"/></svg>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" style={{ animation: `tp-b 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          {messages.length <= 1 && !loading && (
            <div className="space-y-2 pt-1">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s.text.replace("Emma", childName))}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors group shadow-sm">
                  <span className="text-base">{s.icon}</span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{s.text.replace("Emma", childName)}</span>
                  <svg className="w-3.5 h-3.5 text-muted-foreground ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-border px-5 py-4 flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Ask about ${childName}'s progress…`}
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-card border border-border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring transition-all" />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22 11 13 2 9l20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        <style>{`@keyframes tp-b{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}`}</style>
      </div>

      {/* Progress sidebar */}
      <div className="flex-shrink-0 overflow-y-auto px-4 py-5 space-y-4 border-l border-border bg-background" style={{ width: 264 }}>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{childName}&apos;s snapshot</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Avg grade", value: `${avgGrade}%`, color: avgGrade >= 90 ? "#059669" : "#d97706" },
            { label: "Hours", value: `${totalHours}h`, color: "#4f46e5" },
            { label: "Done today", value: `${todayBlocks.filter(b=>b.completed).length}/${todayBlocks.length}`, color: "#059669" },
            { label: "Courses", value: String(courses.length), color: "#6b7280" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg px-3 py-3 shadow-sm">
              <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-3 py-2 border-b border-border"><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Courses</p></div>
          {courses.map((c) => {
            const pct = Math.round((c.hoursLogged / c.hoursTarget) * 100);
            const col = subjectDotColor[c.subject] ?? "#9ca3af";
            return (
              <div key={c.id} className="px-3 py-2.5 border-b border-border last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0"><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: col }} /><span className="text-xs font-medium text-foreground truncate">{c.name}</span></div>
                  <span className="text-xs font-bold ml-1 flex-shrink-0" style={{ color: (c.grade??0) >= 90 ? "#059669" : "#d97706" }}>{c.letterGrade}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col, opacity: 0.7 }} /></div>
                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Panel: Upload ─────────────────────────────────────────────────────────────
function UploadPanel({ childName }: { childName: string }) {
  const [files, setFiles] = useState<UploadFile[]>(INITIAL_FILES);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFiles(raw: File[]) {
    const nf: UploadFile[] = raw.map((f) => ({ id: Date.now()+f.name, name: f.name, ext: f.name.endsWith(".pdf") ? "pdf" : f.name.endsWith(".docx") ? "docx" : "txt", status: "processing" as const, size: (f.size/1024/1024).toFixed(1)+" MB" }));
    setFiles((p) => [...p, ...nf]);
    nf.forEach((x) => setTimeout(() => setFiles((p) => p.map((f) => f.id === x.id ? { ...f, status: "done", concepts: ["extracted concept", "key term"], summary: "AI-extracted summary will appear here." } : f)), 2500));
  }

  const extStyle: Record<string, { bg: string; text: string }> = { pdf: { bg: "#fef2f2", text: "#991b1b" }, docx: { bg: "#eff6ff", text: "#1e40af" }, txt: { bg: "#f0fdf4", text: "#166534" } };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Upload Materials for {childName}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drop textbooks, worksheets, or notes — AI extracts concepts and generates summaries</p>
      </div>
      <div onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn("border-2 border-dashed rounded-lg flex flex-col items-center py-10 cursor-pointer transition-colors", dragging ? "border-blue-400 bg-blue-50" : "border-border hover:border-muted-foreground/40 bg-card")}>
        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} />
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">Drop files or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT · up to 50 MB</p>
      </div>
      <div className="space-y-3">
        {files.map((f) => (
          <div key={f.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: extStyle[f.ext].bg, color: extStyle[f.ext].text }}>{f.ext.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                {f.status === "processing" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{ width: "60%", animation: "pp 1.5s ease-in-out infinite" }}/></div>
                    <span className="text-xs text-muted-foreground">Extracting…</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">{f.size} · <span className="text-green-600">Processed</span></p>
                )}
              </div>
              <button onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))} className="text-muted-foreground/40 hover:text-red-400 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/></svg>
              </button>
            </div>
            {f.status === "done" && f.concepts && (
              <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/30 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">{f.concepts.map((c, i) => <span key={i} className="text-xs bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-md">{c}</span>)}</div>
                {f.summary && <div className="bg-card border border-border rounded-md px-3 py-2.5"><p className="text-xs font-medium text-muted-foreground mb-0.5">AI summary</p><p className="text-xs text-foreground leading-relaxed">{f.summary}</p></div>}
                <div className="flex gap-2 pt-0.5">
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-card border border-border px-3 py-1.5 rounded-md transition-colors">Generate quiz</button>
                  <button className="text-xs font-medium text-muted-foreground hover:text-foreground bg-card border border-border px-3 py-1.5 rounded-md transition-colors">Add to curriculum</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`@keyframes pp{0%,100%{width:40%;opacity:.7}50%{width:80%;opacity:1}}`}</style>
    </div>
  );
}

// ── Panel: Study Roadmap ──────────────────────────────────────────────────────
function RoadmapPanel({ childName }: { childName: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["u1"]));
  const course = mockCourses.find((c) => c.name === "Biology");

  function toggle(id: string) {
    setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const statusStyle = {
    done:     { dot: "#22c55e", badge: { bg: "#f0fdf4", text: "#166534", border: "#86efac", label: "Done" } },
    active:   { dot: "#6366f1", badge: { bg: "#eff6ff", text: "#3730a3", border: "#a5b4fc", label: "Active" } },
    upcoming: { dot: "#d1d5db", badge: { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb", label: "Upcoming" } },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Study roadmap</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Week-by-week plan with estimated hours per topic</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-medium text-foreground border border-border bg-card hover:bg-accent px-3 py-1.5 rounded-md transition-colors">Export PDF</button>
          <button className="text-xs font-medium text-foreground border border-border bg-card hover:bg-accent px-3 py-1.5 rounded-md transition-colors">Push to scheduler</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "30", label: "Total weeks" },
            { value: `${course?.hoursLogged ?? 0 + 150}h`, label: "Study hours" },
            { value: "7.5h", label: "Per week" },
          ].map((m, i) => (
            <div key={i} className="bg-card border border-border rounded-lg px-5 py-4 shadow-sm">
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Unit cards */}
        {ROADMAP_UNITS.map((unit) => {
          const isOpen = expanded.has(unit.id);
          return (
            <div key={unit.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => toggle(unit.id)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors text-left">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{unit.num}</div>
                <span className="text-sm font-semibold text-foreground flex-1">{unit.name}</span>
                <span className="text-xs text-muted-foreground">Weeks {unit.weeks} · {unit.hours} · {unit.credit} credit</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0"
                  style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-border">
                  {unit.rows.map((row, ri) => {
                    const s = statusStyle[row.status];
                    return (
                      <div key={ri} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: s.dot }} />
                        <span className="text-sm text-foreground flex-1 leading-snug">{row.label}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-md border font-medium"
                            style={{ backgroundColor: s.badge.bg, color: s.badge.text, borderColor: s.badge.border }}>
                            {s.badge.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{row.hours}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* AI pacing note */}
        <div className="rounded-lg px-5 py-4" style={{ backgroundColor: "#fdf3e3", border: "1px solid #f0d5a0" }}>
          <p className="text-sm font-semibold mb-1.5" style={{ color: "#92400e" }}>AI pacing note</p>
          <p className="text-sm leading-relaxed" style={{ color: "#b45309" }}>
            Based on 7.5 study hours per week, {childName} should complete all 6 Bloom&apos;s taxonomy levels for each topic before moving on. At the current pace she will finish the full course with 2 weeks of buffer for review. If she studies 9h/week she could complete in 25 weeks.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Panel: Quiz Builder ───────────────────────────────────────────────────────
function QuizPanel({ childName }: { childName: string }) {
  const [activeBloom, setActiveBloom] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});

  const filtered = activeBloom ? QUIZ_ITEMS.filter((q) => q.bloom === activeBloom) : QUIZ_ITEMS;
  const bloomCounts = [1,2,3,4,5,6].map((l) => ({ level: l, count: QUIZ_ITEMS.filter((q) => q.bloom === l).length }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Quiz builder</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{QUIZ_ITEMS.length} questions · Biology · Aligned to Bloom&apos;s Taxonomy</p>
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-medium text-muted-foreground border border-border bg-card hover:bg-accent px-3 py-1.5 rounded-md transition-colors">+ Add question</button>
          <button className="text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors">Assign to {childName}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Bloom's filter */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Bloom&apos;s level</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveBloom(null)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
              style={{ backgroundColor: activeBloom === null ? "#1f2937" : "white", color: activeBloom === null ? "white" : "#374151", borderColor: activeBloom === null ? "#1f2937" : "#e5e7eb" }}>
              All ({QUIZ_ITEMS.length})
            </button>
            {bloomCounts.map(({ level, count }) => {
              const bc = BLOOM_COLORS[level];
              const isActive = activeBloom === level;
              return (
                <button key={level} onClick={() => setActiveBloom(isActive ? null : level)} disabled={count === 0}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-30"
                  style={{ backgroundColor: isActive ? bc.text : bc.bg, color: isActive ? "white" : bc.text, borderColor: bc.text }}>
                  L{level} {bc.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiz cards */}
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const bc = BLOOM_COLORS[item.bloom];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <button onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-accent transition-colors">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: bc.bg, color: bc.text }}>L{item.bloom}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{item.question}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-muted-foreground">{item.topic}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: item.type === "mc" ? "#eff6ff" : "#fdf4ff", color: item.type === "mc" ? "#1e40af" : "#7e22ce" }}>
                        {item.type === "mc" ? "Multiple choice" : "Open response"}
                      </span>
                    </div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0 mt-1"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-4 bg-muted/30 space-y-3">
                    {item.type === "mc" && item.options && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.options.map((opt, oi) => {
                          const answered = mcAnswers[item.id] !== undefined;
                          const selected = mcAnswers[item.id] === oi;
                          const isCorrect = item.correct === oi;
                          return (
                            <button key={oi} onClick={() => !answered && setMcAnswers((a) => ({ ...a, [item.id]: oi }))}
                              className="text-left text-xs px-3 py-2 rounded-md border transition-colors"
                              style={{
                                backgroundColor: answered ? (isCorrect ? "#f0fdf4" : selected ? "#fef2f2" : "#f9fafb") : "#ffffff",
                                borderColor: answered ? (isCorrect ? "#86efac" : selected ? "#fca5a5" : "#e5e7eb") : "#e5e7eb",
                                color: answered ? (isCorrect ? "#166534" : selected ? "#991b1b" : "#6b7280") : "#374151",
                                fontWeight: isCorrect && answered ? 600 : 400,
                              }}>
                              {isCorrect && answered && "✓ "}{opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {item.type === "open" && item.rubric && (
                      <div className="rounded-md px-3 py-3" style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff" }}>
                        <p className="text-xs font-semibold mb-2" style={{ color: "#7e22ce" }}>Grading rubric</p>
                        <ul className="space-y-1.5">
                          {item.rubric.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="flex-shrink-0 mt-0.5" style={{ color: "#a855f7" }}>•</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-0.5">
                      <p className="text-xs text-muted-foreground">Source: {item.source}</p>
                      <div className="flex gap-2">
                        <button className="text-xs text-muted-foreground bg-card border border-border px-2 py-1 rounded-md hover:bg-accent transition-colors">Edit</button>
                        <button className="text-xs text-red-500 bg-card border border-red-100 px-2 py-1 rounded-md hover:bg-red-50 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
const NAV: { id: PanelId; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "chat", label: "AI course planner",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "upload", label: "Upload materials", badge: 3,
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/></svg> },
  { id: "roadmap", label: "Study roadmap",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round"/><line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round"/><line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeWidth="2"/><line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeWidth="2"/><line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeWidth="2"/></svg> },
  { id: "quiz", label: "Quiz builder",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="12" cy="12" r="10" strokeLinecap="round"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeWidth="2"/></svg> },
];

export default function TutorPlanningPage() {
  const [panel, setPanel] = useState<PanelId>("chat");
  const [child, setChild] = useState(mockChildren[0]);

  return (
    <div className="flex h-full overflow-hidden bg-background" style={{ fontFamily: "inherit" }}>
      {/* Inner sidebar */}
      <aside className="flex flex-col flex-shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))]" style={{ width: 240 }}>
        {/* Child info */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Course planner</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: child.avatarColor }}>{child.name[0]}</div>
            <p className="text-xs text-muted-foreground">{child.name} · Biology gr. {child.gradeLevel}</p>
          </div>
          {/* Child switcher */}
          <div className="flex gap-1 mt-2.5">
            {mockChildren.map((c) => (
              <button key={c.id} onClick={() => setChild(c)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors"
                style={{ backgroundColor: child.id === c.id ? c.avatarColor + "20" : "transparent", color: child.id === c.id ? c.avatarColor : "#6b7280" }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace nav */}
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5 mb-1.5">Workspace</p>
          {NAV.map((item) => {
            const active = panel === item.id;
            return (
              <button key={item.id} onClick={() => setPanel(item.id)}
                className={cn("w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left", active ? "bg-accent text-foreground font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
                <span className={active ? "text-foreground" : "text-muted-foreground"}>{item.icon}</span>
                <span className="flex-1 text-sm">{item.label}</span>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Saved courses */}
        <div className="px-3 pt-2 border-t border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1.5 mb-1.5">Saved courses</p>
          {SAVED_COURSES.map((c) => (
            <button key={c} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-left">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {c}
            </button>
          ))}
          <button className="w-full mt-2 text-xs text-muted-foreground border border-dashed border-border rounded-md py-1.5 hover:bg-accent transition-colors flex items-center justify-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/></svg>
            New course
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {panel === "chat"    && <ChatPanel    key={child.id} childId={child.id} childName={child.name} />}
        {panel === "upload"  && <UploadPanel  childName={child.name} />}
        {panel === "roadmap" && <RoadmapPanel childName={child.name} />}
        {panel === "quiz"    && <QuizPanel    childName={child.name} />}
      </main>
    </div>
  );
}
