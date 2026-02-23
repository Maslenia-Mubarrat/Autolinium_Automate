# Autolinium - Cumulative Implementation Plan

This document tracks all development phases of the Autolinium system. Completed steps are marked for reference, and upcoming steps serve as the current roadmap.

---

## Phase 1: Pre-planning & Design (Completed)

*Focused on requirements analysis and architectural blueprinting.*

* **Requirements Extraction:** Extracted text from `AUTOLINIUM APP.docx`.
* **Database Design:** Created the ER Diagram for Users, Attendance, Meetings, Tasks, and KPI scores.
* **Tech Stack Selection:** Finalized Next.js, Express, PostgreSQL, Prisma, and PWA strategy.

---

## Phase 2: Database & Backend Setup (Completed)

*Focused on building the "Brain" and connecting it to the database.*

* **Server Setup:** Initialized Express.js with TypeScript and CORS.
* **Database Sync:** Configured Prisma and successfully synced the schema with PostgreSQL.
* **Seeding:** Created `seed.ts` to insert the initial Admin user.
* **API Verification:** Implemented and tested `/api/health` and `/api/users` routes.

---

## Phase 3: Single Responsive Frontend (PWA) (Current)

*Focused on the "Modern Retro" UI and connecting the pieces.*

### 1. Style & Design Setup

Learn how to initialize a professional design system and customize it for the Autolinium brand.

* **Concepts:** Shadcn UI, Tailwind CSS, CSS Variables.
* **Your Task:** Run `npx shadcn@latest init` and configure the "Slate" theme with CSS variables.

### 2. The "Cyan Retro" Theme

Learn how to modify global CSS to achieve the minimal white background with cyan borders.

* **Concepts:** HSL color codes, Tailwind config, Global CSS.
* **Your Task:** Update `globals.css` to use the Autolinium Cyan (#00A3FF) for primary accents and borders.

### 3. The Layout (One App, Two Views)

Learn how to use "Conditional Rendering" to show the Admin Sidebar for admins and the Mobile Bottom-Nav for employees.

* **Concepts:** React Components, Next.js Layouts, Responsive design (Hidden/Visible utilities).
* **Your Task:** Create a `MainLayout.tsx` that detects the user's role and changes the navigation style.

### 4. Fetching Real Data

Learn how to connect your Next.js frontend to your Express backend.

* **Concepts:** `fetch` API, `useEffect`, Client vs Server components.
* **Your Task:** Create a page that calls `http://localhost:5000/api/users` and displays your email in a beautiful Shadcn Card.

---

## Future Phases

* **Phase 4: Authentication & Security:** Implementing JWT/Cookie login logic.
* **Phase 5: KPI Engine Logic:** Writing the complex math for automated scoring.
* **Phase 6: PWA Finalization:** Manifest setup and offline capabilities.
