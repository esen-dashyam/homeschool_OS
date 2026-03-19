# Homeschool OS

Two separate Next.js apps that run side by side — one for parents, one for students.

---

## Apps

| App | Folder | Port | Who uses it |
|-----|--------|------|-------------|
| **Parent / Tutor dashboard** | `Claude_Parenting_web/` | 3000 | Parents & tutors — course planning, AI tutor chat, study roadmap, quiz builder |
| **Student app** | `student/` | 3001 | Students — courses, lessons (video + reading), exercises, notes, pods |

---

## Running locally

You need two terminal windows open at the same time.

**Terminal 1 — Parent app**
```bash
cd Claude_Parenting_web
npm install
npm run dev
```
Open: http://localhost:3000

**Terminal 2 — Student app**
```bash
cd student
npm install
npm run dev
```
Open: http://localhost:3001

> Both apps must run simultaneously if you want to work on both views at once. The ports are hardcoded (3000 and 3001) so they won't conflict.

---

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (student app)
- Lucide React (icons)

---

## Project structure

```
/
├── Claude_Parenting_web/     # Parent dashboard (port 3000)
│   └── src/app/(app)/
│       ├── student/          # AI Tutor & Planning page
│       ├── dashboard/
│       └── ...
│
├── student/                  # Student app (port 3001)
│   └── src/app/(app)/
│       ├── courses/          # Course list → lesson (video/read) → exercise
│       ├── today/            # Daily schedule
│       ├── notes/            # Personal notes
│       ├── pods/             # Pod tasks
│       └── ...
│
├── brilliant_faithful_student_ui.html   # Static reference mockup
└── parent_course_planner_bloom.html     # Static reference mockup
```
