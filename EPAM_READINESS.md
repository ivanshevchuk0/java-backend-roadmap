# EPAM Java Readiness

[Roadmap](ROADMAP.md) · [Live tracker](ROADMAP.md#epam-java-readiness) · [Weekly review](GITHUB_PROJECTS.md#weekly-reset)

This is a preparation milestone inside the existing plan, targeted for Week 11 with a bounded Week 12 retry. It is **our learning benchmark**, not an EPAM certification, official question bank, admission guarantee, or published passing score. No complete exercise solutions are included.

## What the official guidance changes

Checked **2026-10-22** against [EPAM's Java skills roadmap](https://campus.epam.com/en/skills-roadmap/Java). Its public curriculum progresses from computing/Git/web foundations through language/OOP, collections, functional programming and I/O, then testing, concurrency, database/web development and Spring. Later sections broaden into enterprise, cloud and other specializations. **The curriculum varies by course and location.** This plan selects foundations rather than attempting the entire curriculum in 144 backend hours.

Published intake examples reinforce the need for preparation: [Hungary Java Fundamentals](https://campus.epam.com/en/training/6040) lists collections, I/O, lambdas/streams and algorithmic reasoning with B2 English; [Uzbekistan Java Web Development](https://campus.epam.com/en/training/5966) lists Core Java/OOP, generics, annotations, collections and algorithm/data-structure knowledge with B1 English. Both pages show registration closed and describe technical and English assessments. They are examples, **not applicable Polish intake rules**. No suitable current Poland intake or your eligibility has been established.

Before applying, open the actual intake page and verify location/residency, study-year/age/work eligibility, English requirement, assessment format, permitted tools, and real deadlines. Do that within Week 11's existing role-review time. If you enroll in a substantial EPAM course later, replace overlapping Amazon study time or extend this plan; do not add another full course on top.

## Gap map and evidence plan

The scheduling and evidence below are mentoring choices. Maven and JUnit are this plan's choices for build/testing skills; PostgreSQL is its SQL practice environment. This is not a claim that every intake tests Spring or all these tools at entry.

| Skill | Existing coverage / adjustment | First practical evidence |
| --- | --- | --- |
| Core Java | Strengthen the initial diagnostic: types/wrappers, arrays, Strings/equality, pass-by-value, exceptions; revisit access/package rules in your own code | W01 D1/D5; W09 D5 retrieval |
| OOP | Keep the model/interface/service work; explicitly explain encapsulation, composition/inheritance, abstract/interface and overload/override | W01 D2–3; W02 request flow |
| Collections and equality | Replace a generic problem with List/Set/Map/Queue selection, equal keys and hash consistency; explain basic operation costs | W03 D5 |
| Generics | Typed collections first, then one generic method and invariance; explain a simple bounded/wildcard signature during correction if it is the gap | W01 D3; W03 D5; W07 D5 repair |
| Lambdas | Explicit functional interface, Predicate, Comparator and capture-rule practice | W04 D5 |
| Streams | Loop versus filter/map/aggregate; empty/duplicate input, terminal operations, no shared mutation | W05 D5 |
| I/O | UTF-8 Path/Files round-trip, reader/writer resource lifetime, checked failures | W06 D5; W07 repair |
| Algorithms | Small array/String/map problems; searching/sorting choice, edge cases, time/space reasoning; no competitive-programming syllabus | W03 collection costs; W07–08 D5 |
| Maven / Git | Keep source/test layout, dependency scopes, test/package lifecycle, wrapper, focused diffs/commits | W01 D1/D4, W02 setup; W08 CI |
| JUnit / Mockito | Keep independent unit, negative, HTTP and PostgreSQL tests; mock one dependency where useful | W01 D4–5, W02 D4, W05 |
| SQL / JDBC | Keep keys, joins including zero matches, grouping, prepared statements, transaction reasoning and real PostgreSQL checks | W02 D5; W03 D2; later SQL slots |
| Spring Boot | Keep the accelerated Week 02 start after G1; DI/annotation meaning, request flow, MVC/REST, validation, persistence | W02 onward; W11 D4 explanation |
| Supporting fundamentals | Existing enum and JSON/logging tasks; explain Optional at a lookup boundary, recognize a record versus mutable entity; Java thread/join/race and stack/heap review | W03 D3 lookup review; W08 D5; existing W09 logs/W10 docs |

Do not rewrite working entities into records or add Lombok to demonstrate recognition. Nested classes, native object serialization, Java socket programming/servlet internals, an exhaustive pattern catalogue, advanced concurrency/security, messaging, microservices, extra cloud vendors, frontend frameworks and GenAI tooling are deferred beyond this cycle unless an actual intake or AGH brief requires them. Existing HTTP/network/OS preparation provides context; it does not establish mastery of these deferred Java topics. Keep AGH Flask and required OS languages intact.

## Workload substitutions

Every week remains **B12 / I4 / A4**, and all daily B totals remain unchanged. These are replacement exercises in the same app or tiny fixtures, not another backend. Evidence logging is inside each time box.

| Existing slot | Revised use of the same minutes |
| --- | --- |
| W01–02 diagnostics/reference time | More precise Java/OOP/types/Maven/annotation questions; existing coding/test tasks retained |
| W03 D5: Java45 / SQL45 / notes30 | Collections+generics60 / SQL40 / notes20 |
| W04 D5: collections30 / SQL30 / refactor60 | Lambdas60 / SQL30 / refactor30 |
| W05 D5: Java45 / SQL45 / cleanup30 | Streams60 / SQL30 / cleanup30 |
| W06 D5: Java45 / SQL45 / transaction30 | I/O60 / SQL30 / transaction30 |
| W07 D5: postings45 / Java45 / SQL30 | Algorithm60 / Java repair30 / SQL30; posting review already exists in W11 |
| W08 D5: walkthrough30 / Java45 / SQL45 | Walkthrough15 / algorithm45 / thread review30 / SQL30 |
| W09 D5: CV60 / SQL60 | Retrieval30 / CV45 / SQL45 |
| W10 D5: CV60 / Java30 / SQL30 | CV45 / targeted Java45 / SQL30 |
| W11 D3–4: interview/corrections120 + walkthrough/SQL120 | Assessments below: 120 + 120; W11 D7 review records the milestone |
| W12 D5: mock60 / applications60 | Targeted retry60 / applications60 |

If a prerequisite is weak, use its existing repair/review slot; defer optional polish or move the next skill. AGH deadlines take priority over these assessments. Reallocate before studying, and keep unfinished readiness visible beyond Week 12 rather than squeeze it into extra hours.

## Practical assessments

Use small fresh prompts that you write or request from a mentor **without solutions**. Vary data from practice. Work independently without AI-generated answers or copying a tutorial. Record reference/tool use; an official test's own rules take precedence. Keep original attempts separate from corrections. A passing corrected attempt needs a fresh independent retry.

### A — Core Java and problem solving: Week 11 Day 3, 120m

- **20m:** ten short concept/output-trace questions: two Core Java, two OOP/exceptions, two collections/equality, two generics, one lambda and one stream. Explain reasons, not just choices.
- **40m:** one small array/String/Map problem using a type-safe helper or collection boundary. State the input/output contract before coding. Choose a collection; explain the main operation's time/space cost.
- **30m:** one Predicate/Comparator or filter/map/aggregate transformation on the existing synthetic task fixture; predict results before running and compare with a loop.
- **30m:** review and correct; record the weakest topic and a bounded retry action.

**Internal pass:** at least 8/10 reasoned concept answers; both coding attempts independently run, match predicted normal results and cover empty plus duplicate/boundary input; generics avoid raw casts; complexity and stream behavior are explained correctly. Unfinished or assisted portions are partial. This threshold is our diagnostic, not EPAM's cutoff.

### B — Practical tools and backend foundations: Week 11 Day 4, 120m

| Time | Assessment prompt / evidence |
| --- | --- |
| 30m | Adapt your small file fixture to a fresh UTF-8 dataset. Demonstrate round-trip equality, empty-file and missing-file behavior; explain checked exceptions and resource closure. Fixed line format only. |
| 25m | In the existing Maven exercise, add a normal and negative/boundary JUnit case for one behavior. Break that behavior once, observe a failing assertion, restore it and rerun. Explain when a Mockito repository stub is useful versus a real PostgreSQL test. |
| 15m | Run the documented wrapper verification command, locate test reports, explain compile/test/package and test dependency scope. Record an actual failure instead of claiming a skipped suite passed. |
| 20m | Explain one existing Spring request from controller through DI/service/repository to response. Distinguish framework metadata, plain Java logic, MVC/REST and memory versus persisted data. Demonstrate one valid request and a 400/404 case. |
| 20m | Predict and execute one LEFT JOIN/group-count query with a zero-task course. Explain PK/FK, parameterized JDBC, and what a transaction rollback protects. |
| 10m | Give a short project explanation in English and answer one follow-up about a design/test choice. Record vocabulary or clarity gaps; this is not a CEFR assessment. |

**Internal pass:** each practical row has reproducible, correct evidence and its explanation. A build that skips intended tests, unexplained unsafe SQL, or missing error-path behavior leaves that component partial. Troubleshooting counts against the time box. Store the commit, command/report summary, predicted/actual results and independent explanation; do not upload official assessment questions.

### Retry — Week 12 Day 5, 60m

Choose the weakest component, change its prompt/input, and retry independently; use the final few minutes to compare evidence. Keep the other 60m for applications/search. If more than one substantial gap remains, leave the milestone open and schedule remaining work after Week 12 within future capacity. No universal exam pass is implied.

## Checklist and closing rule

Use the linked **live readiness issue** for these checkboxes; the list here defines criteria and is not a second progress tracker.

1. Core Java/OOP: explain the key distinctions and pass the assessment A concept threshold.
2. Collections/generics: independent typed solution, equality/hash reasoning, data-structure choice and complexity.
3. Lambdas/streams: independent transformation with predicted normal/empty/duplicate results and loop comparison.
4. I/O: UTF-8 round-trip plus empty/missing-file handling and resource explanation.
5. Algorithms: independent edge-case-tested attempt and defensible time/space reasoning.
6. Maven/JUnit: terminal build reports and a test that demonstrably detects broken behavior; explain mocking limits.
7. SQL: verified zero-match join/count plus parameterization/transaction explanation.
8. Spring Boot: explain and demonstrate request/DI/persistence/error flow in your own application.
9. Both original assessment results and any needed fresh retry linked, including unresolved gaps.
10. English explanation attempted; actual intake requirements/eligibility checked, or explicitly no suitable intake yet.

Close the readiness issue when criteria 1–9 have independent evidence and criterion 10 has an honest record. Mark missing intake eligibility separately from skill readiness. Close the repository milestone when its tracker closes; it contains only that tracker. Weekly issues keep their own existing milestones and scheduling history.

The tracker has **Estimate 0h**: it indexes evidence already produced in weekly backend tasks. It is not extra study time. Preserve completed checkboxes, closed issues, comments, existing milestone assignments and Project fields. If a completed task lacks a newly requested skill, use an upcoming repair/retry slot, link the old evidence, and record only the remaining gap; do not reset the completed task or create a full duplicate exercise.
