"use client";

import { useState } from "react";
import { mockFamily, mockChildren } from "@/lib/mockData";
import { cn, getAvatarInitials } from "@/lib/utils";
import { WorldviewMode, AIPersona } from "@/types";
import {
  Settings, User, Shield, Brain, Globe, BookOpen,
  Check, Save, AlertTriangle, Leaf, Sun, Moon,
  MapPin, DollarSign
} from "lucide-react";

const worldviewOptions: { value: WorldviewMode; label: string; description: string }[] = [
  { value: "secular",       label: "Secular",              description: "Standard academic content. Evidence-based science. No religious framing." },
  { value: "christian",     label: "Christian",            description: "Content framed through a Christian worldview. Creation-based science options." },
  { value: "faith-neutral", label: "Faith-Neutral",        description: "Acknowledges religious perspectives without denominational framing." },
  { value: "custom",        label: "Custom",               description: "Configure each subject independently." },
];

const aiPersonaOptions: { value: AIPersona; label: string; description: string }[] = [
  { value: "socratic-coach",          label: "Socratic Coach",          description: "Guides through questions. Never provides direct answers. Best for self-directed learners." },
  { value: "thought-partner",         label: "Thought Partner",         description: "Collaborates on open-ended problems. Offers ideas and frameworks." },
  { value: "critical-thinking-guide", label: "Critical Thinking Guide", description: "Challenges assumptions, pushes students to defend reasoning." },
  { value: "direct-instructor",       label: "Direct Instructor",       description: "Explains concepts clearly and directly. Best for students who prefer structure." },
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

const perSubjectControls = [
  { subject: "Mathematics",         locked: true,  options: [] },
  { subject: "Science",             locked: false, options: ["Evidence-based / Evolution", "Creation-based"] },
  { subject: "History",             locked: false, options: ["Secular historiography", "Christian / Faith-integrated"] },
  { subject: "Literature",          locked: false, options: ["Standard selection", "Values-aligned selection"] },
  { subject: "Health & Life Skills",locked: false, options: ["Comprehensive", "Abstinence-based"] },
];

export default function SettingsPage() {
  const [worldview, setWorldview] = useState<WorldviewMode>(mockFamily.worldview);
  const [state, setState] = useState(mockFamily.state);
  const [budget, setBudget] = useState(mockFamily.weeklyGroceryBudget);
  const [childPersonas, setChildPersonas] = useState<Record<string, AIPersona>>(
    Object.fromEntries(mockChildren.map(c => [c.id, c.aiPersona]))
  );
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("hs-theme") as "light" | "dark") ?? "light";
    }
    return "light";
  });

  function switchTheme(theme: "light" | "dark") {
    localStorage.setItem("hs-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setCurrentTheme(theme);
  }

  const [activeTab, setActiveTab] = useState<"general" | "children" | "worldview" | "compliance" | "account">("general");

  function handleSave(section: string) {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Configure your Homeschool OS</p>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Tab nav */}
        <div className="lg:w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {[
              { id: "general",    label: "General",    icon: Settings },
              { id: "children",   label: "Children",   icon: User },
              { id: "worldview",  label: "Worldview",  icon: Globe },
              { id: "compliance", label: "Compliance", icon: Shield },
              { id: "account",    label: "Account",    icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeTab === tab.id
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeTab === "general" && (
            <>
              <SettingsCard title="Family Profile" icon={<User className="w-4 h-4" />}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Parent Name</label>
                    <input
                      defaultValue={mockFamily.parentName}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                      <MapPin className="w-3 h-3 inline mr-1" /> State
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
                    >
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <SaveButton done={savedSection === "general"} onSave={() => handleSave("general")} />
              </SettingsCard>

              <SettingsCard title="Appearance" icon={<Sun className="w-4 h-4" />}>
                <p className="text-xs text-muted-foreground mb-3">Choose your color scheme.</p>
                <div className="flex gap-3">
                  {[
                    { theme: "light" as const, label: "Light", sub: "Warm white", icon: Sun },
                    { theme: "dark" as const,  label: "Dark",  sub: "Easy on the eyes", icon: Moon },
                  ].map(({ theme, label, sub, icon: Icon }) => (
                    <button
                      key={theme}
                      onClick={() => switchTheme(theme)}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-4 py-3 rounded-md border-2 transition-all",
                        currentTheme === theme ? "border-primary bg-accent" : "border-border hover:bg-accent/40"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", currentTheme === theme ? "text-primary" : "text-muted-foreground")} />
                      <div className="text-left">
                        <p className={cn("text-sm font-medium", currentTheme === theme ? "text-foreground" : "text-muted-foreground")}>{label}</p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                      {currentTheme === theme && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard title="Grocery Budget" icon={<DollarSign className="w-4 h-4" />}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Weekly grocery budget</label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-32 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
                    />
                    <span className="text-muted-foreground text-sm">/ week</span>
                  </div>
                </div>
                <SaveButton done={savedSection === "budget"} onSave={() => handleSave("budget")} />
              </SettingsCard>

              <SettingsCard title="Dietary Restrictions" icon={<Leaf className="w-4 h-4" />}>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Dietary preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {mockFamily.dietaryRestrictions.map((r) => (
                        <span key={r} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full">
                          {r} <button className="hover:text-rose-500 ml-0.5">×</button>
                        </span>
                      ))}
                      <button className="text-xs px-2.5 py-1 border border-dashed border-border text-muted-foreground rounded-full hover:border-primary hover:text-primary transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {mockFamily.allergies.map((a) => (
                        <span key={a} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-500" /> No {a} <button className="hover:text-rose-500 ml-0.5">×</button>
                        </span>
                      ))}
                      <button className="text-xs px-2.5 py-1 border border-dashed border-border text-muted-foreground rounded-full hover:border-rose-400 hover:text-rose-500 transition-colors">
                        + Add allergy
                      </button>
                    </div>
                  </div>
                </div>
                <SaveButton done={savedSection === "diet"} onSave={() => handleSave("diet")} />
              </SettingsCard>
            </>
          )}

          {activeTab === "children" && (
            <>
              {mockChildren.map((child) => (
                <SettingsCard
                  key={child.id}
                  title={child.name}
                  icon={
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: child.avatarColor }}>
                      {getAvatarInitials(child.name)}
                    </div>
                  }
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Name</label>
                      <input defaultValue={child.name} className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Grade Level</label>
                      <select defaultValue={child.gradeLevel} className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground">
                        {["K","1","2","3","4","5","6","7","8","9","10","11","12"].map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Learning Pace</label>
                      <select defaultValue={child.pace} className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground">
                        <option value="accelerated">Accelerated</option>
                        <option value="standard">Standard</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Learning Style</label>
                      <select defaultValue={child.learningStyle} className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground">
                        <option value="visual">Visual</option>
                        <option value="hands-on">Hands-on</option>
                        <option value="reading-based">Reading-based</option>
                        <option value="socratic">Socratic</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      <Brain className="w-3 h-3 inline mr-1" /> AI Tutor Persona
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {aiPersonaOptions.map((p) => {
                        const active = childPersonas[child.id] === p.value;
                        return (
                          <button
                            key={p.value}
                            onClick={() => setChildPersonas(prev => ({ ...prev, [child.id]: p.value }))}
                            className={cn(
                              "text-left p-3 rounded-md border text-sm transition-all",
                              active ? "border-primary bg-accent" : "border-border hover:bg-accent/40"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={cn("font-medium text-xs", active ? "text-foreground" : "text-muted-foreground")}>{p.label}</span>
                              {active && <Check className="w-3 h-3 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground/70">{p.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <SaveButton done={savedSection === child.id} onSave={() => handleSave(child.id)} />
                </SettingsCard>
              ))}
            </>
          )}

          {activeTab === "worldview" && (
            <>
              <SettingsCard title="Worldview Configuration" icon={<Globe className="w-4 h-4" />}>
                <p className="text-muted-foreground text-xs mb-3">This setting propagates to the AI tutor, the knowledge base, and all generated content.</p>
                <div className="space-y-2">
                  {worldviewOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWorldview(opt.value)}
                      className={cn(
                        "w-full text-left p-3 rounded-md border transition-all",
                        worldview === opt.value ? "border-primary bg-accent" : "border-border hover:bg-accent/40"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{opt.label}</span>
                        {worldview === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
                <SaveButton done={savedSection === "worldview"} onSave={() => handleSave("worldview")} />
              </SettingsCard>

              {worldview === "custom" && (
                <SettingsCard title="Per-Subject Controls" icon={<BookOpen className="w-4 h-4" />}>
                  <div className="space-y-3">
                    {perSubjectControls.map((s) => (
                      <div key={s.subject} className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.subject}</p>
                          {s.locked && <p className="text-xs text-muted-foreground">Always secular — no worldview configuration</p>}
                        </div>
                        {!s.locked && s.options.length > 0 && (
                          <div className="flex gap-2 flex-shrink-0">
                            {s.options.map((opt, i) => (
                              <button
                                key={opt}
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                                  i === 0 ? "bg-accent border-border text-foreground" : "border-border text-muted-foreground hover:bg-accent/40"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                        {s.locked && <span className="text-xs text-muted-foreground/40 flex-shrink-0">Locked</span>}
                      </div>
                    ))}
                  </div>
                  <SaveButton done={savedSection === "subjects"} onSave={() => handleSave("subjects")} />
                </SettingsCard>
              )}
            </>
          )}

          {activeTab === "compliance" && (
            <SettingsCard title="State Compliance" icon={<Shield className="w-4 h-4" />}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your state</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground">
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="bg-accent/40 border border-border rounded-md p-3.5 space-y-1.5 text-sm">
                  <p className="font-medium text-foreground text-sm">Current configuration: {state}</p>
                  <p className="text-muted-foreground text-xs">Compliance tier auto-detected. Rules are stored as configurable objects — state rule changes require data updates only, not code changes.</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Notification of intent</p>
                  <div className="flex items-center gap-3 p-3 bg-accent/40 border border-border rounded-md">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-foreground text-sm">Annual notice filed · Last submitted: Sep 1, 2024</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/40 border border-border rounded-md">
                  <span className="text-sm text-foreground">Audit trail enabled</span>
                  <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
              </div>
              <SaveButton done={savedSection === "compliance"} onSave={() => handleSave("compliance")} />
            </SettingsCard>
          )}

          {activeTab === "account" && (
            <SettingsCard title="Account & Transparency" icon={<User className="w-4 h-4" />}>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                    <input type="email" defaultValue="sarah@familymail.com" className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Password</label>
                    <input type="password" defaultValue="••••••••" className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Public roadmap & voting",    desc: "See current sprint and vote on upcoming features" },
                    { label: "In-app feedback",            desc: "One-tap bug report or suggestion from any screen" },
                    { label: "Changelog notifications",    desc: "Get notified when new features ship" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-accent/40 border border-border rounded-md">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="w-10 h-6 bg-primary rounded-full relative flex-shrink-0">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <SaveButton done={savedSection === "account"} onSave={() => handleSave("account")} />
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <h2 className="font-medium text-foreground text-sm">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function SaveButton({ done, onSave }: { done: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all mt-1",
        done ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
      )}
    >
      {done ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Save className="w-3.5 h-3.5" /> Save changes</>}
    </button>
  );
}
