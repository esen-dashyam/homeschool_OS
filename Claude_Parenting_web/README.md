# Homeschool OS

An AI-powered operating system for homeschool families. Connects academic instruction, state compliance, transcript generation, family activity planning, meal planning, and household management in one unified platform.

---

## Two Applications, Two Users

This platform is split into two completely separate Next.js apps that serve different users.

### localhost:3000 — Parent Admin (`~/Desktop/Claude_Parenting_web`)

The parent-facing operating system. Light admin UI with a persistent sidebar. Parents manage their homeschool household here — schedules, compliance, transcripts, meals, groceries, and more.

The `/student` route inside this app lets parents **view** what each child is currently learning — the node map, Bloom's taxonomy progress, XP and streak — without leaving the admin interface.

```bash
cd ~/Desktop/Claude_Parenting_web
npm install
npm run dev
# → http://localhost:3000
```

### localhost:3001 — Student Learning Portal (`~/Desktop/student`)

The student-facing learning interface. A completely separate application — no parent sidebar, no admin chrome. Built as a Brilliant.org-inspired dark learning environment where students do their actual work.

- Dark exercise surface (`#0f1117`) for all interactive content
- Visual node map — completed nodes glow green, active node pulses purple, locked nodes show a padlock
- Bloom's taxonomy quiz — 6 levels per topic (Remember → Understand → Apply → Analyze → Evaluate → Create), unlocking sequentially
- XP and streak system for daily engagement
- Daily challenge card for spaced repetition

```bash
cd ~/Desktop/student
npm install
npm run dev -- --port 3001
# → http://localhost:3001
```

### How they connect

| | Parent (3000) | Student (3001) |
|---|---|---|
| Who uses it | Parents / guardians | Students |
| Theme | Light, warm off-white | Dark (`#0f1117`) learning surface |
| `/student` route | Read-only view of child's progress | — |
| Sees grades / GPA | Yes | Never |
| Sees Carnegie hours | Yes | Never |
| Does exercises / quizzes | No | Yes |
| XP and streak | Visible in parent view | Student's primary motivation |

The parent never sees what a student sees on their screen. The student never sees compliance data, Carnegie units, or transcript records — those accumulate silently in the parent app as a byproduct of learning.

---

## Quick Start

## Stack

- **Next.js 14** with App Router
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **date-fns** for date utilities

## Pages

| Route | Description |
|---|---|
| `/onboarding` | AI planning agent — natural conversation setup |
| `/dashboard` | Parent overview: all children, heat map, engagement chart |
| `/schedule` | Day view (pixel timeline) + week list, one-click bump |
| `/student` | Split-screen AI tutor, quiz assessment, file manager |
| `/compliance` | Attendance log, state requirements, PDF export |
| `/transcript` | GPA calc, Carnegie units, AI course descriptions |
| `/portfolio` | K–12 continuous record, photo/doc/assessment entries |
| `/activities` | Per-child activity calendar, AI suggestions |
| `/meals` | Weekly meal grid, AI suggestions, dietary config |
| `/grocery` | Auto-populated from meals, by-section checklist |
| `/tasks` | Parent personal task list with priority tiers |
| `/settings` | Worldview, child profiles, AI persona, compliance |

## Demo Family

The app ships with a pre-configured demo family:

- **Sarah** (parent) · Colorado · Secular · Gluten-free · $200/week grocery budget
- **Emma**, 15 — Grade 10, Accelerated, Socratic Coach AI persona
- **Liam**, 11 — Grade 6, Standard, Direct Instructor AI persona  
- **Sophia**, 7 — Grade 2, Standard, Thought Partner AI persona

## Architecture Notes

All data is mock (no backend required). State is managed via React `useState`. The data model in `src/types/index.ts` is designed for extensibility — every entity (Child, Course, ScheduleBlock, Meal, etc.) can be extended without breaking changes.

## Phase 1 MVP Features (All Complete)

- ✅ AI planning agent onboarding conversation
- ✅ One-click adaptive rescheduling (bump button)
- ✅ Socratic tutoring engine with document-aware context
- ✅ Split-screen interface with page-tracking
- ✅ Open-ended AI assessment with immediate feedback
- ✅ Block-based schedule editor (daily + weekly views)
- ✅ Multi-child schedule view with conflict indicators
- ✅ 50-state compliance engine (Colorado demo)
- ✅ Attendance auto-log with PDF export
- ✅ K–12 portfolio module
- ✅ Transcript auto-builder (grades 9–12)
- ✅ Weighted/unweighted GPA calculation
- ✅ Carnegie unit session tracking
- ✅ Course description AI generator
- ✅ Parent oversight dashboard with topic heat map
- ✅ Worldview and per-subject content filter

## Phase 2 Features (All Complete)

- ✅ Kid activity planner with AI suggestions
- ✅ Energy-aware weekly meal planner
- ✅ Grocery list auto-populated from meal plan
- ✅ Parent personal task manager
