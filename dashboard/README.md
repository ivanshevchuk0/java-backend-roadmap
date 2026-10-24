# Personal learning tracker

The existing private Learning OS website, redesigned around connected skills using React, TypeScript, Tailwind CSS and React Flow. This is the same Site and origin, with the original 190 practice tasks and course catalog. No exercise solutions or backend learning project are scaffolded here.

## Daily use

- **Today** is the homepage: real AGH deadlines, current-week outcomes, an eligible next skill, active resources, and recent progress.
- **Weekly plan** defaults to four broad outcomes per week. Edit, reschedule, carry forward, archive or postpone the same goal record. Deeper original exercises and checkpoint/review history remain in closed disclosures. There is no required daily schedule.
- **Skill roadmap** retains the curated visual maps and light/dark appearance. Open a skill for purpose, concepts, prerequisites, selected resources, practical exercises, mastery criteria and personal notes. The Core Java and Backend Engineering shortcuts navigate the existing Java map.
- **Courses & Resources** is independent of the weekly plan. Add courses, videos, playlists, documentation, articles, books, projects or roadmap links. Record only the modules/lessons/chapters you use, save a resume link and notes, and explicitly set whole-resource status.
- **Activity** records a takeaway with optional minutes and shows weekly/monthly summaries. Explicit skill/exercise/resource/lesson/milestone completions add history entries. Loading or importing old progress never invents events.
- **Export / Import** keeps the same portable v1 backup envelope and now includes goals, resources, units, activities and skill notes. Invalid imports leave stored data intact.

The learning structure keeps the original 60/20/20 guide and 20-hour default capacity; AGH assignments/exams override it. Course lessons, goal outcomes and skill mastery represent different decisions and never mark one another complete. Blue diagram lines remain curated reading order; actual prerequisites govern recommendations. Maven/JUnit start in Week 1 and Spring Boot remains available around Week 2.

## Audit and compatibility decisions

The previous weekly view exposed 190 fine-grained tasks, while courses had only notes. The new view exposes four high-level outcomes per week, with the same original practice underneath. All existing task IDs, completion, minutes, evidence, notes, milestone history and references remain intact; no prior mastery or enrollment is inferred.

One existing private progress document remains the source of truth. Four optional maps extend it: `goals`, `resources`, `units`, `activities`; notes extend existing skill records. The 48 goal templates and seven catalog resources are static defaults, not duplicated persisted blank records. Only user edits create overlays, using stable IDs. Rescheduling changes a goal’s week, preserving its identity and notes.

Resource notes use `resources[id].notes`, falling back to old `courseNotes[id]` until that resource is edited. The former course-note editor is no longer exposed as a second editable copy. Archived resources and module trees remain recoverable. Module folders do not count as lessons; parent progress is derived from active leaf lessons, and whole-course status remains explicit. No Coursera/YouTube progress is fetched automatically and no course/module catalog is fabricated.

Activity is an event history, not another completion tracker. Summaries count recorded activity, with optional session minutes only. Historical task-minute counters are retained but are not added again to session time. Same-field simultaneous edits use accepted-write order; field-level rebasing protects unrelated status and notes changes. Import merges supplied records without replaying completion events.

## Progress and privacy

The original `learning-os:java-backend:v1` localStorage key and version-1 export envelope remain supported. Existing task IDs, checkboxes, minutes, evidence, course notes, capacity plans, reviews and milestone evidence are retained. Original browser data is backed up under `learning-os:java-backend:v1:before-skill-tree`; the UI offers that exact backup. Unknown safe legacy metadata is preserved.

`/api/progress` stores private progress in the existing Sites native D1 binding. The same owner-private website shares this record across your devices. Browser cache and a durable pending-change queue allow offline edits; the sync indicator distinguishes saved, saving and offline states. Conditional revisions detect concurrent writes and rebase changed fields, so editing evidence on one device does not replace a task status changed on another. Simultaneous edits to the same field resolve in accepted-write order. Keep JSON backups for history/recovery.

**Access boundary:** the API intentionally represents one owner and relies on this Site's verified owner-private platform access. Do not change the Site to public/shared without implementing per-user identity and isolated storage. The API also validates requests, rejects cross-origin browser writes and disables caching. No additional account, paid service, external database or authentication provider was introduced.

Website changes do not alter GitHub issues, checkboxes or milestones. The website's device sync is independent of GitHub tracking.

## Source map

```text
../ROADMAP.md                 Detailed weekly learning content
../EPAM_READINESS.md          EPAM preparation requirements and assessments
src/data/roadmap.json         Original stable weekly tasks and course catalog
src/data/skills.ts            Stable skill IDs, prerequisites and task mappings
src/data/learning.ts          Rich skill guidance, goal templates and learning paths
src/data/diagram.ts           Curated sections, branches and deterministic geometry
src/diagram.css               Diagram-only light/dark styling
src/App.tsx                   Existing navigation and integration
src/components/LearningViews.tsx Homepage, broad goals and activity journal
src/components/ResourceLibrary.tsx Independent resources, units and bookmarks
src/lib/learning.ts           Derived defaults, validation and event history
src/components/SkillTree.tsx  Interactive React Flow canvas
src/components/TopicPanel.tsx Materials, criteria, tasks and deadlines
src/lib/useLearningProgress.ts Browser migration, cache, offline queue and sync
src/lib/progress-sync.ts      Field-level rebase and legacy preservation
app/api/progress/route.ts     Owner-private conditional progress API
src/lib/server-progress.ts   Request validation and storage operations
db/schema.ts                 D1 schema
drizzle/                     Reviewed database migrations
```

Edit content in the existing Markdown and matching structured data together. The former weekly-file generator is no longer used: weekly content now lives in the consolidated `ROADMAP.md`. Preserve task IDs/order/course IDs when changing wording. Curriculum tests check coverage, dependencies and the 12/4/4 weekly budgets. Do not invent deadlines, completed assessments or course progress.

## Development and verification

Daily learning uses the hosted Site; these commands are only for website maintenance. Prerequisites: Node 22.13+ and npm.

```bash
cd dashboard
npm ci
npm run typecheck
npm test
npm run build
```

The supported Sites build helper produces the production Worker archive, including D1 migrations. The app uses the supported Vinext/Cloudflare runtime; `npm run dev -- --hostname 127.0.0.1 --port 5173` starts an optional local preview. Apply the generated migration to its local DB before exercising progress:

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_wide_anita_blake.sql
npm run dev -- --hostname 127.0.0.1 --port 5173
```

With that preview running, in a second terminal:

```bash
node scripts/api-smoke.mjs http://127.0.0.1:5173
npm run test:browser
npm run test:diagram
npm run test:tracker
```

The browser regression requires Playwright Chromium (`npx playwright install chromium` once). It uses isolated profiles and only permits loopback URLs. It verifies legacy migration, refresh/reopening, independent devices, concurrent fields, offline reload/reconnect, export/invalid import, AGH priority, search/expansion, zoom/pan and mobile panels. It restores its local database snapshot afterward. The separate read-only diagram check verifies central alignment, grouped rows, connector routing, collapse/search, independent tracks, light/dark preference and mobile readability. The tracker browser check exercises actual course/lesson progress, high-level goal moves, notes, activity summaries, backups, two browsers, concurrent edits and offline recovery. It also restores its local snapshot. Never run mutation smoke tests against personal production progress.

## Publishing

Reuse `.openai/hosting.json` project ID and its owner-private audience. Push the exact Site source, build/package using the Sites workflow, and deploy that saved commit to the existing URL. Native D1 is enabled by the `DB` binding; production migrations belong in the packaged archive. Keep runtime databases, `.env` files, build output and personal JSON exports outside Git. The GitHub repository contains the same maintainable source, while Sites retains its own deployment source history.
