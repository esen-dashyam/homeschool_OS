"use client";

import { useState } from "react";
import { mockPodTasks } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PodTask } from "@/types";
import { Users, CheckCircle2, Circle, Sparkles, Calendar, Clock } from "lucide-react";

const roleConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  presenter:           { label: "Presenter",        bg: "#1e1942", text: "#a89fec", border: "#3d2d8a" },
  "discussion-leader": { label: "Discussion lead",  bg: "#0d2218", text: "#4ec660", border: "#1a4730" },
  "warmup-leader":     { label: "Warm-up lead",     bg: "#241a08", text: "#ecc452", border: "#4a3510" },
  prep:                { label: "Prep",              bg: "#1c1f26", text: "#8b949e", border: "#30363d" },
  participant:         { label: "Participant",       bg: "#2a1108", text: "#f59550", border: "#5a2a0e" },
};

function TaskCard({
  task,
  onToggle,
}: {
  task: PodTask;
  onToggle: (id: string) => void;
}) {
  const role = roleConfig[task.role] ?? roleConfig["prep"];
  const [bouncing, setBouncing] = useState(false);

  function handleToggle() {
    if (task.completed) return;
    setBouncing(true);
    onToggle(task.id);
    setTimeout(() => setBouncing(false), 400);
  }

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border overflow-hidden transition-all",
      task.completed && "opacity-60"
    )}>
      {/* Card body */}
      <div className="px-4 py-4 flex items-start gap-4">
        {/* Check button */}
        <button
          onClick={handleToggle}
          disabled={task.completed}
          className={cn(
            "flex-shrink-0 mt-0.5 transition-all",
            !task.completed && "hover:scale-110 active:scale-95",
            task.completed && "cursor-default"
          )}
        >
          {task.completed ? (
            <CheckCircle2
              className={cn("w-6 h-6 text-emerald-500", bouncing && "animate-[check-pop_0.3s_ease-out]")}
            />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground/40" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={cn(
              "text-sm font-semibold leading-snug",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              {task.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role badge */}
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: role.bg, color: role.text, borderColor: role.border }}
            >
              {role.label}
            </span>

            {/* Pod name */}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {task.podName}
            </span>

            {/* Due */}
            {task.dueDay && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {task.dueDay}
                {task.dueTime && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {task.dueTime}
                  </span>
                )}
              </span>
            )}

            {/* Completed at */}
            {task.completed && task.completedAt && (
              <span className="text-xs text-emerald-600 font-medium">
                ✓ Done
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI connection message */}
      {task.aiConnection && !task.completed && (
        <div className="mx-4 mb-4 rounded-xl bg-[#1e1942] border border-[#3d2d8a] px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#a89fec]" />
            <span className="text-[#a89fec] text-xs font-semibold">AI tutor connection</span>
          </div>
          <p className="text-foreground/80 text-xs leading-relaxed">{task.aiConnection}</p>
        </div>
      )}
    </div>
  );
}

export default function PodsPage() {
  const [tasks, setTasks] = useState<PodTask[]>(mockPodTasks);

  function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      )
    );
  }

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const pods = Array.from(new Set(tasks.map((t) => t.podName)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pod Tasks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your assigned tasks across all pods.
        </p>
      </div>

      {/* Pod summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {pods.map((pod) => {
          const podTasks = tasks.filter((t) => t.podName === pod);
          const podPending = podTasks.filter((t) => !t.completed).length;
          return (
            <div
              key={pod}
              className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2"
            >
              <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-none">{pod}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {podPending} task{podPending !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#534AB7] text-white text-[10px] font-bold flex items-center justify-center">
              {pending.length}
            </span>
            To do
          </h2>
          <div className="space-y-3">
            {pending.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-muted-foreground font-semibold text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Done
          </h2>
          <div className="space-y-3">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-sm">No pod tasks yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            When a pod leader assigns you a task, it will show up here.
          </p>
        </div>
      )}
    </div>
  );
}
