# Week 09 — Deployment rehearsal, operations, and recovery

[Roadmap](../ROADMAP.md) · [Progress](../PROGRESS.md) · [Previous](week-08.md) · [Next](week-10.md)

**Outline budget:** B12 / I4 / A4 = 20h. Entry: G3. Core target is a local Ubuntu deployment rehearsal, with exact revision and evidence. Hosting is optional and must replace work within the budget, not add hours.

**Materials:** chosen Spring/Compose runtime and PostgreSQL backup/restore documentation. If hosting replaces a local block, consult the provider's current official deployment, configuration, and cost documentation at that time.

| Day / total | Tasks, time boxes, and completion criteria |
| --- | --- |
| 1 / 3h | **B 120m:** write a short deployment checklist and select a known tested app revision. **Done:** exact version, build/start command, DB migration/configuration needs, local access URL, and success checks recorded. **A 60m:** current filesystems lecture/lab. **Done:** explain path/inode/permission concepts as taught and run one rubric-derived inspection. |
| 2 / 3h | **B 120m:** deploy locally from the packaged/containerized build in a fresh environment. Optional: substitute a hosted setup only if G3 and safe access are ready. **Done:** running revision, health/readiness result, and create/read/status smoke evidence recorded; hosting limitations/cost verified if applicable. **I 60m:** current unit or evaluation concepts if ready. **Done:** explain one suitable metric or complete a current lab segment. |
| 3 / 3h | **B 120m:** inspect logs, configuration, and restart behavior. **Done:** find one request/startup event in logs, diagnose a deliberately incorrect local DB setting, restore it, and show data survives restart. **A 60m:** timed current Java exercise. **Done:** runnable attempt, observed errors, and two targeted corrections recorded. |
| 4 / 3h | **B 120m:** back up synthetic app data and restore into a disposable database. **Done:** restored row counts and one API read match expected data; exact backup/restore procedure and version compatibility noted. **I 60m:** current certificate lab. **Done:** reproducible intermediate output plus next step, without skipping prerequisites. |
| 5 / 3h | **B 120m:** draft a one-page CV (60m) and solve a SQL interview problem (60m). **Done:** CV describes only demonstrated features with evidence; SQL attempt has expected results and a correction note. **A 60m:** actual Flask deployment assignment, if due, or local production-serving preparation. **Done:** rubric-derived deployment evidence; a local development server alone is not labeled a completed cloud assignment. |
| 6 / 4h | **B 60m:** rehearse returning to a previous compatible app revision using a copied/disposable environment. **Done:** record revision and smoke result; explain why database migrations may limit rollback. **I 120m:** continue the appropriate certificate lab. **Done:** rerunnable output and three observations with assessment status logged. **A 60m:** current database recovery/transaction or urgent lab work. **Done:** one explained recovery scenario or two required checks. |
| 7 / 1h | **B 60m:** deployment/recovery demo (20m), explain configuration and migration risks (20m), review/replan (20m). **Done:** local vs hosted outcome labeled accurately and next scope reflects AGH deadlines. |

**Checkpoint:** the tested revision can be deployed, observed, restarted, and recovered with recorded evidence. A hosted URL is optional.

**Adjustment:** skip hosting if provider setup or access protection consumes the budget. Keep synthetic data and local access until public write access is appropriately protected. Do AGH-required Flask/cloud work in its own required stack.
