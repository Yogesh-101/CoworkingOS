# CoworkingOS

A unified **multi-center coworking CRM + ERP** web application for operators who manage visitors, desk bookings, sales pipelines, client onboarding, billing, internal operations, and public website content from a single console.

---

## Project Overview

Coworking spaces running multiple branches often rely on spreadsheets, WhatsApp, and disconnected tools for day-to-day work. That leads to missed renewals, poor occupancy visibility, and revenue leakage.

**CoworkingOS** addresses this with a centralized operator platform that combines:

- **CRM** — lead tracking, proposals, and client onboarding workflows  
- **ERP-style operations** — floor maps, visitors, helpdesk, finance, team chat, and admin  
- **Multi-location control** — branch switcher, per-branch metrics, and role-based access  
- **Public-facing CMS** — live preview of marketing site content (hero, pricing, branding)

This repository is a **production-ready frontend demo**: all business data lives in client-side state (**Zustand**) with realistic seed data. No backend or API keys are required to run it locally. It is suitable for demos, UX evaluation, and as a foundation for wiring a real API later.

### Who it is for

| Persona | Typical use |
|--------|-------------|
| Coworking operators | Unified view across centers |
| Branch managers | Floor occupancy, visitors, local tickets |
| Community leads | CRM pipeline and member onboarding |
| Finance teams | Invoices, renewals, revenue KPIs |
| Reception | Visitor check-in and host notifications |

### Architecture (high level)

```
Landing Page  →  Enter Platform  →  App Shell (Sidebar + Header)
                                        ↓
                              Lazy-loaded module per tab
                                        ↓
                              Zustand store (mock data + actions)
```

- **Landing** — marketing site with features, pricing tiers, and CTAs into the app  
- **App shell** — persistent navigation, branch selector, global search, notifications  
- **Modules** — code-split with `React.lazy` for faster initial load  
- **State** — single Zustand store with actions that update KPIs, notifications, and cross-module data (e.g. accepting a proposal creates an invoice and onboarding record)

---

## Setup Instructions

### Prerequisites

- **Node.js** 18 or newer  
- **npm** (comes with Node.js)

No database, Docker, or environment variables are required for the default demo.

### 1. Clone and install

```bash
git clone <your-repo-url>
cd coworkingos
npm install
```

### 2. Run in development

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- On the **landing page**, use **Enter Platform**, **Sign In**, or any pricing CTA to open the operator console.  
- The dev server binds to `0.0.0.0:3000` so you can also reach it from other devices on your network.

### 3. Production build

```bash
npm run build
```

Output is written to the `dist/` directory (static assets ready to deploy).

Preview the production build locally:

```bash
npm run preview
```

Then open **[http://localhost:3000](http://localhost:3000)** again.

### 4. Deploy

Serve the contents of `dist/` with any static host, for example:

- Vercel / Netlify — connect repo, build command `npm run build`, output directory `dist`  
- nginx — `root` pointing to `dist` with SPA fallback to `index.html`  
- AWS S3 + CloudFront, GitHub Pages, etc.

### 5. Other scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` build output |

### Optional environment

`.env.example` is provided for future overrides (e.g. custom dev port). The demo does not read secrets at runtime.

---

## Features Implemented

### Public landing page

- Animated hero and feature sections (Motion, Three.js / ColorBends visuals)  
- Pricing tiers with monthly / annual toggle  
- Navigation anchors (Home, Features, Pricing, About)  
- One-click entry into the operator app  

### Dashboard (multi-location)

- KPI cards: total revenue, occupancy rate, active members, churn  
- Revenue chart (Recharts) with time-range control  
- Recent activity feed tied to the notification system  
- Metrics scoped to the **active branch** (Downtown Hub HQ, Westside Oasis, Tech Park Center, etc.)

### Interactive floor map

- Canvas-style layout of desks, meeting rooms, and private offices  
- Status legend: available, occupied, reserved, maintenance  
- Click-to-select workspace inspector  
- **Book**, **reserve**, and **release** desks with assignee name  
- Automatic occupancy recalculation and onboarding trigger on booking  

### CRM & client experience

- **Lead pipeline** — Kanban-style stages: new → contacted → qualified → proposal → negotiation → won / lost  
- Search, add lead, promote/demote stage, delete lead  
- **Client onboarding** — checklist steps with progress %; complete onboarding flow  
- **Quotations & proposals** — create proposals; accept/decline triggers invoices, lead updates, and new onboarding records  

### Smart visitor management

- Check-in new visitors (name, company, host, branch)  
- Active vs completed visitor lists with search  
- Badge print simulation (progress steps)  
- Host notification simulation  
- Branch-filtered visitor log  

### Helpdesk & operations

- **Service tickets** — create, assign, update status (open / in-progress / resolved)  
- Categories: WiFi/Network, Facilities, Cleaning, etc.  
- **Internal tasks** — operational to-dos with priority and assignee  

### Finance & billing

- Invoice list with status: paid, pending, overdue  
- Mark invoices paid (updates revenue KPI)  
- Create new invoices  
- **Renewals tracker** — renew contract, send renewal reminder  
- **PDF export** of invoice/receipt data (jsPDF)  

### Team chat

- Channels: operations, billing urgent, general  
- Send messages as the current operator role  
- Channel switching with message history  

### Website CMS (live customizer)

- Edit hero title, subtitle, brand name, accent color  
- Toggle pricing section visibility  
- Configure hot desk / dedicated / meeting room list prices  
- Live preview of public-site styling  

### ERP admin & RBAC

- **Employee management** — add staff, update status (active / on-leave)  
- **Integrations layer** — Kisi, Slack, Stripe, SendGrid-style cards; connect/disconnect, webhook URLs  
- **Role-based access control** — three roles with different sidebar permissions:  
  - **Super Admin** — all modules + Settings  
  - **Community Host** — dashboard, floor map, CRM, visitors, helpdesk, team chat  
  - **Receptionist** — dashboard, visitors, helpdesk  
- Profile popover: edit display name and session role (persisted in `localStorage`)  

### Settings

- Theme preference, notification toggles, email digest, privacy mode (Super Admin only)  

### Global app features

- **Branch switcher** in header — changes context for floor map, visitors, and dashboard copy  
- **Global search** — leads, invoices, desks across branches  
- **Notification center** — read/unread, mark all read, delete, simulate test alerts  
- **Cross-module automation** — actions in one module update others (e.g. proposal accepted → invoice + onboarding + notifications)  

---

## Tech Stack Used

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI framework** | React 19 | Component model, concurrent features |
| **Language** | TypeScript 5.8 | Type-safe domain models and components |
| **Build tool** | Vite 6 | Dev server, HMR, optimized production bundles |
| **Styling** | Tailwind CSS 4 | Utility-first layout and design tokens |
| **State** | Zustand 5 | Global app state, actions, mock persistence |
| **Routing / views** | View state in Zustand | `landing` vs `app` + `activeTab` module switching |
| **Charts** | Recharts 3 | Dashboard revenue and analytics |
| **Animation** | Motion 12 | Page transitions, modals, landing motion |
| **3D / visuals** | Three.js | Landing page background effects (ColorBends) |
| **Icons** | Lucide React | Consistent icon set across modules |
| **PDF** | jsPDF 4 | Invoice/receipt export in billing |
| **Dates** | date-fns 4 | Formatting for invoices, visitors, proposals |
| **Utilities** | clsx, tailwind-merge | Conditional classes (`cn()` helper) |

### Build & quality

- **@vitejs/plugin-react** — Fast Refresh for React  
- **@tailwindcss/vite** — Tailwind v4 Vite integration  
- **ESM** — `"type": "module"` throughout  
- **Code splitting** — lazy-loaded dashboard modules + Rollup `manualChunks` for vendor bundles (React, charts, PDF, motion, three)

### Project structure

```
coworkingos/
├── public/                 # Static assets (favicons, logos)
├── src/
│   ├── App.tsx             # Landing vs app, lazy module router
│   ├── main.tsx            # React entry
│   ├── store.ts            # Zustand store + mock data + actions
│   ├── types.ts            # Domain TypeScript interfaces
│   ├── index.css           # Tailwind + brand theme tokens
│   ├── lib/utils.ts        # cn() and shared helpers
│   └── components/
│       ├── landing/        # Marketing LandingPage
│       ├── layout/         # Sidebar, Header, Layout shell
│       ├── dashboard/      # Feature modules (CRM, Billing, …)
│       └── ui/             # Shared UI (lamp, radar, BrandLogo)
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Data model (summary)

Core entities are defined in `src/types.ts`, including: `Branch`, `Desk`, `Lead`, `Invoice`, `Visitor`, `ClientOnboarding`, `Proposal`, `Employee`, `Ticket`, `InternalTask`, `ChatMessage`, `CMSSettings`, `IntegrationSetting`, `WorkspaceRenewal`, and `UserSettings`.

---

## License

Demonstration prototype — customize and extend for your deployment. Add a backend, authentication, and real multi-tenancy when moving beyond the demo.
