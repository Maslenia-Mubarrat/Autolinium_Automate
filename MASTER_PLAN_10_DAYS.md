# 🏁 Autolinium: The 10-Day Road to 100% Completion

**Project:** Autolinium (Internal Office & KPI Management)
**Owner:** Maslenia Mubarrat (ALM-009)
**Start Date:** March 4, 2026
**Deadline:** March 14, 2026

## 📜 Technical Foundation (Review First)

- **Shared Memory:** Every new AI should read `MESSAGE_FOR_FELLOW_AI.md` and this plan.
- **Design System:** "Cyan Retro" (White bg, Cyan `#00A3FF` borders, Sharp corners, Mono fonts).
- **Backend:** Express + Prisma (PostgreSQL).
- **Frontend:** Next.js 15 (App Router).

---

## 📅 The 10-Day Master Schedule

### 📅 Day 1 & 2 (March 4-5): Multi-User Foundation & Advanced Attendance [CATCH-UP SPRINT]

**Status:** 🏃 In-Progress

- [x] Remove hardcoded `userId=1` from Backend & KpiCard.
- [ ] **Day 1 Finish:** Implement TaskBoard user-filtering & Log-out button.
- [ ] **Attendance Logic:** Link `LeaveRequest` to `Attendance`. If leave is APPROVED, attendance should show "ON LEAVE" instead of "ABSENT".
- [ ] **History View:** Create a "My Attendance" page for employees to see their full month history.
- [ ] **Logout:** Ensure users can switch accounts easily.
- [ ] Create `useAuth` hook on Frontend to handle User Sessions.
- [ ] Add Route Guards: Redirect unauthenticated users to `/login`.
- [ ] **Goal:** A secure login that persists across refreshes and identifies the user correctly.

- [ ] Add "Home Office" vs "On Office" toggle to `AttendanceCard`.
- [ ] Update Backend to store `locationMode` in Attendance records.
- [ ] Build the **Daily Heatmap** for Admin (Visual grid of all employees' status today).
- [ ] Implement the "Promise Time" system for late arrivals with admin metadata.
- [ ] **Goal:** Full visibility of who is where and why they are late.

### 📅 Day 3: March 6 — Task Flow & Leave Automation

**Status:** 🏃 In-Progress
*Mission: Professional task management and leave cycle.*

- [/] Implement "Task Reasons" (Employees must explain delays/work when marking tasks as DONE).
- [ ] Build the "Leave Request Center" with Date Pickers (Frontend).
- [ ] Add Admin Dashboard for Leave Approval (Bulk actions).
- [ ] Sync Leave Days with KPI 1 (Attendance) logic.
- [ ] **Goal:** Zero manual tracking for tasks and leaves.

### [ ] Day 4: March 7 — Meeting Pulse & Behavior Penalties

*Mission: Mastering meeting participation.*

- [ ] Build the "Meeting Confirmation" UI (Employees click 'I am here' or 'Will Skip').
- [ ] Implement the Client Meeting "Behavior Penalty" system (Admin logs 0-10 score).
- [ ] Backend: Auto-deduct KPI 3 & 4 based on attendance/skip status.
- [ ] **Goal:** Automated meeting compliance tracking.

### [ ] Day 5: March 8 — Peer Review & Weekly Reports

*Mission: Subjective data collection system.*

- [ ] Create the **Peer Review Form** (Opens on the 7th of every month, rates all staff).
- [ ] Build the **Weekly Report Submit** form (Summary, Issues, Next-Plan).
- [ ] Implement the Admin "Report Audit" view (Read all reports on one page).
- [ ] **Goal:** 100% submission rate for qualitative feedback.

### [ ] Day 6: March 9 — The KPI Super-Engine (Automation)

*Mission: The "Brain" of the project.*

- [ ] Build the `storedMonthlyKPI` table update logic (Snapshots for history).
- [ ] Implement all 9 KPI Category formulas (Attendance to Innovation).
- [ ] Create the "Admin Manual Entry" page for KPI 8 (Value) and 9 (Innovation).
- [ ] Add "Termination Risk" logic (Flags users with KPI < 75 for 3 months).
- [ ] **Goal:** A self-calculating performance engine.

### [ ] Day 7: March 10 — Payroll, Bonuses & Incentives

*Mission: Connecting performance to money.*

- [ ] Build the "Bonus Calculator" `(KPI - 75) * 1000 BDT`.
- [ ] Implement the "Increment Tracker" (Quarterly review logic).
- [ ] Create the **Personal Financial Statement** view for employees.
- [ ] **Goal:** Transparency in earnings based on work.

### [ ] Day 8: March 11 — Admin Intelligence Dashboard (Analytics)

*Mission: The Boss's bird's eye view.*

- [ ] Build the "Full Office Performance" chart (Monthly trends).
- [ ] Implement the **Disciplinary System** (Admin issues 'Warnings').
- [ ] Create the "Warning History" log for each employee profile.
- [ ] **Goal:** Data-driven decisions for the CEO.

### [ ] Day 9: March 12 — PWA Transformation & Reminders

*Mission: Making it a true mobile tool.*

- [ ] Configure `next-pwa` (Service workers, Manifest, Splash screens).
- [ ] Implement "Toast Notifications" for reminders (Thursday 2 PM reports, etc.).
- [ ] Build the "Admin Push" system (Send a notice to all screens).
- [ ] **Goal:** Zero friction mobile experience.

### [ ] Day 10: March 13 — Final Audit, Polish & Live Pilot

*Mission: Launch Day.*

- [ ] Comprehensive UI Polish (Ensure every component is perfectly "Cyan Retro").
- [ ] End-to-End Test (Check-in -> Work -> Report -> KPI -> Bonus).
- [ ] Freeze code and prepare the "Handover Report" for production.
- [ ] **Goal:** 100% Completion. Ready for deployment.

---

## 🛠️ How to use this Plan

1. **Mark Progress:** Check the [ ] boxes as you complete missions.
2. **Context for AI:** Whenever you start a new session, point the AI to this file immediately.
3. **Flexibility:** If a task takes longer, we adjust the dates but keep the sequence.
