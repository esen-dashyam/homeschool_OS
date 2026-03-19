"use client";

import { useState } from "react";
import { mockNotes } from "@/lib/mockData";
import { cn, getSubjectColor } from "@/lib/utils";
import { StudentNote } from "@/types";
import { StickyNote, Search, Sparkles, Bell, Pencil, Trash2, X, Check, Plus } from "lucide-react";

const sourceConfig = {
  manual:      { label: "My note",     className: "bg-accent text-foreground border-border" },
  "ai-flagged":  { label: "AI saved",    className: "bg-[#1e1942] text-[#a89fec] border-[#3d2d8a]" },
  "ai-reminder": { label: "Study tip",   className: "bg-[#241a08] text-[#ecc452] border-[#4a3510]" },
};

function NoteCard({
  note,
  onDelete,
  onEdit,
}: {
  note: StudentNote;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colors = getSubjectColor(note.subject);
  const sourceStyle = sourceConfig[note.source];

  const relativeDate = (() => {
    const diff = Date.now() - new Date(note.createdAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  })();

  function saveEdit() {
    onEdit(note.id, draft);
    setEditing(false);
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2 border-b border-border"
        style={{ backgroundColor: colors.lightBg }}
      >
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
          style={{ backgroundColor: colors.bg, color: colors.accent, borderColor: colors.border }}
        >
          {note.subject}
        </span>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 flex items-center gap-1",
          sourceStyle.className
        )}>
          {note.source === "ai-flagged" && <Sparkles className="w-2.5 h-2.5" />}
          {note.source === "ai-reminder" && <Bell className="w-2.5 h-2.5" />}
          {sourceStyle.label}
        </span>
        <span className="text-muted-foreground text-xs ml-auto flex-shrink-0">{relativeDate}</span>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
            rows={4}
            className="w-full text-sm text-foreground bg-accent/40 border border-border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        ) : (
          <p className="text-foreground text-sm leading-relaxed">{note.content}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#534AB7] px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={() => { setEditing(false); setDraft(note.content); }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </>
        ) : (
          <>
            {note.source === "manual" && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-muted-foreground">Delete this note?</span>
                <button
                  onClick={() => onDelete(note.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-accent transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 ml-auto px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<StudentNote[]>(mockNotes);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [showNewNote, setShowNewNote] = useState(false);
  const [newSubject, setNewSubject] = useState("Biology");
  const [newContent, setNewContent] = useState("");

  const subjects = ["All", ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filtered = notes.filter((n) => {
    const matchSubject = filterSubject === "All" || n.subject === filterSubject;
    const matchSearch = !search.trim() || n.content.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  function handleDelete(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function handleEdit(id: string, content: string) {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n));
  }

  function handleAddNote() {
    if (!newContent.trim()) return;
    const newNote: StudentNote = {
      id: `n-${Date.now()}`,
      subject: newSubject,
      content: newContent.trim(),
      source: "manual",
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNewContent("");
    setShowNewNote(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">Private — only you can see these.</p>
        </div>
        <button
          onClick={() => setShowNewNote(!showNewNote)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#534AB7] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New note
        </button>
      </div>

      {/* New note composer */}
      {showNewNote && (
        <div className="bg-card rounded-2xl border border-[#3d2d8a]/50 shadow-sm overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-border bg-[#1e1942] flex items-center gap-3">
            <StickyNote className="w-4 h-4 text-[#534AB7]" />
            <span className="text-foreground font-semibold text-sm">New note</span>
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="ml-auto text-xs bg-white border border-border rounded-lg px-2 py-1 text-foreground outline-none focus:ring-1 focus:ring-ring"
            >
              {["Biology", "Algebra II", "AP World History", "English Literature", "Spanish II"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="p-4">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note…"
              rows={3}
              autoFocus
              className="w-full text-sm text-foreground bg-accent/30 border border-border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddNote}
                disabled={!newContent.trim()}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#534AB7] px-4 py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Check className="w-3.5 h-3.5" /> Save note
              </button>
              <button
                onClick={() => { setShowNewNote(false); setNewContent(""); }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your notes…"
          className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground bg-card placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Subject filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {subjects.map((subject) => {
          const colors = subject !== "All" ? getSubjectColor(subject) : null;
          const active = filterSubject === subject;
          return (
            <button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              className={cn(
                "flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                active
                  ? "text-white"
                  : "text-muted-foreground border-border bg-card hover:bg-accent"
              )}
              style={active && colors ? { backgroundColor: colors.accent, borderColor: colors.accent } :
                     active ? { backgroundColor: "#534AB7", borderColor: "#534AB7" } : {}}
            >
              {subject}
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
            <StickyNote className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-sm">No notes yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            {search ? "Try a different search." : "Start writing your first note above."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
