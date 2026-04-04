# **EMS: Education Management System - Telegram Mini App**

## **Overview**
A comprehensive Education Management System (EMS) built as a Telegram Mini App. It manages users (admins, teachers, guardians, students), courses, sessions, attendance, billing, and teacher payroll.

## **Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Telegram UI Kit (matching Telegram design)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Telegram Integration**: @telegram-apps/sdk-react
- **State Management**: Zustand + React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: date-fns + luxon
- **i18n**: i18next + react-i18next (Arabic RTL Support)

## **Project Structure**
- `src/components/ui/`: Base UI components (Button, Input, Card, Modal, etc.)
- `src/components/forms/`: Form components (FormInput, FormSelect, etc.)
- `src/components/telegram/`: Telegram-specific wrappers (MainButton, BackButton, etc.)
- `src/features/`: Feature modules (auth, admin, teacher, guardian, independent, sessions, billing, notifications, shared)
- `src/hooks/`: Custom hooks (useTelegram, useSupabase, useAuth, etc.)
- `src/lib/`: Configuration files (supabase.ts, telegram.ts, i18n.ts, etc.)
- `src/pages/`: Main application routes (Landing, Login, Register, etc.)
- `src/stores/`: Zustand stores (authStore, userStore, etc.)
- `src/types/`: TypeScript definitions
- `src/services/`: API services (Supabase tables)
- `src/utils/`: Helper functions (dateHelpers, currencyHelpers, etc.)
- `supabase/`: Database migrations, functions, and seed data
- `telegram-bot/`: Node.js Telegram bot for notifications

## **Detailed Directory Map**
(Refer to the full structure provided in the project prompt)

## **Core Features**
1. **Telegram Integration**: Native look-and-feel, auth via `initData`, CloudStorage caching.
2. **Role-Based Dashboards**: Tailored for Admin, Teacher, Guardian, and Independent users.
3. **Session Management**: Calendar view, room booking, conflict detection.
4. **Attendance & Justifications**: Real-time marking and submission/review workflow.
5. **Billing Engine**: Automated invoicing, balance tracking, and payment recording.
6. **Teacher Payroll**: Monthly statements derived from completed sessions.
7. **Real-time Notifications**: In-app toasts and Telegram bot alerts.

## **Implementation Plan**

### **Phase 1: Foundation (COMPLETED)**
- [x] Folder structure initialization.
- [x] Environment variables & Supabase client.
- [x] Telegram SDK initialization & `useTelegram` hook.
- [x] Basic routing & role-based redirection.
- [x] Enhanced "Access Restricted" landing page for non-Telegram environments.

### **Phase 2: Core Academic & UI Skeleton (CURRENT)**
- [ ] Create base UI components (`src/components/ui/`).
- [ ] Implement `i18n` with Arabic (RTL) and English support.
- [ ] Setup `Zustand` stores for global state.
- [ ] Define full `Zod` schemas and TypeScript types.
- [ ] Build Admin/Teacher/Guardian/Independent dashboard skeletons.

### **Phase 3: Features - Part 1 (Auth & Users)**
- [ ] Login/Registration with phone verification.
- [ ] Role-based user profiles.
- [ ] Admin management pages (Users, Teachers, Guardians, Students).

### **Phase 4: Features - Part 2 (Sessions & Attendance)**
- [ ] Calendar integration.
- [ ] Session creation & management.
- [ ] Real-time attendance marking & QR scanner.
- [ ] Absence justification submission.

### **Phase 5: Features - Part 3 (Billing & Payroll)**
- [ ] Invoice generation logic.
- [ ] Payment processing & balance updates.
- [ ] Teacher payroll calculation & statements.

---
*Last Updated: 2026-04-04*
