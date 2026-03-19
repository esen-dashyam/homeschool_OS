"use client";

import { useState, useRef, useEffect } from "react";
import { mockStudent, mockCourses, mockTutorMessages, socraticResponses } from "@/lib/mockData";
import { cn, getSubjectColor } from "@/lib/utils";
import { ChatMessage } from "@/types";
import {
  Send, Sparkles, FileText, ChevronLeft, ChevronRight,
  BookOpen, Lightbulb, BookmarkPlus, Check
} from "lucide-react";

const documentPages = [
  {
    page: 1,
    title: "Chapter 4: Cell Organelles",
    content: `Cells are the fundamental units of life. Eukaryotic cells contain membrane-bound organelles, each with a specific function that contributes to the overall survival of the cell.

The **nucleus** serves as the control center of the cell. It contains the cell's DNA and directs gene expression and cell reproduction.

The **cell membrane** is a phospholipid bilayer that controls what enters and exits the cell, maintaining the internal environment.`,
  },
  {
    page: 2,
    title: "Mitochondria & Energy",
    content: `The **mitochondria** are often called the powerhouse of the cell. They are the sites of cellular respiration — the process that converts glucose and oxygen into ATP (adenosine triphosphate), the cell's energy currency.

Mitochondria have a double membrane:
- The **outer membrane** acts as a boundary
- The **inner membrane** is folded into cristae, which increase surface area for ATP production

Mitochondria contain their own DNA, separate from the nucleus. This supports the **endosymbiotic theory** — that mitochondria evolved from free-living bacteria that were absorbed by larger cells long ago.`,
  },
  {
    page: 3,
    title: "Endoplasmic Reticulum",
    content: `The **endoplasmic reticulum (ER)** is a network of folded membranes that serves as a manufacturing and transport system.

There are two types:

**Rough ER** — has ribosomes attached to its surface. These ribosomes manufacture proteins, which are then processed and transported via the ER.

**Smooth ER** — has no ribosomes. It synthesizes lipids and phospholipids, detoxifies harmful chemicals, and stores calcium ions.

The ER works closely with the Golgi apparatus to process and ship proteins throughout the cell.`,
  },
  {
    page: 4,
    title: "Golgi Apparatus & Lysosomes",
    content: `The **Golgi apparatus** acts as the cell's post office. It receives proteins and lipids from the ER, modifies them, packages them into vesicles, and ships them to their destinations — either within the cell or outside it.

**Lysosomes** are membrane-bound vesicles containing digestive enzymes. They break down:
- Worn-out organelles (autophagy)
- Food particles taken in by the cell
- Foreign invaders (bacteria, viruses)

Without lysosomes, cellular waste would accumulate. Lysosomal storage diseases occur when these enzymes are defective.`,
  },
];

const personaLabels: Record<string, { name: string; color: string }> = {
  socratic:       { name: "Socratic",       color: "#534AB7" },
  direct:         { name: "Direct",         color: "#0F6E56" },
  "thought-partner": { name: "Thought Partner", color: "#993C1D" },
};

export default function TutorPage() {
  const course = mockCourses[0];
  const colors = getSubjectColor(course.subject);
  const persona = personaLabels[mockStudent.aiPersona] ?? personaLabels["socratic"];

  const [messages, setMessages] = useState<ChatMessage[]>(mockTutorMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIdx, setResponseIdx] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showMaterials, setShowMaterials] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend() {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const resp = socraticResponses[responseIdx % socraticResponses.length];
      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: resp.content,
        timestamp: new Date().toISOString(),
        citation: resp.citation,
        hintBox: resp.hintBox,
      };
      setMessages((p) => [...p, aiMsg]);
      setIsTyping(false);
      setResponseIdx((i) => i + 1);
    }, 1400 + Math.random() * 600);
  }

  function handleSaveNote(msgId: string) {
    setSavedNotes((prev) => new Set(Array.from(prev).concat(msgId)));
  }

  const doc = documentPages[currentPage];

  const quickPrompts = [
    "What do I need to know about this topic?",
    "Can you give me a hint?",
    "I don't understand this part",
    "Quiz me on what we covered",
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-4 sm:px-6 py-3 border-b border-border flex items-center gap-3 flex-shrink-0"
        style={{ backgroundColor: colors.lightBg }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}` }}
        >
          🧬
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm truncate">{course.name}</p>
            <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
            <p className="text-muted-foreground text-xs hidden sm:block truncate">{course.nextTopic}</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: colors.bg, color: persona.color, border: `1px solid ${colors.border}` }}
            >
              {persona.name} mode
            </span>
            <span className="text-muted-foreground text-xs">Page {currentPage + 1} of {documentPages.length}</span>
          </div>
        </div>
        <button
          onClick={() => setShowMaterials(!showMaterials)}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all",
            showMaterials
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Materials</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Materials panel */}
        {showMaterials && (
          <div className="hidden lg:flex flex-col w-80 xl:w-96 border-r border-border flex-shrink-0 bg-card">
            {/* Doc nav */}
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-accent/30">
              <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-foreground font-medium text-xs truncate flex-1">{doc.title}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-muted-foreground font-medium w-6 text-center">{currentPage + 1}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(documentPages.length - 1, p + 1))}
                  disabled={currentPage === documentPages.length - 1}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Page tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide">
              {documentPages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    "flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors",
                    i === currentPage
                      ? "text-white"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                  style={i === currentPage ? { backgroundColor: colors.accent } : {}}
                >
                  p.{i + 1}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <h3 className="font-semibold text-foreground text-sm mb-3">{doc.title}</h3>
              <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
                {doc.content.split("\n").map((line, i) => {
                  if (!line.trim()) return <div key={i} className="h-1" />;
                  const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/^- /, "• ");
                  return (
                    <p
                      key={i}
                      dangerouslySetInnerHTML={{ __html: formatted }}
                      className={line.startsWith("-") ? "pl-3" : ""}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
              >
                {/* Avatar */}
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}` }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
                  </div>
                )}
                {msg.role === "user" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1"
                    style={{ backgroundColor: mockStudent.avatarColor }}
                  >
                    {mockStudent.name[0]}
                  </div>
                )}

                <div className="max-w-[82%] space-y-1.5">
                  {/* Bubble */}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-foreground text-background rounded-tr-sm"
                        : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                    )}
                  >
                    {msg.content.split("\n").map((line, i) => {
                      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                      return line
                        ? <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="mb-0.5 last:mb-0" />
                        : <div key={i} className="h-1" />;
                    })}
                  </div>

                  {/* Citation */}
                  {msg.citation && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span>Cited: {msg.citation}</span>
                    </div>
                  )}

                  {/* Hint box */}
                  {msg.hintBox && (
                    <div
                      className="rounded-xl px-4 py-3 text-xs leading-relaxed border"
                      style={{ backgroundColor: colors.lightBg, borderColor: colors.border }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5" style={{ color: colors.accent }}>
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="font-semibold">Hint — {msg.hintBox.page}</span>
                      </div>
                      <p className="text-foreground/80 italic">{msg.hintBox.passage}</p>
                    </div>
                  )}

                  {/* Save note button (AI messages only) */}
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <button
                      onClick={() => handleSaveNote(msg.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all",
                        savedNotes.has(msg.id)
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-muted-foreground border-transparent hover:border-border hover:bg-accent"
                      )}
                    >
                      {savedNotes.has(msg.id) ? (
                        <><Check className="w-3 h-3" /> Saved to notes</>
                      ) : (
                        <><BookmarkPlus className="w-3 h-3" /> Save as note</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.bg, border: `1.5px solid ${colors.border}` }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => { setInput(p); inputRef.current?.focus(); }}
                className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-1 flex-shrink-0">
            <div className="flex gap-2 items-end bg-card border border-border rounded-2xl shadow-sm px-4 py-2.5 focus-within:ring-2 focus-within:ring-ring transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask about organelles…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                  input.trim() && !isTyping
                    ? "text-white shadow-sm hover:opacity-90 active:scale-95"
                    : "bg-accent text-muted-foreground cursor-not-allowed"
                )}
                style={input.trim() && !isTyping ? { backgroundColor: colors.accent } : {}}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1.5">
              Socratic mode — the tutor guides you to the answer, not to it
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
