# Learning OS dashboard

A static React + TypeScript + Tailwind dashboard for the existing twelve-week roadmap. No app backend, accounts, database, analytics service, or exercise solutions. The hours chart uses small HTML/CSS bars rather than another runtime library.

## Run locally

Prerequisites: Node.js 22.12+ in the 22 LTS line (or a supported newer LTS such as 24), npm, and a modern browser.

```bash
cd /home/ivan-shevchuk/Projects/java-backend-roadmap/dashboard
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Keep the command running while using the dashboard; Ctrl+C stops it. In another checkout, change the path accordingly.

```bash
# Production output: dashboard/dist/
npm run build
npm run preview

# Content consistency, progress/import tests, and TypeScript/production build
npm run data:check
npm test
npm run build

# Optional isolated browser regression (download Chromium once)
npx playwright install chromium
npm run test:browser
```

The browser regression starts/stops its own localhost server on port 4179 and uses fresh contexts, never your personal browser profile. It reports temporary screenshot/export paths and tests desktop/mobile behavior, refresh persistence, JSON restore, invalid imports, course/review notes, prerequisite invalidation, and unavailable/corrupt storage.

## Daily use

1. Select the week you want to inspect. Viewing another week does not change your current week; choose “Set as current week” explicitly.
2. Check real AGH deadlines and current exercise rubrics. In Plan settings, change weekly capacity and reserve AGH hours first. The remaining time splits backend:data science at 3:1.
3. Open “Next up” or a board task. Read the description and definition of done; attempt it yourself. Days mean movable study sessions.
4. Mark task status, record cumulative logged minutes, adjust priority, and add evidence/next action. A high-priority AGH item explicitly saved in its editor moves ahead of other days. Otherwise suggestions follow study-day order.
5. Review the workload against the budget. Edit task estimates or defer optional tasks when needed; lowering capacity does not magically shorten exercises. Deferred tasks leave scheduled totals, but their already logged minutes remain counted.
6. Verify a project milestone only after recording reproducible evidence and verifying its backend prerequisite. Task completion alone does not verify a checkpoint. Reopening a prerequisite also reopens dependent milestones while preserving their evidence notes.
7. Use Weekly review for real deadlines, blockers, at most two carryovers, and the next three outcomes. Update the course note with your actual enrolled unit and assessment status. Export JSON regularly.

## What the numbers mean

- **Weekly tasks / overall percentage:** self-reported completion of scheduled tasks, excluding deferred tasks. Deferred counts stay visible. This measures the plan, not mastery or grades.
- **Logged hours:** actual minutes you entered, including work on unfinished/deferred tasks. Checking a task never fills these in.
- **Scheduled workload:** sum of active task estimates, with your overrides. Estimated effort on completed tasks is shown separately from logged time.
- **Planned chart bars:** each week's configured capacity, initially 20h. Logged bars are actual entered time. Bars can exceed the plan; they are not capped to hide an overrun.
- **Allocation:** initial 60/20/20. AGH reserves override the ratio. This is a time budget, not an automatic change to task scope.
- **Course cards:** completion of mapped roadmap tasks, not a Coursera certificate percentage. Some tasks support multiple course topics; time is still counted once in overall statistics. Google ML is marked later and has no invented completion target.
- **Milestones:** manually verified evidence gates for the evolving Java backend. This dashboard does not implement that backend for you.

## Persistence and JSON backups

Progress uses localStorage key `learning-os:java-backend:v1`, with a versioned JSON envelope identifying this roadmap. It stores current week/start date, task status/priority/estimates/actual time/evidence, weekly capacity, milestone evidence, course notes, and reviews.

Use **Export progress**, then **Import progress** in the destination browser. Import validates the file and previews its summary before replacing current progress. You can export current progress from that preview first. Malformed/oversized/incompatible files, invalid times or IDs, and inconsistent checkpoint dependencies are rejected without replacing existing state.

Saved state belongs to the browser profile **and origin**: a different port, device, hostname, or private preview URL has separate storage. There is no GitHub or cross-device sync. Clearing site data removes local progress; private browsing may discard it on exit. Keep one editing tab open to avoid conflicting writes. Export a backup before switching environments or clearing storage.

If storage is unavailable/full, the app continues in memory and displays an export warning. If stored data is unreadable, it preserves the raw value and offers a recovery download; it does not silently overwrite it. Restore a valid backup or explicitly start fresh after saving the recovery copy.

JSON exports may include your personal notes and evidence links. They are user data, not project source. Do not commit them to the repository.

## Content and UI structure

```text
../weeks/week-*.md             Editorial learning-plan source
../scripts/sync-roadmap.mjs    Content parser + budget checks + Mermaid generator
src/data/roadmap.json          Generated structured weeks/tasks/courses/dependencies
src/lib/                      Typed progress, calculations, validation, persistence
src/components/               Task board, timeline, chart, accessible dialogs
src/App.tsx                   Overview, courses, milestones, review, navigation
src/styles.css                Dark theme, responsive styles, reduced-motion support
scripts/browser-smoke.mjs     Isolated end-to-end interaction checks
```

Edit roadmap content in the weekly Markdown, then run from this directory:

```bash
npm run data:sync
npm run data:check
npm test
npm run build
```

Commit the updated Markdown, generated JSON, and Mermaid block together. Do not edit generated JSON alone. Short outline labels, course mappings, and phase metadata are maintained in the generator; descriptions, criteria, day/track assignments, and time estimates come from the weekly plans. All 190 tasks preserve the original 12/4/4 weekly budget.

Task IDs are deterministic by week/day/track/position. Preserve the order of existing slots when editing text and append new slots where possible. A structural reordering or ID change requires a progress migration and schema/version decision; export a backup first. The current import rejects unknown IDs rather than dropping them silently.

The Mermaid block in ROADMAP.md is generated from the same milestone sequence. AGH/IBM are parallel tracks, and AGH's baseline never overrides its actual coursework deadlines. The dashboard does not invent deadlines or current enrollment progress.

## Static hosting

`npm run build` emits only static assets in `dist/`. They can be served from a static host; no server-side account or authentication code is part of the app. The optional Sites preview retains private platform access independently of browser-local progress. Keep private repository links private as intended. Changing the preview origin requires JSON export/import to transfer progress.
