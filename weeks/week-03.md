# Week 03 — Persist tasks in PostgreSQL

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-02.md) · [Next](week-04.md)

**Live progress:** [Week 03 GitHub issues](../TASKS.md#week-03). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Refine against real AGH briefs before starting. Track letters and review rules follow README. Entry: G2; repair any Week 02 PostgreSQL setup blocker first. Goal: the same API now stores tasks durably. Avoid adding a second application.

**Materials:** selected Amazon SQL/JDBC sections; Spring JPA guide; official Flyway documentation for the chosen version. Keep passive material under about 30% of the week's total. Every slot below includes its evidence log.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** establish the application's PostgreSQL database and first task-table migration. Reserve up to 30m for setup repair if needed. **Done:** migration applies to an empty disposable DB; a second start makes no destructive schema change; connection settings are externalized. **A 60m:** current OS thread/shared-state topic or urgent lab. **Done:** draw one interleaving and identify a possible race; record a rubric-derived lab check if assigned. |
| 2 / 3h | **B 120m:** time-box a prepared-statement JDBC operation to 30m within the existing exercise, then begin JPA mapping/repository integration for 90m. **Done:** JDBC query uses parameters and closes resources; JPA saves and reloads one task in actual PostgreSQL. **I 60m:** current IBM lab, or pandas loading/filtering if ready. **Done:** artifact loads a dataset and explains one selection, or records the exact incomplete step. |
| 3 / 3h | **B 120m:** switch the service's repository implementation from memory to PostgreSQL. **Done:** HTTP create/read/status flow still works and a task survives application restart; explain which layer changed. **A 60m:** current Java collections/OOP exercise. **Done:** runnable attempt with two required cases and one boundary case, or a clear blocker. |
| 4 / 3h | **B 120m:** add PostgreSQL integration checks using migrations. **Done:** save/reload, update, missing-ID, and one database constraint scenario run against real PostgreSQL; report how the database is isolated/reset. **I 60m:** current lab or basic summary statistics. **Done:** one reproducible summary with a plain-language interpretation. |
| 5 / 3h | **B 120m:** spend 45m on one small Java list/map problem, 45m on a join/count SQL question, and 30m documenting DB/test setup. **Done:** attempts include edge cases and complexity/query reasoning; setup commands are recorded. **A 60m:** current Flask assignment, or a tiny routing exercise if it has not arrived. **Done:** two routes exercised with expected responses; distinguish this preparation from any required submission. |
| 6 / 4h | **B 60m:** repeat restart persistence and review schema ownership. **Done:** evidence names DB version, app revision, migration, and surviving record; schema is migration-managed rather than silently rebuilt at startup. **I 120m:** current IBM lab, or compare two data subsets if ready. **Done:** rerunnable notebook/script and three observations; record actual provider progress. **A 60m:** current database keys/normalization topic. **Done:** explain PK/FK and identify one redundancy anomaly in a small example using course terminology. |
| 7 / 1h | **B 60m:** demo persistence (20m), explain JDBC/JPA/migration roles without notes (20m), and review/replan (20m). **Done:** checkpoint marked from evidence, upcoming AGH deadlines checked, next three outcomes and revised hours recorded. |

**Checkpoint:** API data survives restart; migrations and actual PostgreSQL checks are reproducible. Do not call an H2-only or mocked test a PostgreSQL integration check.

**Adjustment:** if persistence is incomplete, defer JDBC extensions and extra interview problems before adding Week 04 relationships. Continue the current IBM unit rather than forcing pandas ahead of prerequisites.
