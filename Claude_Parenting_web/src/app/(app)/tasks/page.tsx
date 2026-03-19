"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Plus, Users, LayoutGrid, List, Calendar, User,
  GripVertical, Check, Trash2, X, Share2, Clock
} from "lucide-react";

type TaskRole =
  | "teacher" | "driver" | "supply-lead" | "organizer" | "logistics"
  | "student-presenter" | "discussion-leader" | "warmup-leader"
  | "admin" | "errand" | "appointment" | "self-care" | "household";

type TaskStatus = "todo" | "inprogress" | "done";
type BoardView = "kanban" | "weekly" | "list" | "mine";

interface Assignee { name: string; color: string; initials: string; }
interface BoardTask {
  id: string; title: string; role: TaskRole;
  assignees: Assignee[]; status: TaskStatus;
  day?: string; dueDate?: string; notes?: string;
  boardId: string;
}
interface Board { id: string; name: string; type: "family" | "coop"; coopDay?: string; }

const BOARDS: Board[] = [
  { id: "family", name: "Family Board", type: "family" },
  { id: "coop-1", name: "Thursday Co-op", type: "coop", coopDay: "Thursday" },
];

const INITIAL_TASKS: BoardTask[] = [
  { id: "bt-1", title: "Register Emma for SAT prep", role: "admin", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "todo", boardId: "family", dueDate: "2026-03-22" },
  { id: "bt-2", title: "Order Liam's math workbook", role: "errand", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "todo", boardId: "family" },
  { id: "bt-3", title: "Schedule dentist for all kids", role: "appointment", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "inprogress", boardId: "family", dueDate: "2026-03-25" },
  { id: "bt-4", title: "Update compliance attendance log", role: "admin", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "done", boardId: "family" },
  { id: "bt-5", title: "Buy art supplies for Sophia", role: "errand", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "done", boardId: "family" },
  { id: "bt-6", title: "Teach Art — Watercolor Basics", role: "teacher", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "todo", day: "Thursday", notes: "Bring 12 watercolor sets", boardId: "coop-1" },
  { id: "bt-7", title: "Teach History — Revolutionary War", role: "teacher", assignees: [{ name: "James K.", color: "#10b981", initials: "JK" }], status: "inprogress", day: "Thursday", boardId: "coop-1" },
  { id: "bt-8", title: "Coordinate PE — Relay races", role: "logistics", assignees: [{ name: "Priya N.", color: "#f59e0b", initials: "PN" }], status: "todo", day: "Thursday", boardId: "coop-1" },
  { id: "bt-9", title: "Morning carpool — North group", role: "driver", assignees: [{ name: "Linda C.", color: "#ef4444", initials: "LC" }], status: "todo", day: "Thursday", notes: "Pick up by 8:45am", boardId: "coop-1" },
  { id: "bt-10", title: "Science presentation — Ecosystems", role: "student-presenter", assignees: [{ name: "Emma", color: "#6366f1", initials: "E" }], status: "todo", day: "Thursday", boardId: "coop-1" },
  { id: "bt-11", title: "Lead morning warmup activity", role: "warmup-leader", assignees: [{ name: "Liam", color: "#10b981", initials: "L" }], status: "todo", day: "Thursday", boardId: "coop-1" },
  { id: "bt-12", title: "Confirm venue — Priya's house", role: "organizer", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "done", day: "Monday", boardId: "coop-1" },
  { id: "bt-13", title: "Send weekly agenda to all families", role: "organizer", assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }], status: "inprogress", day: "Wednesday", boardId: "coop-1" },
];

const ROLE_COLORS: Record<TaskRole, string> = {
  teacher: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  driver: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  "supply-lead": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  organizer: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  logistics: "bg-accent text-muted-foreground border-border",
  "student-presenter": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  "discussion-leader": "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
  "warmup-leader": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
  admin: "bg-accent text-muted-foreground border-border",
  errand: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  appointment: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  "self-care": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
  household: "bg-accent text-muted-foreground border-border",
};

const ROLE_LABELS: Record<TaskRole, string> = {
  teacher: "Teacher", driver: "Driver", "supply-lead": "Supply Lead",
  organizer: "Organizer", logistics: "Logistics", "student-presenter": "Presenter",
  "discussion-leader": "Discussion", "warmup-leader": "Warmup",
  admin: "Admin", errand: "Errand", appointment: "Appt",
  "self-care": "Self-care", household: "Household",
};

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "inprogress", label: "In progress" },
  { id: "done", label: "Done" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_TASKS);
  const [activeBoardId, setActiveBoardId] = useState("family");
  const [view, setView] = useState<BoardView>("kanban");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", role: "admin" as TaskRole, notes: "", day: "" });
  const dragRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const activeBoard = BOARDS.find(b => b.id === activeBoardId)!;
  const boardTasks = tasks.filter(t => t.boardId === activeBoardId);

  function moveTask(id: string, status: TaskStatus) {
    setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));
  }
  function deleteTask(id: string) { setTasks(p => p.filter(t => t.id !== id)); }
  function addTask() {
    if (!newTask.title.trim()) return;
    setTasks(p => [...p, {
      id: `bt-${Date.now()}`, title: newTask.title, role: newTask.role,
      assignees: [{ name: "Sarah M.", color: "#6366f1", initials: "SM" }],
      status: "todo", boardId: activeBoardId,
      notes: newTask.notes || undefined, day: newTask.day || undefined,
    }]);
    setNewTask({ title: "", role: "admin", notes: "", day: "" });
    setShowAdd(false);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {BOARDS.map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBoardId(b.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                  activeBoardId === b.id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {b.type === "coop" ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {b.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md overflow-hidden">
              {([
                { id: "kanban" as BoardView, icon: LayoutGrid, label: "Board" },
                { id: "weekly" as BoardView, icon: Calendar, label: "Weekly" },
                { id: "list" as BoardView, icon: List, label: "List" },
                { id: "mine" as BoardView, icon: User, label: "Mine" },
              ]).map(v => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  title={v.label}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors",
                    view === v.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-80 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" /> New task
            </button>
          </div>
        </div>
      </div>

      {/* Add task inline form */}
      {showAdd && (
        <div className="px-4 lg:px-6 py-3 border-b border-border bg-card flex-shrink-0">
          <div className="flex gap-2 flex-wrap items-end max-w-2xl">
            <input
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addTask()}
              placeholder="Task title…"
              autoFocus
              className="flex-1 min-w-40 border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-ring bg-background text-foreground"
            />
            <select
              value={newTask.role}
              onChange={e => setNewTask(p => ({ ...p, role: e.target.value as TaskRole }))}
              className="border border-border rounded-md px-2 py-1.5 text-sm outline-none bg-background text-foreground"
            >
              {(Object.keys(ROLE_LABELS) as TaskRole[]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            {activeBoard.type === "coop" && (
              <select
                value={newTask.day}
                onChange={e => setNewTask(p => ({ ...p, day: e.target.value }))}
                className="border border-border rounded-md px-2 py-1.5 text-sm outline-none bg-background text-foreground"
              >
                <option value="">No day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <input
              value={newTask.notes}
              onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))}
              placeholder="Note (optional)"
              className="border border-border rounded-md px-3 py-1.5 text-sm outline-none bg-background text-foreground min-w-36"
            />
            <div className="flex gap-1.5">
              <button onClick={addTask} className="px-3 py-1.5 bg-foreground text-background text-sm rounded-md font-medium hover:opacity-80">Add</button>
              <button onClick={() => setShowAdd(false)} className="px-2.5 py-1.5 border border-border text-muted-foreground rounded-md hover:bg-accent"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Board views */}
      <div className="flex-1 overflow-auto">
        {view === "kanban" && (
          <KanbanView
            tasks={boardTasks} dragOver={dragOver}
            onDragStart={id => { dragRef.current = id; }}
            onDragOver={(e, col) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(col); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={col => { if (dragRef.current) moveTask(dragRef.current, col as TaskStatus); dragRef.current = null; setDragOver(null); }}
            onMove={moveTask} onDelete={deleteTask}
          />
        )}
        {view === "weekly" && <WeeklyView tasks={boardTasks} onMove={moveTask} onDelete={deleteTask} />}
        {view === "list" && <ListView tasks={boardTasks} onMove={moveTask} onDelete={deleteTask} />}
        {view === "mine" && (
          <MyView
            tasks={boardTasks.filter(t => t.assignees.some(a => a.name.startsWith("Sarah")))}
            onMove={moveTask} onDelete={deleteTask}
          />
        )}
      </div>
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────
function TaskCard({ task, onDragStart, onMove, onDelete }: {
  task: BoardTask;
  onDragStart?: () => void;
  onMove?: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const nextStatus: Record<TaskStatus, TaskStatus | null> = { todo: "inprogress", inprogress: "done", done: null };

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", task.id); onDragStart?.(); }}
      onDragEnd={() => {}}
      className="bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing group hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium leading-snug", task.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>
            {task.title}
          </p>
          {task.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.notes}</p>}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md border", ROLE_COLORS[task.role])}>
              {ROLE_LABELS[task.role]}
            </span>
            {task.day && (
              <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-md">{task.day}</span>
            )}
            {task.dueDate && !task.day && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(task.dueDate + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((a, i) => (
              <div key={i} title={a.name} className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: a.color }}>
                {a.initials[0]}
              </div>
            ))}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onMove && nextStatus[task.status] && (
              <button
                onClick={() => onMove(task.id, nextStatus[task.status]!)}
                title="Move forward"
                className="p-0.5 text-muted-foreground hover:text-green-600 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => onDelete(task.id)} className="p-0.5 text-muted-foreground hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Kanban View ────────────────────────────────────────────
function KanbanView({ tasks, dragOver, onDragStart, onDragOver, onDragLeave, onDrop, onMove, onDelete }: {
  tasks: BoardTask[]; dragOver: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, col: string) => void;
  onDragLeave: () => void;
  onDrop: (col: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 lg:p-6 grid grid-cols-3 gap-3 h-full min-h-0 items-start">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={e => onDragOver(e, col.id)}
            onDragLeave={onDragLeave}
            onDrop={e => { e.preventDefault(); onDrop(col.id); }}
            className={cn(
              "flex flex-col rounded-md border min-h-40 transition-colors",
              dragOver === col.id ? "border-ring/50 bg-accent/30" : "border-border bg-background/60"
            )}
          >
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{col.label}</span>
              <span className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto">
              {colTasks.map(task => (
                <TaskCard key={task.id} task={task} onDragStart={() => onDragStart(task.id)} onMove={onMove} onDelete={onDelete} />
              ))}
              {colTasks.length === 0 && (
                <p className="text-center py-6 text-muted-foreground/40 text-xs">Drop cards here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Weekly View ────────────────────────────────────────────
function WeeklyView({ tasks, onMove, onDelete }: {
  tasks: BoardTask[]; onMove: (id: string, status: TaskStatus) => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="p-4 lg:p-6 overflow-x-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[900px]">
        {DAYS.map(day => {
          const dayTasks = tasks.filter(t => t.day === day);
          return (
            <div key={day} className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1.5 border-b border-border">{day.slice(0, 3)}</div>
              {dayTasks.map(t => <TaskCard key={t.id} task={t} onMove={onMove} onDelete={onDelete} />)}
              {dayTasks.length === 0 && <div className="text-xs text-muted-foreground/30 pt-2">—</div>}
            </div>
          );
        })}
      </div>
      {tasks.filter(t => !t.day).length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Unscheduled</p>
          <div className="flex flex-wrap gap-2">
            {tasks.filter(t => !t.day).map(t => (
              <div key={t.id} className="w-56"><TaskCard task={t} onMove={onMove} onDelete={onDelete} /></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── List View ──────────────────────────────────────────────
function ListView({ tasks, onMove, onDelete }: {
  tasks: BoardTask[]; onMove: (id: string, status: TaskStatus) => void; onDelete: (id: string) => void;
}) {
  const sorted = [...tasks].sort((a, b) => {
    const o = { todo: 0, inprogress: 1, done: 2 };
    return o[a.status] - o[b.status];
  });
  return (
    <div className="p-4 lg:p-6 max-w-3xl">
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] text-[10px] text-muted-foreground font-semibold uppercase tracking-wide px-4 py-2 border-b border-border gap-4">
          <span>Task</span><span>Role</span><span>Assignee</span><span>Day</span><span>Status</span>
        </div>
        <div className="divide-y divide-border">
          {sorted.map(task => (
            <div key={task.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-2.5 gap-4 group hover:bg-accent/20 transition-colors">
              <div className="min-w-0">
                <p className={cn("text-sm truncate", task.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>{task.title}</p>
                {task.notes && <p className="text-xs text-muted-foreground truncate">{task.notes}</p>}
              </div>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md border whitespace-nowrap", ROLE_COLORS[task.role])}>{ROLE_LABELS[task.role]}</span>
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 2).map((a, i) => (
                  <div key={i} title={a.name} className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: a.color }}>{a.initials[0]}</div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{task.day ?? (task.dueDate ? new Date(task.dueDate + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—")}</span>
              <button
                onClick={() => {
                  const next: Record<TaskStatus, TaskStatus> = { todo: "inprogress", inprogress: "done", done: "todo" };
                  onMove(task.id, next[task.status]);
                }}
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors",
                  task.status === "todo" ? "border-border text-muted-foreground hover:border-blue-300 hover:text-blue-600" :
                  task.status === "inprogress" ? "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300" :
                  "border-green-200 text-green-700 bg-green-50 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
                )}
              >
                {task.status === "todo" ? "To do" : task.status === "inprogress" ? "In progress" : "Done"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── My Tasks View ──────────────────────────────────────────
function MyView({ tasks, onMove, onDelete }: {
  tasks: BoardTask[]; onMove: (id: string, status: TaskStatus) => void; onDelete: (id: string) => void;
}) {
  const groups: { id: TaskStatus; label: string }[] = [
    { id: "todo", label: "To do" },
    { id: "inprogress", label: "In progress" },
    { id: "done", label: "Done" },
  ];
  return (
    <div className="p-4 lg:p-6 max-w-2xl space-y-5">
      {groups.map(g => {
        const items = tasks.filter(t => t.status === g.id);
        if (!items.length) return null;
        return (
          <div key={g.id}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{g.label} · {items.length}</p>
            <div className="space-y-2">
              {items.map(t => <TaskCard key={t.id} task={t} onMove={onMove} onDelete={onDelete} />)}
            </div>
          </div>
        );
      })}
      {!tasks.length && <p className="text-muted-foreground text-sm">No tasks assigned to you.</p>}
    </div>
  );
}
