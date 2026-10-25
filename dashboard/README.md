# Personal learning tracker

The existing private Learning OS website, redesigned around connected skills using React, TypeScript, Tailwind CSS and React Flow. This is the same Site and origin, with the original 190 practice tasks and course catalog. No exercise solutions or backend learning project are scaffolded here.

## Daily use

- **Today**: check real AGH deadlines, plan a few activities, then study. Each activity can link a skill, Coursera/YouTube resource, project or AGH subject. Enter 30/60/90 minutes or a custom plan; actual minutes remain optional. Check completion, skip, edit, move or delete/restore an activity in place.
- **Recurring activities**: choose daily, weekdays or selected days, with an optional end date. One rule generates visible dates without storing hundreds of blank tasks. Completing, editing, skipping or moving an occurrence saves only that occurrence; moving retains its identity and suppresses the original date. Edit or pause a rule in the closed recurring section.
- **Roadmaps**: Java Developer and Backend load complete reference skill trees. Full Roadmap and My Learning Path retain identical source nodes and connections; personal mode highlights your priorities. Search, pan, zoom, fit, section jumps, themes and detailed skill panels remain available. Data Science/AGH retain their separate maps. Guides load on demand; personal notes and four-state mastery save independently.
- **Courses**: add/edit courses, YouTube links/playlists, docs, books and other materials. Record your own modules/lessons, notes and resume links. No external learning progress is assumed or fetched automatically.
- **Projects**: choose the primary evolving StudyTask backend first. Nine original project briefs cover CLI, Backend API, Database and Full-Stack, with level filters, objectives, criteria, linked skills and your repository/notes. Alternatives replace optional practice, not extra required weekly hours.
- **Progress**: weekly/monthly history includes explicit completions, manual learning logs and recorded planner activity. Completed sessions or sessions with actual time appear once, derived from their existing record. The original skill list remains accessible, including unmatched older topics.
- **Week button**: open the existing 12-week schedule and 3–5 broad outcomes. Edit, reschedule, carry forward or postpone the same goal; original practice, evidence, checkpoints and reviews remain in closed sections.
- **Export / Import**: the same portable v1 backup includes every optional map, notes and preserved legacy fields. Invalid imports leave stored data intact; imports merge without generating historical completion events.

Daily and weekly completion equals completed activities divided by non-skipped activities (zero active activities means 0%). Skips remain visible and reduce planned workload; they do not count as completion. The seven-day chart shows this activity-count percentage, with separate planned/actual figures. Actual totals use only entered values, including partial or skipped work, never estimated duration. No timer, quota, external scheduler or notification service is required. Weekly/monthly planner statistics include all scheduled days in the selected period; the journal shows recorded work through today.

The learning structure keeps the original 60/20/20 guide and 20-hour default capacity; AGH assignments/exams override it. Course lessons, goal outcomes and skill mastery represent different decisions and never mark one another complete. Blue diagram lines remain curated reading order; actual prerequisites govern recommendations. Maven/JUnit start in Week 1 and Spring Boot remains available around Week 2.

## Audit and compatibility decisions

The previous weekly view exposed 190 fine-grained tasks, while courses had only notes. The new view exposes four high-level outcomes per week, with the same original practice underneath. All existing task IDs, completion, minutes, evidence, notes, milestone history and references remain intact; no prior mastery or enrollment is inferred.

One existing private progress document remains the source of truth. Optional maps extend it: `goals`, `resources`, `units`, `activities`, `projects`, `sessions`, `routines`; notes extend existing skill records. The 48 goal templates and seven catalog resources are static defaults, not duplicated persisted blank records. Only user edits create overlays, using stable IDs. Rescheduling changes a goal’s week, preserving its identity and notes.

Resource notes use `resources[id].notes`, falling back to old `courseNotes[id]` until that resource is edited. The former course-note editor is no longer exposed as a second editable copy. Archived resources and module trees remain recoverable. Module folders do not count as lessons; parent progress is derived from active leaf lessons, and whole-course status remains explicit. No Coursera/YouTube progress is fetched automatically and no course/module catalog is fabricated.

Activity is an event history, not another completion tracker. Summaries count recorded activity, with optional session minutes only. Historical task-minute counters are retained but are not added again to session time. Same-field simultaneous edits use accepted-write order; field-level rebasing protects unrelated status and notes changes. Import merges supplied records without replaying completion events.

## Progress and privacy

### Full reference roadmap: audit, migration and rollback

The original curated Java map had 86 tracked skills and Backend had 22. This was not just a label-count gap: Java omitted nested classes, object lifecycle, initializer blocks, modules, Stack/Deque, functional/network/date/regex APIs, alternative frameworks, logging and testing tools. Backend omitted most alternative languages/data stores, authentication, caching, distributed systems, resilience, real-time protocols, observability and optional AI branches.

The replacement reads each complete official graph privately at runtime. The source snapshot checked on 24 October 2026 contains Java **125 diagram nodes / 88 skills / 29 edges / 7 section containers**, and Backend **225 nodes / 155 skills / 60 edges / 7 containers**. Topic, subtopic, section, title, label, paragraph, button, legend and horizontal/vertical line elements are all retained, with source IDs, dimensions, coordinates, handles and relationships. These counts describe that snapshot, not a promise that upstream never changes. The footer exposes the fetched revision and check date. Full Roadmap and My Learning Path use the same entire graph; the latter changes emphasis only. Existing Data Science/AGH maps and the 12-week study budget are retained.

**Reuse boundary:** [the upstream license](https://github.com/nilbuild/developer-roadmap/blob/master/license) allows personal use while restricting redistribution/publication. This owner-private viewer fetches source diagrams and individual topic guides only when used. Official graph JSON, guide text and reference screenshots are not bundled in Git, static assets, deployment archives or the progress database. Temporary browser caches are for personal offline use. Original renderer code, aliases and practice prompts remain in source; topic guides are attributed and link to their official originals. Do not make this Site or its reference proxy public, redistribute its caches, or claim this is an open-licensed copy. Upstream access or format changes can temporarily prevent a fresh load; a cached graph is clearly identified, and saved progress remains independent.

Before rollout, export progress from the current private site and retain the existing saved Site version **5**. There is **no bulk rewrite or database-schema migration**. The same D1 document, browser key and v1 backup envelope remain authoritative. Exact semantic matches reuse existing skill IDs; unmatched reference skills use `ref-java-<source-id>` / `ref-backend-<source-id>` and have no stored entry until edited. Duplicate source labels and obsolete upstream IDs never merge distinct nodes within a map. Unmatched original skills, task checkboxes, goals, notes and milestones remain available through the weekly plan/history. A parent's completion is never copied to its children, and course or session completion never sets mastery.

Personal features use optional `projects`, `sessions` and `routines` maps in that same document, with sparse stable records. Existing records are not replaced; adding these fields requires validation, field-level sync, import/export and recovery tests before deployment. New exploration topics are not automatically added to weekly objectives or deadlines.

**Rollback plan:** export again before rollback. Redeploy saved version 5 to restore the prior UI while retaining the new export and D1 state. That prior validator cannot edit `ref-*` links or the new project/session/routine maps, so an older interface must remain read-only until a compatibility patch accepts those optional fields, or the current interface must explicitly remove only those new links/maps after preserving the upgraded export. Do not silently delete these records or bulk-normalize mastery. For a complete state rollback, a controlled restore may replace the document with the pre-upgrade snapshot only after an explicit destructive-restore request; ordinary Import intentionally merges supplied records and does not clear history. The new viewer can be redeployed later without replaying completion events.

Verification mutates only an isolated local progress document, restores its snapshot afterward, and compares untouched legacy records. Production checks are read-only. Test source geometry and full/personal equality, topic guides, all status values, notes, JSON roundtrips, separate-browser sync, concurrent fields, offline refresh/reconnect, mobile navigation and retained course/task history.

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
src/data/java-roadmap.ts      Expanded Java topics, specific guides and curated sections
src/data/skill-catalog.ts     Canonical lookup; shared map IDs use one progress record
src/data/diagram.ts           Retained diagrams and deterministic geometry
src/diagram.css               Diagram-only light/dark styling
src/App.tsx                   Existing navigation and integration
src/components/LearningViews.tsx Homepage, broad goals and activity journal
src/components/ResourceLibrary.tsx Independent resources, units and bookmarks
src/lib/learning.ts           Derived defaults, validation and event history
src/components/ReferenceMap.tsx Complete runtime graph renderer
src/lib/server-reference-roadmaps.ts Allowlisted private reference proxy
src/lib/reference-learning.ts Original exercises and legacy-ID compatibility
src/components/DailyPlanner.tsx Sparse planner/routines and weekly chart
src/lib/study-planner.ts       Calendar-safe recurrence and derived statistics
src/components/Projects.tsx   Original project catalogue and personal progress
src/components/SkillTree.tsx  Retained Data Science/AGH React Flow canvas
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
npm run test:reference
npm run test:diagram
npm run test:tracker
npm run test:planner
```

The browser checks use installed Playwright Chromium (`npx playwright install chromium` once). Run mutation suites sequentially against a disposable loopback preview; each snapshots and restores that local progress document. Never run them against personal production progress.

- `test:reference` compares every runtime Java/Backend node ID, dimension and source position, all edges, full/personal equality and topic guides. It checks independent notes/mastery/skip, retained records, refresh, separate browsers, concurrent fields, offline recovery and mobile panels. Earlier `test:browser` / `test:java-map` commands are aliases for this current graph check.
- `test:diagram` is read-only: complete source graph geometry/controls and retained Data Science/AGH diagrams, theme, section navigation and responsive layouts.
- `test:tracker` exercises original course/module/lesson notes, bookmarks, archive/restore, weekly goal moves, legacy imports and concurrent/offline resource updates.
- `test:planner` covers linked activities, separate actual time, skip/completion percentages, sparse recurring rules, rescheduling without duplicate occurrences, pause/delete/restore, project status, history, export/import, cross-device/offline sync and 320/390px layouts.

Unit tests use invented reference fixtures, never redistributed upstream diagrams. The model tests also cover calendar arithmetic across DST/year/month boundaries, bounded recurrence ranges, API validation and unchanged legacy records. Browser artifacts and private backups belong outside Git.

## Publishing

Reuse `.openai/hosting.json` project ID and its owner-private audience. Push the exact Site source, build/package using the Sites workflow, and deploy that saved commit to the existing URL. Native D1 is enabled by the `DB` binding; production migrations belong in the packaged archive. Keep runtime databases, `.env` files, build output and personal JSON exports outside Git. The GitHub repository contains the same maintainable source, while Sites retains its own deployment source history.
