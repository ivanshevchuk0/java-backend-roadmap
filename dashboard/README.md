# Learning skill tree

The existing private Learning OS website, redesigned around connected skills using React, TypeScript, Tailwind CSS and React Flow. This is the same Site and origin, with the original 190 practice tasks and course catalog. No exercise solutions or backend learning project are scaffolded here.

## Daily use

- **Skill roadmap:** explore three tracks, expand a section, search, pan or zoom. Click a node for materials, an exercise, completion criteria, prerequisites and original practice tasks.
- **Today:** recorded AGH deadlines within seven days (including overdue), explicitly promoted unfinished AGH tasks, then eligible skills. Recommendations respect prerequisites and the current week; later ML remains available for manual exploration.
- **12-week plan:** browse all tasks, change the current week, adapt weekly capacity, defer work, record actual minutes/evidence, edit course notes and weekly reviews, and verify project milestones.
- **Navigation → Export / Import:** keep a portable JSON backup. Invalid imports leave saved progress intact. Imports merge supplied records, preserving unrelated history.

Skill status is a self-assessment. Completing a topic does not check practice tasks or verify a project milestone. Track bars count completed skills; 60/20/20 labels describe the time allocation. Logged time is entered explicitly. AGH coursework overrides the default 20-hour budget.

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
src/data/skills.ts            Skills, groups, prerequisites and task mappings
src/App.tsx                   Primary skill tree, Today and retained schedule
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
```

The browser regression requires Playwright Chromium (`npx playwright install chromium` once). It uses isolated profiles and only permits loopback URLs. It verifies legacy migration, refresh/reopening, independent devices, concurrent fields, offline reload/reconnect, export/invalid import, AGH priority, search/expansion, zoom/pan and mobile panels. It restores its local database snapshot afterward. Never run mutation smoke tests against personal production progress.

## Publishing

Reuse `.openai/hosting.json` project ID and its owner-private audience. Push the exact Site source, build/package using the Sites workflow, and deploy that saved commit to the existing URL. Native D1 is enabled by the `DB` binding; production migrations belong in the packaged archive. Keep runtime databases, `.env` files, build output and personal JSON exports outside Git. The GitHub repository contains the same maintainable source, while Sites retains its own deployment source history.
