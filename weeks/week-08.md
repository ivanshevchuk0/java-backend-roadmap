# Week 08 — CI and trustworthy integration checks

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-07.md) · [Next](week-09.md)

**Live progress:** [Week 08 GitHub issues](../TASKS.md#week-08). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: documented container/local run path. Goal: every change can be checked consistently, including real PostgreSQL tests.

**Materials:** official documentation for the repository's actual CI provider, Maven test lifecycle, and chosen PostgreSQL test setup. Use a CI database service or Testcontainers if feasible; choose one approach first.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** make one full verification command run unit, HTTP, and PostgreSQL integration tests. **Done:** test report names/counts prove all intended classes execute; missing DB causes an explicit failure rather than silent skipping. **A 60m:** current virtual-memory lecture/lab. **Done:** explain paging/page fault and solve one small address/page calculation or assigned trace. |
| 2 / 3h | **B 120m:** configure CI to use a compatible JDK and PostgreSQL. **Done:** workflow configuration names required steps and an actual run executes verification; record provider/run link and revision. If no remote exists, arrange your chosen repository hosting at this stage and mark CI unverified until it runs. **I 60m:** current unit; only if ready, review train/validation/test concepts. **Done:** current artifact or a correct split explanation with one leakage example. |
| 3 / 3h | **B 120m:** verify failures are visible. **Done:** a deliberate failing test fails CI, restoration passes, and database-test reports are inspectable; avoid merging intentional breakage. **A 60m:** current OOP exam/lab practice. **Done:** a timed mini-exercise with results and two corrections logged. |
| 4 / 3h | **B 120m:** inspect repeatability and test isolation. **Done:** two verification runs from reset disposable test data pass without order assumptions; CI applies migrations. **I 60m:** current IBM lab, or leakage/split exercise if prerequisites are met. **Done:** reproducible result and one stated limitation; modeling remains optional. |
| 5 / 3h | **B 120m:** five-minute project walkthrough (30m), Java interview exercise (45m), SQL interview exercise (45m). **Done:** recording/notes explain request flow and tests; both attempts include edge cases and corrections. **A 60m:** actual Flask/cloud-assignment preparation. **Done:** rubric, required platform, configuration needs, and one locally verified behavior recorded. |
| 6 / 4h | **B 60m:** document how a contributor reproduces CI locally. **Done:** verification command, DB prerequisites, report locations, and one common failure diagnosis are written. **I 120m:** current certificate lab; optional split/evaluation exercise only when ready. **Done:** rerunnable artifact and true assessment status. **A 60m:** timed SQL/course database mock. **Done:** attempt three course-style questions, execute/check results, log errors. |
| 7 / 1h | **B 60m:** inspect a real passing CI run (20m), explain test isolation and database evidence (20m), review/replan (20m). **Done:** G3 passed only with startup + PostgreSQL test + actual CI evidence; deployment waits if this fails. |

**Checkpoint:** a green CI result proves the intended test layers ran. A prepared workflow file alone is not an executed CI pipeline.

**Adjustment:** defer optional lint/coverage tooling. Fix CI discovery and real database execution before moving to deployment; continue the current IBM unit if later topics are premature.
