"use client";

import { useState, useRef, useEffect } from "react";
import { cn, getAvatarInitials } from "@/lib/utils";
import { mockAdults, mockFamily } from "@/lib/mockData";
import {
  Hash, Plus, Search, Bell, Pin, Smile, ChevronDown, ChevronRight,
  Paperclip, Send, Users, X, MessageSquare, AtSign,
  BookOpen, Calendar, MoreHorizontal, Reply, Bookmark,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface Author {
  id: string; name: string; avatarColor: string; role: string; online: boolean;
}
interface Reaction { emoji: string; count: number; reactedByMe: boolean; }
interface Message {
  id: string; channelId: string; authorId: string;
  content: string; timestamp: Date;
  reactions: Reaction[]; threadCount?: number; isPinned?: boolean;
}
interface Channel {
  id: string; name: string; description: string;
  type: "channel" | "dm"; dmUserId?: string;
  unread: number; isPrivate?: boolean;
}

// ── Authors ────────────────────────────────────────────────
const AUTHORS: Author[] = [
  { id: "adult-1", name: "Sarah", avatarColor: "#8b5cf6", role: "Parent", online: true },
  { id: "adult-2", name: "David", avatarColor: "#0ea5e9", role: "Parent", online: true },
  { id: "child-1", name: "Emma", avatarColor: "#6366f1", role: "Student", online: true },
  { id: "child-2", name: "Liam", avatarColor: "#10b981", role: "Student", online: false },
  { id: "child-3", name: "Sophia", avatarColor: "#f59e0b", role: "Student", online: true },
];

const ME = AUTHORS[0]; // logged in as Sarah

// ── Initial Channels ───────────────────────────────────────
const INITIAL_CHANNELS: Channel[] = [
  { id: "ch-general",    name: "general",    description: "Family announcements and day-to-day updates", type: "channel", unread: 3 },
  { id: "ch-curriculum", name: "curriculum", description: "Lesson ideas, resources, and planning", type: "channel", unread: 1 },
  { id: "ch-coop",       name: "co-op",      description: "Thursday co-op coordination", type: "channel", unread: 0 },
  { id: "ch-schedule",   name: "schedule",   description: "Schedule changes and reminders", type: "channel", unread: 2 },
  { id: "ch-random",     name: "random",     description: "Fun stuff, memes, and off-topic", type: "channel", unread: 0 },
  { id: "dm-david",  name: "David",  description: "", type: "dm", dmUserId: "adult-2", unread: 1 },
  { id: "dm-emma",   name: "Emma",   description: "", type: "dm", dmUserId: "child-1", unread: 0 },
  { id: "dm-liam",   name: "Liam",   description: "", type: "dm", dmUserId: "child-2", unread: 0 },
];

function d(minAgo: number) { return new Date(Date.now() - minAgo * 60000); }

// ── Initial Messages ───────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  // #general
  { id: "g1", channelId: "ch-general", authorId: "adult-1", content: "Good morning everyone! 🌅 School starts at 9am today. Emma, don't forget your Biology lab notebook.", timestamp: d(180), reactions: [{ emoji: "👍", count: 2, reactedByMe: false }] },
  { id: "g2", channelId: "ch-general", authorId: "adult-2", content: "I'll be dropping Liam at Robotics co-op at 12:45. Who needs a ride back?", timestamp: d(162), reactions: [] },
  { id: "g3", channelId: "ch-general", authorId: "child-1", content: "I'm good, I'll be home by 3:30. Can we have a snack run today? 🍕", timestamp: d(155), reactions: [{ emoji: "❤️", count: 1, reactedByMe: false }, { emoji: "😂", count: 2, reactedByMe: true }] },
  { id: "g4", channelId: "ch-general", authorId: "child-2", content: "Yes please!! I vote pizza 🍕🍕🍕", timestamp: d(150), reactions: [{ emoji: "🍕", count: 3, reactedByMe: false }], threadCount: 4 },
  { id: "g5", channelId: "ch-general", authorId: "child-3", content: "Me too me too!! 🙋‍♀️", timestamp: d(148), reactions: [] },
  { id: "g6", channelId: "ch-general", authorId: "adult-1", content: "Ha, okay — if everyone finishes their morning work by noon. Deal?", timestamp: d(145), reactions: [{ emoji: "✅", count: 4, reactedByMe: true }] },
  { id: "g7", channelId: "ch-general", authorId: "adult-2", content: "Also heads up — I have a dentist appt Thursday 10–11am so I won't be available for that slot. Sarah has co-op pickup covered.", timestamp: d(60), reactions: [] },
  { id: "g8", channelId: "ch-general", authorId: "adult-1", content: "Yep, I've got it. Also reminder: **weekly planning session tonight at 8pm** in the living room. David please be there this time 😅", timestamp: d(15), reactions: [{ emoji: "😅", count: 1, reactedByMe: false }, { emoji: "👀", count: 1, reactedByMe: false }] },
  { id: "g9", channelId: "ch-general", authorId: "adult-2", content: "I'll be there, I promise!", timestamp: d(10), reactions: [{ emoji: "😂", count: 2, reactedByMe: false }] },

  // #curriculum
  { id: "c1", channelId: "ch-curriculum", authorId: "adult-1", content: "Found a great Khan Academy playlist for Liam's Earth Science unit. Sharing it here: **Plate Tectonics Series** — 12 videos, really clear explanations.", timestamp: d(500), reactions: [{ emoji: "🙌", count: 2, reactedByMe: false }] },
  { id: "c2", channelId: "ch-curriculum", authorId: "adult-2", content: "Perfect timing! He's been struggling with the concept of subduction zones. Will queue it up for Friday.", timestamp: d(490), reactions: [] },
  { id: "c3", channelId: "ch-curriculum", authorId: "child-1", content: "Mom — for AP World History, should I use the AMSCO textbook or the Heimler review videos to prep for the DBQ?", timestamp: d(240), reactions: [] },
  { id: "c4", channelId: "ch-curriculum", authorId: "adult-1", content: "Both honestly. Use AMSCO for content depth, Heimler for essay structure. I'll leave a DBQ prompt on your desk for this week.", timestamp: d(235), reactions: [{ emoji: "📚", count: 1, reactedByMe: false }] },
  { id: "c5", channelId: "ch-curriculum", authorId: "adult-1", content: "Also thinking of adding a poetry unit for Sophia in April. Anyone have good picture book recommendations for 2nd grade?", timestamp: d(45), reactions: [] },

  // #co-op
  { id: "co1", channelId: "ch-coop", authorId: "adult-1", content: "Thursday co-op confirmed at Priya's house 9am–1:30pm. Kids should bring: water bottle, snack to share, and any supplies for their project.", timestamp: d(1440), reactions: [{ emoji: "✅", count: 3, reactedByMe: false }] },
  { id: "co2", channelId: "ch-coop", authorId: "adult-2", content: "Do we need to bring anything for the art session?", timestamp: d(1420), reactions: [] },
  { id: "co3", channelId: "ch-coop", authorId: "adult-1", content: "Sarah M. said she has all the watercolor supplies. Just bring Sophia with her apron so she doesn't ruin her clothes again 😂", timestamp: d(1410), reactions: [{ emoji: "😂", count: 2, reactedByMe: true }] },
  { id: "co4", channelId: "ch-coop", authorId: "child-1", content: "Emma here — for the history presentation, how long should it be?", timestamp: d(720), reactions: [] },
  { id: "co5", channelId: "ch-coop", authorId: "adult-1", content: "5–7 minutes, with at least one visual (poster, slides, or artifact). You're presenting on WWI causes, right?", timestamp: d(715), reactions: [] },
  { id: "co6", channelId: "ch-coop", authorId: "child-1", content: "Yes! I made slides already. Can I practice with you tonight?", timestamp: d(710), reactions: [{ emoji: "⭐", count: 1, reactedByMe: false }] },

  // #schedule
  { id: "sc1", channelId: "ch-schedule", authorId: "adult-1", content: "Schedule update: **Friday Biology Lab** moved from 10am to 9am so we finish before lunch. Emma please adjust your study plan.", timestamp: d(300), reactions: [{ emoji: "👍", count: 1, reactedByMe: false }] },
  { id: "sc2", channelId: "ch-schedule", authorId: "child-1", content: "Got it! That works better for me actually.", timestamp: d(290), reactions: [] },
  { id: "sc3", channelId: "ch-schedule", authorId: "adult-2", content: "Reminder: soccer game Saturday 10am. I'll handle transport. Game is at Eisenhower Park, field 3.", timestamp: d(120), reactions: [{ emoji: "⚽", count: 2, reactedByMe: false }] },
  { id: "sc4", channelId: "ch-schedule", authorId: "child-2", content: "LETS GOO 🔥🔥🔥", timestamp: d(115), reactions: [{ emoji: "🔥", count: 3, reactedByMe: false }] },
  { id: "sc5", channelId: "ch-schedule", authorId: "adult-1", content: "Museum visit Saturday afternoon after the game — pack comfortable shoes, we're going to the natural history exhibit.", timestamp: d(30), reactions: [{ emoji: "🦕", count: 2, reactedByMe: true }] },

  // #random
  { id: "r1", channelId: "ch-random", authorId: "child-2", content: "I built a working calculator in Minecraft using redstone circuits. Dad said it doesn't count as math but I disagree 😤", timestamp: d(2880), reactions: [{ emoji: "😂", count: 4, reactedByMe: true }, { emoji: "🧠", count: 2, reactedByMe: false }], threadCount: 6 },
  { id: "r2", channelId: "ch-random", authorId: "adult-2", content: "Okay FINE it counts as computer science 😂", timestamp: d(2860), reactions: [{ emoji: "🎉", count: 3, reactedByMe: false }] },
  { id: "r3", channelId: "ch-random", authorId: "child-3", content: "Look what I drew today!! 🎨 (Sophia's dragon drawing)", timestamp: d(1800), reactions: [{ emoji: "❤️", count: 4, reactedByMe: true }, { emoji: "🐉", count: 2, reactedByMe: false }] },
  { id: "r4", channelId: "ch-random", authorId: "child-1", content: "Sophia that is SO good omg", timestamp: d(1795), reactions: [] },

  // DM: David
  { id: "dm1", channelId: "dm-david", authorId: "adult-2", content: "Hey — can you order more printer ink today? Running out for the curriculum printouts.", timestamp: d(90), reactions: [] },
  { id: "dm2", channelId: "dm-david", authorId: "adult-1", content: "Already on it, ordered it this morning. Should arrive Thursday.", timestamp: d(85), reactions: [{ emoji: "💯", count: 1, reactedByMe: false }] },
  { id: "dm3", channelId: "dm-david", authorId: "adult-2", content: "You're the best ❤️ Also — are we doing date night this Friday or Saturday?", timestamp: d(5), reactions: [] },

  // DM: Emma
  { id: "dme1", channelId: "dm-emma", authorId: "child-1", content: "Mom can you check my AP History essay outline? I put it in the shared folder.", timestamp: d(400), reactions: [] },
  { id: "dme2", channelId: "dm-emma", authorId: "adult-1", content: "Looking at it now. Your thesis is strong but the second body paragraph needs more evidence from the primary sources.", timestamp: d(380), reactions: [] },
  { id: "dme3", channelId: "dm-emma", authorId: "child-1", content: "Okay I'll add the Zimmermann telegram reference. Thanks!", timestamp: d(375), reactions: [{ emoji: "📝", count: 1, reactedByMe: false }] },
];

const EMOJI_OPTIONS = ["👍","❤️","😂","🎉","🔥","✅","⭐","📚","🙌","😅","👀","💯"];

// ── Helpers ────────────────────────────────────────────────
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function fmtDay(d: Date) {
  const now = new Date();
  const diff = now.getDate() - d.getDate();
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

// ── Main Component ─────────────────────────────────────────
export default function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeChannel, setActiveChannel] = useState("ch-general");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showChannelSection, setShowChannelSection] = useState(true);
  const [showDMSection, setShowDMSection] = useState(true);
  const [threadMsg, setThreadMsg] = useState<Message | null>(null);
  const [threadInput, setThreadInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channel = channels.find(c => c.id === activeChannel)!;
  const channelMessages = messages.filter(m => m.channelId === activeChannel);

  // Group messages by day + consecutive author
  const grouped = (() => {
    const result: Array<{ date: string; messages: Array<Message & { showHeader: boolean }> }> = [];
    let currentDate = "";
    let currentGroup: Array<Message & { showHeader: boolean }> = [];

    for (let i = 0; i < channelMessages.length; i++) {
      const msg = channelMessages[i];
      const prev = channelMessages[i - 1];
      const dateLabel = fmtDay(msg.timestamp);
      const showHeader = !prev || prev.authorId !== msg.authorId ||
        (msg.timestamp.getTime() - prev.timestamp.getTime()) > 5 * 60000;

      if (dateLabel !== currentDate) {
        if (currentGroup.length) result.push({ date: currentDate, messages: currentGroup });
        currentDate = dateLabel;
        currentGroup = [];
      }
      currentGroup.push({ ...msg, showHeader });
    }
    if (currentGroup.length) result.push({ date: currentDate, messages: currentGroup });
    return result;
  })();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length, activeChannel]);

  function sendMessage(text: string, isThread = false) {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      authorId: ME.id,
      content: text.trim(),
      timestamp: new Date(),
      reactions: [],
    };
    setMessages(prev => [...prev, newMsg]);
    if (isThread) setThreadInput(""); else setInput("");
    // Mark channel as read
    setChannels(prev => prev.map(c => c.id === activeChannel ? { ...c, unread: 0 } : c));
  }

  function switchChannel(id: string) {
    setActiveChannel(id);
    setThreadMsg(null);
    setChannels(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function toggleReaction(msgId: string, emoji: string) {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...m, reactions: existing.count === 1
            ? m.reactions.filter(r => r.emoji !== emoji)
            : m.reactions.map(r => r.emoji === emoji
                ? { ...r, count: r.reactedByMe ? r.count - 1 : r.count + 1, reactedByMe: !r.reactedByMe }
                : r)
        };
      }
      return { ...m, reactions: [...m.reactions, { emoji, count: 1, reactedByMe: true }] };
    }));
    setShowEmojiPicker(null);
  }

  const totalUnread = channels.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ── Chat Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-[hsl(var(--sidebar-background))] overflow-y-auto">
        {/* Workspace header */}
        <div className="px-3 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <p className="text-foreground font-bold text-sm truncate">Johnson Family</p>
            <p className="text-muted-foreground text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {AUTHORS.filter(a => a.online).length} online
            </p>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-1">
            <Bell className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pt-2 pb-1">
          <div className="flex items-center gap-1.5 bg-accent rounded-md px-2 py-1.5">
            <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
            />
          </div>
        </div>

        <nav className="flex-1 px-1 py-1 space-y-0.5 overflow-y-auto">
          {/* Channels */}
          <button
            onClick={() => setShowChannelSection(s => !s)}
            className="flex items-center gap-1 w-full px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
          >
            {showChannelSection ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Channels
            <button className="ml-auto" onClick={e => e.stopPropagation()}>
              <Plus className="w-3 h-3 hover:text-foreground" />
            </button>
          </button>
          {showChannelSection && channels.filter(c => c.type === "channel").map(ch => (
            <SidebarItem key={ch.id} ch={ch} active={activeChannel === ch.id} onClick={() => switchChannel(ch.id)} />
          ))}

          {/* Direct Messages */}
          <button
            onClick={() => setShowDMSection(s => !s)}
            className="flex items-center gap-1 w-full px-2 py-1 mt-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground"
          >
            {showDMSection ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Direct Messages
            <Plus className="w-3 h-3 ml-auto hover:text-foreground" />
          </button>
          {showDMSection && channels.filter(c => c.type === "dm").map(ch => {
            const author = AUTHORS.find(a => a.id === ch.dmUserId);
            return (
              <button
                key={ch.id}
                onClick={() => switchChannel(ch.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors",
                  activeChannel === ch.id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: author?.avatarColor }}>
                    {getAvatarInitials(ch.name)}
                  </div>
                  {author?.online && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[hsl(var(--sidebar-background))]" />}
                </div>
                <span className="truncate flex-1">{ch.name}</span>
                {ch.unread > 0 && <span className="w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{ch.unread}</span>}
              </button>
            );
          })}
        </nav>

        {/* Me footer */}
        <div className="px-2 py-2 border-t border-border flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: ME.avatarColor }}>
              {getAvatarInitials(ME.name)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[hsl(var(--sidebar-background))]" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-xs font-semibold truncate">{ME.name}</p>
            <p className="text-green-600 text-[10px]">Active</p>
          </div>
        </div>
      </aside>

      {/* ── Main Message Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Channel header */}
        <header className="flex-shrink-0 border-b border-border px-4 py-2.5 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            {channel.type === "channel"
              ? <Hash className="w-4 h-4 text-muted-foreground" />
              : <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: AUTHORS.find(a => a.id === channel.dmUserId)?.avatarColor }}>{getAvatarInitials(channel.name)}</div>
            }
            <span className="font-semibold text-foreground text-sm">{channel.name}</span>
            {channel.description && <span className="text-muted-foreground text-xs hidden md:block">— {channel.description}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"><Pin className="w-4 h-4" /></button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"><Users className="w-4 h-4" /></button>
            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"><Search className="w-4 h-4" /></button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Channel intro */}
            {channel.type === "channel" && (
              <div className="pb-2 border-b border-border mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-2">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground">#{channel.name}</h2>
                <p className="text-muted-foreground text-sm mt-1">{channel.description} This is the start of the #{channel.name} channel.</p>
              </div>
            )}

            {grouped.map(({ date, messages: msgs }) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 border border-border rounded-full">{date}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {/* Messages */}
                <div className="space-y-0.5">
                  {msgs.map(msg => (
                    <MessageRow
                      key={msg.id}
                      msg={msg}
                      showHeader={msg.showHeader}
                      showEmojiPicker={showEmojiPicker === msg.id}
                      onEmojiPickerToggle={() => setShowEmojiPicker(prev => prev === msg.id ? null : msg.id)}
                      onReact={emoji => toggleReaction(msg.id, emoji)}
                      onThread={() => setThreadMsg(msg)}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Thread panel */}
          {threadMsg && (
            <div className="w-80 border-l border-border flex flex-col flex-shrink-0 bg-background">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                <p className="font-semibold text-foreground text-sm">Thread</p>
                <button onClick={() => setThreadMsg(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <MessageRow
                  msg={threadMsg}
                  showHeader
                  showEmojiPicker={false}
                  onEmojiPickerToggle={() => {}}
                  onReact={emoji => toggleReaction(threadMsg.id, emoji)}
                  onThread={() => {}}
                />
                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground">{threadMsg.threadCount ?? 0} replies</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-xs text-muted-foreground text-center">No replies yet — be the first to reply!</p>
              </div>
              <div className="p-3 border-t border-border flex-shrink-0">
                <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 focus-within:border-foreground/40 transition-colors bg-background">
                  <input
                    value={threadInput}
                    onChange={e => setThreadInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(threadInput, true); } }}
                    placeholder="Reply in thread…"
                    className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button onClick={() => sendMessage(threadInput, true)} disabled={!threadInput.trim()} className="text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2">
          <div className="border border-border rounded-xl overflow-hidden focus-within:border-foreground/30 transition-colors bg-background">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: ME.avatarColor }}>
                {getAvatarInitials(ME.name)}
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder={channel.type === "channel" ? `Message #${channel.name}` : `Message ${channel.name}`}
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground min-w-0"
              />
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50">
              <div className="flex items-center gap-1">
                {[
                  { icon: <Paperclip className="w-3.5 h-3.5" />, tip: "Attach file" },
                  { icon: <Smile className="w-3.5 h-3.5" />, tip: "Emoji" },
                  { icon: <AtSign className="w-3.5 h-3.5" />, tip: "Mention" },
                  { icon: <BookOpen className="w-3.5 h-3.5" />, tip: "Resources" },
                  { icon: <Calendar className="w-3.5 h-3.5" />, tip: "Schedule" },
                ].map(({ icon, tip }, i) => (
                  <button key={i} title={tip} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                    {icon}
                  </button>
                ))}
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-md text-xs font-medium disabled:opacity-30 hover:opacity-90 transition-opacity"
              >
                <Send className="w-3 h-3" /> Send
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-1">Press <kbd className="border border-border rounded-md px-1 py-0.5 font-mono text-[9px]">Enter</kbd> to send · <kbd className="border border-border rounded-md px-1 py-0.5 font-mono text-[9px]">Shift+Enter</kbd> for new line</p>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Item ───────────────────────────────────────────
function SidebarItem({ ch, active, onClick }: { ch: Channel; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-colors",
        active ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      <Hash className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate flex-1">{ch.name}</span>
      {ch.unread > 0 && (
        <span className="w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
          {ch.unread}
        </span>
      )}
    </button>
  );
}

// ── Message Row ────────────────────────────────────────────
function MessageRow({ msg, showHeader, showEmojiPicker, onEmojiPickerToggle, onReact, onThread }: {
  msg: Message; showHeader: boolean;
  showEmojiPicker: boolean; onEmojiPickerToggle: () => void;
  onReact: (emoji: string) => void; onThread: () => void;
}) {
  const author = AUTHORS.find(a => a.id === msg.authorId)!;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group flex gap-3 px-2 py-0.5 rounded-md hover:bg-accent/40 transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar or spacer */}
      <div className="w-8 flex-shrink-0 mt-0.5">
        {showHeader ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: author.avatarColor }}>
            {getAvatarInitials(author.name)}
          </div>
        ) : (
          <span className={cn("text-[10px] text-muted-foreground leading-none select-none mt-2 block text-right opacity-0 group-hover:opacity-100 transition-opacity")}>
            {fmtTime(msg.timestamp).replace(" AM", "a").replace(" PM", "p")}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground">{author.name}</span>
            <span className="text-[10px] text-muted-foreground">{fmtTime(msg.timestamp)}</span>
            {author.role === "Student" && (
              <span className="text-[9px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-full">student</span>
            )}
            {msg.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
          </div>
        )}

        {/* Content — render **bold** */}
        <p className="text-sm text-foreground/90 leading-relaxed break-words">
          {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={i}>{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
        </p>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  r.reactedByMe
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-accent border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                {r.emoji} <span className="font-medium">{r.count}</span>
              </button>
            ))}
            <button
              onClick={onEmojiPickerToggle}
              className="px-1.5 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-foreground/40 transition-colors"
            >
              <Smile className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Thread count */}
        {msg.threadCount && (
          <button
            onClick={onThread}
            className="flex items-center gap-1.5 mt-1 text-xs text-primary hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {msg.threadCount} {msg.threadCount === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover action bar */}
      {hovered && (
        <div className="absolute right-2 top-0 -translate-y-1/2 flex items-center gap-0.5 bg-background border border-border rounded-md shadow-sm px-1 py-0.5 z-10">
          <ActionBtn icon={<Smile className="w-3.5 h-3.5" />} tip="React" onClick={onEmojiPickerToggle} />
          <ActionBtn icon={<Reply className="w-3.5 h-3.5" />} tip="Reply in thread" onClick={onThread} />
          <ActionBtn icon={<Bookmark className="w-3.5 h-3.5" />} tip="Save" onClick={() => {}} />
          <ActionBtn icon={<Pin className="w-3.5 h-3.5" />} tip="Pin" onClick={() => {}} />
          <ActionBtn icon={<MoreHorizontal className="w-3.5 h-3.5" />} tip="More" onClick={() => {}} />
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute right-2 top-8 z-20 bg-background border border-border rounded-xl shadow-lg p-2 flex flex-wrap gap-1 w-52">
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => onReact(e)} className="w-8 h-8 text-lg hover:bg-accent rounded-md flex items-center justify-center transition-colors">
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, tip, onClick }: { icon: React.ReactNode; tip: string; onClick: () => void }) {
  return (
    <button title={tip} onClick={onClick} className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
      {icon}
    </button>
  );
}
