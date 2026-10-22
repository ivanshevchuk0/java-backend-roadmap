# One Project, three views

[Home / current tasks](README.md) · [All weeks](ROADMAP.md#all-weeks)

**Working now:** README → existing weekly issues → live checkboxes/comments. **Project setup is pending.** On 2026-10-22 the CLI reported `missing required scopes [read:project]`, and no connected browser was available. An existing Project may exist, but this session cannot inspect, configure or verify it. No Project URL or completed setup is claimed.

## Authorization

Choose **one** route; no paid plan or external service is needed.

- **Browser:** sign in to GitHub as `ivanshevchuk0`, open [your Projects](https://github.com/users/ivanshevchuk0/projects), and use your existing learning Project if present. The owner account must authorize creation/settings, item membership, fields, saved views and private visibility through the signed-in UI. Follow the setup below; no new CLI permission is required.
- **Let the assistant configure it later:** run `gh auth refresh --hostname github.com --scopes project` yourself and complete GitHub's authorization, then report that it finished. Read-only `read:project` is insufficient for edits. Never share a token. Project edits require the `project` scope; [CLI authorization reference](https://cli.github.com/manual/gh_auth_refresh). This command has not been run automatically. Saved-view setup may still require the browser if the available API cannot configure it.

Until that is done, [This Week issue list](https://github.com/ivanshevchuk0/java-backend-roadmap/issues?q=is%3Aissue+milestone%3A%22Week+01%22) and the three homepage task links are usable from any signed-in device.

## One-time setup in GitHub

1. Open the existing learning Project. **Create a private Project only if none exists**, named `Java Backend Learning`. Link it from this repository's Projects tab. Do not create a second Project or duplicate draft tasks.
2. Add missing items from `ivanshevchuk0/java-backend-roadmap`, filter `is:issue label:learning-plan`. Keep all 37 existing issues, including completed ones. Weekly cards represent one track/week; their daily checklists are the actionable tasks. No issue splitting, deletion, or bulk closing is needed.
3. Configure Status as exactly **To Do → In Progress → Done**. Keep Done values and history. Rename existing matching options rather than recreating them. Map Ready/Backlog to To Do, keep ongoing items In Progress, and copy a Blocked reason into its issue before moving it to To Do. Only remove old status options after their items are safely mapped. Never set every open issue to To Do: some may already be in progress.
4. Reuse the existing fields below; add only missing fields. Preserve all existing remaining estimates, priorities and dates. For untouched weekly cards, initial estimates are Java **12h**, IBM **4h**, AGH **4h**; readiness #37 is **0h**. An open issue is not proof it is unstarted.
5. Save the three views below in the **same Project**. Make This Week the first tab and bookmark its actual URL. Replace README's `Board: setup pending` sentence with that verified link only after the view works.

| Field | Purpose |
| --- | --- |
| Status | To Do, In Progress, Done; only three columns |
| Labels, Milestone | Existing track labels and scheduled week; no extra Week or Track field |
| Priority | Existing P0/P1/P2, with real AGH submissions first |
| Estimate | Remaining hours, not original total or inferred time spent |
| Start date / Target date | Flexible schedule for timeline bars |
| Deadline | Real academic/intake date, only after checking its source |

## Saved views

| View | Layout and exact initial filter | Settings |
| --- | --- | --- |
| **This Week** | Board · `repo:ivanshevchuk0/java-backend-roadmap milestone:"Week 01"` | Columns = Status. Order To Do, In Progress, Done. Sort P0 first, then Deadline ascending. Show Labels, Estimate, Deadline. Keep Done visible. Save changes. |
| **Timeline** | Roadmap · `repo:ivanshevchuk0/java-backend-roadmap` | Start date → Target date; group by Milestone; quarter zoom. No current-week or open-only filter: future and completed items remain accessible. |
| **AGH Deadlines** | Table · `repo:ivanshevchuk0/java-backend-roadmap label:"track:agh" is:open` | Show Deadline, Title, Milestone, Priority, Estimate, Status; sort Deadline ascending. Inspect undated items too; unknown is not safe. |

Choose your real plan start before dating the timeline. Set each week's Start/Target dates from that start; leave unknown weeks undated instead of inventing deadlines. **Undated items have no timeline bar.** Check this explicitly before calling the timeline ready. Real deadlines remain separate from these planning dates.

The current filter initially shows Week 01's three issues; update it at the weekly reset. In Week 11, include readiness with `milestone:"Week 11","EPAM Java Readiness"` (same-field alternatives). Only its evidence index is 0h; assessment effort stays in #31 and the bounded retry in #34.

Official UI references: [filters](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects), [board columns](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout), [timeline dates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout).

## Daily updates

Open README → urgent AGH work or the first unchecked item in the active issue. The first unfinished day is expanded initially; expand the next day as you progress. Every unfinished task links material, states the exercise under **Work**, and gives **Done when** criteria.

Set the weekly card In Progress when you start. Check a task only after verifying it; add `minutes · evidence · next action` in an issue comment. Resume an unfinished item before another tutorial. A day is a movable study session, not an automatic calendar deadline.

Close an issue when its remaining tasks and evidence are complete. The native closed-issue workflow can set Status to Done; dragging a card to Done alone does not close the issue. Keep elapsed hours in comments, not another tracker or a new custom field.

## Weekly reset

Use the existing Day 7 review time. Post one short comment in the backend issue:

```text
Planned / actual B-I-A hours:
Checkpoint and EPAM evidence (pass / partial / gaps):
AGH briefs, verified deadlines in the next 14 days, submission state:
IBM unit / artifact / next step:
At most two essential carryovers, remaining hours, next action:
Optional scope cut; next capacity and three outcomes:
```

1. Reserve mandatory AGH time first. Default **20h = Java12 / IBM4 / AGH4**. For 10h AGH, use Java7.5 / IBM2.5 / AGH10. Flask and other university tooling stay as assigned.
2. Keep the same unfinished issue, checkboxes and comments. Update its scheduled Milestone, remaining Estimate and flexible dates. Preserve real Deadline and original curriculum week. Reduce scope elsewhere: a carryover does not fit on top of a full week.
3. Update README's current week, focus and three issue links using [All weeks](ROADMAP.md#all-weeks). Edit the This Week view's milestone filter once; no daily Markdown edits are needed. Include carryovers assigned to that week. If an active carryover replaces a track's normal package, point that homepage row at the carryover and move the displaced package forward.
4. Record current AGH source/rubric, due time/time zone, required stack, checks and submission receipt in the existing AGH issue. If deadlines differ, list each in its brief table; use the earliest unresolved deadline on the Project card. Do not create extra issues just to reorganize preparation.

Changing a planned date never extends a university deadline. After two weak weeks reduce optional scope about 25%, rather than add hours or more courses. EPAM readiness stays open until independent evidence meets [its rubric](EPAM_READINESS.md); a finished calendar week does not establish readiness.

## Setup acceptance check

Verify while signed in before replacing the pending notice:

- This Week shows only the scheduled current week, with three status columns and visible completion.
- A checked issue item remains checked after refresh and on another device; no progress is copied into README.
- Timeline shows dated items across the full plan; unknown dates are explicitly undated.
- AGH Deadlines includes real submissions and undated work; due dates match briefs.
- Move one unfinished item to a later week: its evidence/completed boxes remain, and the This Week filter follows the milestone.
- The repository and Project remain private; only existing issues are used.

GitHub Free includes Issues and Projects: [plan details](https://github.com/pricing). These views need no Actions job, subscription, hosting, server, marketplace app or generated dashboard.

<details>
<summary>Earlier dashboard history</summary>

The old React dashboard is retained only in Git history (`0ddbc0b`). If you still have browser-only progress, export it before clearing browser data and transfer evidence into the existing issues. It was not imported automatically. A separate old Sites preview was not removed by deleting its source; it is unused by this workflow and can be managed from its owner's Sites Library. No replacement deployment is required.

</details>
