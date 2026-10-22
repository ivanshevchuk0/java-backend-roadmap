# Week 01 — Java foundation and a small tested model

[Overview](../README.md) · [Progress](../PROGRESS.md) · [Resources](../RESOURCES.md) · [Next week](week-02.md)

**Live progress:** [Week 01 GitHub issues](../TASKS.md#week-01). Use issues for checklist updates; this file remains the curriculum.

**Budget:** B 12h / I 4h / A 4h = 20h. This is a future task checklist, not generated application code. Day numbers are movable sessions. Every task's estimate includes its short evidence log. Check real deadlines first and replace A tasks when needed.

**Outcome:** explain your model, manipulate tasks in a collection, handle invalid/missing data, and run at least four meaningful JUnit tests. This is enough to attempt Spring in Week 02; advanced Java topics can follow later.

**Entry:** basic Java syntax and terminal familiarity. No course completion required. Use existing AGH exercises for diagnostics rather than starting from zero.

**Materials cap:** about 2h of passive Java/course/reference material across the 12 B hours. Read only relevant Amazon Java/Dev.java/Maven/JUnit sections. All explanations must lead to an attempted exercise.

## Day 1 — Establish a baseline, 3h

- [ ] **B · 30m: tool and Git check.** Check `java --version`, `javac --version`, `mvn --version`, `git --version`; open the intended work folder in VS Code and confirm Java support. Decide where future exercise/app code will live. **Done:** versions and paths recorded in PROGRESS; compile/run a tiny class from the terminal, or record the exact blocker and next fix. Do not install every later tool today.
- [ ] **B · 60m: Java diagnostic.** Spend at most 15m reviewing a current example, then independently trace constructor/static/instance execution and write a small object-based exercise. Use your current Client or sports-store work as context. **Done:** one runnable attempt and five answered questions: class vs object, when a constructor runs, object field vs local variable, static vs instance, and method argument vs return value. Record uncertain answers for repair.
- [ ] **B · 30m: define the project slice.** Write a short domain note for StudyTask: title, status, optional due date, and identifier; define create/find/change-status behavior. **Done:** three operations and four acceptance cases written in your own words, including blank title and missing ID. No framework or database yet.
- [ ] **A · 30m: inspect current AGH briefs.** Check the four subjects' actual current exercises and deadlines. **Done:** all four rows in the deadline board have a source and next action; unresolved dates are explicitly unknown with a follow-up action.
- [ ] **A · 30m: OS baseline.** Review one current Bash exercise. In a disposable directory, independently demonstrate quoting a filename with spaces, one pipeline, and permission inspection. **Done:** three command/output examples plus one explanation of quoting. Avoid practicing destructive commands on real coursework.

## Day 2 — Objects and rules, 3h

- [ ] **B · 20m: targeted OOP reading.** Read only the constructor/encapsulation material exposed by Day 1. **Done:** explain constructor vs normal method and private state in three sentences without notes.
- [ ] **B · 100m: implement the domain exercise yourself.** Create a StudyTask class and status enum; use a constructor and methods to express the chosen rules. Keep input/output separate from the model. **Done:** a small runner creates two independent tasks, changes one status, and shows that the other object's state is unchanged; sources compile. Record one design question instead of adding a framework.
- [ ] **I · 60m: IBM starting point.** Open your actual enrolled certificate progress and complete one suitably small segment/lab, or continue the current lab. **Done:** course/unit name, completed assessment or executable artifact, and one next step logged. If new, create/run a notebook with three Python expressions/functions and explain the outputs.

## Day 3 — Collections and a repository boundary, 3h

- [ ] **B · 20m: collections/interface lookup.** Review typed lists/maps and a small Java interface. **Done:** explain why a lookup operation may be absent and which collection you will use.
- [ ] **B · 100m: in-memory storage.** Define a small repository interface and an in-memory implementation; create/list/find tasks through it. Keep it single-threaded and simple. **Done:** store three tasks, retrieve an existing ID, handle a missing ID deliberately, and explain the interface's role. Show the operations in a runnable exercise. Full generic abstractions are unnecessary.
- [ ] **A · 60m: current Java lab.** Check the actual rubric. If the October 20 sports-store task remains relevant, independently verify Scanner input and discount boundaries; otherwise work on the latest task. **Done:** compile/run evidence, at least three rubric-derived checks, and a precise remaining-work list. Preserve its required console behavior and submission file rules.

## Day 4 — First automated tests, 3h

- [ ] **B · 20m: Maven/JUnit essentials.** Look up standard source/test layout, a dependency, and assertions. **Done:** explain what the Maven test phase does and where a test belongs.
- [ ] **B · 100m: package the small exercise and test it.** Create a minimal Maven exercise when you reach this task; add JUnit Jupiter compatible with your JDK. This is still learner-created work, not an entire backend scaffold. **Done:** terminal test run passes at least three scenarios: valid creation, changing one object's state independently, and repository lookup. Intentionally break one behavior to see a test fail, then restore it. Save the command/report summary. Carry these classes into the later app instead of restarting from another tutorial.
- [ ] **I · 60m: Python practice.** Continue the current certificate unit; if reviewing basics, practice functions, lists/dictionaries, and a simple transformation. **Done:** one rerunnable notebook/script or a finished provider lab; explain one input/output and one error you corrected.

## Day 5 — Exceptions and a service, 3h

- [ ] **B · 20m: exceptions and validation.** Read only what is needed for blank titles and missing tasks. **Done:** describe which layer decides validity and what the caller sees when an operation fails.
- [ ] **B · 70m: create a small service.** Move create/find/change-status use cases behind a service using constructor-supplied repository dependency. **Done:** a runner calls the service rather than manipulating storage directly; both valid and missing-ID paths are deliberate. Explain dependency injection here as passing a dependency through the constructor.
- [ ] **B · 30m: negative tests.** Add at least one invalid-title test and one missing-ID test; avoid catch-all exception handling. **Done:** both fail if their behavior is removed and pass normally; total suite has at least four meaningful tests. Record any unfinished rule as a blocker.
- [ ] **A · 60m: current web lab.** Verify current HTML/CSS rubric; use lab02's noted TODOs only if still relevant. **Done:** evidence for one layout check at wide/narrow widths, one form validation case, and asset loading; record remaining rubric items. Do not assume an existing “published” note proves today's behavior or submission.

## Day 6 — SQL preview and data practice, 4h

- [ ] **B · 20m: SQL and HTTP preview.** Read a brief explanation of primary/foreign keys and GET vs POST. **Done:** explain a task identifier, a future course reference, and the different purpose of the two HTTP methods.
- [ ] **B · 40m: relational exercise.** Sketch Course → StudyTask and write three proposed queries: list tasks, filter by status, count tasks per course. Execute in an existing suitable SQL environment if available; otherwise mark results as predictions to run in Week 02. **Done:** diagram, three query attempts, predicted results for a tiny dataset, and a clear “executed” or “not yet executed” label. No database setup rabbit hole today.
- [ ] **I · 120m: certificate lab.** Spend up to 30m on required explanation and the rest implementing its lab. If choosing a review exercise, load a tiny CSV with Python, validate rows, and summarize one field. **Done:** notebook/script reruns and produces one explained result; log incomplete assessments honestly. This does not imply finishing a whole course unit in two hours.
- [ ] **A · 60m: current database lab.** Use the assigned tool. If Countries/Cities is still current, independently explain PK/FK, reproduce one filter and one INNER/LEFT JOIN comparison, then check submission requirements. **Done:** two query results or design-view evidence, explanation of unmatched rows, and actual submission status recorded. Do not replace a required Base artifact with a PostgreSQL exercise.

## Day 7 — Checkpoint and adaptation, 1h

- [ ] **B · 20m: demo.** From the terminal, create/list/find/change a task and run tests. **Done:** commands and results logged; name one behavior proved by a negative test.
- [ ] **B · 20m: G1 assessment.** Without copying, explain a constructor, interface, typed collection, missing/invalid input handling, Maven dependency, and GET vs POST. **Done:** G1 marked passed only if those explanations and at least four passing meaningful tests exist. Mark precise gaps otherwise.
- [ ] **B · 20m: review and Week 02 setup.** Fill the weekly template, check deadlines for the next 14 days, and select next week's three outcomes. **Done:** revised B/I/A hours, at most two carryovers, and the first action for Day 1 recorded. G1 gaps use the bounded repair path in ROADMAP; unfinished SQL preview can be deferred.

## Exit evidence

- [ ] Small Java domain/service/repository exercise runs and at least four tests pass.
- [ ] You can trace your own object construction and explain the interface boundary.
- [ ] AGH board reflects real briefs, with unknowns and submission states visible.
- [ ] IBM starting unit and this week's lab evidence are logged.
- [ ] Week 02 scope fits actual available hours; Spring entry follows G1 evidence.

**If short on time:** defer SQL preview and extra refactoring first. Keep current AGH submissions, Java rules/tests, and the review. **If ahead:** add one boundary test or explain a failed attempt; do not start another course.
