# Cognalytix — Frontend

**Self-discovery mirror UI** for the Cognalytix journaling product. Built with React 19, Vite 6, and plain CSS (no framework). Theme adapts to a warm vintage-paper aesthetic in light and dark modes.

The frontend communicates with the Spring Boot API in `../source`. All API calls go through `/api` — the Vite dev proxy forwards them to the backend at `http://localhost:8000`.

---

## Prerequisites

- **Node.js 20+**
- **Backend** running at `http://localhost:8000` (or configured via `VITE_PROXY_TARGET`)
- **npm**

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The browser calls `/api/...` same-origin; Vite proxies to the backend.

---

## Pages & Features

### Write (`/write`)
- Full-width journal entry editor with live word count
- Submit creates entry via `POST /api/journals`, which queues async AI analysis
- After save, polls `GET /api/journals/{id}` until `analysisStatus` is `DONE`
- Then polls `GET /api/insights/growth/latest?entryId=` every 2.5s (up to 8 attempts) for the trajectory mirror
- Shows the **Post-Entry Mirror** — integratedBody quote, trajectoryLine narrative, direction badge

### Journal (`/journal`)
- Paginated entry list with live search (title, content, mood label)
- Click an entry → full detail view
- Entry detail:
  - **AI reflection panel** — insight text, theme tags, optional coping suggestion
  - **What the model highlighted** — pull-quote sections with topic/emotion badges and intensity dots
  - **Topics · intensity** — all sections with hierarchical label display (displayText + category tag)
  - **Trajectory · mirror** — appears after analysis + mirror pipeline completes (may be 2–5s after `analysisStatus = DONE`):
    - Headline + day anchor line
    - Integrated body (main mirror narration)
    - Trajectory line (how past pattern connects to today)
    - Direction badge (GROWTH / SHIFT / STABLE)
    - **Pattern details** (collapsible) — the SQL-aggregated numbers behind the mirror:
      - Topic family name
      - Prior emotion family + intensity + journal count
      - Current emotion family + intensity
      - Shift direction and magnitude with plain-language interpretation
  - **Section badges** show `displayText` (e.g. "feeling anxious") with optional `category` tag (e.g. "emotion") when available from the hierarchical label data

### Insights (`/growth`)
- Pattern timeline of the last 12 analyzed entries
- Milestones section (static — computed from entry count thresholds at 10 and 30)
- Each timeline entry shows:
  - Direction badge (GROWTH / SHIFT / STABLE)
  - Type badge ("Post-Entry" or "Snapshot")
  - Pattern type badge (e.g. "EMOTION DRIFT ON TOPIC FAMILY")
  - Mirror narration (integratedBody or headline)
  - Topic (headline or mood label)
  - Date
- **Show pattern details** (collapsible per entry) — the trajectoryFacts:
  - Topic family
  - Before/after emotion families with intensity values
  - Journal count
  - Shift description

### Login / Register
- `POST /api/auth/register`, `POST /api/auth/login`
- Access + refresh tokens stored in `localStorage`
- Automatic token refresh on `401` (once per request, deduplicated via promise cache)
- Session cleared on logout or failed refresh

---

## API Surface

| Area | Endpoints Used |
|---|---|
| Auth | `POST /api/auth/{register,login,refresh,logout}` |
| Journals | `GET/POST /api/journals`, `GET/PUT /api/journals/{id}`, `POST .../reanalyze` |
| Growth | `GET /api/insights/growth/latest?entryId=` |

All responses normalized by `src/utils/journalApiNormalize.js` to handle mixed camelCase/snake_case from proxies. Journal list omits sections; open an entry by ID to get full section data.

---

## Authentication

Tokens live in `localStorage` alongside public user fields:

```javascript
{ accessToken, refreshToken, user: { id, name, email, role } }
```

Protected routes check for `accessToken`. On `401`, `client.js` automatically attempts one token refresh. If refresh fails or the refresh token is missing, the user is redirected to `/login`.

---

## Theming

Theme tokens are defined in `src/theme.js`. Both light and dark palettes share a warm vintage-paper aesthetic (parchment backgrounds, terracotta accents, sage growth indicators, rose for caution).

Design tokens via `getT(dark)` → `t`:

| Token | Usage |
|---|---|
| `t.ink / t.inkMid / t.inkDim` | Primary / secondary / muted text |
| `t.ember / t.emberSoft` | Accent (terracotta) |
| `t.growth / t.growthSoft` | Positive direction |
| `t.caution / t.cautionSoft` | Shift / negative direction |
| `t.surface / t.surfaceEl` | Card backgrounds |
| `iCol(intensity, t)` | Intensity color: sage ≤2, terracotta ≤3, rose >3 |

Font families: **Fraunces** (serif, display/narrative text) + **Figtree** (sans-serif, UI).

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Vite dev server with `/api` proxy to `http://localhost:8000` |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Preview production build locally |

### Proxy Target

Override where `/api` is proxied:

```bash
VITE_PROXY_TARGET=http://localhost:9000 npm run dev
```

Defaults to `http://localhost:8000` (configured in `vite.config.js`).

### API Base URL

For a separate backend origin (production / CDN deployment):

```bash
VITE_API_BASE=https://api.example.com npm run build
```

When `VITE_API_BASE` is unset, requests are relative (`/api/...`).

---

## Project Layout

```
src/
├── api/
│   ├── client.js          # JWT auth, auto-refresh, apiFetch / apiJson helpers
│   ├── authApi.js         # Register / login / refresh / logout
│   ├── journalsApi.js    # CRUD + reanalyze
│   ├── insightsApi.js    # Growth mirror: GET /api/insights/growth/latest
│   └── storage.js        # localStorage helpers for tokens + user
│
├── components/
│   ├── Badge.jsx         # Badge (label), DirBadge (direction), IntensityDots
│   ├── BrandLockup.jsx   # Cognalytix wordmark + tagline
│   └── Sidebar.jsx       # Navigation rail
│
├── context/
│   └── AuthContext.jsx    # Session state, login/register/logout, theme toggle
│
├── layouts/
│   └── MainLayout.jsx    # Sidebar + themed shell wrapping all pages
│
├── pages/
│   ├── HomePage.jsx       # Landing / redirect
│   ├── LoginPage.jsx     # Sign in
│   ├── RegisterPage.jsx  # Create account
│   ├── WritePage.jsx    # Journal entry creation + post-save mirror
│   ├── JournalPage.jsx  # Entry list + entry detail + trajectory mirror
│   └── InsightsPage.jsx # Growth pattern timeline
│
├── theme.js               # Design tokens, iCol() intensity color mapper
├── utils/
│   ├── dates.js           # Date formatting
│   ├── journalApiNormalize.js  # snake_case → camelCase + null guards
│   ├── journalContentDedupe.js # Pull-quote dedup detection
│   └── journalStats.js
│
├── App.jsx                # Router: public routes + protected shell
└── main.jsx              # React root + theme/font setup
```

---

## Design Decisions

### Theme tokens, not CSS variables
All styling uses inline style objects driven by `theme.js` tokens. No CSS custom properties, no Tailwind. The theme function `getT(dark)` returns both semantic names and legacy aliases, ensuring existing components work unchanged while new code uses the canonical names.

### Intensity color progression
Emotion intensity is mapped to a color strip: sage (calm) → terracotta (moderate) → rose (heightened). This keeps the emotional heat visible at a glance without bright saturation spikes.

### Normalized API responses
`journalApiNormalize.js` handles mixed snake_case/camelCase from proxies and older server versions. Every API response goes through it before reaching components.

### JWT refresh deduplication
`client.js` caches the in-flight refresh promise to prevent multiple concurrent refresh attempts. `apiFetch` retries exactly once after a successful refresh.

---

## Feature Status

| Feature | Status |
|---|---|
| Journal entry creation + editing | Done |
| Async AI analysis (poll for DONE) | Done |
| Per-entry trajectory mirror | Done |
| 5-field mirror card display | Done |
| Trajectory facts explainability | Done |
| Hierarchical label display | Done |
| Pattern type badges | Done |
| Growth direction badges | Done |
| Intensity dots | Done |
| Search | Done |
| Reanalysis | Done |
| Milestone notifications | Static (entry count) |
| Weekly/monthly insight timeline | Planned |
| Cross-topic correlation display | Planned |
| Mood history charts | Planned |
| Export | Planned |

See [`../source/README.md`](../source/README.md) for the full backend roadmap.
