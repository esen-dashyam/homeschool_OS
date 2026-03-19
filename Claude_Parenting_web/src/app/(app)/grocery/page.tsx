"use client";

import { useState } from "react";
import { mockGroceryItems, mockFamily } from "@/lib/mockData";
import { GroceryItem } from "@/types";
import { cn } from "@/lib/utils";
import {
  ShoppingCart, Check, Plus, RefreshCw, Package,
  Leaf, Home, Beef, Snowflake, Box, Droplets, Pin
} from "lucide-react";

const CATEGORIES = ["produce", "dairy", "meat", "pantry", "frozen", "household", "personal-care", "other"] as const;
type Category = typeof CATEGORIES[number];

const categoryIcons: Record<Category, React.ReactNode> = {
  produce: <Leaf className="w-3.5 h-3.5" />,
  dairy: <Droplets className="w-3.5 h-3.5" />,
  meat: <Beef className="w-3.5 h-3.5" />,
  pantry: <Box className="w-3.5 h-3.5" />,
  frozen: <Snowflake className="w-3.5 h-3.5" />,
  household: <Home className="w-3.5 h-3.5" />,
  "personal-care": <Package className="w-3.5 h-3.5" />,
  other: <ShoppingCart className="w-3.5 h-3.5" />,
};

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItem[]>(mockGroceryItems);
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("pantry");
  const [showAdd, setShowAdd] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const estimatedTotal = items.reduce((s, i) => s + (i.estimatedCost ?? 0), 0);
  const remainingCost = items.filter(i => !i.checked).reduce((s, i) => s + (i.estimatedCost ?? 0), 0);

  function toggleItem(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  function addItem() {
    if (!newItem.trim()) return;
    const item: GroceryItem = {
      id: `g-${Date.now()}`,
      name: newItem.trim(),
      quantity: "1",
      unit: "unit",
      category: newCategory,
      checked: false,
    };
    setItems((prev) => [...prev, item]);
    setNewItem("");
    setShowAdd(false);
  }

  function resetList() {
    setItems((prev) => prev.map((i) => ({ ...i, checked: false })));
    setResetDone(true);
    setTimeout(() => setResetDone(false), 1500);
  }

  const grouped = CATEGORIES.reduce<Record<Category, GroceryItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<Category, GroceryItem[]>);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Grocery List</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {checkedCount}/{totalCount} checked · Est. ${remainingCost.toFixed(2)} remaining of ${estimatedTotal.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-foreground text-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
          <button
            onClick={resetList}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all",
              resetDone ? "bg-green-600 text-white" : "bg-foreground text-background hover:opacity-80"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {resetDone ? "Reset!" : "Reset list"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-md border border-border p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-foreground font-medium text-sm">Shopping progress</span>
          <span className="text-muted-foreground text-xs">{checkedCount} of {totalCount} items</span>
        </div>
        <div className="w-full bg-accent rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
          <span>Budget: ${mockFamily.weeklyGroceryBudget}/week</span>
          <span className={remainingCost > mockFamily.weeklyGroceryBudget ? "text-rose-500" : "text-green-600 dark:text-green-400"}>
            ${remainingCost.toFixed(2)} remaining
          </span>
        </div>
      </div>

      {/* Add item form */}
      {showAdd && (
        <div className="bg-accent/40 border border-border rounded-md p-4 flex gap-3 flex-wrap">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Item name…"
            className="flex-1 min-w-40 bg-card border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          <button
            onClick={addItem}
            className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Add
          </button>
        </div>
      )}

      {/* Staples */}
      {items.filter(i => i.isStaple).length > 0 && (
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-accent/40 flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground font-semibold text-xs uppercase tracking-wide">Pinned Staples</span>
          </div>
          <div className="divide-y divide-border">
            {items.filter(i => i.isStaple).map((item) => (
              <GroceryItemRow key={item.id} item={item} onToggle={toggleItem} />
            ))}
          </div>
        </div>
      )}

      {/* By category */}
      {CATEGORIES.map((cat) => {
        const catItems = grouped[cat].filter(i => !i.isStaple);
        if (catItems.length === 0) return null;
        return (
          <div key={cat} className="bg-card rounded-md border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-accent/40 flex items-center gap-2">
              <span className="text-muted-foreground">{categoryIcons[cat]}</span>
              <span className="text-foreground font-semibold text-xs uppercase tracking-wide capitalize">{cat}</span>
              <span className="ml-auto text-muted-foreground text-[11px]">
                {catItems.filter(i => i.checked).length}/{catItems.length}
              </span>
            </div>
            <div className="divide-y divide-border">
              {catItems.map((item) => (
                <GroceryItemRow key={item.id} item={item} onToggle={toggleItem} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroceryItemRow({ item, onToggle }: { item: GroceryItem; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40",
        item.checked && "opacity-50"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        item.checked ? "bg-green-500 border-green-500" : "border-border"
      )}>
        {item.checked && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm font-medium", item.checked ? "line-through text-muted-foreground" : "text-foreground")}>
          {item.name}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        <span>{item.quantity} {item.unit}</span>
        {item.estimatedCost && (
          <span className={item.checked ? "line-through" : ""}>${item.estimatedCost.toFixed(2)}</span>
        )}
      </div>
    </button>
  );
}
