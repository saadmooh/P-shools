# Dashboard UI Enhancement & Unification Plan

This document outlines the architectural and design changes required to unify the Merchant Dashboard with the Customer Application's visual language.

## 1. Core Design Principles
To achieve consistency, all dashboard pages must adhere to the following theme constants:

*   **Background**: Use `bg-surface` (`#f8fafc`) for page backgrounds.
*   **Cards**: Use `bg-white` with `border-border` and `shadow-soft`.
*   **Typography**: Exclusively use `Jakarta Sans`. Bold text should use `font-black` or `font-extrabold`.
*   **Border Radius**: Primary containers must use `rounded-[32px]` or `rounded-3xl`. Buttons/Inputs use `rounded-2xl`.
*   **RTL Support**: Since the dashboard is in Arabic, ensure all layouts use `text-right` and `flex-row-reverse` where appropriate.

## 2. Layout & Global Navigation (`src/components/Layout.jsx`)
The layout must act as the bridge between the two environments.

### Changes:
*   **Sidebar (Desktop)**:
    *   Switch to `bg-white` with a right border.
    *   Add a "Home" button (`lucide-react`) at the bottom of the sidebar to navigate back to the Customer App (`/`).
    *   Add a user profile snippet at the bottom for quick identity verification.
*   **Header (Mobile)**:
    *   Implement a sticky header with `blur-xl` background.
    *   **Left Side**: Add a "Back Arrow" button to return to the previous page.
    *   **Right Side**: Add a "Home" button to exit the dashboard and return to the main app.
    *   **Center**: Display the current page title in `font-black`.
*   **Bottom Nav (Mobile)**:
    *   Use the white/blur style from the main app.
    *   Limit to the 5 most important sections.

## 3. Page-Specific Enhancements

### A. Dashboard Overview (`Overview.jsx`)
*   **Stats Grid**: Replace flat boxes with elevated cards using `StatCard` component logic.
*   **Charts**: Use `AreaChart` with a soft gradient fill (`stopOpacity={0.2}`). Remove axes lines for a "cleaner" look.
*   **Action Gating**: Ensure the "Manage Roles" button is only visible to the `owner`.

### B. Product & Offer Management (`Products.jsx`, `Offers.jsx`)
*   **Grid Layout**: Use a responsive grid (2 columns on mobile, 4 on desktop).
*   **Image Handling**: Products should have an `aspect-square` container with `overflow-hidden`. Use `hover:scale-110` animations on images.
*   **Modals**: All forms (Add/Edit) must be full-screen on mobile or center-aligned large modals on desktop with `backdrop-blur-md`.
*   **Empty States**: Use `lucide-react` icons with `opacity-20` for empty list states.

### C. Customer Management (`Customers.jsx`, `CustomerDetail.jsx`)
*   **List UI**: Each customer should be a wide card with their avatar, name, and tier badge.
*   **Role Management**: In `CustomerDetail.jsx`, add a styled `<select>` dropdown to allow Owners to change a user's `role_id`.

## 4. Navigation Logic
To ensure users don't get lost:
1.  **From App to Dashboard**: Authorized users see a "Dashboard" link in their `BottomNav`.
2.  **From Dashboard to App**: Every dashboard page must have a visible "Home" or "Exit" icon.
3.  **Persistence**: Use `framer-motion`'s `AnimatePresence` to cross-fade between the app and dashboard states to avoid a jarring transition.

## 5. Technical Implementation Steps
1.  **Global CSS**: Ensure `Jakarta Sans` is loaded in `index.html`.
2.  **Component Refactor**: Start with `Layout.jsx` to establish the frame.
3.  **Style Migration**: Update `Overview.jsx` first as a template for other pages.
4.  **Verification**: Check RTL alignment on all inputs and labels.
