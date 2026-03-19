"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@/types";

const onboardingFlow = [
  {
    trigger: 0,
    response: "Hi! I'm your Homeschool OS planning assistant. I'll set up a complete operating system for your homeschool family — academic schedules, compliance, transcripts, meals, and activities.\n\n**What are your children's names and ages?**",
  },
  {
    trigger: 1,
    response: "Wonderful! I've noted your children's profiles. Now let me understand your academic goals.\n\n**What state do you homeschool in, and what subjects are you covering this year?**",
  },
  {
    trigger: 2,
    response: "Got it — I've configured the compliance settings for your state.\n\n**What is your family's worldview preference for curriculum?** (Secular, Christian, Faith-neutral, or Custom per-subject)",
  },
  {
    trigger: 3,
    response: "Perfect. Last question: **What are your family's dietary preferences or restrictions?** (e.g., gluten-free, vegetarian, nut allergies, and your approximate weekly grocery budget)",
  },
  {
    trigger: 4,
    response: "🎉 **Your Homeschool OS is ready!**\n\nI've built:\n- ✅ Full academic schedule for each child\n- ✅ State compliance tracking configured for your state\n- ✅ Transcript records opened for your high schoolers\n- ✅ First-week meal plan with grocery list\n- ✅ Activity suggestions based on each child's interests\n\nLet's go to your dashboard.",
    isFinal: true,
  },
];

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  localStorage.setItem("hs-theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [themeChosen, setThemeChosen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: onboardingFlow[0].response,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function chooseTheme(chosen: Theme) {
    applyTheme(chosen);
    setTheme(chosen);
    setThemeChosen(true);
  }

  function handleSend() {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const nextStep = step + 1;
    const flow = onboardingFlow[nextStep];
    if (!flow) return;

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: flow.response,
        timestamp: new Date().toISOString(),
      }]);
      setIsTyping(false);
      setStep(nextStep);
      if (flow.isFinal) setIsDone(true);
    }, 1200);
  }

  // ── Step 0: Theme chooser ──────────────────────────────────
  if (!themeChosen) {
    return (
      <div className="fixed inset-0 z-50 flex" style={{ fontFamily: "system-ui, sans-serif" }}>
        {/* Light */}
        <button
          onClick={() => chooseTheme("light")}
          className="relative flex-1 flex flex-col items-center justify-center gap-6 bg-[#fbfaf8] group transition-all duration-300 hover:flex-[1.08]"
        >
          <p className="absolute top-10 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-widest text-[#9b9a97]">
            Choose your appearance
          </p>

          <div className="flex flex-col items-center gap-5">
            {/* Preview */}
            <div className="w-52 h-36 rounded-xl border border-[#e9e9e7] bg-white shadow-sm overflow-hidden">
              <div className="h-8 bg-[#f7f6f3] border-b border-[#e9e9e7] flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-[#d4d2ce]" />
                <div className="w-14 h-1.5 rounded-full bg-[#d4d2ce]" />
              </div>
              <div className="p-3 space-y-2">
                <div className="w-24 h-2 rounded-full bg-[#e9e9e7]" />
                <div className="w-32 h-2 rounded-full bg-[#f0efed]" />
                <div className="w-20 h-2 rounded-full bg-[#f0efed]" />
                <div className="mt-3 flex gap-2">
                  <div className="w-12 h-6 rounded-md bg-[#f0efed]" />
                  <div className="w-12 h-6 rounded-md bg-[#f0efed]" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[#37352f] font-semibold text-xl tracking-tight">Light</p>
              <p className="text-[#9b9a97] text-sm mt-1">Clean & minimal</p>
            </div>

            <div className="px-6 py-2 rounded-full border border-[#d4d2ce] text-[#37352f] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Select
            </div>
          </div>

          {/* Divider */}
          <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-[#e9e9e7]" />
        </button>

        {/* Dark */}
        <button
          onClick={() => chooseTheme("dark")}
          className="relative flex-1 flex flex-col items-center justify-center gap-6 bg-[#191919] group transition-all duration-300 hover:flex-[1.08]"
        >
          <div className="flex flex-col items-center gap-5">
            {/* Preview */}
            <div className="w-52 h-36 rounded-xl border border-[#2f2f2f] bg-[#1f1f1f] shadow-sm overflow-hidden">
              <div className="h-8 bg-[#191919] border-b border-[#2f2f2f] flex items-center gap-2 px-3">
                <div className="w-2 h-2 rounded-full bg-[#3f3f3f]" />
                <div className="w-14 h-1.5 rounded-full bg-[#3f3f3f]" />
              </div>
              <div className="p-3 space-y-2">
                <div className="w-24 h-2 rounded-full bg-[#2f2f2f]" />
                <div className="w-32 h-2 rounded-full bg-[#252525]" />
                <div className="w-20 h-2 rounded-full bg-[#252525]" />
                <div className="mt-3 flex gap-2">
                  <div className="w-12 h-6 rounded-md bg-[#252525]" />
                  <div className="w-12 h-6 rounded-md bg-[#252525]" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[#e8e6e1] font-semibold text-xl tracking-tight">Dark</p>
              <p className="text-[#6b6b6b] text-sm mt-1">Easy on the eyes</p>
            </div>

            <div className="px-6 py-2 rounded-full border border-[#3f3f3f] text-[#e8e6e1] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Select
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ── Step 1+: AI onboarding chat ────────────────────────────
  // Exact same palette as the app theme (CSS variable values)
  const c = theme === "dark"
    ? {
        page: "#191919",
        card: "#1f1f1f",
        border: "#2f2f2f",
        heading: "#e8e6e1",
        sub: "#6b6b6b",
        aiBubble: "#2a2a2a",
        aiText: "#d4d2ce",
        userBubble: "#2383e2",
        inputBg: "#252525",
        inputBorder: "#3f3f3f",
        inputText: "#e8e6e1",
        inputPlaceholder: "#555",
        accent: "#2383e2",
        dots: "#555",
        footer: "#444",
      }
    : {
        page: "#fbfaf8",
        card: "#ffffff",
        border: "#e9e9e7",
        heading: "#37352f",
        sub: "#9b9a97",
        aiBubble: "#f0efed",
        aiText: "#37352f",
        userBubble: "#2383e2",
        inputBg: "#f7f6f3",
        inputBorder: "#e9e9e7",
        inputText: "#37352f",
        inputPlaceholder: "#b0aeab",
        accent: "#2383e2",
        dots: "#c8c6c2",
        footer: "#c8c6c2",
      };

  const aiIcon = (
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: c.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: c.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg style={{ width: 22, height: 22, color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.2rem", color: c.heading, letterSpacing: "-0.02em" }}>Homeschool OS</div>
          <div style={{ fontSize: "0.72rem", color: c.sub }}>AI Planning Assistant</div>
        </div>
      </div>

      {/* Chat window */}
      <div style={{ width: "100%", maxWidth: 640, height: 520, backgroundColor: c.card, border: `1px solid ${c.border}`, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: theme === "dark" ? "0 24px 48px rgba(0,0,0,0.6)" : "0 8px 32px rgba(0,0,0,0.08)" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", gap: "0.75rem", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
              {msg.role === "assistant" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: c.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {aiIcon}
                </div>
              )}
              <div style={{
                maxWidth: "82%",
                backgroundColor: msg.role === "user" ? c.userBubble : c.aiBubble,
                color: msg.role === "user" ? "#fff" : c.aiText,
                borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                padding: "0.65rem 1rem",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}>
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} style={{ margin: line.startsWith("✅") || line.startsWith("🎉") ? "0 0 4px" : 0 }}
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                  />
                ))}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: c.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {aiIcon}
              </div>
              <div style={{ backgroundColor: c.aiBubble, borderRadius: "4px 18px 18px 18px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: 5 }}>
                {[0, 150, 300].map((delay) => (
                  <span key={delay} style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: c.dots, display: "inline-block", animation: "bounce 1s infinite", animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "1rem", borderTop: `1px solid ${c.border}` }}>
          {isDone ? (
            <button
              onClick={() => router.push("/dashboard")}
              style={{ width: "100%", backgroundColor: c.accent, color: "#fff", fontWeight: 600, padding: "0.75rem", borderRadius: 10, border: "none", cursor: "pointer", fontSize: "0.9rem" }}
            >
              Open My Homeschool OS →
            </button>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type your response…"
                style={{ flex: 1, backgroundColor: c.inputBg, border: `1px solid ${c.inputBorder}`, borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: c.inputText, outline: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{ backgroundColor: c.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 1rem", cursor: "pointer", opacity: (!input.trim() || isTyping) ? 0.4 : 1 }}
              >
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.72rem", color: c.footer, textAlign: "center" }}>
        You can update any setting later — this takes about 2 minutes
      </p>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}
