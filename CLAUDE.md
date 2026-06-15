# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (CRA, port 3000)
npm run build      # Production build
npm test           # Run tests
npm test -- --testPathPattern=<file>  # Run a single test file
```

## Architecture overview

**Homix** is a React 18 + TypeScript Arabic RTL dashboard for managing manufacturing orders, shipments, tickets, factories, products, vendors, and users. The entire UI is in Arabic.

### Provider stack (`src/index.tsx`)

```
BrowserRouter
  └── Redux Provider
        └── QueryClientProvider (React Query)
              └── MaterialUIControllerProvider (theme/sidebar context)
                    └── App
```

### State layers

| Concern | Tool | Location |
|---------|------|----------|
| Auth (user, token) | Redux | `store/slices/authSlice.ts` |
| Notifications | Redux | `store/slices/notificationsSlice.ts` |
| Server data | React Query | `src/query/` |
| Sidebar / dark mode | MaterialUI context | `context/index.tsx` |

### Authentication

JWT is stored in `localStorage` under the key `"user"` as a JSON object with `token`, `userType`, and `id`. `shared/functions/sessionGuard.ts` provides helpers for expiry checks (`isJwtExpired`), clearing (`clearAuthStorage`), and cross-tab sync via the custom `"homix-auth-changed"` window event.

`App.tsx` derives `sessionOk` reactively from localStorage on every route change and tab focus — no token in Redux is the source of truth at startup, localStorage is.

On a 401 response or `force_logout: true` in any API response body, `axiosRequest` calls `redirectToSignIn()`, which clears localStorage and lets App's route guard redirect to `/authentication/sign-in`.

### User roles & routing (`src/routes.tsx`)

Four route sets keyed by `user.userType`:
- `"1"` → admin: all sections (home, products, orders, shipments, tickets, factories, financial reports, vendors, users)
- `"2"` → vendor: home, products, orders, tickets, financial reports
- `"3"` → operations: products, orders, factories, shipments, tickets
- default → logistics: products, orders, shipments, tickets

Detail/add/edit routes (orders, shipments, factories, users, tickets, products) are defined directly in `App.tsx` — not in the route arrays — and are always wrapped in `<ProtectedRoutes>`.

### HTTP client

Always use `axiosRequest` from `shared/functions/axiosRequest.ts`, never raw `axios`. It:
- Sets `baseURL` to `process.env.REACT_APP_API_URL`
- Attaches `Authorization: Bearer <token>` from localStorage on every request
- Globally handles 401 and `force_logout` responses by clearing the session

### React Query conventions (`src/query/`)

- **Key factory** in `query/keys.ts` — always use these for `queryKey` and `invalidateQueries`. Never hardcode key arrays inline.
- **Page size**: `ORDERS_LIST_PAGE_SIZE = 30` (from `query/ordersList.ts`)
- **Default config** (`query/queryClient.ts`): `staleTime: 30s`, `retry: 1`, `refetchOnWindowFocus: true`
- After any mutation, invalidate with `queryClient.invalidateQueries({ queryKey: orderKeys.all() })` or the relevant domain key.

### Orders listing pattern

`layouts/Orders/index.tsx` is the canonical example of a filter-driven list page:
- **URL params** drive server-side filters: `page`, `status`, `vendorId`, `orderNumber`, `paymentStatus`, `deliveryStatus`, `userId`, `deliveryBy`, date range
- **Local state** drives client-side filtering on the current page: `searchOperationCode`, `searchProductCode`, `searchCustomerName`
- Two separate `filtersKey` memos exist: one for the list query, one for the KPI summary query (which also includes client-side fields)
- `useOrdersMeta()` fetches dropdown options from `/orders/meta`
- `useOrdersSummaryQuery()` drives the KPI cards at the top of the page

### Design tokens

`layouts/Orders/ordersHomixTheme.ts` exports `HX` and `cardSx` — used across Orders, Tickets, and the Dashboard. The accent color is `#6366f1` (indigo), background is `#f4f5f9`. Import from here when building any new Homix-styled component.

### Dashboard

The active dashboard is `src/claude/dashboard/HomixDashboardPage.tsx`. The directories `layouts/dashboard/` and `layouts/dashboardV2/` are legacy and unused.

### Theme & RTL

RTL is enforced globally via `stylis-plugin-rtl` + Emotion's `CacheProvider` in `App.tsx`. Theme files are in `assets/theme/` (light) and `assets/theme-dark/` (dark). The `MaterialUIControllerProvider` (`context/index.tsx`) controls `darkMode` and `layout` state — `layout === "dashboard"` shows the sidenav.

### Module path alias

`tsconfig.json` sets `baseUrl: "src"`, so all imports resolve from `src/` with no prefix — e.g. `import X from "layouts/Orders/..."`.

### TypeScript

Strict mode is off (`strict: false`, `strictNullChecks: false`, `noImplicitAny: false`). The codebase mixes typed and untyped code freely.

### Real-time notifications

`hooks/useSocket.ts` opens a Socket.io connection to `REACT_APP_API_URL` authenticated with the JWT, subscribed per `userId`. Incoming events are dispatched to Redux and trigger a sound (`/Notification.wav`) after the first user interaction on the page.

### Environment

- `REACT_APP_API_URL` — backend base URL (`https://homix.onrender.com`)
- `GENERATE_SOURCEMAP=false` set in `.env`
