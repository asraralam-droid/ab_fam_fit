# Admin Desktop — Standalone Package

Paste-ready **desktop admin dashboard** extracted from the Misty mobile app. Includes all admin pages, affiliate admin, Redux store with mock data, modals, and a sidebar layout for full-width desktop use.

## Folder structure

```
admin-desktop/
├── src/                 ← copy this into your new React project's src/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

> **Note:** The main Misty app already uses `src/` at the repo root, so this package lives in `admin-desktop/` with its own `src/` inside. When starting a new project, replace that project's `src/` with `admin-desktop/src/`.

## Quick start (run standalone)

```bash
cd admin-desktop
npm install
npm run dev
```

Open http://localhost:5173 — you land on `/admin` with a pre-authenticated admin user (`Alex Admin`).

## Paste into a new Vite + React project

1. Create a Vite React + TypeScript project.
2. Install dependencies from `admin-desktop/package.json`.
3. Copy `admin-desktop/src/` → your project's `src/`.
4. Copy root config files (`index.html`, `tailwind.config.js`, `postcss.config.js`, `vite.config.ts`, `tsconfig.json`) or merge their settings.
5. Run `npm run dev`.

## What's included

| Area | Description |
|------|-------------|
| **Layout** | `layouts/AdminDesktopLayout.tsx` — sidebar nav, theme toggle, sign out |
| **Admin pages** | Dashboard, Members, Activity, Content, Programs, Promos, Recipes, Pricing |
| **Affiliate admin** | Overview, Affiliates, Rules, Referrals, Payouts, Fraud |
| **Store** | `adminSlice`, `adminProgramsSlice`, `affiliateSlice`, `contentSlice`, auth + theme + challenges |
| **UI** | Modals, ToggleSwitch, ThemeProvider |
| **Persistence** | `localStorage` key `abi-admin-desktop-v1` (separate from the mobile app) |

## Auth

Mock admin auth is seeded in `store/slices.ts`. Guards redirect non-admin users to `/admin`. Use **Sign out** in the sidebar to test guard behavior.

## Routes

All routes are under `/admin`:

- `/admin` — Dashboard
- `/admin/members`, `/admin/activity`, `/admin/content`, `/admin/programs`
- `/admin/promos`, `/admin/recipes`, `/admin/pricing`
- `/admin/affiliate/*` — affiliate sub-sections
