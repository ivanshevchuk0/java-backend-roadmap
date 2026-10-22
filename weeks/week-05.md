# Week 05 — Test service behavior and transaction rollback

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-04.md) · [Next](week-06.md)

**Live progress:** [Week 05 GitHub issues](../TASKS.md#week-05). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: working relationships and deliberate errors. Goal: understand what unit tests, HTTP tests, and actual PostgreSQL tests each prove.

**Materials:** Mockito API, JUnit/Boot testing references, and selected transaction documentation. Use mocks for a real dependency boundary, not for the database behavior you are trying to prove.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** build a behavior/test matrix and write Mockito-isolated service tests. **Done:** valid creation and missing-course behavior tested with repository isolation; explain the mock's purpose and one limitation. **A 60m:** current synchronization exercise. **Done:** identify the critical section and explain a lock/semaphore choice using an observed example or assigned trace. |
| 2 / 3h | **B 120m:** improve boundary tests without starting Spring unnecessarily. **Done:** invalid-title, status change, and missing-task service tests assert outcomes; a deliberate behavior regression is caught. **I 60m:** current unit or SQL/data-access lab. **Done:** execute a relevant query/transformation and explain its result; no duplicate video sequence for already-demonstrated SQL. |
| 3 / 3h | **B 120m:** define a two-task batch creation service operation, without adding a new HTTP endpoint, and make it atomic. **Done:** success creates both tasks; a forced failure during the second write leaves neither task committed; explain the transaction boundary. **A 60m:** current OOP interface/equality topic. **Done:** explain a relevant equality or interface decision with runnable examples and a boundary case. |
| 4 / 3h | **B 120m:** test rollback and constraints against PostgreSQL. **Done:** committed database state is inspected after the service call; test setup does not hide behavior inside a surrounding test transaction; record success and failure results. **I 60m:** current IBM lab. **Done:** one reproducible intermediate result plus next step; use the course's actual remaining assessment requirements. |
| 5 / 3h | **B 120m:** Java problem (45m), SQL transaction/isolation question (45m), test cleanup (30m). **Done:** attempts include edge cases; explain what rollback does and does not undo; tests remain independent of order. **A 60m:** current Flask testing assignment. **Done:** one success and one error-path test run in the Python/Flask project required by the course. |
| 6 / 4h | **B 60m:** consolidate repeatable test commands and failure diagnosis. **Done:** another run from a reset disposable test DB succeeds; unit versus DB-test commands and reset procedure are documented. **I 120m:** certificate lab or a data-access exercise if appropriate. **Done:** outputs rerun and one issue/fix is explained; actual unit progress logged. **A 60m:** current database transaction exercise. **Done:** show commit/rollback behavior and predict the final rows before executing. |
| 7 / 1h | **B 60m:** demo a test catching a real regression and rollback evidence (20m), explain test layers (20m), review/replan (20m). **Done:** test matrix shows covered behaviors and known gaps; next week reflects AGH deadlines. |

**Checkpoint:** you can identify which test proves each behavior, and rollback is verified through actual database state. Mocked repository calls alone are insufficient.

**Adjustment:** keep the atomic operation tiny. If transaction behavior is unclear, defer extra features and debug the committed state before moving to pagination.
