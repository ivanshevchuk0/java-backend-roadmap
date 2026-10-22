# Selected resources and stopping rules

Use this as a lookup table, not a reading backlog. Choose the smallest section that unblocks today's task, then close it and produce the listed evidence. Public course pages and core reference pages were checked on **2026-10-22**. Your enrolled syllabus, access terms, and current unit still need checking; module order and versions can change.

## EPAM alignment references — no additional course

[EPAM Java roadmap](https://campus.epam.com/en/skills-roadmap/Java) was checked on 2026-10-22, including its public curriculum data loaded by the page. Use it as a skills reference, not a requirement to finish every specialization. [EPAM_READINESS.md](EPAM_READINESS.md) maps selected gaps to the same 12-week budget and distinguishes our practice rubric from official intake rules. Examples: [Hungary Fundamentals](https://campus.epam.com/en/training/6040), [Uzbekistan Java Web Development](https://campus.epam.com/en/training/5966); both currently show registration closed and have location-specific rules. Check your actual intake before applying.

For W03–06 use the matching collections/generics/lambda/stream/I/O sections of [Dev.java](https://dev.java/learn/), then close the reference and attempt the week's fixture. Reuse the existing Amazon course if it addresses a gap; do not enroll in another complete course. Arrays/maps and their official Java API descriptions are enough for the planned small algorithm exercises; no extra algorithm platform subscription is needed.

## Course selection

The time boxes below are this plan's allocation for selected material, not provider estimates or promises of full course completion. All reading, videos, quizzes, and labs consume the track's existing hours.

| Course | When / track | Use for | Stop or skip when |
| --- | --- | --- | --- |
| [Amazon: Programming with Java](https://www.coursera.org/learn/programming-with-java) | W01, then targeted gaps / B | Methods, classes/objects, collections, exceptions; limit passive material to about 2h in W01 | You can demonstrate G1; do not wait for every module before Spring |
| [Amazon: Database Management with Java and SQL](https://www.coursera.org/learn/database-management-with-java-and-sql) | W01 SQL preview, W02–03 SQL/JDBC, later transactions / B | Relational model, keys, joins, prepared JDBC statements; initially budget about 2–3h of selected explanations across W01–03 | You can run/explain the needed query and parameterized operation; avoid a separate full JDBC app |
| [Amazon: Full Stack Web Development](https://www.coursera.org/learn/fullstack-web-development) | Start W02 / B | HTTP, Spring/Boot, web APIs, selected persistence/deployment sections; about 1h passive material in W02, then as needed | One small application feature works and is tested; unrelated frontend/cloud modules can wait |
| [IBM Data Science Professional Certificate](https://www.coursera.org/professional-certificates/ibm-data-science) | W01–12 / I, 4h/week by default | Continue current enrolled unit; Python, notebooks, pandas, SQL, analysis, evaluation as prerequisites allow | Weekly time box ends; record exact next lab. Do not promise the whole certificate within 48h |
| [IBM: Hands-on Introduction to Linux Commands and Shell Scripting](https://www.coursera.org/learn/hands-on-introduction-to-linux-commands-and-shell-scripting) | Selected W01–02 material, later as assigned / A | Quoting, pipes/redirection, variables, arguments, permissions, small scripts | You can explain and independently adapt the current AGH exercise; skip repeated beginner videos |
| [IBM: Developing AI Applications with Python and Flask](https://www.coursera.org/learn/python-project-for-ai-application-development) | W03 onward, or earlier if AGH requires / A | Python modules, tests, Flask routes, requests/errors, required deployment | Current Flask rubric is met; skip Watson/AI-specific additions unless assigned |
| [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course/) | Normally after W12 / future I | ML foundations once Python/data/math prerequisites are ready | Use [prerequisites](https://developers.google.com/machine-learning/crash-course/prereqs-and-prework) first; defer if AGH or backend foundations need the time |

The course pages support the subjects listed; the schedule and project mapping are mentoring choices. Preserve provider-required assessments if earning a credential. No paid purchase or full-course enrollment is required merely to follow this framework.

## Official references: open only for a current task

| Need | Reference | Practical use / stopping point |
| --- | --- | --- |
| Java language/OOP/collections/generics/lambdas/streams/I/O | [Dev.java learning](https://dev.java/learn/) | Read one matching topic; explain it using your own class and run an example |
| Git basics and branching | [Pro Git](https://git-scm.com/book/en/v2) | Stage/review/commit one change, then later practice a small branch/merge |
| Maven layout, dependencies, lifecycle | [Maven getting started](https://maven.apache.org/guides/getting-started/) | Explain `pom.xml`, dependency, test phase, and wrapper command |
| Tests and assertions | [JUnit documentation](https://docs.junit.org/current/user-guide/) | Use Jupiter tests/assertions matching your dependency version; no manual major-version upgrade just to follow latest docs |
| Repository isolation | [Mockito API](https://javadoc.io/doc/org.mockito/mockito-core/latest/org.mockito/org/mockito/Mockito.html) | W05: one service behavior with a mocked dependency; keep domain objects real |
| Boot setup/version compatibility | [Spring requirements](https://docs.spring.io/spring-boot/system-requirements.html), [Spring Initializr](https://start.spring.io/) | W02: record compatible stable versions and generate only the small project you need at that time |
| First HTTP endpoint | [Spring REST guide](https://spring.io/guides/gs/rest-service/) | W02: one endpoint, then adapt it to StudyTask and explain the request path |
| Persistence | [Spring JPA guide](https://spring.io/guides/gs/accessing-data-jpa/) | W03: learn mapping/repository ideas; configure actual PostgreSQL for this project rather than treating a guide's sample DB as equivalent |
| HTTP tests | [Spring web testing guide](https://spring.io/guides/gs/testing-web/), [Boot testing reference](https://docs.spring.io/spring-boot/reference/testing/index.html) | W02 onward: success/error HTTP assertions; select documentation for your Boot version |
| SQL and PostgreSQL | [PostgreSQL tutorial](https://www.postgresql.org/docs/current/tutorial.html) | Keys, joins, aggregation, transactions; run queries and predict results before executing |
| Shell/process questions | Ubuntu `man bash`, `man ps`, `man kill`, `man chmod`, `man 2 fork` where installed | Explain the flag/system call required by the current lab; IBM shell material does not cover the entire OS syllabus |
| HTML/CSS/JS | [MDN web development](https://developer.mozilla.org/en-US/docs/Learn_web_development) | Use forms, layout, responsive CSS, DOM/events/fetch as assigned; stop when the lab behavior is verified |
| Flask | [Flask tutorial](https://flask.palletsprojects.com/en/stable/tutorial/) | Routing/templates, testing, deployment concepts; follow AGH tooling and submission rules |
| Docker Compose | [Docker Compose quickstart](https://docs.docker.com/compose/gettingstarted/) | W07: service networking, named volume, startup readiness; adapt concepts to Java rather than starting a new sample portfolio app |

For Flyway, CI provider setup, Spring security configuration, and a hosting provider, select the official documentation **when the relevant week arrives**, record the chosen version/provider, and consult only the section required by the task. Do not add another course for these topics.

## AGH source precedence

Use current exercise instructions, lecture slides, grading rubric, and lecturer announcements first. Fill their URLs/paths into PROGRESS.md. The topic mapping in ROADMAP.md is provisional and must move with the course schedule. Local coursework notes help identify what to review but are not authoritative proof of submission or grading.

## Avoid redundant work

- Java syntax already demonstrated → use a 10-minute diagnostic instead of another full introduction.
- SQL covered in AGH and Amazon → reuse the concept, predict one query result, and do any certificate-required assessment; do not count the time twice.
- Python/Git covered in IBM → test yourself, skip optional repetition, and keep required graded work.
- Flask requested by AGH → implement in Flask. A working Spring endpoint is useful prior knowledge, not a substitute submission.
- After two explanations of the same issue, stop collecting resources. Write a tiny experiment or request a hint with your error output.
- Notes should contain commands, decisions, mistakes, and evidence. Avoid transcribing whole lectures or copying completed tutorial repositories.

## Free route and tracker resources

The tracker uses only GitHub Free. Course links above are optional learning sources, not required purchases. Coursera certificate access or graded assessments may require payment; this plan does not promise free credentials. If access is paid, skip the purchase and practice the same topic using the official references below.

| Topic | Free reference | Practical evidence |
| --- | --- | --- |
| Java, Spring, SQL, Git, testing, Docker | Official references already listed above | Independently run the week's exercise and relevant checks |
| Python fundamentals | [Python tutorial](https://docs.python.org/3/tutorial/) | A runnable script/notebook with explained inputs and outputs |
| Tabular data and analysis | [pandas getting started](https://pandas.pydata.org/docs/getting_started/index.html) | Load, filter, summarize, and check a small dataset |
| Arrays and numerical basics | [NumPy beginner guide](https://numpy.org/doc/stable/user/absolute_beginners.html) | Explain and run one array operation appropriate to your current level |
| Linux/Bash | Ubuntu's local manual pages and the shell references above | Commands or a small script matched to the AGH rubric |
| Flask | The official Flask reference above | Required route/template/request/test behavior in Flask |

Record your actual IBM course unit when you have access; otherwise label the week's work as free-reference practice instead of certificate completion. Google ML stays later, after its prerequisites. Any AGH-hosted deployment follows the university's assigned platform; paid cloud hosting is not part of the learning tracker.

[GitHub Projects setup](GITHUB_PROJECTS.md) documents native views, fields, filters, and permissions. No subscriptions, marketplace extensions, or external tracking services are needed.
