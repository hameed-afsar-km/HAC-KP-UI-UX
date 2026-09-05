# Track 7 — Entity Graph · HAC'KP 2026

A forensic intelligence and AML investigation platform. It turns raw case files into a structured
knowledge graph: entities are extracted, linked across devices and accounts, verified by an
analyst, and finally resolved into a single identity — with an interactive network map to explore it all.

The UI is the working surface for the **Track 7 — Entity Graph** scenario. It is built as a fast,
dark-first, single-canvas application where the graph is the centre of the workflow rather than an
afterthought.

---

## Stack

- **Next.js 16 (App Router)** + **React 19**, TypeScript
- **Tailwind CSS v4** with design tokens (light/dark themes)
- **Motion** for page/indicator animation, **Phosphor Icons** throughout
- Headless **Canvas 2D** graph renderer (no graph library) with custom layout + physics
- Mock backend layer (`lib/api.ts`, `lib/extractions-api.ts`, `lib/resolution-api.ts`) with a remote
  REST fallback and session-persistent state

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Light/dark is toggled from the nav pill
(sun/moon); the choice is remembered in `localStorage`.

| Command      | What it does                |
| ------------ | --------------------------- |
| `npm run dev`  | Start the dev server on :3000 |
| `npm run build`| Production build            |
| `npm start`    | Serve the production build  |
| `npm run lint` | ESLint across the app       |

---

## How the app is organised

The app is scoped per investigation *case*. Cases contain evidence, extraction jobs, reviewed
findings and a resolution pipeline, and every page under a case is reachable from the numbered
step rail in the header:

```
Files → Analysis → Findings → Verify → Match → Map
```

### `/` — Command Center (dashboard)

The landing page. Four metric cards summarise the portfolio (active cases, pending decisions,
running analyses, known entity types), followed by a live **System Log** timeline and a
**Quick Actions** panel. The right column lists the most recent **Active Cases**.

### `/cases` — Case portfolio

Searchable, filterable and sortable grid of all investigations. Each card shows category,
status, assigned officer and a short description.

### `/cases/[id]` — Case overview

The six-stage investigation workflow as a grid, plus case meta (status, category, officers,
timeline stages). This is the hub you jump between stages from.

### `/cases/[id]/evidence` and `/cases/[id]/upload`

**Evidence** is the vault: every file the case has gathered, with type, size, source and upload
metadata. **Upload** is where new files land — drag-and-drop with a progress flow and per-file
validation results.

### `/cases/[id]/jobs` and `/cases/[id]/extractions`

**Jobs** runs the extraction pipeline on uploaded files and shows attempt history with warnings.
**Extractions** is the findings explorer — every entity pulled out of the documents, filterable by
type, with per-extraction detail pages (`/extractions/[extractionId]`) showing attributes and raw
context.

### `/cases/[id]/quality-review` — Verify

Human-in-the-loop verification. An officer signs off whether each extracted entity's attributes
are consistent, flagging anomalies or confirming them before anything is acted on.

### `/cases/[id]/resolution-review` — Match

The cross-device resolution stage. Candidates are proposed when separate records may belong to
the *same real person* (aliases, devices, accounts). Each candidate carries a confidence signal
breakdown and a source dossier. You can **accept**, **reject**, **defer** or **reopen**, with
explicit warning/contradiction acknowledgements before a forced merge.

### `/cases/[id]/graph` — Network map

The core Track 7 view. A custom canvas graph of the resolved topology:

- **Entity Builder sidebar** — toggle on/off entity nodes by type category before rendering
- **Camera controls** — zoom in/out, reset, and force-layout
- **Reconstruction (► Play)** — reveals the graph one node at a time, drawing links in as it goes
- **Node & edge selection** — click any node or link to open a detail drawer
- **Drag nodes**, **pan** with the canvas, **scroll to zoom**
- **Search + entity-type filter** — matches are highlighted, carried nodes dimmed, and the camera
  auto-centres on the first hit

Entity and relationship drill-downs live at `/graph/entity/[entityId]` and
`/graph/relationship/[relationshipId]` with topology, attributes and a timeline.

### `/ontology`, `/ontology/entities`, `/ontology/relationships`

The schema dictionary. All 33 entity types and 18 relationship types ARGUS uses to classify data,
with attributes per type. `/ontology` arrives here via the nav "Ontology" link.

---

## The graph component (`InvestigationCanvas`)

Everything about the map is hand-rolled canvas — no external graph library.

- **Layout** — identity node anchored centre, other entities arranged on two orbit tiers
  ("direct resolution" vs "peripheral linkage"), with concentric radar guide rings
- **Glyphs** — each entity type has its own vector icon (device, IP, wallet, document, …)
- **Physics** — optional collision/spring simulation with the identity node locked centre
- **Rendering** — dot-grid background, confidence progress rings, per-type palette, label pills
- **Progressive reveal** — pressing play rebuilds the graph node-by-node with smooth link draw-in
  instead of a hard jump; toggling nodes in the builder side lerps the layout smoothly

## Backend & data

All data flows through `lib/api.ts`. It calls a remote REST service
(`https://ui-service-kwry.onrender.com/rest/v1`) with a 6s timeout, and on failure falls back to
local seeded data (`lib/mock-data.ts`) so the UI always runs. The extraction and resolution layers
simulate their own session state with real conflict guards (409-style version checks).

## Design system

- Brand orange `#E85002` with a near-black chromatic accent `#C10801`
- Light surfaces `#F9F9F9`/white, dark surfaces pure black/`#111111`
- Fonts: **Space Grotesk** for display, **Geist** for body, **Geist Mono** for data/status
- Shared shells: animated `BeamsBackground`, floating-island nav, and an ARGUS footer — consistent
  across every page

---

## Screenshots

Place a capture of each view in `screenshots/` and they render here automatically.

![Command Center dashboard](screenshots/dashboard.png)

![Case portfolio](../screenshots/cases.png)

![Investigation graph](screenshots/graph.png)

![Ontology dictionary](screenshots/ontology.png)

---

## Repository layout

```
app/                    # pages per route (cases, graph, ontology, …)
components/
  navigation/           # AppLayoutShell, FloatingIslandNav, CaseHeader, breadcrumbs
  graph/                # InvestigationCanvas + entity/relationship drawers
  help/ theme/ ui/      # HelpModal, ThemeProvider/ThemeToggle, BeamsBackground
  extractions/ resolution/   # workflow modals & drawers
lib/                    # api.ts, types.ts, mock-data.ts + simulated backends
```

---

*Built for the HAC'KP 2026 challenge. UI/UX work on the Track 7 — Entity Graph submission.*