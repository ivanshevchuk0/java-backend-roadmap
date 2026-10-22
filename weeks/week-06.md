# Week 06 — Queries, stable pagination, and SQL reasoning

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-05.md) · [Next](week-07.md)

**Live progress:** [Week 06 GitHub issues](../TASKS.md#week-06). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: reliable service/DB tests. Goal: bounded API results with clear query semantics and one evidence-based performance observation.

**Materials:** Spring Data query/pagination documentation and PostgreSQL query-plan reference; choose only the sections needed for the query. Do not build a generic search framework.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** define status/course filters and bounded page parameters. **Done:** examples specify defaults, maximum size, invalid values, and stable ordering with an ID tie-breaker; empty results are valid. **A 60m:** current deadlock material. **Done:** draw a wait-for example, name the four conditions, and explain one prevention strategy. |
| 2 / 3h | **B 120m:** implement filtering and pagination in the existing repository/API. **Done:** two pages from a fixed dataset return predictable non-overlapping results; combined filters produce the expected subset. **I 60m:** current IBM lab or visualization preparation. **Done:** choose a question, data columns, and a suitable chart with a reason. |
| 3 / 3h | **B 120m:** test edge cases and document the list-response change. **Done:** first/last/empty pages, bad page parameters, and filter combinations are covered; API examples match page metadata. **A 60m:** current Java exam/lab review. **Done:** answer five retrieval questions and run one exercise targeting the weakest answer. |
| 4 / 3h | **B 120m:** inspect generated SQL and one PostgreSQL query plan. **Done:** identify a join/filter/sort, consider one index, compare plans on a documented sample size, and state limits of timing conclusions on tiny data. **I 60m:** current lab or one chart. **Done:** chart has labeled axes/units and one supported interpretation. |
| 5 / 3h | **B 120m:** practice Java I/O (60m), SQL aggregation (30m), and transaction-boundary review (30m). Write/read a tiny UTF-8 task-title file with Path/Files and one try-with-resources reader or writer; use a fixed line format. **Done:** round-trip values match, empty and missing-file cases are deliberate, and a checked I/O exception and resource closure are explained; SQL result and transaction scope are justified. No general CSV parser or Java object serialization implementation. **A 60m:** current Flask REST exercise. **Done:** required method/status behavior and one error response verified in Flask. |
| 6 / 4h | **B 60m:** run the regression suite and one bounded-list demo. **Done:** previous create/update/rollback checks remain green; docs show stable ordering and response limits. **I 120m:** continue the certificate lab or chart comparison. **Done:** reproducible artifact, three observations, and a note on one misleading interpretation to avoid. **A 60m:** current index/query-plan topic or urgent database lab. **Done:** one explained plan or two rubric-derived query checks. |
| 7 / 1h | **B 60m:** demo pages/filters (20m), explain a query and transaction choice (20m), review/replan (20m). **Done:** query checkpoint recorded; Week 07 remains within capacity. |

**Checkpoint:** filters/pages are correct and tested, and one query decision is explained using observed SQL/plan evidence.

**Adjustment:** drop extra filters before reducing correctness tests. If AGH is busy, defer performance experimentation and retain the simple indexed schema plus a documented open question.
