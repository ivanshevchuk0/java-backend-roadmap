# GitHub Projects setup and workflow

Markdown curriculum → issue checklists → one private Project. No application runtime, deployment, or ongoing automation code.

## Ready versus still to configure

[TASKS.md](TASKS.md) links to 36 weekly issues, one per week per track, with all 190 original task checklists and completion criteria. Twelve repository milestones, Week 01–Week 12, represent scheduled weeks. Dates remain unset until you choose a start and verify actual deadlines.

Labels: `track:backend` green, `track:data` purple, `track:agh` amber, `learning-plan` for tracker issues, and `assignment` for real submissions.

**The Project, its fields, issue membership, and saved views have not been configured by the assistant.** The current CLI token lacks Projects access. Repository permissions are separate. The browser route below completes setup without granting the CLI additional access.

## Free features

GitHub Free includes Issues & Projects. Board/Table/Roadmap, Project custom fields, labels, milestones, and issue checklists form this workflow. No paid add-on, subscription, Actions job, Pages hosting, or external integration is needed. The optional auto-add workflow is limited to **one** on GitHub Free; this single-repository tracker needs at most one. [Pricing](https://github.com/pricing), [Projects overview](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects), [auto-add limits](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically).

## 1. Create a private Project

1. Sign in as `ivanshevchuk0`. Open [your Projects](https://github.com/users/ivanshevchuk0/projects) → **New project**.
2. Choose **Table**, your personal account as owner, and name it **Java Backend — 12-week learning plan**.
3. If offered **Import items from repository**, select `ivanshevchuk0/java-backend-roadmap`. Otherwise use **Add item from repository**, select this repository, filter `is:issue label:learning-plan`, select all matching issues, and add them. Include all pages; verify 36 initial items.
4. In Project **Settings**, verify **Visibility: Private**. Repository and Project visibility are separate.
5. Link it from the repository’s Projects tab if needed. Bookmark its actual URL and add it to README. No Project number is assumed here.

Use existing issues rather than duplicate draft cards. [Create a Project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project), [add issues](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/adding-items-to-your-project).

## 2. Small field set

Show built-in **Title**, **Labels**, **Milestone**, and **Status**. Labels supply the track; Milestone supplies the scheduled week. Avoid duplicate Track/Week fields.

| Field | Type | Meaning |
| --- | --- | --- |
| Status | Existing single select | Backlog, Ready, In progress, Blocked, Done |
| Priority | Single select | P0 = university work/deadlines first; P1 = core; P2 = optional |
| Estimate | Number, hours | Remaining effort; initially backend 12, data 4, AGH 4 per issue |
| Start date | Date | Flexible planned start |
| Target date | Date | Flexible planned finish; Roadmap bar end |
| Deadline | Date | Verified academic/submission deadline; blank when unknown |

Optional: add **Actual hours**, Number, only if short time logs in issue comments are insufficient. Never infer actual time from completion.

Use **+ / New field** in Table and edit single-select options in settings. Rename default Todo to Ready and add Backlog/Blocked. These are **Project custom fields**, not organization-wide issue fields. [Single-select fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-single-select-fields).

Initialize in batches:

1. Filter `label:"track:backend"`: Estimate 12, Priority P1.
2. Filter `label:"track:data"`: Estimate 4, Priority P1.
3. Filter `label:"track:agh"`: Estimate 4, Priority P0. Actual due assignments outrank generic preparation.
4. Set all Status values to Backlog. When beginning, filter `milestone:"Week 01"` and set those three issues to Ready.
5. Set planned dates for the current/next week first. Future weeks can stay undated; real deadlines always come from briefs.

For bulk edits, configure one cell, copy it, select matching cells in the same column with Ctrl-click/Shift-selection, and paste. GitHub offers undo for bulk changes. [Bulk editing](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/editing-items-in-your-project).

## 3. Save three views

Choose **New view**, a layout, configure it, then **Save changes**. All views share the same issues.

| View | Configuration | Purpose |
| --- | --- | --- |
| This week | **Board**, grouped by Status; filter `repo:ivanshevchuk0/java-backend-roadmap milestone:"Week 01"`; sort Priority P0 first, then Deadline ascending; show Labels, Estimate, Deadline | Daily work. Update the saved milestone filter at the weekly reset; keep Done visible for the week. |
| All tasks | **Table**, grouped by Milestone; show Title, Labels, Status, Priority, Estimate, Start date, Target date, Deadline; sort Priority then Deadline | Edit scope and schedules in place. |
| 12-week plan | **Roadmap**, Start date → Target date; grouped by Milestone; show Labels/Priority; choose a suitable zoom | See scheduling pressure. Undated items need dates before bars appear. |

Enable **View → Field sum → Estimate** in Table for remaining hours per milestone. Filter a track label to check that track’s budget. GitHub cannot group table rows by labels; Milestone grouping plus label filtering avoids another field. [Tables and sums](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-table-layout), [Roadmap dates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout).

Useful filters:

```text
# Replace Week 01 during the weekly reset
milestone:"Week 01" -status:Backlog -status:Done

# Open university work across all weeks
label:"track:agh" is:open

# Real assignments missing verified deadlines
label:"track:agh" label:assignment is:open no:Deadline

# Replace the placeholder with the end date of your next seven days
label:"track:agh" is:open Deadline:<=YYYY-MM-DD
```

Inspect undated assignments too; blank Deadline does not mean low priority. [Filter syntax](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects).

## 4. Minimal automation

Keep the default workflow setting Status to Done when an issue closes. Use **Close issue** after meeting criteria; dragging to Done alone does not close an issue. Reopen and set Ready/In progress if evidence is invalid.

Optionally enable **one** auto-add workflow for this repository using `is:issue label:learning-plan`. Reuse any workflow created during import. Auto-add does not backfill existing items, so add the initial 36 if not imported. These are native Project workflows, not Actions jobs. [Built-in workflows](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations), [auto-add behavior](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically).

## AGH assignments and capacity

Weekly AGH issues are preparation packages. Use the **AGH assignment** issue template for each real assignment with a distinct deadline. Record exercise, authoritative rubric, required tools, due time/time zone, submission format, and receipt. Add it to the Project, set P0, and schedule it first.

Move replaced hours out of preparation estimates: a 2h lab plus 2h remaining preparation is 4h, not 6h. If mandatory work needs 10h, reserve 10h and shrink other tracks. Count each learning block once.

Deadline is the real academic date; Target date is your flexible plan. Dragging a Roadmap bar does not grant an extension. Flask/Base/OS tooling stays as assigned. Check submission receipts.

## Reschedule unfinished work

1. Keep the same issue open with completed checkboxes and evidence intact.
2. Note remaining work, reason, next action, and hours.
3. Change **Milestone** to the next scheduled week. The `[Plan W01]` title/body retain the original curriculum reference; they are not a due date.
4. Update **Estimate** to remaining effort and **Start date/Target date** to the new plan. Preserve a real **Deadline**.
5. Move optional work to Backlog or cut scope to make room. A 2h carryover does not fit on top of a full 12h backend week automatically.
6. Set Ready, or Blocked with a next experiment. Keep at most two essential carryovers; demonstrate backend prerequisites before expanding scope.

Close for completed work or an explicit scope change with linked follow-up work. Use “not planned” for deliberately dropped optional work, not “completed.” Milestone percentages count issues, not hours/mastery; assess progress with estimates, evidence, and prerequisite gates.

## Optional CLI authorization

The current CLI reported `missing required scopes [read:project]`. Read scope only permits viewing; editing/creation needs `project`. Browser setup above needs no CLI token change.

If you choose CLI access, run this yourself and complete GitHub’s confirmation:

```bash
gh auth refresh --hostname github.com --scopes project
gh project list --owner ivanshevchuk0
```

Never paste tokens into chat. If a token is separately managed, update its permissions through GitHub settings or use the browser route. Broader scope has not been requested automatically. [CLI scope requirements](https://cli.github.com/manual/gh_project), [auth refresh](https://cli.github.com/manual/gh_auth_refresh).

## Migration from the old dashboard

React source, lockfile, tests, generated JSON, hosting manifest, and data-sync script are removed from the current tree. Commit `0ddbc0b` retains the earlier implementation. Daily progress now belongs in GitHub.

If you recorded browser progress, export its JSON before clearing that browser’s data, then transfer completed items/evidence to matching issues. Browser progress was not read or automatically imported.

The old private hosted preview is a separate existing resource; removing code does not unpublish it. The available Sites connector has no delete/unpublish operation, so it has **not** been deleted. To remove it, open your Sites Library and the owner management controls for **Learning OS — Java Backend Roadmap**, after saving needed progress. It is no longer linked as the learning interface; this workflow does not depend on it. No replacement deployment was made.
