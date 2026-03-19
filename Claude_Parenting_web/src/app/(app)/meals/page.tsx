"use client";

import { useState } from "react";
import { mockMeals, mockFamily } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Meal } from "@/types";
import {
  Utensils, Sparkles, Plus, RefreshCw, ShoppingCart,
  Clock, ChevronLeft, ChevronRight, Check, Leaf
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const mealTypeIcons: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🥗",
  dinner: "🍽️",
  snack: "🍎",
};

const aiSuggestions = [
  { name: "Overnight Oats with Berries", type: "breakfast", prepTime: 5, tags: ["gluten-free", "high-protein"] },
  { name: "Turkey Lettuce Wraps", type: "lunch", prepTime: 15, tags: ["gluten-free", "light"] },
  { name: "Sheet Pan Chicken & Veggies", type: "dinner", prepTime: 30, tags: ["gluten-free", "family-friendly"] },
  { name: "Hummus & Veggie Sticks", type: "snack", prepTime: 5, tags: ["gluten-free", "plant-based"] },
  { name: "Smoothie Bowl", type: "breakfast", prepTime: 10, tags: ["gluten-free", "energy-boost"] },
  { name: "Quinoa Power Bowl", type: "lunch", prepTime: 20, tags: ["gluten-free", "high-protein"] },
];

type MealType = typeof MEAL_TYPES[number];

export default function MealsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [meals, setMeals] = useState<Record<string, Record<MealType, string>>>(() => {
    const init: Record<string, Record<MealType, string>> = {};
    DAYS.forEach((d) => {
      init[d] = { breakfast: "", lunch: "", dinner: "", snack: "" };
    });
    init["Monday"] = { breakfast: "Greek Yogurt & Berries", lunch: "Grilled Chicken Salad", dinner: "Salmon & Roasted Veggies", snack: "Apple with Almond Butter" };
    init["Tuesday"] = { breakfast: "Scrambled Eggs & Toast", lunch: "Turkey Lettuce Wraps", dinner: "Beef Stir Fry & Rice", snack: "Hummus & Veggies" };
    init["Wednesday"] = { breakfast: "Smoothie Bowl", lunch: "Quinoa Power Bowl", dinner: "Baked Chicken Thighs", snack: "Mixed Berries" };
    return init;
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pushDone, setPushDone] = useState(false);
  const [editCell, setEditCell] = useState<{ day: string; type: MealType } | null>(null);

  const totalMeals = Object.values(meals).flatMap(Object.values).filter(Boolean).length;
  const estimatedCost = 148;

  function handlePushToGrocery() {
    setPushDone(true);
    setTimeout(() => setPushDone(false), 2500);
  }

  function handleEdit(day: string, type: MealType, value: string) {
    setMeals((prev) => ({ ...prev, [day]: { ...prev[day], [type]: value } }));
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Meal Planner</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Energy-aware · {totalMeals} meals planned · Est. ${estimatedCost}/week
            {mockFamily.dietaryRestrictions.length > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">{mockFamily.dietaryRestrictions.join(", ")}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-muted-foreground text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Suggestions
          </button>
          <button
            onClick={handlePushToGrocery}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all",
              pushDone ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
            )}
          >
            {pushDone ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            {pushDone ? "Pushed!" : "Push to Grocery"}
          </button>
        </div>
      </div>

      {/* Dietary tags */}
      <div className="flex flex-wrap gap-2">
        {[...mockFamily.dietaryRestrictions, ...mockFamily.allergies.map(a => `No ${a}`)].map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full font-medium">
            <Leaf className="w-3 h-3" /> {tag}
          </span>
        ))}
        <span className="text-xs px-2.5 py-1 bg-accent border border-border text-muted-foreground rounded-full">
          Budget: ${mockFamily.weeklyGroceryBudget}/week
        </span>
      </div>

      {/* AI suggestions panel */}
      {showSuggestions && (
        <div className="bg-accent/40 border border-border rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-foreground font-medium text-sm">AI Suggestions — based on your family profile</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiSuggestions.map((s) => (
              <div key={s.name} className="bg-card border border-border rounded-md p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground font-medium text-sm">{s.name}</p>
                  <span className="text-[10px]">{mealTypeIcons[s.type]}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-accent text-muted-foreground rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent text-muted-foreground rounded-full flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {s.prepTime}m
                  </span>
                </div>
                <button className="mt-auto text-primary text-xs font-medium hover:underline text-left">
                  + Add to Monday {s.type}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week nav */}
      <div className="flex items-center gap-2">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-foreground font-medium text-sm">
          {weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
        </span>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button className="ml-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate week
        </button>
      </div>

      {/* Meal grid */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-accent/50 border-b border-border">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-28">Meal</th>
                {DAYS.map((d) => (
                  <th key={d} className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {d.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MEAL_TYPES.map((mealType) => (
                <tr key={mealType} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{mealTypeIcons[mealType]}</span>
                      <span className="text-xs font-medium text-muted-foreground capitalize">{mealType}</span>
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const isEditing = editCell?.day === day && editCell?.type === mealType;
                    const val = meals[day]?.[mealType] ?? "";
                    return (
                      <td key={day} className="px-2 py-2 align-top">
                        {isEditing ? (
                          <input
                            autoFocus
                            defaultValue={val}
                            onBlur={(e) => { handleEdit(day, mealType, e.target.value); setEditCell(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") { handleEdit(day, mealType, (e.target as HTMLInputElement).value); setEditCell(null); } }}
                            className="w-full text-xs bg-card border border-border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-ring text-foreground"
                          />
                        ) : (
                          <button
                            onClick={() => setEditCell({ day, type: mealType })}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded-md text-xs transition-all",
                              val
                                ? "border border-border bg-accent/40 text-foreground font-medium hover:bg-accent/70"
                                : "text-muted-foreground/50 hover:bg-accent/40 hover:text-muted-foreground border border-dashed border-border"
                            )}
                          >
                            {val || <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Add</span>}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget estimate */}
      <div className="bg-card rounded-md border border-border p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-foreground font-medium text-sm">Estimated weekly cost</span>
            <span className={cn("font-bold text-sm", estimatedCost > mockFamily.weeklyGroceryBudget ? "text-rose-600 dark:text-rose-400" : "text-green-600 dark:text-green-400")}>
              ${estimatedCost} / ${mockFamily.weeklyGroceryBudget} budget
            </span>
          </div>
          <div className="w-full bg-accent rounded-full h-2">
            <div
              className={cn("h-2 rounded-full transition-all", estimatedCost > mockFamily.weeklyGroceryBudget ? "bg-rose-400" : "bg-green-500")}
              style={{ width: `${Math.min(100, (estimatedCost / mockFamily.weeklyGroceryBudget) * 100)}%` }}
            />
          </div>
        </div>
        {estimatedCost <= mockFamily.weeklyGroceryBudget && (
          <span className="text-green-600 dark:text-green-400 text-xs font-medium whitespace-nowrap">✓ Within budget</span>
        )}
      </div>
    </div>
  );
}
