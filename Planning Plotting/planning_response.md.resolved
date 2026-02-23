# Autolinium Project Planning & Strategy

Based on the Product Requirements Document (PRD) for the **Autolinium Internal Office & KPI Management System**, here is a comprehensive guide to help you build this project professionally.

---

## 1. Professional Pre-Planning Approach

Jumping straight into coding usually leads to messy code and missing features. A professional approach involves designing the system's architecture, database, and user interfaces first. 

### What You Need to Do Before Coding:
1. **Entity-Relationship (ER) Diagram:** Since this system mathematically calculates KPIs based on relationships (Employees, Attendance, Tasks, Meetings), an ER diagram is **mandatory**. You need to map out how the `User` table connects to `Attendance`, `PeerReviews`, and `Projects`.
2. **User Flow & Wireframing:** Sketch out the screens for the Admin Web Panel and the Employee Mobile App. Know exactly where buttons go before writing UI code.
3. **API Design:** Plan your backend routes (e.g., `POST /api/attendance/check-in`, `GET /api/kpi/monthly-summary`).
4. **Logic Flowcharts:** For complex logic like the **KPI & Bonus Calculation** (KPI 1 to 9), write down the math and conditions in a flowchart to avoid bugs in the backend.

### Where to Learn (Easy & Not Too Elaborate):
* **ER Diagrams:** Check out **Draw.io** or **Eraser.io** (Eraser is amazing for developers). Search YouTube for *"Database Design Tutorial for Beginners"* by **freeCodeCamp**.
* **Wireframing:** **Figma** is the industry standard. Search for *"Figma UI Design Tutorial"* — you don't need to be an expert, just use basic shapes and text.
* **API & System Design:** Search for *"REST API Concepts"* by **Traversy Media** on YouTube.

---

## 2. Basic Structure / Skeleton of the System

Here is a high-level skeleton of how your project should be structured.

### Database Entities (The Core Tables)
* **Users:** (ID, Name, Role [Admin/Employee], BaseSalary, Status)
* **Attendance:** (ID, UserID, Date, EntryTime, ExitTime, Status [Present/Absent/Late], AdminOverrides)
* **Leaves & Requests:** (ID, UserID, Type, Status [Pending/Approved/Rejected])
* **Meetings:** (ID, Type [Internal/Client], Date, Agenda)
* **MeetingAttendees:** (MeetingID, UserID, JoinTime, SkipStatus)
* **Tasks/Projects:** (ID, AssignedUserID, Deadline, CompletedDate, Status, ValidReason)
* **PeerReviews:** (ID, ReviewerID, TargetUserID, Month, Score, Feedback)
* **WeeklyReports:** (ID, UserID, SubmittedAt, Content, MissingKnowledgeShare)
* **MonthlyKPIs:** (ID, UserID, Month, KPI_1, KPI_2... KPI_9, TotalScore, BonusAmount)

### Application Structure
**1. Admin Web Panel (For CEO/Management)**
* **Dashboard:** Company overview, heatmap, current month estimate.
* **Employee Management:** List of staff, roles, and profiles.
* **Attendance Center:** Edit records, approve leaves, manage late requests.
* **KPI Management:** Enter manual KPI scores (KPI 8 & 9), view employee breakdowns.
* **Task/Meeting Manager:** Create meetings, log client meetings, assign projects.

**2. Employee Mobile App / Web Portal**
* **Home:** Big Check-In / Check-Out button, daily schedule.
* **My Stats:** Attendance history, warning notices.
* **KPI Dashboard:** Live breakdown of current month's KPIs and estimated bonus.
* **Task Board:** Assigned tasks and status toggles.
* **Forms:** Weekly report submission, peer review forms (opens on the 7th of the month).

---

## 3. Industry-Standard Tech Stack

Given your background (knowing React, Node, React Native, JS), you are actually in a great position. The following stack is modern, highly efficient, and perfectly suited for this web + mobile requirement:

### **Database: PostgreSQL**
* **Why:** This app relies heavily on relational data (Employees have many Attendances; Attendances affect KPIs). A relational database like PostgreSQL is strict, safe, and industry-standard.
* **Tooling:** Use **Prisma ORM**. It makes writing database queries in Node/JavaScript incredibly easy and type-safe.

### **Backend: Node.js with Express.js (or NestJS)**
* **Why:** You already know Node. It handles asynchronous operations well.
* **Architecture:** Create a RESTful API. The backend will serve both your Admin Web Panel and your Employee Mobile App.

### **Frontend (Admin Panel): React (Next.js) + Tailwind CSS**
* **Why:** Next.js is the absolute standard for React apps today. Tailwind CSS will speed up your styling immensely once you get the hang of it.
* **Components:** Use a component library like **shadcn/ui** or **Chakra UI** to get pre-built, beautiful tables, buttons, and modals.

### **Mobile App (Employee): React Native (with Expo)**
* **Why:** You know some React Native. Using **Expo** takes away 90% of the headache of mobile development. You write React code, and it builds for both Android and iOS easily.

---

## 4. Realistic Time Estimation

Since you are rusty, learning as you go, acting as a solo developer, and dedicating 6-8 hours a day, here is a realistic milestone breakdown for your first professional-grade app:

* **Phase 1: Pre-planning & Design (1 - 1.5 Weeks)**
  * Re-familiarizing yourself with Figma, drawing the ER diagram, and setting up the Git repositories.
* **Phase 2: Database & Backend Setup (3 - 4 Weeks)**
  * Setting up Node, PostgreSQL, and Prisma.
  * Writing the API routes. 
  * *Challenge:* The KPI calculation logic is complex. You will spend a good amount of time carefully coding the math for attendance deductions, timeliness, and bonuses.
* **Phase 3: Admin Web Panel Frontend (3 - 4 Weeks)**
  * Building out the React (Next.js) dashboard.
  * Connecting the frontend UI to your backend APIs (using tools like React Query or Axios).
  * Building complex UI elements like Attendance Heatmaps and data tables.
* **Phase 4: Employee Mobile App (2 - 3 Weeks)**
  * Setting up React Native (Expo).
  * Building the Check-In/Out features and connecting them to the backend.
  * Displaying the user's KPI statistics.
* **Phase 5: Testing, Bug Fixing & Deployment (1.5 - 2 Weeks)**
  * Testing edge cases (e.g., what happens if someone forgets to check out?).
  * Deploying the backend (e.g., Render or Heroku) and frontend (Vercel).

### **Total Estimated Time: ~3 to 3.5 Months (11 - 14 Weeks)**
This is a very realistic timeline. As a solo mid-level developer re-learning the stack, building a multi-platform app with complex mathematical business logic (KPIs, deductions, bonuses) takes time. Don't rush the backend logic—if the KPI math is wrong, the business loses money or employees get underpaid!

---

**Next Steps:**
If you agree with this approach, I recommend we start with **Phase 1**. We can design the database schema (ER Diagram) together right here in our chat, and then I can help you initialize your Next.js and Node.js projects. Let me know what you'd like to tackle first!
