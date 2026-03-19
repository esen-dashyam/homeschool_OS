"use client";

import { useState } from "react";
import { mockFamily, mockActivities } from "@/lib/mockData";
import { Activity, ActivityCategory } from "@/types";
import { cn, getAvatarInitials, formatTime } from "@/lib/utils";
import {
  Star, Plus, Sparkles, TreePine, Wrench, Palette,
  Users, Dumbbell, Trash2, Check
} from "lucide-react";

const categoryConfig: Record<ActivityCategory, { label: string; icon: React.ReactNode; dot: string }> = {
  outdoor:      { label: "Outdoor & Nature",     icon: <TreePine className="w-3.5 h-3.5" />,  dot: "bg-green-500" },
  "life-skills":{ label: "Life Skills",          icon: <Wrench className="w-3.5 h-3.5" />,   dot: "bg-amber-500" },
  creative:     { label: "Creative Arts",        icon: <Palette className="w-3.5 h-3.5" />,  dot: "bg-rose-400" },
  social:       { label: "Social & Community",   icon: <Users className="w-3.5 h-3.5" />,    dot: "bg-blue-400" },
  physical:     { label: "Physical Fitness",     icon: <Dumbbell className="w-3.5 h-3.5" />, dot: "bg-orange-400" },
};

const aiSuggestions: Record<string, { name: string; category: ActivityCategory; time: string; why: string }[]> = {
  "child-1": [
    { name: "Nature Photography Walk", category: "outdoor", time: "45 min", why: "Matches Emma's photography interest + outdoor energy break after heavy academics" },
    { name: "Creative Writing Sprint", category: "creative", time: "30 min", why: "Ties into Emma's literature coursework and writing interest" },
    { name: "Volunteer at Local Library", category: "social", time: "2 hrs", why: "Community service for college applications, social engagement" },
  ],
  "child-2": [
    { name: "LEGO Robotics Challenge", category: "outdoor", time: "1 hr", why: "Liam's robotics interest + hands-on learning style" },
    { name: "Soccer Drills", category: "physical", time: "45 min", why: "High energy afternoon activity matches Liam's afternoon energy pattern" },
    { name: "Basic Home Cooking", category: "life-skills", time: "1 hr", why: "Age-appropriate life skill, hands-on learning" },
  ],
  "child-3": [
    { name: "Backyard Bird Count", category: "outdoor", time: "30 min", why: "Connects to Sophia's animal interest, outdoor time after morning academics" },
    { name: "Watercolor Nature Journal", category: "creative", time: "45 min", why: "Art interest + gentle creative activity suitable for grade 2" },
    { name: "Baking Cookies", category: "life-skills", time: "1 hr", why: "Fun life skill, math practice through measuring" },
  ],
};

export default function ActivitiesPage() {
  const [selectedChild, setSelectedChild] = useState(mockFamily.children[0].id);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addedSuggestion, setAddedSuggestion] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: "", category: "outdoor" as ActivityCategory, startTime: "15:00", endTime: "16:00" });

  const child = mockFamily.children.find((c) => c.id === selectedChild)!;
  const childActivities = activities.filter((a) => a.childId === selectedChild);
  const suggestions = aiSuggestions[selectedChild] ?? [];

  function addSuggestion(name: string, category: ActivityCategory) {
    const today = new Date().toISOString().split("T")[0];
    const act: Activity = {
      id: `a-${Date.now()}`,
      childId: selectedChild,
      name,
      category,
      date: today,
      startTime: "15:30",
      endTime: "16:30",
      isAISuggested: true,
    };
    setActivities((p) => [...p, act]);
    setAddedSuggestion(name);
    setTimeout(() => setAddedSuggestion(null), 2000);
  }

  function deleteActivity(id: string) {
    setActivities((p) => p.filter((a) => a.id !== id));
  }

  function handleAddActivity() {
    if (!newActivity.name.trim()) return;
    const today = new Date().toISOString().split("T")[0];
    const act: Activity = {
      id: `a-${Date.now()}`,
      childId: selectedChild,
      name: newActivity.name,
      category: newActivity.category,
      date: today,
      startTime: newActivity.startTime,
      endTime: newActivity.endTime,
    };
    setActivities((p) => [...p, act]);
    setNewActivity({ name: "", category: "outdoor", startTime: "15:00", endTime: "16:00" });
    setShowAddForm(false);
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kid Activities</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{childActivities.length} activities · AI suggests, parent decides</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Suggestions
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Activity
          </button>
        </div>
      </div>

      {/* Child selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {mockFamily.children.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedChild(c.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border",
              c.id === selectedChild
                ? "bg-foreground text-background border-transparent"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: c.avatarColor }}>
              {getAvatarInitials(c.name)}
            </div>
            {c.name}
          </button>
        ))}
      </div>

      {/* Child interests */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground font-medium self-center">Interests:</span>
        {child.interests.map((interest) => (
          <span key={interest} className="text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full capitalize">{interest}</span>
        ))}
        <span className="text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full">
          ⚡ {child.energyPattern} energy
        </span>
      </div>

      {/* AI Suggestions */}
      {showSuggestions && (
        <div className="bg-accent/40 border border-border rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-foreground font-medium text-sm">AI Suggestions for {child.name}</h3>
            <span className="ml-auto text-muted-foreground text-xs">Based on age, interests, and today&apos;s schedule</span>
          </div>
          <div className="space-y-2.5">
            {suggestions.map((s) => {
              const config = categoryConfig[s.category];
              const isAdded = addedSuggestion === s.name;
              return (
                <div key={s.name} className="bg-card border border-border rounded-md p-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm">{s.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{s.time} · {s.why}</p>
                  </div>
                  <button
                    onClick={() => addSuggestion(s.name, s.category)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0",
                      isAdded ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
                    )}
                  >
                    {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-md p-4 space-y-3">
          <h3 className="font-medium text-foreground text-sm">New Activity for {child.name}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={newActivity.name}
              onChange={(e) => setNewActivity(p => ({ ...p, name: e.target.value }))}
              placeholder="Activity name…"
              className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={newActivity.category}
              onChange={(e) => setNewActivity(p => ({ ...p, category: e.target.value as ActivityCategory }))}
              className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground"
            >
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <div className="flex gap-2 items-center">
              <input type="time" value={newActivity.startTime} onChange={(e) => setNewActivity(p => ({ ...p, startTime: e.target.value }))} className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
              <span className="text-muted-foreground text-sm">to</span>
              <input type="time" value={newActivity.endTime} onChange={(e) => setNewActivity(p => ({ ...p, endTime: e.target.value }))} className="flex-1 border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring bg-card text-foreground" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddActivity} className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity">Add Activity</button>
            <button onClick={() => setShowAddForm(false)} className="border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-accent transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Activities by category */}
      {Object.entries(categoryConfig).map(([catKey, config]) => {
        const cat = catKey as ActivityCategory;
        const catActivities = childActivities.filter((a) => a.category === cat);
        if (catActivities.length === 0) return null;
        return (
          <div key={cat} className="bg-card rounded-md border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-accent/40 flex items-center gap-2">
              <span className="text-muted-foreground">{config.icon}</span>
              <span className="text-foreground font-medium text-sm">{config.label}</span>
              <span className="ml-auto text-muted-foreground text-[11px]">{catActivities.length} activities</span>
            </div>
            <div className="divide-y divide-border">
              {catActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm">{activity.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{formatTime(activity.startTime)} – {formatTime(activity.endTime)}</span>
                      {activity.location && <span>· {activity.location}</span>}
                      {activity.recurring && <span className="text-primary">· Recurring</span>}
                      {activity.isAISuggested && <span className="text-muted-foreground">· AI suggested</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="p-1.5 rounded-md text-muted-foreground/40 hover:text-rose-500 hover:bg-accent transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {childActivities.length === 0 && (
        <div className="bg-accent/40 border border-dashed border-border rounded-md p-8 text-center">
          <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium text-sm">No activities scheduled for {child.name}</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Use AI Suggestions or add one manually</p>
        </div>
      )}
    </div>
  );
}
