# USSD Dashboard

An administration frontend for **BluPay Africa USSD** services, built with **Nuxt 4** and **Vue 3**.

The app lets operators allocate USSD short codes to merchants, design and manage USSD menu flows (visually or as JSON), run sandbox test sessions, and monitor live sessions, transactions, and backend service logs in real time.

> **Note:** This repository is a client-only frontend. It contains no application backend, database schema, or payment-processing logic. All business requests are reverse-proxied by Nitro to the external BluPay Africa backend.

## Features

- **Authentication & user management** — login/logout, password change, role-based users (register, edit, delete).
- **Merchants & directory allocation** — browse allocated USSD codes, allocate new codes, update and release assignments, with available-code lookup by level.
- **Menus & flows** — list, create, update, and delete USSD menu config flows.
- **Visual Builder** — drag-and-drop node editor (Vue Flow) for designing menu flows, plus a JSON builder for direct schema editing.
- **Sandbox & simulator** — start test USSD sessions and send inputs against the sandbox backend.
- **Real-time monitoring (SSE)** — Live Sessions, Transaction Logs, and Service Logs streamed from the backend.
- **Settings** — profile, password, and user management.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Nuxt 4 (SSR) + Vue 3 |
| State management | Pinia (`@pinia/nuxt`) |
| Styling | Tailwind CSS (`@nuxtjs/tailwindcss`) with a custom `vibes` brand palette and dark mode |
| Flow editor | `@vue-flow/core`, `@vue-flow/background` |
| Charts | Chart.js + vue-chartjs |
| Icons | lucide-vue-next |
| Utilities | date-fns |
| Testing | Vitest + @vue/test-utils + happy-dom |
| Server / proxy | Nitro (bundled with Nuxt) |

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Setup

Install dependencies (a `postinstall` hook runs `nuxt prepare` for type generation):

```bash
npm install
```

### Development Server

Start the dev server on `http://localhost:3000`:

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview the production build:

```bash
npm run preview
```

### Static Generation

Generate a static site:

```bash
npm run generate
```

### Testing

Run unit tests (Vitest):

```bash
npm run test        # watch mode
npm run test:run    # single run
```

## Environment Variables

Runtime configuration is driven by environment variables. Create a `.env` file for local development.

| Variable | Default | Description |
|---|---|---|
| `NUXT_PUBLIC_API_BASE_URL` | `/api` | Public API base URL. **Must remain `/api`** for the Nitro proxy to work. |
| `API_TARGET_URL` | `https://ussd.blupayafrica.com/api/v1` | Upstream target for `/api/**` requests. |
| `SSE_TARGET_URL` | `https://ussd.blupayafrica.com/ussd/sse` | Upstream target for `/sse/**` streams. |

## API Proxy

Nitro route rules (see `nuxt.config.ts`) reverse-proxy requests to the BluPay Africa backend so the browser only ever talks to same-origin paths:

| Client path | Proxied to |
|---|---|
| `/api/**` | `API_TARGET_URL` (default `https://ussd.blupayafrica.com/api/v1/**`) |
| `/sse/**` | `SSE_TARGET_URL` (default `https://ussd.blupayafrica.com/ussd/sse/**`) |
| `/ussd/sandbox/**` | `https://ussd.blupayafrica.com/ussd/sandbox/**` |

All HTTP calls go through the `useApi` composable (`app/composables/useApi.ts`), which attaches auth/CSRF headers, retries, caches GETs, deduplicates in-flight requests, logs traffic, and auto-logs-out on `401`/`403`. Real-time streams go through `useSse` (`app/composables/useSse.ts`).

## Project Structure

```
app/
├── assets/css/         # Tailwind entrypoint
├── components/         # UI, builder, charts, logs, settings, transactions
├── composables/        # useApi, useSse, useLogger, useToast, error handlers
├── constants/          # api, ui, userRoles, validation constants
├── layouts/            # auth, default
├── middleware/         # auth.global.ts (route guard + CSRF checks)
├── pages/              # route pages (allocate, builder, live-sessions, ...)
├── plugins/            # auth.ts
├── stores/             # Pinia stores (auth, directory, menuConfigs, ...)
├── types/              # shared TypeScript types (api.ts)
└── utils/              # validation, statusHelpers, passwordValidation
server/api/auth/        # Nitro server routes
tests/                  # Vitest unit tests
nuxt.config.ts          # Nuxt + Nitro proxy configuration
tailwind.config.ts      # Tailwind theme (vibes palette)
```

### Key Pages

| Route | Purpose |
|---|---|
| `/live-sessions` | Real-time active USSD sessions (default landing route) |
| `/subscribers` | Merchants / directory listing |
| `/allocate` | Allocate USSD codes to merchants |
| `/menus-flows` | Manage menu config flows |
| `/builder/visual`, `/builder/json` | Visual and JSON flow builders |
| `/sandbox`, `/simulator` | Backend sandbox testing and simulation |
| `/transaction-logs` | Real-time transaction stream |
| `/service-logs` | Real-time backend service log stream |
| `/settings` | Profile, password, and user management |

## Deployment

The project ships with a `vercel.json` for Vercel deployment. It mirrors the Nitro proxy using `rewrites` for `/api/**`, `/sse/**`, and `/ussd/sandbox/**` (pointing at `https://ussd.blupayafrica.com/...`), plus a catch-all rewrite to `/` for SPA-style client routing. Note that these rewrite destinations are **hardcoded** in `vercel.json` — unlike the Nitro config, they do not read `API_TARGET_URL` / `SSE_TARGET_URL`, so update the file directly if the upstream host changes.

Because the app relies on server-side proxying, deploy it as a **server (SSR)** target rather than a pure static site. For non-Vercel providers, configure the equivalent proxy/rewrite rules and set `API_TARGET_URL` / `SSE_TARGET_URL` in the hosting environment. See the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for details.

## Further Reading

- [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction)
- [Pinia documentation](https://pinia.vuejs.org/)
- [Vue Flow documentation](https://vueflow.dev/)
