# Week 07 — Reproducible app and database with Docker Compose

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-06.md) · [Next](week-08.md)

**Live progress:** [Week 07 GitHub issues](../TASKS.md#week-07). Use issues for checklist updates; this file remains the curriculum.

**Outline budget:** B12 / I4 / A4 = 20h. Entry: working PostgreSQL application and verification command. Goal: another environment can start the same app/database with documented configuration.

**Materials:** official Docker build/Compose documentation and a matching Spring packaging reference. Learn images, containers, networking, ports, and volumes through the existing application.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** package the app and create a small Docker image definition. **Done:** packaged artifact and image build; container starts with configuration supplied externally; record JDK/runtime choices. **A 60m:** current OS memory topic. **Done:** explain stack/heap/address-space roles and inspect one harmless process's memory information. |
| 2 / 3h | **B 120m:** define app+PostgreSQL Compose services, internal network, and persistent volume. **Done:** app reaches DB by service name, migrations apply, and a local HTTP request succeeds. **I 60m:** current IBM lab or descriptive statistics. **Done:** compute and interpret a central-tendency/spread measure relevant to the dataset. |
| 3 / 3h | **B 120m:** add startup readiness and document expected first-run behavior. **Done:** cold start works twice; explain service readiness versus container start and host versus container ports. **A 60m:** current OOP review. **Done:** independently solve one small course-style exercise and identify one weak concept. |
| 4 / 3h | **B 120m:** verify persistence/configuration and clean-clone instructions in a separate disposable checkout or copy. **Done:** create record, restart services, retrieve same record; no hidden IDE settings or secret values needed in tracked files. **I 60m:** current lab or exploratory analysis. **Done:** one supported data observation and one unanswered question recorded. |
| 5 / 3h | **B 120m:** solve one array/String/Map algorithm (60m), repair or retrieve an I/O/generics gap (30m), and solve one SQL question (30m). This replaces the early posting survey; live role review stays in Week 11. **Done:** independent algorithm attempt covers normal, empty and duplicate cases with time/space reasoning; one earlier gap has new evidence; SQL predicted and actual results agree. If blocked, retain the attempt and smallest next action. **A 60m:** current responsive HTML/CSS/JS lab. **Done:** two viewport checks and one required interaction verified, without building an elaborate portfolio frontend. |
| 6 / 4h | **B 60m:** write a two-minute run/demo guide. **Done:** startup, sample requests, logs, normal shutdown, and distinction between restart and destructive volume removal are clear. **I 120m:** continue the certificate lab. **Done:** rerunnable notebook and three observations with actual progress logged. **A 60m:** current database schema/review task. **Done:** one diagram or schema attempt plus two rubric-derived checks. |
| 7 / 1h | **B 60m:** demo clean startup and persistence (20m), explain image/container/network/volume (20m), review/replan (20m). **Done:** reproducibility evidence and remaining blockers logged before CI. |

**Checkpoint:** app+DB start predictably with documented commands, migrations, and volume persistence. A running container without a working HTTP/database flow is incomplete.

**Adjustment:** keep one simple Compose setup; defer image-size optimization, multiple environments, and hosted deployment. Never test data deletion against a coursework or personal database.
