# Week 10 — Explainable API, safe defaults, and portfolio evidence

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-09.md) · [Next](week-11.md)

**Live progress:** [Week 10 GitHub issues](../TASKS.md#week-10). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: deployment rehearsal and recovery evidence. Goal: a reviewer can run the application, understand its contract, and see honest limits without a long explanation from you.

**Materials:** selected official Spring/configuration and API documentation references; no new course or custom authentication system. Keep the local single-user scope unless public access is an explicit replacement task.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** review actual input/error/configuration boundaries. **Done:** invalid-input checks pass, responses expose no stack traces, tracked configuration contains no secret values, and public write access is not unintentionally exposed. Record concrete findings/fixes. **A 60m:** current sockets topic/lab. **Done:** explain client/server, port, TCP vs UDP, and inspect one harmless connection or required example. |
| 2 / 3h | **B 120m:** finalize an API reference with executable request examples. **Done:** create/read/update/delete, filters/pages, errors, and sample responses match the running version; document single-user scope and known limits. **I 60m:** continue the current lab, or export a small synthetic task dataset for analysis. **Done:** input schema, provenance, and one data-quality check recorded. |
| 3 / 3h | **B 120m:** write a clear app README and prepare a five-minute demo. **Done:** purpose, architecture sketch, run/test commands, migrations, deployment path, and limitations are present; someone can follow the steps without IDE-only setup. **A 60m:** weakest current OOP topic. **Done:** one independent exercise and explanation show whether the gap is closed. |
| 4 / 3h | **B 120m:** inspect one concrete quality gap from the demo and add a regression check. **Done:** one reproducible bug/confusing behavior is fixed and tested, or the verified absence of the suspected bug is documented. **I 60m:** current unit or pandas analysis of the export. **Done:** answer one specific question with a reproducible grouped summary. |
| 5 / 3h | **B 120m:** refine CV/project explanation (60m), Java practice (30m), SQL practice (30m). **Done:** one evidence-based project bullet, one debugging story, and two reviewed problem attempts. **A 60m:** weakest current web/Flask requirement. **Done:** one rubric-derived behavior and negative case verified in the required stack. |
| 6 / 4h | **B 60m:** run a timed demo and collect evidence links. **Done:** demo fits five minutes, commands work, and current revision/test/deployment evidence is easy to find. **I 120m:** current lab or finish export analysis. **Done:** notebook reruns, reports three observations and a limitation; no unsupported predictive/ML claims. **A 60m:** weakest current database topic. **Done:** two independently attempted queries/tasks with checked results. |
| 7 / 1h | **B 60m:** demonstrate documented behavior (20m), explain one tradeoff and one limitation (20m), review/replan (20m). **Done:** feature freeze scope chosen for Week 11; live AGH priorities recorded. |

**Checkpoint:** application documentation is reproducible and claims match observed functionality. IBM export analysis is optional if current certificate work is more appropriate; it does not become a new service.

**Adjustment:** skip automatic API tooling and hosted polish before sacrificing clear examples/tests. Spend remaining time fixing an observed gap rather than adding features.
