# Java Backend: 12-week learning roadmap

**Markdown is the curriculum. GitHub Issues hold checklists and evidence. GitHub Projects is the interactive planner.** Focus on Java and AGH coursework with a tracker that needs no application maintenance.

Start with [Week 01](weeks/week-01.md), the [weekly issue index](TASKS.md), and the [Projects setup guide](GITHUB_PROJECTS.md).

## What to open

| Resource | Use |
| --- | --- |
| [ROADMAP.md](ROADMAP.md) | Full plan, prerequisites, checkpoints, and Mermaid dependencies |
| [weeks/](weeks/) | Detailed daily tasks for weeks 01–02 and daily outlines for weeks 03–12 |
| [TASKS.md](TASKS.md) | Links to 36 weekly issues, 12 weekly milestones, and the EPAM readiness tracker |
| [GitHub Issues](https://github.com/ivanshevchuk0/java-backend-roadmap/issues?q=is%3Aissue+is%3Aopen+label%3Alearning-plan) | Live checklists, evidence, blockers, and assignment details |
| [GITHUB_PROJECTS.md](GITHUB_PROJECTS.md) | Board, Table, Roadmap, fields, authorization, and rescheduling |
| [PROGRESS.md](PROGRESS.md) | Capacity and weekly review template |
| [EPAM_READINESS.md](EPAM_READINESS.md) | Official-source gap map, assessments, rubric and time substitutions |
| [RESOURCES.md](RESOURCES.md) | Selected materials, free alternatives, and stopping rules |

The repository is private. Set the Project to private too. The CLI can manage repository issues but currently lacks Projects permission, so Project creation, membership, fields, and saved views still need owner setup. Use the browser instructions without changing CLI access, or explicitly authorize the CLI yourself.

## Free and easy to maintain

GitHub Free includes Issues and Projects. This tracker uses labels, milestones, checklists, Project fields/views, and optional built-in workflows. No paid plan, hosted app, database, Actions job, marketplace app, or subscription is needed. [GitHub pricing](https://github.com/pricing) lists Issues & Projects in the Free plan.

The React dashboard, dependency/build files, hosting manifest, and data-sync script have been removed from the current tree. The previous version remains in Git history. See [migration notes](GITHUB_PROJECTS.md#migration-from-the-old-dashboard) for old browser progress and the separate hosted preview.

Course purchases are optional. If access requires payment, use the free official references in RESOURCES.md. Buying a certificate is not required.

## Default independent study budget

| Track / label | Share | Hours/week |
| --- | ---: | ---: |
| Java/Backend · `track:backend` | 60% | 12 |
| Data Science · `track:data` | 20% | 4 |
| AGH preparation · `track:agh` | 20% | 4 |

These 20 hours are outside scheduled classes. **Actual AGH assignments and deadlines override the ratio.** Reserve their time first, then split the remainder backend:data approximately 3:1. A 20h week with 10h AGH work leaves 7.5h backend and 2.5h data science.

Aim for at least 70% active practice. Courses support the work; completing every certificate is not a 12-week requirement.

## Every day

1. Open the Project’s **This week** Board and check real AGH deadlines first. Until setup is complete, use TASKS.md and the current milestone.
2. Choose one checklist item inside a weekly issue. Read its criteria and time box; keep one active coding task alongside necessary university work.
3. Set its issue to **In progress**, then attempt the exercise yourself. Read only what unblocks it.
4. Check the item after verifying the result. Add actual minutes, evidence, blocker, and next action to the issue. A checkmark does not log hours or prove a whole checkpoint.
5. Close the issue after its remaining work and evidence are complete. The native closed-issue workflow can set Status to Done. Do not update a second set of daily progress checkboxes in Markdown.

Use GitHub in a browser on Ubuntu, a phone, or another device. Progress lives on GitHub. Markdown remains the learning reference; execution changes belong in the live issue.

After 20 focused minutes stuck, ask for a hint with the command, exact error, expected result, and your attempt. Do not request complete exercise solutions by default.

## Weekly reset

Day 7 includes a 60-minute backend review. Demonstrate the checkpoint, check upcoming AGH briefs/deadlines, compare actual effort with capacity, and choose three next outcomes. Use PROGRESS.md’s template in one place: a weekly issue comment or a Markdown journal entry.

Reuse unfinished issues: change milestone/planned dates, reduce estimates to remaining effort, and preserve academic deadlines. Remove optional scope to make room. Carry at most two essential items. After two weeks below 80% core completion, reduce scope about 25%.

Spring starts around week 2 after G1; PostgreSQL follows in week 3. The evolving Study Task Tracker is still your Java portfolio exercise to implement. AGH Flask assignments stay in Flask and follow the lecturer’s tooling.

## EPAM preparation

Core Java/OOP precedes explicit collections/generics, lambdas, streams, I/O and algorithm practice in the existing Java hours. [EPAM Java Readiness](EPAM_READINESS.md) replaces Week 11 interview practice with two assessments and reserves the existing Week 12 mock hour for a retry. Update the [live readiness issue](https://github.com/ivanshevchuk0/java-backend-roadmap/issues/37) from evidence, without adding study hours. Existing progress and weekly issue schedules stay intact. The benchmark is ours; verify the actual EPAM intake's requirements before applying.
