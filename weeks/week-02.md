# Week 02 — Start Spring Boot and expose a small API

[Overview](../README.md) · [Progress](../PROGRESS.md) · [Previous week](week-01.md) · [Next week](week-03.md)

**Live progress:** [Week 02 GitHub issues](../TASKS.md#week-02). Use issues for checklist updates; this file remains the curriculum.

**Budget:** B 12h / I 4h / A 4h = 20h. Follow the AGH override before using these default tasks. This file describes work you will do; no app has been generated in the framework phase.

**Entry:** G1 evidence from Week 01. HTTP can be new. PostgreSQL proficiency is not required to start an in-memory Spring endpoint.

**Outcome:** one Spring application reusing your Week 01 domain ideas, with create/list/read/change-status operations and HTTP tests. PostgreSQL preparation happens alongside it; persistence implementation starts in Week 03.

**Materials cap:** roughly 1h of passive Spring material in B time, plus short reference lookups as required. Use selected Amazon Spring/HTTP sections and official guides; do not copy a finished course backend.

## Day 1 — Gate, setup, first endpoint, 3h

- [ ] **B · 30m: verify G1 and versions.** Re-run Week 01 tests, explain the constructor/repository boundary, and check JDK compatibility with your chosen stable Spring Boot version. **Done:** G1 and chosen versions recorded. If prerequisites fail, use today's full 2h B block for targeted repair instead, then reassess next session; defer SQL preview if needed to start Spring later this week.
- [ ] **B · 30m: generate the smallest app at this point.** Use Spring Initializr with Maven and Spring Web; retain its wrapper and compatible test dependencies. Bring over useful Week 01 classes, avoiding duplicate tutorial implementations. **Done:** wrapper builds/tests from terminal and the application starts locally. Record the actual project path. Database/JPA/Docker dependencies can wait.
- [ ] **B · 60m: first read endpoint.** Implement a GET task-list endpoint using a small in-memory dependency, consulting at most 15m of the REST guide. **Done:** a terminal HTTP request to `/api/tasks` returns 200 and valid JSON; explain URL → controller → response in your own words. The list may initially be empty.
- [ ] **A · 60m: OS processes/current lab.** Follow the actual brief. If no urgent replacement, observe a harmless process, PID/parent relationship, normal termination, and exit status. **Done:** three command/output observations and an explanation of process vs program; required lab code stays in the assigned language.

## Day 2 — Dependency injection and creation, 3h

- [ ] **B · 20m: Spring bean/constructor injection reading.** Compare Spring constructor injection with Week 01; inspect one component annotation and distinguish metadata from an interface or an ordinary Java constructor. **Done:** explain who constructs controller/service, what the annotation signals, and how constructor injection supports a service unit test without Spring.
- [ ] **B · 80m: POST and service wiring.** Add a small create request/response and wire controller → service → repository. **Done:** POST returns 201, a generated ID, and a Location header; a subsequent GET finds the created task. No persistence is claimed yet.
- [ ] **B · 20m: keep service tests running.** Run old tests against the adapted service; add or adjust a creation test when necessary. **Done:** service behavior remains tested without starting the whole web application; record passing results.
- [ ] **I · 60m: current certificate unit.** Continue its Python/data lab. **Done:** one completed small segment or reproducible intermediate artifact and a next step logged; use a function/list/dictionary exercise if basics still need repair.

## Day 3 — Read, status change, and errors, 3h

- [ ] **B · 20m: HTTP semantics.** Review path parameters, JSON, 400, 404, and status updates. **Done:** write an expected-status table for valid create/read/update, blank title, invalid status, and missing task.
- [ ] **B · 70m: implement the next vertical slice.** Add read-by-ID and PATCH status through the service. Handle missing numeric IDs explicitly and reject invalid input using the simplest compatible approach; formal validation refactoring comes in Week 04. **Done:** create → read → change status → read works; missing ID gives 404, blank title and unknown status give 400 rather than 500.
- [ ] **B · 30m: exercise domain/service boundaries.** Add or refine tests for missing-ID and invalid-status handling. **Done:** at least one test verifies each failure behavior, and unchanged tasks retain their state.
- [ ] **A · 60m: current OOP exercise.** Implement or independently recheck the current Java rubric, using inheritance/interfaces only if useful or required. **Done:** runnable evidence for two required behaviors and one boundary case, plus submission status. Do not rewrite a working lab to imitate Spring patterns.

## Day 4 — HTTP regression checks, 3h

- [ ] **B · 20m: web-test lookup.** Read the testing section matching your selected Spring Boot version. **Done:** distinguish a service unit test from an HTTP/controller test and choose a compatible approach.
- [ ] **B · 100m: automate HTTP cases.** Write tests for create, list/read, status change, missing ID, blank title, and unknown status. Assert meaningful status and response content rather than only application startup. **Done:** at least five meaningful HTTP tests cover both success and failure, terminal build passes, and a deliberately broken status/validation rule makes a test fail before restoring it. Record any scenario still untested.
- [ ] **I · 60m: data exercise.** Continue the current lab, or read a small local CSV and calculate a grouped/count summary if ready. **Done:** reproducible artifact with one interpretation and one input-quality check. Do not skip unresolved Python prerequisites to reach pandas early.

## Day 5 — PostgreSQL and SQL foundations, 3h

- [ ] **B · 20m: SQL/JDBC reading.** Select keys, joins, and parameterized queries from Amazon's database course or the PostgreSQL tutorial. **Done:** explain why SQL parameters are different from concatenating user input into a query.
- [ ] **B · 100m: set up a disposable PostgreSQL database and practice.** Use local PostgreSQL or a database-only container. Record the version and connection method without secret values. Create a tiny Course/StudyTask sample schema and run select, filter, join, group/count, and insert exercises. This is SQL practice; the API still uses memory. **Done:** five executed query/command results with predicted-vs-actual notes, including a course with no tasks and an intentional FK violation. Leave JDBC coding to Week 03 rather than build another application. If setup blocks for 30m, record the error, write query attempts, and reserve the first Week 03 block for setup; do not claim execution.
- [ ] **A · 60m: current web task.** Follow the rubric; if appropriate, practice one DOM/event or form behavior and inspect its HTTP request. **Done:** one browser-visible behavior and request/validation evidence recorded. If Flask has already been assigned, replace this with the actual Flask task immediately.

## Day 6 — Explain, document, and continue IBM, 4h

- [ ] **B · 25m: document current behavior.** Write app run/test commands and manual request examples, including the memory-only storage limitation and reset behavior. **Done:** instructions reproduce create → read → update and at least one error. Record actual commands; do not present future PostgreSQL support as complete.
- [ ] **B · 35m: internship baseline.** Explain your request flow aloud for five minutes; answer three questions on encapsulation, collections, and HTTP; list two strengths and two gaps. **Done:** short notes include one design tradeoff and the next practice target. Review your Git diff and make a focused commit if ready.
- [ ] **I · 120m: certificate lab.** Continue the currently appropriate lab, spending more time running/editing than watching. **Done:** rerunnable output, three observations, and actual certificate progress logged. If unfinished, identify the next specific step rather than rushing to the next unit.
- [ ] **A · 60m: current database assignment.** Practice in its required tool; choose joins/aggregation if the rubric leaves a gap. **Done:** two query results and an explanation of the zero-match case; verify any imminent submission separately from portfolio work.

## Day 7 — G2 checkpoint and next week, 1h

- [ ] **B · 20m: API demo.** Start from an empty in-memory store; create a task, read it, change status, show one 400 and one 404, and run tests. **Done:** exact commands/results and app revision recorded. State that restart loses in-memory tasks.
- [ ] **B · 20m: G2 review.** Explain controller/service/repository responsibilities, constructor injection, PK/FK, a join, and parameterized SQL. **Done:** mark passed only with the HTTP flow and explanations; flag missing PostgreSQL setup/query execution for the first Week 03 block.
- [ ] **B · 20m: replan.** Fill the weekly review, check real AGH deadlines, and refine the Week 03 outline. **Done:** three outcomes, actual hours, at most two essential carryovers, and a first action recorded. If the API is unfinished, simplify optional documentation/interview work before expanding database scope.

## Exit evidence

- [ ] One small Spring application with create/list/read/status flow and deliberate 400/404 behavior.
- [ ] Service tests plus at least five HTTP tests run successfully from the terminal.
- [ ] PostgreSQL/query practice is either executed with evidence or explicitly blocked and scheduled for repair.
- [ ] You can explain the request flow and why JPA/storage changes belong behind a boundary.
- [ ] AGH and IBM progress reflect actual work, with Week 03 adjusted to prerequisites and deadlines.

**If short on time:** preserve the Spring vertical slice and tests; defer extra SQL exercises and optional CV polish. **If ahead:** add one malformed-JSON test or improve a confusing explanation. Do not add authentication, a large frontend, or another backend yet.
