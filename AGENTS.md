# AGENTS.md — Development Guide for AI Coding Agents

## Project Overview

Customer loyalty/rewards Telegram Mini App built with **React 18**, **Vite 5**, **Tailwind CSS 3**, **Zustand 4**, and **Supabase**. Mobile-first design targeting Telegram's WebApp environment.

## Build / Lint / Test Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (output: `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on the entire project |
| `npx eslint . --fix` | Auto-fix lint issues |

**Testing:** No test runner is configured yet. When adding tests, use **Vitest** + **React Testing Library**:
- `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- Single test file: `npx vitest run src/components/OfferCard.test.jsx`
- Single test by name: `npx vitest run -t "renders offer title"`
- Watch mode: `npx vitest`

## Project Structure

```
src/
├── components/   # Reusable UI components (PascalCase .jsx)
├── pages/        # Route-level pages (PascalCase .jsx)
├── hooks/        # Custom hooks (camelCase, "use" prefix, .js)
├── lib/          # Utilities & services (camelCase .js)
├── store/        # Zustand stores (camelCase .js)
├── assets/       # Static assets (images, SVGs)
├── main.jsx      # Entry point
├── App.jsx       # Root component with routing
└── index.css     # Global Tailwind styles
```

## Code Style

### Formatting
- **Indentation:** 2 spaces
- **Semicolons:** None
- **Quotes:** Single quotes
- **Trailing commas:** Not used
- **No Prettier** — follow existing conventions

### Naming Conventions
| Entity | Convention | Example |
|---|---|---|
| Component files | PascalCase `.jsx` | `OfferCard.jsx` |
| Page files | PascalCase `.jsx` | `Home.jsx`, `OfferDetail.jsx` |
| Hook files | `use` prefix, `.js` | `useOffers.js` |
| Lib/utility files | camelCase `.js` | `supabase.js`, `tiers.js` |
| Store files | `use` prefix, `.js` | `userStore.js` |
| Components | PascalCase functions | `export default function OfferCard(...)` |
| Hooks | Named exports | `export const useOffers = () => {...}` |
| Constants | UPPER_SNAKE_CASE | `TIERS`, `TIER_ORDER` |
| Variables/functions | camelCase | `activeTab`, `handleScan` |
| Event handlers | `handle` prefix | `handleNav`, `handleScan` |

### Import Order (no blank lines between groups)
1. React core
2. Third-party libraries
3. Internal: stores → lib → hooks → components/pages

```js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useUserStore from '../store/userStore'
import { useOffers } from '../hooks/useOffers'
import OfferCard from '../components/OfferCard'
```

### Component Patterns
- Functional components only (no class components)
- Components: `export default function ComponentName`
- Hooks: `export const useHookName`
- Tailwind utility classes directly in `className`
- Inline SVGs for icons (no icon library installed)
- Framer Motion for animations (`motion.div`, `motion.button`)

## Error Handling

- Wrap all async Supabase calls in `try/catch`
- Check `if (error) throw error` after Supabase queries
- Provide fallback/mock data when Supabase is unreachable
- Store error state: `set({ error: err.message })`
- Log with context: `console.error('ComponentName error:', err)`
- Check specific error codes: `error.code !== 'PGRST116'` (not found), `error.code === '42P01'` (table missing)

## State Management

- **Zustand** for global state (`src/store/userStore.js`)
- `useState`/`useReducer` for local component state
- No Context API usage currently

## Routing

- `react-router-dom` v6 with `BrowserRouter` in `App.jsx`
- Navigate programmatically: `const navigate = useNavigate()`
- Links: `<Link to="/path">`

## Tailwind & Styling

- Tailwind CSS 3 with custom theme in `tailwind.config.js`
- Custom colors, fonts (Plus Jakarta Sans), shadows, border-radius defined in config
- PostCSS + Autoprefixer via `postcss.config.js`
- Mobile-first: `max-w-md` containers, bottom navigation, touch-friendly

## After Making Changes

1. Run `npm run lint` to check for errors
2. Run `npx eslint . --fix` to auto-fix
3. If `package.json` changed, run `npm install`
4. Run `npm run build` to verify no build errors
5. Monitor dev server output for runtime errors

## Key Libraries

- `react` 18, `react-dom` 18, `react-router-dom` 6
- `zustand` 4 (state management)
- `@supabase/supabase-js` (backend)
- `framer-motion` (animations)
- `tailwindcss` 3 (styling)
- `@twa-dev/sdk` (Telegram WebApp)
- `html5-qrcode`, `qrcode.react` (QR code features)
