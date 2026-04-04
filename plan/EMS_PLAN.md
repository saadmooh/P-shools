# Education Management System (EMS) - Telegram Mini App

## 📋 Project Overview
A comprehensive Education Management System (EMS) designed as a Telegram Mini App. The system handles users (Admins, Teachers, Guardians, Independent Students), course management, session scheduling, real-time attendance, automated billing, and teacher payroll.

---

## 🛠 Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Telegram UI Kit (matching native Telegram design)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Telegram Integration**: `@telegram-apps/sdk-react`, `@telegram-apps/init-data-node`
- **State Management**: Zustand + TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: `date-fns` + `luxon` (for timezone handling)
- **i18n**: `i18next` + `react-i18next` (Full Arabic RTL Support)

---

## 📁 Project Structure
```text
📦 education-management-tma/
├── 📁 public/
│   ├── 📄 index.html
│   └── 📁 locales/
│       ├── 📄 ar.json (Arabic)
│       └── 📄 en.json (English)
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 ui/             # Base UI (Button, Input, Card, etc.)
│   │   ├── 📁 forms/          # Form Components (FormInput, etc.)
│   │   └── 📁 telegram/       # SDK Wrappers (MainButton, etc.)
│   ├── 📁 features/           # Domain-driven modules
│   │   ├── 📁 auth/           # Login, Registration, OTP
│   │   ├── 📁 admin/          # Management dashboards
│   │   ├── 📁 teacher/        # Attendance, Schedule, Payroll
│   │   ├── 📁 guardian/       # Child progress, Invoices, Payments
│   │   ├── 📁 independent/    # Course browsing, personal billing
│   │   ├── 📁 sessions/       # Shared scheduling logic
│   │   ├── 📁 billing/        # Invoicing and payment engine
│   │   └── 📁 shared/         # Layouts, ProtectedRoutes, Nav
│   ├── 📁 hooks/              # Custom hooks (useTelegram, useAuth)
│   ├── 📁 lib/                # Configs (supabase, i18n, etc.)
│   ├── 📁 services/           # Supabase data layer
│   ├── 📁 stores/             # Zustand global state
│   ├── 📁 types/              # TypeScript definitions
│   └── 📁 utils/              # Helper functions (currency, dates)
├── 📁 supabase/               # SQL Migrations & Edge Functions
└── 📁 telegram-bot/           # Node.js Bot for notifications
```

---

## 🗄 Database Schema (Supabase)

### Core Entities
- **users**: Auth base with roles (admin, teacher, guardian, independent).
- **guardians**: Linked to users; stores balance and personal info.
- **teachers**: Linked to users; stores specialty and base hourly rates.
- **students**: Linked to a primary guardian.
- **rooms**: School physical infrastructure (capacity, features).
- **school_levels**: (e.g., Elementary, Middle, High School).
- **subjects**: Linked to levels; stores default price per hour.

### Academic & Sessions
- **groups**: Recurring study groups linked to a subject and teacher.
- **courses**: Independent one-off or short-term courses.
- **sessions**: Unified table for group and course occurrences. Includes `justification_deadline`.

### Enrollments & Attendance
- **group_enrollments / course_participants**: Links students/users to academic entities.
- **attendances**: Tracks presence, hours billed, and billing status.
- **absence_justifications**: Stores reasons and attachments for absences.

### Financials
- **invoices**: Monthly or on-demand billing for guardians/independents.
- **invoice_lines**: Detailed breakdown of session fees and discounts.
- **payments**: Records cash, transfer, or check transactions.
- **teacher_payrolls**: Monthly statements based on completed sessions and custom rates.

---

## 🚀 Implementation Phases

### Phase 1: Foundation (COMPLETED)
- [x] Initialized Vite + React + TypeScript project.
- [x] Set up full directory structure.
- [x] Installed core dependencies (Telegram SDK, Supabase, Zustand, i18n).
- [x] Configured Supabase client and environment placeholders.
- [x] Implemented Telegram SDK initialization and `useTelegram` hook.
- [x] Established basic role-based routing.

### Phase 2: Core Academic & UI Skeleton (COMPLETED)
- [x] Implement UI Library (`src/components/ui/`) based on Telegram Design System.
- [x] Configure `i18next` with RTL support for Arabic.
- [x] Define Zod schemas and TypeScript types for all DB tables.
- [x] Setup global stores for Auth, UI, and Notifications.
- [x] Build Admin/Teacher/Guardian/Independent dashboard skeletons.

### Phase 3: Auth & Admin Management (CURRENT)
- [ ] Implement Telegram Auth/OTP verification flow.
- [ ] Build Admin pages for Rooms, Levels, Subjects, and Users.
- [ ] Implement Student enrollment with QR code generation.

### Phase 4: Sessions, Attendance & Real-time
- [ ] Integrate `react-big-calendar` for scheduling.
- [ ] Build Teacher session management and Attendance marking (inc. QR scanning).
- [ ] Implement Guardian absence justification submission with file upload.
- [ ] Enable Supabase Realtime for live attendance/balance updates.

### Phase 5: Billing Engine & Payroll
- [ ] Build the automated invoicing logic (Edge Functions).
- [ ] Implement Payment recording and Balance management.
- [ ] Create Teacher Payroll statements and approval workflow.
- [ ] Setup Telegram Bot for critical notifications (Invoice due, Absence alert).

---

## 🎨 UI/UX Requirements
1. **Telegram Native Look**: Full use of `--tg-theme-*` CSS variables.
2. **Accessibility**: RTL support is non-negotiable (Arabic as primary).
3. **Performance**: Optimistic UI updates, skeleton loaders, and virtualization for long lists.
4. **Offline Support**: Caching critical data in Telegram CloudStorage.

---
*Documented on: 2026-04-04*
