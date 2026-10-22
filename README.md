# Java Backend: 12-week learning framework

Build Java backend skills while keeping AGH semester 3 coursework on track. The long-term AI/ML direction stays active through a small, steady data-science track.

**Start here:** [Week 01](weeks/week-01.md). Read the [roadmap](ROADMAP.md) once, then work from the weekly checklist and [progress tracker](PROGRESS.md).

## What this repository contains

| File | Purpose |
| --- | --- |
| [ROADMAP.md](ROADMAP.md) | Scope, prerequisites, milestones, scheduling rules, and 12-week overview |
| [PROGRESS.md](PROGRESS.md) | Capacity, real AGH deadlines, evidence, blockers, and weekly decisions |
| [RESOURCES.md](RESOURCES.md) | Selected course sections and official references, with stopping rules |
| [weeks/week-01.md](weeks/week-01.md), [week-02.md](weeks/week-02.md) | Detailed daily tasks |
| [weeks/week-03.md](weeks/week-03.md) through [week-12.md](weeks/week-12.md) | Daily outlines; refine only the next week during review |
| [dashboard/](dashboard/README.md) | Interactive React dashboard: tasks, hours, checkpoints, course notes, and local JSON backups |
| [scripts/sync-roadmap.mjs](scripts/sync-roadmap.mjs) | Generates structured dashboard data and the Mermaid dependency diagram from the weekly Markdown |

The learning framework includes Markdown and a browser-local dashboard. The Study Task Tracker backend, Maven files, database scripts, containers, and exercise implementations are still work for you to create during the plan. The dashboard is a tool for learning; it is not a completed portfolio backend.

## Open the visual dashboard

[Open the private Learning OS dashboard](https://java-backend-learning-os.modestduck2.chatgpt.site), or run it locally below. Local and hosted URLs have separate browser storage; use JSON export/import to transfer progress.

Use Node.js 22.12+ from the 22 LTS line, or a supported newer LTS release, and npm:

```bash
cd /home/ivan-shevchuk/Projects/java-backend-roadmap/dashboard
npm ci
npm run dev
```

Open the localhost URL printed in the terminal. In another clone, enter its `dashboard/` directory instead. See the [dashboard guide](dashboard/README.md) for production builds, tests, data updates, and backup behavior.

Choose your current week, review “Next up”, and open a task for its completion criteria. Check it when done and log actual minutes separately. Use Plan settings to reserve AGH hours first. Export JSON regularly; import it to move progress between browsers or local/hosted URLs. Dashboard changes do not modify the Markdown tracker or sync through GitHub.

## Default week: 20 independent study hours

These hours are outside scheduled university classes. Required lab preparation and submissions use this budget first.

| Track | Share | Hours | Includes |
| --- | ---: | ---: | --- |
| B: Java/backend | 60% | 12 | Java, SQL, Spring Boot, tests, Git, project documentation, internship practice, weekly review |
| I: IBM Data Science | 20% | 4 | Current certificate unit and its practical lab |
| A: AGH preparation | 20% | 4 | Actual coursework; selected IBM Linux/Flask topics belong here |

Change weekly capacity in [PROGRESS.md](PROGRESS.md). AGH deadlines override the ratio. Never count one hour in two tracks, even when the topic overlaps.

Aim for at least **70% active work**: writing/debugging code, tests, SQL, lab work, retrieval practice, and demos. Cap passive videos/reading at roughly 30%. No need to finish every listed course in 12 weeks.

## Use this system every day

1. **Open the current week and PROGRESS.md.** Check deadlines within the next 7 days. Replace a planned task if a real lab needs the time.
2. **Choose one small result.** For example: “one test proves an unknown task returns 404.” Read its completion criteria before starting.
3. **Use a timer.** A 60-minute block can be 5 minutes recalling the last session, 10 minutes of targeted reading, 40 minutes doing the task, and 5 minutes recording evidence. Existing weekly estimates include these activities; do not add them on top.
4. **Attempt the work before asking for help.** After 20 focused minutes stuck, record the command, exact error, expected behavior, and what you tried. Ask for a hint or review of your attempt.
5. **Verify the result.** Run the relevant test, query, command, or lab check. Mark a checkbox only when its stated evidence exists. A watched video alone does not complete a coding task.
6. **Close the session.** Log actual minutes, evidence path/commit, blocker, and the very next action. Review changes before making a small Git commit when useful. Do not commit credentials or generated build files.

Day numbers mean study sessions, not fixed weekdays. Move sessions to fit your timetable. Day 7 has a one-hour review and leaves the rest of the day free.

## Weekly review: 60 minutes, already budgeted

Use the Day 7 checklist and the review template in PROGRESS.md. Demonstrate the week's checkpoint, compare planned versus actual hours, inspect upcoming AGH rubrics, and choose at most three outcomes for next week. Carry forward at most two essential unfinished tasks; drop or defer the rest explicitly.

- If less than 80% of core work is done for two weeks, reduce next week's scope by about 25%.
- If Java prerequisites are missing, use the bounded repair block in Week 02 before starting Spring.
- If an exam or submission needs more time, cut stretch features and course videos first, then reduce backend/IBM work. Do not create catch-up debt or remove sleep to preserve a ratio.

## How to ask your mentor for help

> I am on Week __, Day __, task __. Expected: __. Actual command/output: __. I tried __. Please give one hint or review my approach, without a complete solution.

For a weekly review, share the progress entry and links to your attempts/tests. Ask the mentor to adjust the next week around your current lectures and deadlines. Internship readiness is assessed through working evidence and explanations; the calendar alone does not establish it.
