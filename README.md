# Java Backend Learning Dashboard

A React and TypeScript study planner paired with a 12-week Java/backend learning plan. It connects skills, resources, and daily activities, with offline edits, revision-based progress synchronization, and JSON backups.

[**Study plan**](ROADMAP.md#all-weeks) · [**Application source**](dashboard/) · [**Local setup and verification**](dashboard/README.md#development-and-verification)

The hosted tracker is **owner-private**, not a public demo. This repository shares its source and study materials. The application is written in TypeScript; Java/backend projects in the curriculum are learning objectives, not completed implementations.

## Inspect the implementation

- **Interface:** React and TypeScript views for skills, courses, projects, and daily planning.
- **Persistence:** a Cloudflare D1 / Drizzle progress API, browser cache, and a pending-edit queue.
- **Progress continuity:** field-level conflict rebasing, legacy record preservation, and JSON import/export.
- **Verification:** Vitest model/API tests and local Playwright smoke scripts.

The hosted progress API stores a single owner's state and relies on platform access control. Keep that deployment private; a public or multi-user deployment would require explicit identity checks and isolated storage.

With Node.js 22.13+ and npm installed, run these checks from the repository root:

```bash
cd dashboard
npm ci
npm run typecheck
npm test
npm run build
```

These commands install, test, and build locally; they do not deploy the application or access saved personal progress. Follow the [developer notes](dashboard/README.md#development-and-verification) for local D1 setup and browser smoke tests. Use only disposable local state for mutation tests.

## Learning workflow

The dashboard shows a saved week, next eligible skill, and progress across **Java & Backend (60%) · IBM Data Science (20%) · AGH (20%)**.

**AGH assignments and real deadlines come first.** Default capacity is 20 hours/week; reserve university time before splitting the remaining time Java:IBM about 3:1.

## Every day

1. Open **Today**: check AGH deadlines, then add a few study activities or use a recurring routine. Set planned minutes; actual time is optional.
2. Open **Roadmaps** for a skill’s guide, resources, exercise and mastery criteria, or resume a lesson in **Courses**. **Projects** contains practical briefs for the same evolving Java backend.
3. Check an activity when finished. Course lessons, projects and skill mastery each keep their own status. Record actual time only if you want to.
4. Use **Progress** for weekly/monthly study history. The week button opens your 12-week plan, where unfinished objectives can move without copying records.

Weekly planning stays at 3–5 broad outcomes; the original 190 exercises and their evidence remain under **Optional practice & original task history**. The daily planner supports editing, skipping, moving and recurring activities without imposing a quota. Its chart shows completion by activity count; planned and recorded time remain separate.

**Java Developer** and **Backend** load their complete official reference graphs privately, including groups and connections. **Full Roadmap** and **My Learning Path** contain the same nodes; personal mode highlights Java/Spring Boot/PostgreSQL priorities. Data Science and AGH retain separate maps. Skills support Not started / Learning / Done / Skipped; skipping never counts as mastery. Shared concepts reuse existing progress records, while unmatched original topics remain in Progress and the weekly plan.

All website progress saves privately across devices. Watch the sync indicator before switching devices; Export / Import provides a portable backup.

[**12-week Markdown plan**](ROADMAP.md#all-weeks) · [**Materials**](RESOURCES.md) · [**EPAM Java Readiness**](EPAM_READINESS.md)

<details>
<summary>GitHub tasks and backups</summary>

Existing GitHub issues, checkboxes, comments, and milestones are preserved. Website progress synchronizes between your browsers, **not with GitHub issue checkboxes**. Choose the website for daily tracking to avoid updating two trackers.

[Week 01 Java #1](https://github.com/ivanshevchuk0/java-backend-roadmap/issues/1) · [IBM #2](https://github.com/ivanshevchuk0/java-backend-roadmap/issues/2) · [AGH #3](https://github.com/ivanshevchuk0/java-backend-roadmap/issues/3) · [Optional GitHub Project setup](GITHUB_PROJECTS.md#authorization)

On your first visit after the redesign, progress stored in that browser is migrated using the original storage key. A pre-redesign backup remains downloadable. Use **Export / Import** in the navigation for portable JSON backups; do not commit personal exports.

</details>

<details>
<summary>Website source and maintenance</summary>

The existing website source lives in [dashboard/](dashboard/). [Developer notes](dashboard/README.md) cover checks, storage, and deployment. No local server is needed for daily learning. The website keeps its existing owner-private audience; do not publish its shared owner progress endpoint publicly.

</details>
