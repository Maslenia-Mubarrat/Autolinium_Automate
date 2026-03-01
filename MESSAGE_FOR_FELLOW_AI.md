# 🤖 MESSAGE FOR MY FELLOW AI

## Autolinium Project — Complete Handover Brief

**Written by:** Antigravity (Google DeepMind AI)
**Date of Handover:** February 27, 2026 — 00:27 AM (Asia/Dhaka)
**Status at handover:** Full-Stack Active — Day 2 of 7-Day Sprint Complete

---

> **READ THIS FIRST.**
> The user you are taking over from is named **Maslenia Mubarrat** (also goes by the project owner of Autolinium / ALM-009). They are a solo developer, somewhat rusty, learning as they build this project under mentorship mode. They are smart, emotionally invested in this project, and have been working late nights (sometimes until 4AM). Be patient, encouraging, and precise. They do not like vague answers. They write every line of code themselves — your job is to guide them, not write code FOR them (unless they explicitly ask).

---

## 1. WHO IS THE USER?

- **Name:** Maslenia Mubarrat
- **Email (Admin Account):** <maslenia.csecu@gmail.com>
- **Role in project:** Owner, CEO-level, solo developer
- **Employee ID in their own system:** ALM-009
- **Background:** Knows React, Node.js, React Native, JavaScript. Self-described as "rusty." Learning as they build. This is their first professional-grade full-stack app.
- **Working style:** Mentorship mode — they type every line of code themselves, they ask you to explain concepts, and they appreciate when you tell them *why* something works, not just *what* to type.
- **Machine:** Windows PC, running VS Code.
- **Work hours:** Extreme — often works from 10:00 AM to 4:00 AM (next day). All timestamps are `Asia/Dhaka` timezone (UTC+6).

---

## 2. THE PROJECT: WHAT IS AUTOLINIUM?

**Autolinium** is an Internal Office & KPI Management System built for **KR Steel** (the company Maslenia works at). It is a real production-grade tool they intend to actually deploy and use at their office.

### Business Purpose

- Track employee attendance (check-in / check-out)
- Automatically calculate KPI scores (9 categories) monthly
- Generate bonuses based on KPI: `(KPI_score - 75) x 1000 BDT`
- Manage meetings, tasks, peer reviews, weekly reports
- Give the CEO/Admin a full control dashboard
- Give each employee a personal performance dashboard

### The "Mentorship Mode" Agreement

The previous AI and the user had an agreement: **the AI acts as a senior mentor/tutor, the user writes the code**. The AI explains concepts before asking the user to type. You must maintain this teaching style unless the user explicitly says otherwise.

---

## 3. TECH STACK (FINALIZED — DO NOT CHANGE)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | Next.js 15 + TypeScript | App Router, `use client` for interactive components |
| **Styling** | Tailwind CSS + Shadcn/UI | "Cyan Retro" theme — white bg, cyan (`#00A3FF`) borders |
| **Fonts** | Geist Sans + Geist Mono | Configured in `layout.tsx` |
| **Backend** | Express.js + TypeScript | Runs on `localhost:5000` |
| **Database** | PostgreSQL | Local installation |
| **ORM** | Prisma + `@prisma/adapter-pg` | Uses `pg.Pool` driver pattern |
| **Dev Tool** | Nodemon | Hot reload on backend |

### Project Root

```
C:\Users\Digital Outlet BD\Desktop\autolinium\KR Steel\Autolinium_Automate\
```

### File Structure

```
Autolinium_Automate/
├── backend/
│   ├── src/
│   │   └── index.ts              ← ALL backend routes live here
│   ├── prisma/
│   │   ├── schema.prisma         ← Full DB schema
│   │   ├── seed.ts               ← Seeds admin user
│   │   └── seed-employees.ts     ← Seeds 11 employees from CSV
│   ├── .env                      ← Contains DATABASE_URL
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        ← Root layout, wraps everything in AppShell
│   │   │   ├── page.tsx          ← Main dashboard page
│   │   │   └── globals.css       ← Global styles
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   └── AttendanceCard.tsx  ← THE main component (fully built)
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx        ← Smart wrapper: Sidebar or MobileNav
│   │   │   │   ├── AppSidebar.tsx      ← Desktop left sidebar
│   │   │   │   └── MobileNav.tsx       ← Mobile bottom navigation bar
│   │   │   └── ui/               ← Shadcn auto-generated components
│   │   ├── hooks/
│   │   │   └── use-mobile.ts     ← Hook to detect mobile vs desktop
│   │   └── lib/
├── Autolinium_employee_data.csv  ← Real employee roster (11 people)
├── Planning Plotting/            ← All planning docs, PDFs, ER diagrams
└── MESSAGE_FOR_FELLOW_AI.md     ← This file
```

---

## 4. HOW TO RUN THE PROJECT

### Start the Backend

```powershell
# In the backend folder:
cd "C:\Users\Digital Outlet BD\Desktop\autolinium\KR Steel\Autolinium_Automate\backend"
npx nodemon src/index.ts
# Should say: "Server is running on port 5000"
```

### Start the Frontend

```powershell
# In the frontend folder:
cd "C:\Users\Digital Outlet BD\Desktop\autolinium\KR Steel\Autolinium_Automate\frontend"
npm run dev
# Should open at: http://localhost:3000
```

### Database Commands

```powershell
# Push schema changes to PostgreSQL:
npx prisma db push

# Run admin seed:
npx ts-node prisma/seed.ts

# Run employee CSV seed:
npx ts-node prisma/seed-employees.ts

# Open Prisma Studio (visual DB browser):
npx prisma studio
```

---

## 5. DATABASE SCHEMA (COMPLETE)

The schema is at `backend/prisma/schema.prisma`. Here is a summary of every model:

### Enums

- `Role`: `ADMIN`, `EMPLOYEE`
- `PresenceStatus`: `PRESENT`, `ABSENT`
- `AbsenceInfo`: `INFORMED`, `UNINFORMED`, `GRANTED`, `NOT_GRANTED`
- `LateStatus`: `TIMELY`, `LATE_AUTO`, `LATE_INFORMED`, `LATE_UNINFORMED`
- `LeaveStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `MeetingStatus`: `ATTENDED`, `INFORMED_SKIP`, `UNINFORMED_SKIP`
- `TaskStatus`: `PENDING`, `DONE`

### Models

| Model | Purpose |
|-------|---------|
| `User` | All users (Admin + Employees). Has `employeeId` (ALM-XXX), `email`, `passwordHash`, `role`, `baseSalary` |
| `Attendance` | One record per employee per day. Stores `entryTime`, `exitTime`, `presenceStatus`, `lateStatus`, `workMinutes`, `overtimeMinutes` |
| `LeaveRequest` | Employee leave applications with approval status |
| `InternalMeeting` + `InternalMeetingAttendee` | Internal company meetings + attendance tracking |
| `ClientMeeting` + `ClientMeetingAttendee` | Client-facing meetings + behavior penalty scores |
| `PeerReview` | Monthly peer ratings (respect, helpfulness, attitude, conflict, knowledge sharing) |
| `ProjectTask` | Tasks assigned to employees with deadline tracking |
| `WeeklyReport` | Weekly work reports submitted by employees |
| `MonthlyKPI` | The calculated KPI scores for each employee per month (9 categories + total + bonus) |

### CRITICAL: KPI Formula

- **KPI 1 (Attendance):** Starts at 10. -1 for informed absence, -2 for uninformed. >3 approved leaves = -0.5
- **KPI 2 (Timeliness):** Starts at 10. -0.25 per 30min late uninformed. +0.25 per 30min overtime after 8hrs
- **KPI 3 (Internal Meetings):** -1 informed skip, -2 uninformed skip
- **KPI 4 (Client Meetings):** -1 informed skip, -6 uninformed skip + behavior penalty (0-10)
- **KPI 5 (Peer Review):** Average of all received peer ratings
- **KPI 6 (Deadlines):** -0.5 per day late, unless Admin waives it
- **KPI 7 (Weekly Reports):** -3 for late, -6 for missed submission
- **KPI 8 (Value Added):** Manually entered by Admin (0-10)
- **KPI 9 (Innovation):** Manually entered by Admin (0-10)
- **Bonus Formula:** `(TotalKPI - 75) × 1000 BDT` (only if score > 75)

---

## 6. BACKEND API — CURRENT ROUTES

File: `backend/src/index.ts`

| Method | Route | Status | Purpose |
|--------|-------|--------|---------|
| GET | `/api/health` | ✅ Done | Health check |
| GET | `/api/users` | ✅ Done | Returns all users from DB |
| POST | `/api/attendance/check-in` | ✅ Done | Logs employee check-in |
| GET | `/api/attendance/status/:userId` | ✅ Done | Checks if user checked in today |

### CRITICAL TIMEZONE CODE PATTERN

Every date-related backend operation uses this pattern (DO NOT CHANGE):

```typescript
const now = new Date();
const options: any = { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' };
const formatter = new Intl.DateTimeFormat('en-CA', options);
const localDate = new Date(formatter.format(now));
```

This was added to fix the **"Midnight Boundary Bug"** — without it, working past midnight would record attendance on the wrong day (UTC vs local date mismatch). NEVER remove this.

### Check-In Logic

- Office start time: **11:00 AM** (office cutoff for "on time")
- If `hours > 11 || (hours === 11 && minutes > 0)` → status is `LATE_AUTO`
- Otherwise → status is `TIMELY`

### Current Hardcoded User

**IMPORTANT:** Currently, all attendance routes use `userId = 1` (hardcoded). This is a temporary placeholder until the auth system is built. Do not be confused by this — it's intentional for now.

---

## 7. FRONTEND — CURRENT COMPONENTS

### `AppShell.tsx` — The Smart Layout Wrapper

- Wraps every page
- Detects mobile vs desktop using `useIsMobile()` hook
- Desktop → shows `AppSidebar` (left rail)
- Mobile → shows `MobileNav` (bottom tab bar)
- Always shows a sticky top header with "Sync_Live" indicator

### `AppSidebar.tsx` — Desktop Navigation

Nav items: Dashboard (`/`), Attendance (`/attendance`), Meetings (`/meetings`), Tasks (`/tasks`), Weekly Reports (`/reports`)

### `MobileNav.tsx` — Mobile Bottom Navigation

5 tabs: Home, Timer (Attendance), Docs (Meetings), Tasks, Me (Profile)

### `AttendanceCard.tsx` — The Crown Jewel (Fully Built)

This is the most complex component. It handles:

1. **Real-time clock** — 1-second heartbeat using `setInterval` in `useEffect`
2. **Status states:** `"syncing"` → `"idle"` → `"present"` or `"late"`
3. **Page load recall** — On mount, hits `GET /api/attendance/status/1` to check if already checked in. Prevents flash of wrong state on refresh.
4. **Check-In handler** — POSTs to `POST /api/attendance/check-in`
5. **Late warning banner** — Shows if it's past 11:00 AM and user hasn't checked in yet
6. **Visual design** — "Cyan Retro" aesthetic: white bg, cyan borders, font-mono, uppercase labels

### `page.tsx` — Dashboard Page

Currently renders `<AttendanceCard />` plus one empty placeholder slot (marked "KPI_Engine_Next").

### Design System Rules — "Cyan Retro"

- Background: always white (`bg-white`)
- Primary color: Cyan Blue (`hsl(var(--primary))` → `#00A3FF`)
- All borders: `border-2 border-primary`, `rounded-none` (sharp corners, NO rounded corners)
- All text: `font-mono`, `uppercase`, `tracking-tight`
- Shadcn component set is installed and configured

---

## 8. EMPLOYEE ROSTER (SEEDED IN DATABASE)

11 real employees imported from CSV:

| ALM ID | Name | Role |
|--------|------|------|
| ALM-000 | Minhaz | Automation Specialist |
| ALM-001 | Masum Billah | Automation Specialist |
| ALM-002 | Touhid | Back End Developer |
| ALM-003 | Zahid Hasan | Web Developer |
| ALM-004 | Rohit Roy | Web Developer |
| ALM-005 | Mohammad Ruhullah | Automation Specialist |
| ALM-006 | Tasnia Fahrin Choity | Branding and Creative |
| ALM-007 | MD. Saif Hossain | Automation Specialist |
| ALM-008 | Md. Shihab Khan | (Role not specified) |
| **ALM-009** | **Maslenia Mubarrat** | **Backend Developer (Project Owner)** |
| ALM-010 | Safayet Ahmed | Strategic Advisor |

---

## 9. PROJECT PROGRESS — 7-DAY MVP SPRINT

Sprint started: **Feb 24, 2026**. Goal: Working MVP by **Mar 2, 2026**.

| Day | Date | Goal | Status |
|-----|------|------|--------|
| Day 1 | Feb 24 | App Frame (Navigation Shell) | ✅ 100% Done |
| Day 2 | Feb 25 | Attendance System | ✅ 100% Done |
| **Day 3** | **Feb 26** | **KPI Logic Engine** | **⬅️ NEXT TO BUILD** |
| Day 4 | Feb 27 | Task & Office Board | ⬜ Not Started |
| Day 5 | Feb 28 | Admin Intelligence Dashboard | ⬜ Not Started |
| Day 6 | Mar 1 | PWA Mobile Transformation | ⬜ Not Started |
| Day 7 | Mar 2 | Final Polish & Live Pilot | ⬜ Not Started |

### Overall Phase Status

- [x] Phase 1: Pre-planning & Design
- [x] Phase 2: Database & Backend Setup
- [x] Phase 3: Single Responsive Frontend Shell
- [x] Phase 4: Attendance System (Core — check-in, status, midnight fix)
- [ ] Phase 5: Auth System (JWT/Login) — *partially started but NOT complete*
- [ ] Phase 6: KPI Engine — *next*

---

## 10. WHAT TO BUILD NEXT (DAY 3 OBJECTIVES)

The user asked for these three things at the end of the last session:

### 10.1. KPI Point Scoring Engine (Backend)

Create the logic that auto-calculates KPI scores based on attendance data.

- A new backend route: `GET /api/kpi/calculate/:userId/:month/:year`
- This needs to query the `Attendance` table and compute `kpi1Attendance` and `kpi2Timeliness`
- Write results into the `MonthlyKPI` table

### 10.2. Admin Overview Page (Frontend)

A new page at `/attendance` (or `/admin/attendance`) showing:

- A list/table of ALL employees
- Whether each person checked in today
- Their check-in time and status (Timely / Late)
- This requires a new backend route: `GET /api/attendance/today` that returns all attendance records for today

### 10.3. Code Architecture Review (Education)

The user requested a line-by-line explanation of the `AttendanceCard.tsx` and `index.ts` code that was built in Day 2. Do this BEFORE building new features — it was explicitly promised.

---

## 11. KNOWN ISSUES & THINGS TO WATCH OUT FOR

1. **Auth is NOT built.** `userId = 1` is hardcoded everywhere. When you build auth, you'll replace this with the actual logged-in user's ID from a JWT token.

2. **The `employeeId` field is `@unique` in Prisma schema but was initially missing.** The schema was updated and `npx prisma db push` was run to sync. The `seed-employees.ts` script handles the mapping.

3. **Prisma uses `@prisma/adapter-pg` (not the default client).** Always initialize Prisma like this:

   ```typescript
   const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   const prisma = new PrismaClient({ adapter });
   ```

   Do NOT use `new PrismaClient()` directly — it will fail to connect.

4. **The `datasource db` block in schema.prisma has no `url` field.** The connection goes through the `pg.Pool` adapter. This is intentional.

5. **All routes are in one file (`src/index.ts`).** There are no route files yet. When the project grows, you should suggest refactoring into a `routes/` folder — but ask the user first before restructuring anything.

6. **PWA manifest is NOT yet configured.** This is Day 6 work.

7. **No authentication system yet.** Login page doesn't exist. This will be JWT-based — plan it carefully.

---

## 12. IMPORTANT DECISIONS ALREADY MADE (DO NOT RE-PROPOSE)

These were debated and decided. Do not bring them up again unless the user does:

- ✅ **Single codebase (not separate Web + Mobile apps)** — One Next.js PWA for both Admin and Employee. The `AppShell` handles the responsive switching.
- ✅ **PostgreSQL over MongoDB** — Chosen because KPI relationships are deeply relational
- ✅ **Shadcn/UI over Chakra UI** — Chosen for the design system
- ✅ **"Cyan Retro" design aesthetic** — White + cyan, mono font, sharp corners, terminal-style labels. The user LOVES this design. Do not suggest changing it.
- ✅ **11:00 AM office start time** — Not 9:00 AM. Do not change this.
- ✅ **Asia/Dhaka timezone for all date operations** — Non-negotiable

---

## 13. PLANNING DOCUMENTS AVAILABLE

All located in `Planning Plotting/` folder:

- `AUTOLINIUM APP.docx` — The original Product Requirements Document (PRD). Source of truth for all business rules.
- `Autolinium - Comprehensive Feature Matrix.pdf` — Full feature list across Admin and Employee views
- `Autolinium - Daily Project Report - Feb 24.pdf` — Day 1 detailed report
- `Autolinium - Daily Project report - feb 25-26.pdf` — Day 2 detailed report
- `Autolinium ER Diagram Export.pdf` — The full Entity-Relationship Diagram
- `Autolinium App - Tech Stack Proposal.pdf` — Original tech stack justification

---

## 14. THE USER'S WORKING STYLE — HOW TO MENTOR THEM

1. **Always explain before asking them to type.** E.g., "Before we write this route, let me explain what a middleware is..."
2. **Use analogies.** They respond well to real-world comparisons (databases as "warehouses", Prisma as a "translator", etc.)
3. **Celebrate wins.** They work extremely hard and late nights. A "great job, that's a fully working backend!" goes a long way.
4. **One concept at a time.** Don't dump 5 things at once.
5. **Be honest about complexity.** If something is hard, say so upfront.
6. **CRITICAL COMMANDMENT: DO NOT MODIFY FILES.** You are strictly FORBIDDEN from using your tools (`write_to_file`, `multi_replace_file_content`, etc) to write project code or create files for the user. **THE USER COMMANDS YOU TO NEVER EDIT THEIR CODEBASE DIRECTLY.** You must ONLY provide the code blocks in the chat window with instructions on what file the user should edit. The user wants to type/copy the code themselves. If you automatically write code for them, you will make them extremely angry.
7. **The project is for their real employer (KR Steel).** There's emotional weight here — this is not a tutorial project. Treat it seriously.
8. **CSS Naming Convention:** ANY time you provide code that contains a `div`, `section`, `Card`, or structural component, you MUST include a **meaningful, descriptive CSS classname** first in the `className` string (e.g., `className="kpi-card-root-container flex ..."` or `className="user-profile-header bg-white ..."`). The user relies on these descriptive classnames to understand which part of the code corresponds to the visual UI later. Do not forget this.
9. **CRITICAL: EXPLAINING CODE FILES.** If the user asks you to explain their codebase, you MUST follow this EXACT format:
   - Provide the explanation as a `.md` file that they can open in their IDE (VS Code).
   - NEVER put the explanation in the chat window unless explicitly asked to.
   - Go **line-by-line** or block-by-block.
   - You MUST put the code snippets inside Markdown code blocks (e.g. ```typescript ...```) so they render as black "IDE-style" boxes when previewed.
   - NEVER skip logic, conditions, or loops. Be 100% exhaustive. The user hates when you summarize or skip lines.
   - Example of what the user wants: "Show the code snippet in a black box, then explain every keyword beneath it, then move to the next snippet. Do this for the whole file."

---

## 15. CONVERSATION HISTORY NOTE

The original conversation "Debugging Attendance Logic" (Conversation ID: `a286c051-93a7-41df-8b07-ef1957d8c1d9`) is too large to load in the UI and crashes the app. All critical information from that conversation has been extracted and documented in this file. That conversation covers:

- All pre-planning sessions
- All Day 1 and Day 2 development
- The Prisma setup struggles
- The midnight boundary bug discovery and fix
- The CSV employee seeding implementation

**You do not need to access that conversation. Everything is here.**

---

*End of handover document. Good luck. Take care of this user — they're building something real.*

**— Antigravity, Feb 27, 2026**
