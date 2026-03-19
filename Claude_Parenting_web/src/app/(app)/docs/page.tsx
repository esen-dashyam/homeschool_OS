"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Plus, FileText, BookOpen, ChevronRight, ChevronDown,
  GripVertical, Check, Trash2, X, Share2, Clock,
  AlertCircle, Minus, BarChart2, Link2, Table2,
  Type, Heading2, CheckSquare
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────
type DocBlockType = "h1" | "h2" | "h3" | "text" | "checklist" | "table" | "resource" | "divider" | "callout" | "progress";

interface CheckItem { id: string; text: string; checked: boolean; hours?: number; }
interface DocBlock {
  id: string; type: DocBlockType; content?: string;
  items?: CheckItem[]; rows?: string[][]; headers?: string[];
  url?: string; calloutType?: "info" | "warning" | "tip";
}
interface UnitDoc {
  id: string; title: string; subject?: string; childName?: string;
  updatedAt: string; totalHoursLogged: number; blocks: DocBlock[];
  isShared?: boolean;
}

// ── Initial data ───────────────────────────────────────────
const INITIAL_DOCS: UnitDoc[] = [
  {
    id: "doc-1", title: "Biology Unit 3 — Cell Structure", subject: "Biology", childName: "Emma",
    updatedAt: "Mar 15", totalHoursLogged: 5, isShared: false,
    blocks: [
      { id: "b1", type: "h1", content: "Biology Unit 3 — Cell Structure & Function" },
      { id: "b2", type: "text", content: "This unit covers eukaryotic and prokaryotic cells, organelles, membrane transport, and cell division. Emma works through each topic at standard pace with weekly check-ins." },
      { id: "b3", type: "h2", content: "Week 1 — Cell Types & Organelles" },
      { id: "b4", type: "checklist", items: [
        { id: "ci1", text: "Prokaryotic vs eukaryotic cells", checked: true, hours: 2 },
        { id: "ci2", text: "Organelle structure and function", checked: true, hours: 3 },
        { id: "ci3", text: "Cell membrane composition", checked: false, hours: 2 },
      ]},
      { id: "b5", type: "h2", content: "Week 2 — Transport & Communication" },
      { id: "b6", type: "checklist", items: [
        { id: "ci4", text: "Passive transport — diffusion and osmosis", checked: false, hours: 2 },
        { id: "ci5", text: "Active transport and protein pumps", checked: false, hours: 2 },
        { id: "ci6", text: "Cell signaling basics", checked: false, hours: 1 },
      ]},
      { id: "b7", type: "h2", content: "Week 3 — Cell Division" },
      { id: "b8", type: "checklist", items: [
        { id: "ci7", text: "Mitosis — phases and significance", checked: false, hours: 3 },
        { id: "ci8", text: "Meiosis and genetic variation", checked: false, hours: 3 },
      ]},
      { id: "b9", type: "callout", calloutType: "warning", content: "CO requirement: lab component required for science credit. Schedule at least one hands-on cell observation lab this unit." },
      { id: "b10", type: "resource", content: "Khan Academy — Cell Biology", url: "https://khanacademy.org/science/biology" },
      { id: "b11", type: "progress" },
    ],
  },
  {
    id: "doc-2", title: "Co-op Session Plan — March 20", subject: undefined, childName: undefined,
    updatedAt: "Mar 17", totalHoursLogged: 0, isShared: true,
    blocks: [
      { id: "b12", type: "h1", content: "Thursday Co-op — March 20, 2026" },
      { id: "b13", type: "text", content: "Session plan for all participating families. Hosted at Priya's house, 9:00am–1:30pm." },
      { id: "b14", type: "h2", content: "Morning Block — Art (Sarah M.)" },
      { id: "b15", type: "checklist", items: [
        { id: "ci9", text: "Watercolor technique demo", checked: false },
        { id: "ci10", text: "Free painting — nature theme", checked: false },
        { id: "ci11", text: "Gallery share", checked: false },
      ]},
      { id: "b16", type: "h2", content: "Second Block — History (James K.)" },
      { id: "b17", type: "checklist", items: [
        { id: "ci12", text: "Revolutionary War timeline review", checked: false },
        { id: "ci13", text: "Primary source reading — Common Sense excerpt", checked: false },
        { id: "ci14", text: "Student-led discussion", checked: false },
      ]},
    ],
  },
  {
    id: "doc-3", title: "AP World History — Unit 5 Reading Log", subject: "AP World History", childName: "Emma",
    updatedAt: "Mar 10", totalHoursLogged: 8,
    blocks: [
      { id: "b18", type: "h1", content: "AP World History — Unit 5 Reading Log" },
      { id: "b19", type: "table", headers: ["Title", "Pages", "Date", "Done"], rows: [
        ["Ways of the World Ch. 17", "pp. 440–465", "Feb 3", "✓"],
        ["Ways of the World Ch. 18", "pp. 466–498", "Feb 10", "✓"],
        ["Ways of the World Ch. 19", "pp. 499–530", "Feb 17", "—"],
        ["Primary Sources packet", "20 pages", "Feb 24", "—"],
      ]},
    ],
  },
];

const SUBJECTS = ["Biology", "AP World History", "English Literature", "Algebra II"];

// ── Main Component ─────────────────────────────────────────
export default function DocsPage() {
  const [docs, setDocs] = useState<UnitDoc[]>(INITIAL_DOCS);
  const [selectedDocId, setSelectedDocId] = useState("doc-1");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const selectedDoc = docs.find(d => d.id === selectedDocId)!;
  const subjectGroups = SUBJECTS
    .map(s => ({ subject: s, docs: docs.filter(d => d.subject === s) }))
    .filter(g => g.docs.length > 0);
  const standaloneDocs = docs.filter(d => !d.subject);

  function updateDoc(docId: string, updater: (d: UnitDoc) => UnitDoc) {
    setDocs(p => p.map(d => d.id === docId ? updater(d) : d));
  }
  function updateBlock(docId: string, blockId: string, updater: (b: DocBlock) => DocBlock) {
    updateDoc(docId, d => ({ ...d, blocks: d.blocks.map(b => b.id === blockId ? updater(b) : b) }));
  }
  function toggleCheckItem(docId: string, blockId: string, itemId: string) {
    const doc = docs.find(d => d.id === docId)!;
    const block = doc.blocks.find(b => b.id === blockId)!;
    const item = block.items!.find(i => i.id === itemId)!;
    const delta = item.hours ? (item.checked ? -item.hours : item.hours) : 0;
    updateDoc(docId, d => ({
      ...d,
      totalHoursLogged: Math.max(0, d.totalHoursLogged + delta),
      blocks: d.blocks.map(b => b.id === blockId ? {
        ...b, items: b.items!.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
      } : b),
    }));
  }
  function addBlock(docId: string, type: DocBlockType) {
    const id = `b-${Date.now()}`;
    const block: DocBlock = {
      id, type,
      content: type === "callout" ? "Note…" : type === "resource" ? "Resource title" : type.startsWith("h") ? "Heading" : type === "text" ? "Start writing…" : undefined,
      items: type === "checklist" ? [{ id: `ci-${Date.now()}`, text: "New item", checked: false }] : undefined,
      rows: type === "table" ? [["", ""], ["", ""]] : undefined,
      headers: type === "table" ? ["Column 1", "Column 2"] : undefined,
      calloutType: type === "callout" ? "info" : undefined,
    };
    updateDoc(docId, d => ({ ...d, blocks: [...d.blocks, block] }));
  }
  function deleteBlock(docId: string, blockId: string) {
    updateDoc(docId, d => ({ ...d, blocks: d.blocks.filter(b => b.id !== blockId) }));
  }
  function addCheckItem(docId: string, blockId: string) {
    updateBlock(docId, blockId, b => ({
      ...b, items: [...(b.items ?? []), { id: `ci-${Date.now()}`, text: "New item", checked: false }]
    }));
  }
  function updateCheckItemText(docId: string, blockId: string, itemId: string, text: string) {
    updateBlock(docId, blockId, b => ({
      ...b, items: b.items!.map(i => i.id === itemId ? { ...i, text } : i)
    }));
  }

  const allItems = selectedDoc?.blocks.flatMap(b => b.items ?? []) ?? [];
  const checkedCount = allItems.filter(i => i.checked).length;
  const progress = allItems.length > 0 ? Math.round((checkedCount / allItems.length) * 100) : 0;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 border-r border-border flex-shrink-0 flex flex-col overflow-y-auto bg-[hsl(var(--sidebar-background))]">
        <div className="px-3 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Documents</span>
          <button
            onClick={() => setShowTemplates(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="New document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-1">
          {subjectGroups.map(({ subject, docs: subDocs }) => (
            <div key={subject} className="mb-2">
              <button
                onClick={() => setCollapsed(p => ({ ...p, [subject]: !p[subject] }))}
                className="flex items-center gap-1 w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 hover:text-foreground transition-colors"
              >
                {collapsed[subject] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {subject}
              </button>
              {!collapsed[subject] && subDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-left transition-colors",
                    selectedDocId === doc.id
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <FileText className="w-3 h-3 flex-shrink-0 opacity-60" />
                  <span className="truncate">{doc.title.split(" — ")[1] ?? doc.title}</span>
                </button>
              ))}
            </div>
          ))}
          {standaloneDocs.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">Standalone</div>
              {standaloneDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-left transition-colors",
                    selectedDocId === doc.id
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <FileText className="w-3 h-3 flex-shrink-0 opacity-60" />
                  <span className="truncate flex-1">{doc.title}</span>
                  {doc.isShared && <Share2 className="w-2.5 h-2.5 text-primary/60" />}
                </button>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* Editor */}
      <main className="flex-1 overflow-y-auto bg-background">
        {selectedDoc ? (
          <>
            {/* Toolbar */}
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-6 lg:px-10 py-2.5 flex items-center justify-between z-10 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {selectedDoc.childName && (
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{selectedDoc.childName}</span>
                )}
                {selectedDoc.subject && <span className="text-foreground/60">{selectedDoc.subject}</span>}
                <span>Updated {selectedDoc.updatedAt}</span>
                {selectedDoc.totalHoursLogged > 0 && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Clock className="w-3 h-3" />{selectedDoc.totalHoursLogged}h logged to transcript
                  </span>
                )}
                {allItems.length > 0 && (
                  <span>{checkedCount}/{allItems.length} topics complete</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedDoc.isShared && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Share2 className="w-3 h-3" />Shared
                  </span>
                )}
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-2.5 py-1 hover:bg-accent transition-colors">
                  <Share2 className="w-3 h-3" />Share
                </button>
              </div>
            </div>

            {/* Blocks */}
            <div className="max-w-2xl mx-auto px-6 lg:px-10 py-10 space-y-1">
              {selectedDoc.blocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  progress={block.type === "progress" ? progress : undefined}
                  onDelete={() => deleteBlock(selectedDoc.id, block.id)}
                  onToggleItem={itemId => toggleCheckItem(selectedDoc.id, block.id, itemId)}
                  onAddItem={() => addCheckItem(selectedDoc.id, block.id)}
                  onUpdateItemText={(itemId, text) => updateCheckItemText(selectedDoc.id, block.id, itemId, text)}
                  onUpdateContent={content => updateBlock(selectedDoc.id, block.id, b => ({ ...b, content }))}
                />
              ))}
              <div className="pt-6">
                <BlockAdder onAdd={type => addBlock(selectedDoc.id, type)} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a document from the sidebar
          </div>
        )}
      </main>

      {/* Template modal */}
      {showTemplates && (
        <TemplateModal
          onClose={() => setShowTemplates(false)}
          onCreate={(title, subject) => {
            const newDoc: UnitDoc = {
              id: `doc-${Date.now()}`, title,
              subject: subject || undefined, updatedAt: "Just now",
              totalHoursLogged: 0,
              blocks: [
                { id: `b-${Date.now()}-1`, type: "h1", content: title },
                { id: `b-${Date.now()}-2`, type: "text", content: "Add your unit overview here." },
                { id: `b-${Date.now()}-3`, type: "h2", content: "Week 1" },
                { id: `b-${Date.now()}-4`, type: "checklist", items: [
                  { id: `ci-${Date.now()}-1`, text: "Topic 1", checked: false, hours: 2 },
                  { id: `ci-${Date.now()}-2`, text: "Topic 2", checked: false, hours: 2 },
                ]},
              ],
            };
            setDocs(p => [...p, newDoc]);
            setSelectedDocId(newDoc.id);
            setShowTemplates(false);
          }}
        />
      )}
    </div>
  );
}

// ── Block Renderer ─────────────────────────────────────────
function BlockRenderer({ block, progress, onDelete, onToggleItem, onAddItem, onUpdateItemText, onUpdateContent }: {
  block: DocBlock; progress?: number;
  onDelete: () => void; onToggleItem: (id: string) => void;
  onAddItem: () => void; onUpdateItemText: (itemId: string, text: string) => void;
  onUpdateContent: (content: string) => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative group/block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Side controls */}
      <div className={cn("absolute -left-10 top-0.5 flex items-center gap-0.5 transition-opacity", hover ? "opacity-100" : "opacity-0")}>
        <button className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-0.5 text-muted-foreground/40 hover:text-rose-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* H1 */}
      {block.type === "h1" && (
        <div
          contentEditable suppressContentEditableWarning
          onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
          className="text-2xl font-bold text-foreground outline-none cursor-text py-1"
        >{block.content}</div>
      )}

      {/* H2 */}
      {block.type === "h2" && (
        <div
          contentEditable suppressContentEditableWarning
          onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
          className="text-lg font-semibold text-foreground outline-none cursor-text py-0.5 mt-4"
        >{block.content}</div>
      )}

      {/* H3 */}
      {block.type === "h3" && (
        <div
          contentEditable suppressContentEditableWarning
          onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
          className="text-base font-semibold text-muted-foreground outline-none cursor-text py-0.5"
        >{block.content}</div>
      )}

      {/* Text */}
      {block.type === "text" && (
        <div
          contentEditable suppressContentEditableWarning
          onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
          className="text-sm text-foreground/80 leading-relaxed outline-none cursor-text py-0.5 min-h-[1.5rem]"
        >{block.content}</div>
      )}

      {/* Divider */}
      {block.type === "divider" && <hr className="border-border my-3" />}

      {/* Callout */}
      {block.type === "callout" && (
        <div className={cn("flex gap-3 p-3 rounded-md border my-1", {
          "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900": block.calloutType === "info",
          "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900": block.calloutType === "warning",
          "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900": block.calloutType === "tip",
        })}>
          <AlertCircle className={cn("w-4 h-4 mt-0.5 flex-shrink-0", {
            "text-blue-500": block.calloutType === "info",
            "text-amber-500": block.calloutType === "warning",
            "text-green-500": block.calloutType === "tip",
          })} />
          <div
            contentEditable suppressContentEditableWarning
            onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
            className="text-sm outline-none cursor-text flex-1 text-foreground/80"
          >{block.content}</div>
        </div>
      )}

      {/* Resource */}
      {block.type === "resource" && (
        <div className="flex items-center gap-2.5 p-2.5 border border-border rounded-md hover:bg-accent/30 transition-colors my-1">
          <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div
              contentEditable suppressContentEditableWarning
              onBlur={e => onUpdateContent(e.currentTarget.textContent ?? "")}
              className="text-sm text-primary font-medium outline-none cursor-text"
            >{block.content}</div>
            {block.url && <p className="text-xs text-muted-foreground truncate mt-0.5">{block.url}</p>}
          </div>
        </div>
      )}

      {/* Progress */}
      {block.type === "progress" && progress !== undefined && (
        <div className="my-2 py-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Unit progress</span><span>{progress}%</span>
          </div>
          <div className="w-full bg-accent rounded-full h-1.5">
            <div className="h-1.5 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Table */}
      {block.type === "table" && block.rows && (
        <div className="my-2 overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-md overflow-hidden">
            {block.headers && (
              <thead>
                <tr className="bg-accent">
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-foreground border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0 hover:bg-accent/20">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-xs text-muted-foreground">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Checklist */}
      {block.type === "checklist" && block.items && (
        <div style={{ margin: "4px 0" }}>
          {block.items.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "3px 0" }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleItem(item.id)}
                style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0, accentColor: "#2383e2" }}
              />
              <span style={{
                fontSize: "14px",
                flex: 1,
                textDecoration: item.checked ? "line-through" : "none",
                color: item.checked ? "#9b9a97" : "inherit",
              }}>
                {item.text}
              </span>
              {item.hours && item.checked && (
                <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, flexShrink: 0 }}>
                  +{item.hours}h logged
                </span>
              )}
              {item.hours && !item.checked && (
                <span style={{ fontSize: "11px", color: "#9b9a97", flexShrink: 0 }}>
                  {item.hours}h
                </span>
              )}
            </div>
          ))}
          <button
            onClick={onAddItem}
            style={{ marginTop: "6px", fontSize: "12px", color: "#9b9a97", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", padding: 0 }}
          >
            + Add item
          </button>
        </div>
      )}
    </div>
  );
}

// ── Block Adder ────────────────────────────────────────────
function BlockAdder({ onAdd }: { onAdd: (type: DocBlockType) => void }) {
  const [open, setOpen] = useState(false);

  const blockTypes: { type: DocBlockType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: "text", label: "Text", icon: <Type className="w-4 h-4" />, desc: "Plain paragraph" },
    { type: "h2", label: "Heading", icon: <Heading2 className="w-4 h-4" />, desc: "Section title" },
    { type: "checklist", label: "Checklist", icon: <CheckSquare className="w-4 h-4" />, desc: "Topics with hour tags" },
    { type: "table", label: "Table", icon: <Table2 className="w-4 h-4" />, desc: "Rows and columns" },
    { type: "resource", label: "Resource link", icon: <Link2 className="w-4 h-4" />, desc: "URL with title" },
    { type: "callout", label: "Callout", icon: <AlertCircle className="w-4 h-4" />, desc: "Highlighted note" },
    { type: "divider", label: "Divider", icon: <Minus className="w-4 h-4" />, desc: "Horizontal separator" },
    { type: "progress", label: "Progress bar", icon: <BarChart2 className="w-4 h-4" />, desc: "Auto from checklist" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="w-4 h-4" />Add block
      </button>
      {open && (
        <div className="absolute bottom-8 left-0 bg-card border border-border rounded-md shadow-lg z-20 w-72 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground">Insert block</p>
          </div>
          <div className="p-1.5">
            {blockTypes.map(bt => (
              <button
                key={bt.type}
                onClick={() => { onAdd(bt.type); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                <div className="text-muted-foreground flex-shrink-0">{bt.icon}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bt.label}</p>
                  <p className="text-xs text-muted-foreground">{bt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Template Modal ─────────────────────────────────────────
function TemplateModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (title: string, subject?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [selected, setSelected] = useState("unit");

  const templates = [
    { id: "unit", label: "Unit Plan", desc: "Checklist, weekly schedule, resources" },
    { id: "coop", label: "Co-op Session", desc: "Multi-subject, per-teacher sections" },
    { id: "reading", label: "Reading Log", desc: "Title, pages, date, hours" },
    { id: "lab", label: "Lab Report", desc: "Hypothesis, method, results" },
    { id: "portfolio", label: "Portfolio Entry", desc: "Description, reflection, photos" },
    { id: "blank", label: "Blank", desc: "Start from scratch" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-card border border-border rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <p className="font-semibold text-foreground text-sm">New document</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Title</label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Biology Unit 4 — Genetics" autoFocus
              className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-ring bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Subject (optional)</label>
            <input
              value={subject} onChange={e => setSubject(e.target.value)}
              placeholder="Biology"
              className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-ring bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(t => (
                <button
                  key={t.id} onClick={() => setSelected(t.id)}
                  className={cn(
                    "text-left p-3 rounded-md border transition-colors",
                    selected === t.id ? "border-foreground bg-accent" : "border-border hover:bg-accent/50"
                  )}
                >
                  <p className="text-xs font-medium text-foreground">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-accent">Cancel</button>
          <button
            onClick={() => title && onCreate(title, subject)}
            disabled={!title}
            className="px-4 py-2 text-sm bg-foreground text-background rounded-md font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
          >Create</button>
        </div>
      </div>
    </div>
  );
}
