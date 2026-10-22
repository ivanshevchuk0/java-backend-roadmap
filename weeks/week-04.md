# Week 04 — Relationships, validation, and a clear error contract

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-03.md) · [Next](week-05.md)

**Live progress:** [Week 04 GitHub issues](../TASKS.md#week-04). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: task persistence and migration checkpoint. Goal: a task belongs to a real course, invalid requests fail predictably, and deletion has defined behavior. Refine around actual AGH deadlines.

**Materials:** selected Spring validation, exception-handling, and JPA relationship references matching your version; targeted Amazon persistence material only for a gap. Keep domain rules simple and migrations explicit.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** introduce/refine request/response DTOs and title/status/date validation. **Done:** document required versus optional fields; blank title, unknown status, and malformed input each return 400; normal create remains 201. **A 60m:** current IPC topic or lab. **Done:** compare two IPC mechanisms and show one assigned or tiny approved-language example with observed output. |
| 2 / 3h | **B 120m:** add Course persistence, create/list operations, and task-to-course association with a migration. Decide what happens to older tasks explicitly. **Done:** create a course and linked task, query the relationship, reject a missing course, and demonstrate FK enforcement in PostgreSQL. **I 60m:** current unit or missing-value exercise. **Done:** identify missing values and justify one handling choice without silently discarding rows. |
| 3 / 3h | **B 120m:** standardize error responses and implement task deletion. **Done:** document a small stable error shape; missing task/course cases have deliberate status codes; existing task deletion gives 204 and later read gives 404. **A 60m:** current Java exceptions exercise. **Done:** demonstrate one expected failure and one successful case; explain propagation/handling. |
| 4 / 3h | **B 120m:** automate relationship and HTTP error scenarios. **Done:** tests cover invalid payload, missing ID, missing course, successful link, and delete behavior; at least one relationship constraint check uses PostgreSQL. **I 60m:** current IBM lab or clean a small dataset. **Done:** record before/after row counts and verify one invariant. |
| 5 / 3h | **B 120m:** Java collection exercise (30m), SQL INNER/LEFT JOIN exercise (30m), simplify one confusing layer (60m). **Done:** both attempts include an edge case and an explanation; refactor preserves passing tests. **A 60m:** actual Flask requests/templates exercise. **Done:** one request/form path and one invalid-input path verified in Flask, or the latest rubric-derived behavior. |
| 6 / 4h | **B 60m:** update the API behavior table and review the migration. **Done:** docs match real 201/204/400/404 responses and an existing database upgrades without unexplained data loss. **I 120m:** current certificate lab; connect SQL knowledge only if it is relevant. **Done:** one rerunnable result with data-quality notes and certificate status logged. **A 60m:** current joins/aggregation task. **Done:** two executed queries with expected results, including a zero-match group where relevant. |
| 7 / 1h | **B 60m:** demo valid and invalid flows (20m), explain DTO vs entity and PK/FK (20m), weekly review (20m). **Done:** relationship/error checkpoint has evidence; next scope/hours reflect live AGH work. |

**Checkpoint:** course/task relation and consistent client errors work in HTTP and PostgreSQL. No advanced many-to-many model or authentication project is needed.

**Adjustment:** defer extra request fields and refactoring if the relationship/error paths are not tested. If course linking requires more time, finish it before transaction work.
