/** Learning guidance only: no new tasks, hours, issues, or inferred completion.
 * Goal skillIds are the navigation targets for deeper skill guides.
 * The existing weekly task/progress catalog remains the evidence record.
 */
export interface SkillDetail {
  level: 'essential' | 'recommended' | 'advanced';
  why: string;
  concepts: string[];
  practice: { title: string; instruction: string }[];
}
export interface GoalTemplate {
  id: string;
  week: number;
  track: 'backend' | 'data' | 'agh';
  title: string;
  description: string;
  skillIds: string[];
}
export interface LearningPath {
  id: 'core-java' | 'backend' | 'data' | 'agh';
  title: string;
  description: string;
  skillIds: string[];
}

export const skillDetails: Record<string, SkillDetail> = {
  "core-java": {
    "level": "essential",
    "why": "Plain Java is the base for your AGH exercises, Spring services and EPAM concept questions. Diagnose the code you already have before repeating an introduction.",
    "concepts": [
      "Primitive types, wrapper values and conversions",
      "Variables, local scope and object fields",
      "Arrays, indexing and boundary cases",
      "String immutability; == versus equals",
      "Methods, arguments, return values and pass-by-value",
      "Checked and unchecked exceptions; deliberate failure handling"
    ],
    "practice": [
      {
        "title": "Predict before running",
        "instruction": "Use your existing Java diagnostic to predict four short traces involving state, arrays, String equality and an argument passed to a method. Run each attempt and explain the first disagreement."
      },
      {
        "title": "Repair one real gap",
        "instruction": "Choose one compile error or wrong result from current AGH or StudyTask code. Make the smallest change yourself, rerun it and record what rule explains the fix."
      }
    ]
  },
  "oop": {
    "level": "essential",
    "why": "A small model with clear responsibilities makes Spring understandable and helps you explain your own design without relying on framework terminology.",
    "concepts": [
      "Classes, instances and constructor execution",
      "Encapsulation and valid object state",
      "Composition versus inheritance",
      "Interfaces versus abstract classes",
      "Overloading versus overriding",
      "Constructor-supplied dependencies and responsibility boundaries"
    ],
    "practice": [
      {
        "title": "Two objects, independent state",
        "instruction": "In the existing StudyTask exercise, construct two tasks and change one status. Show that the other object stays unchanged; explain which method protects the rule."
      },
      {
        "title": "Explain the boundary",
        "instruction": "Use the existing repository interface and service to explain who owns storage, validation and use-case decisions. Justify one interface or composition choice using your code."
      }
    ]
  },
  "collections": {
    "level": "essential",
    "why": "Choosing a suitable collection matters more than memorizing every implementation. Typed lookups support the Week 01 model; equality and costs are revisited in Week 03.",
    "concepts": [
      "List, Set, Map and Queue use cases",
      "Typed collection declarations and iteration",
      "Ordered, duplicate and unique elements",
      "Missing keys and absent lookup results",
      "equals/hashCode consistency for value keys",
      "Basic lookup, insertion and iteration costs"
    ],
    "practice": [
      {
        "title": "Model lookup behavior",
        "instruction": "Store three tasks in the existing in-memory exercise and check one present ID, one missing ID and a duplicate-related case. Explain the collection choice."
      },
      {
        "title": "Revisit equality in Week 03",
        "instruction": "Reuse the planned tiny value-key fixture to compare equal keys in a Set or Map. Predict the result before running; keep this deeper exercise out of the Week 02 Spring entry gate."
      }
    ]
  },
  "generics": {
    "level": "essential",
    "why": "Generics let the compiler protect collection and helper boundaries. Learn enough to explain safe code rather than building an abstraction framework.",
    "concepts": [
      "Type parameters versus concrete type arguments",
      "Compile-time safety and raw-type hazards",
      "Generic methods and inferred types",
      "Invariance: List<Integer> versus List<Number>",
      "Simple upper/lower bounds and wildcard intent",
      "Choosing a concrete signature over unnecessary generalization"
    ],
    "practice": [
      {
        "title": "One typed helper",
        "instruction": "In the existing Week 03 fixture, write one small generic method and call it with two suitable value types. Compare it with an unsafe raw-type attempt and explain the compiler response."
      },
      {
        "title": "Explain a signature",
        "instruction": "During a planned repair slot, explain one bounded or wildcard signature from the code or reference you are using. If the explanation is still weak, record that specific gap rather than expanding the exercise."
      }
    ]
  },
  "git-maven": {
    "level": "essential",
    "why": "Small commits and reproducible terminal builds make your work reviewable and prevent IDE-only success from hiding missing dependencies or tests.",
    "concepts": [
      "Working tree, staging area and focused commits",
      "Reviewing a diff before committing",
      "Maven source and test directory layout",
      "pom.xml coordinates and dependency scopes",
      "Compile, test, package and verify lifecycle phases",
      "Wrapper commands, test reports and repeatable builds"
    ],
    "practice": [
      {
        "title": "Verify the learner-created exercise",
        "instruction": "Run the documented Maven command for your existing exercise and locate its test report. Explain one dependency and why a test dependency belongs in its scope."
      },
      {
        "title": "Make a reviewable change",
        "instruction": "Inspect the diff for one actual learning change, stage only its intended files and record a concise commit when ready. Do not create an unrelated project to practice Git."
      }
    ]
  },
  "junit": {
    "level": "essential",
    "why": "Tests turn your expected behavior into evidence. Begin with plain Java before adding Spring so that an application-startup check never substitutes for behavior checks.",
    "concepts": [
      "Jupiter test methods and meaningful assertions",
      "Arrange, act and assert around one behavior",
      "Normal, boundary, invalid and missing-data cases",
      "Exception assertions and failure messages",
      "Independent fixtures and repeatable execution",
      "Deliberately broken behavior as a test effectiveness check"
    ],
    "practice": [
      {
        "title": "Prove a rule",
        "instruction": "Use the Week 01 model/service tests to check valid creation, independent state and a missing or invalid input. Reach the existing four-meaningful-test G1 gate."
      },
      {
        "title": "Watch one test catch a regression",
        "instruction": "Temporarily break one tested behavior, run the suite and identify the failing assertion. Restore the behavior and rerun; keep commands/results as evidence."
      }
    ]
  },
  "lambdas": {
    "level": "essential",
    "why": "Functional interfaces and lambdas make Java collection transformations concise once the underlying types and behavior are clear.",
    "concepts": [
      "A functional interface and its single abstract method",
      "Lambda parameters, body and inferred types",
      "Predicate for selection decisions",
      "Comparator for ordering decisions",
      "Captured variables and effectively-final rules",
      "Equivalent ordinary-method or loop behavior"
    ],
    "practice": [
      {
        "title": "Predicate and Comparator",
        "instruction": "Reuse the Week 03 task fixture in the existing Week 04 slot. Write one selection predicate and one comparator, then predict and run normal and empty/duplicate-related input."
      },
      {
        "title": "Explain the function boundary",
        "instruction": "For one lambda, identify its input, output, functional-interface method and captured values. Compare it with a plain Java equivalent without adding an endpoint."
      }
    ]
  },
  "streams": {
    "level": "essential",
    "why": "Streams help express transformations, but correctness and explainable behavior come before shorter code. The planned exercise uses existing synthetic task data.",
    "concepts": [
      "A stream source and pipeline",
      "filter, map and aggregate intent",
      "Intermediate versus terminal operations",
      "Lazy evaluation and when work runs",
      "Empty input, duplicate values and encounter order",
      "Stateless transformations and avoiding shared mutation"
    ],
    "practice": [
      {
        "title": "Compare a loop and a pipeline",
        "instruction": "In the existing Week 05 practice, implement the same task selection/transformation with a loop and a stream. Predict outputs for normal, empty and duplicate-containing input."
      },
      {
        "title": "Trace execution",
        "instruction": "Explain where the pipeline starts executing and what terminal operation produces the result. Check result agreement instead of adding parallel streams or new application features."
      }
    ]
  },
  "io": {
    "level": "essential",
    "why": "File handling joins Java exceptions with real resources and is explicit EPAM preparation. One tiny UTF-8 fixture is enough for this cycle.",
    "concepts": [
      "Path and Files as file-system interfaces",
      "UTF-8 text encoding and round-trip meaning",
      "Reading versus writing a fixed simple format",
      "Reader/writer lifetime and try-with-resources",
      "Checked I/O failures and useful error reporting",
      "Empty files, missing files and safe disposable fixtures"
    ],
    "practice": [
      {
        "title": "Round-trip a tiny fixture",
        "instruction": "Use the existing Week 06 I/O slot to write and read a few UTF-8 records in a disposable location. Compare the original and reloaded values; keep the format simple."
      },
      {
        "title": "Exercise failure paths",
        "instruction": "Check an empty file and an intentionally missing path. Explain the checked exception and resource closure; do not add a general CSV parser or API feature."
      }
    ]
  },
  "algorithms": {
    "level": "essential",
    "why": "Small independent problems build the reasoning needed for technical tests and everyday backend choices. This plan values contracts and edge cases over a large problem count.",
    "concepts": [
      "Input/output contracts and explicit assumptions",
      "Arrays, Strings and Map-based counting or lookup",
      "Linear search versus appropriate sorting/search choices",
      "Normal, empty, duplicate and boundary inputs",
      "Time complexity from loops and data-structure operations",
      "Space complexity and readable tradeoffs"
    ],
    "practice": [
      {
        "title": "One fresh problem",
        "instruction": "Use a scheduled Week 07–08 practice slot for one array, String or Map prompt. State the contract, attempt it independently and run normal plus edge-case checks."
      },
      {
        "title": "Explain the cost",
        "instruction": "Walk through the main operations of your attempt and justify time/space complexity. Use a later repair slot for the weakest part instead of starting a new algorithm course."
      }
    ]
  },
  "http": {
    "level": "essential",
    "why": "Understanding a request contract lets you reason about Spring or Flask without treating either framework as magic.",
    "concepts": [
      "URLs, paths, parameters and a resource identifier",
      "GET, POST and PATCH intent in the planned API",
      "JSON request and response bodies",
      "201, 204, 400 and 404 semantics",
      "Headers such as Content-Type and Location",
      "Predicted request/response pairs versus observed evidence"
    ],
    "practice": [
      {
        "title": "Predict the contract",
        "instruction": "Use the Week 01 preview and Week 02 status table to describe create, read and status-change requests before running them. Include invalid input and a missing ID."
      },
      {
        "title": "Observe the API",
        "instruction": "Once the Week 02 Spring slice exists, execute one valid and one invalid request and compare actual status/body with your prediction. A running API is later evidence, not an entry requirement for learning HTTP."
      }
    ]
  },
  "spring": {
    "level": "essential",
    "why": "Spring starts in Week 02 so you can apply basic Java quickly. Its entry gate is a small tested model, not prior mastery of streams, I/O or advanced collections.",
    "concepts": [
      "Spring Boot setup and compatible dependency versions",
      "Component metadata and bean construction",
      "Constructor injection versus ordinary Java construction",
      "Controller, service and repository responsibilities",
      "Mapping HTTP input/output to the existing model",
      "In-memory behavior, missing data and deliberate client errors"
    ],
    "practice": [
      {
        "title": "Build the first vertical slice",
        "instruction": "After G1, adapt your existing StudyTask exercise into the Week 02 create/read/status API. Keep storage in memory and explain controller → service → repository."
      },
      {
        "title": "Demonstrate behavior",
        "instruction": "Show a 201 creation with ID and Location, a subsequent read/status change and deliberate 400/404 cases. State that restart loses in-memory data; do not claim PostgreSQL persistence yet."
      }
    ]
  },
  "sql": {
    "level": "essential",
    "why": "SQL supports both AGH Databases and backend persistence. Predicting results, including unmatched rows, is more valuable than collecting query syntax.",
    "concepts": [
      "Tables, primary keys and foreign keys",
      "SELECT, WHERE and deterministic ordering",
      "INNER JOIN versus LEFT JOIN",
      "Grouping, aggregation and zero-match counts",
      "Parameterized statements versus SQL string concatenation",
      "Transaction commit/rollback as a change boundary"
    ],
    "practice": [
      {
        "title": "Predict and execute",
        "instruction": "Use the planned tiny Course/StudyTask schema to predict and run the existing SQL exercises. Include a course with no tasks and an intentional FK violation."
      },
      {
        "title": "Explain query safety",
        "instruction": "Explain one join/count result and why user values become SQL parameters. Reuse concepts across AGH and Amazon without double-counting study hours or replacing required university tooling."
      }
    ]
  },
  "persistence": {
    "level": "essential",
    "why": "Persistence extends the same application behind a repository boundary. Reproducible migrations and real PostgreSQL evidence matter more than a second database tutorial project.",
    "concepts": [
      "Database configuration outside application source",
      "Migration-managed schema and repeatable startup",
      "Prepared JDBC statements and resource closure",
      "JPA entities, identity and repository mapping",
      "Optional lookup results and mutable entity boundaries",
      "Restart persistence and real database constraints"
    ],
    "practice": [
      {
        "title": "Persist the existing flow",
        "instruction": "After G2, use the Week 03 tasks to apply a migration, try one parameterized JDBC operation and integrate JPA with actual PostgreSQL."
      },
      {
        "title": "Verify durability",
        "instruction": "Create a task through the API, restart the application and read it back. Record schema version and connection method without secret values; verify a constraint in the real database."
      }
    ]
  },
  "validation": {
    "level": "essential",
    "why": "A useful API protects its domain and gives clients predictable failure information. The Week 04 relationship work keeps those rules concrete.",
    "concepts": [
      "Request/response DTOs versus persistence entities",
      "Required fields and valid title/status/date input",
      "Malformed input versus a missing resource",
      "A small consistent error-response shape",
      "Course/task association and foreign-key enforcement",
      "Deletion status and subsequent lookup behavior"
    ],
    "practice": [
      {
        "title": "Implement the relationship contract",
        "instruction": "Use the existing Week 04 slice to link a task to a real course, reject a missing course and define validation/error responses."
      },
      {
        "title": "Check the client paths",
        "instruction": "Verify valid creation/linking, blank title or invalid status, missing IDs and delete-then-read. Keep tests focused on the published contract rather than framework internals."
      }
    ]
  },
  "service-tests": {
    "level": "essential",
    "why": "Different tests prove different things. Repository mocks isolate service decisions; HTTP tests verify the contract; actual PostgreSQL tests verify database behavior.",
    "concepts": [
      "A behavior/test matrix across application layers",
      "Mockito stubs at a dependency boundary",
      "Outcome assertions versus excessive interaction checking",
      "HTTP success and failure status/body assertions",
      "Real PostgreSQL integration checks and isolated resets",
      "Test reports that reveal skipped or undiscovered cases"
    ],
    "practice": [
      {
        "title": "Choose the proving layer",
        "instruction": "Using the existing Week 02–05 checks, identify which test proves one service decision, one HTTP error and one persistence constraint. Record any actual gap."
      },
      {
        "title": "Make isolation useful",
        "instruction": "In the scheduled Mockito work, isolate one repository dependency and assert meaningful service behavior. Explain why that test does not establish PostgreSQL correctness."
      }
    ]
  },
  "transactions": {
    "level": "essential",
    "why": "Atomic changes and predictable query results protect real data. You need observed committed state to prove rollback rather than just a mocked repository call.",
    "concepts": [
      "An application service transaction boundary",
      "Commit, rollback and all-or-nothing writes",
      "A forced failure during the second write",
      "Committed state versus test-owned transaction state",
      "Deterministic filtering and pagination results",
      "Observed SQL/query plans and justified query decisions"
    ],
    "practice": [
      {
        "title": "Force a partial-write failure",
        "instruction": "Use the planned two-task batch operation without a new endpoint. Make the second write fail and inspect committed PostgreSQL state after the service call."
      },
      {
        "title": "Explain a query decision",
        "instruction": "During Week 06, predict a filter/page result and compare it with execution. Use one observed query or plan to explain a decision; avoid speculative optimization."
      }
    ]
  },
  "docker": {
    "level": "recommended",
    "why": "Containers make the same app/database setup easier to reproduce. The goal is a working HTTP and persistence flow, not a collection of running containers.",
    "concepts": [
      "Application image versus a running container",
      "Compose service names and networking",
      "Configuration passed at runtime",
      "Database readiness versus process startup order",
      "Named volumes and durable database data",
      "Clean start, restart and explicitly destructive resets"
    ],
    "practice": [
      {
        "title": "Run app and database together",
        "instruction": "Use the existing Week 07 Compose work to start the packaged app and PostgreSQL with documented commands. Execute a create/read flow through HTTP."
      },
      {
        "title": "Check persistence across restarts",
        "instruction": "Restart services and reload a task. Explain volume and readiness behavior, and distinguish normal restart from a destructive database reset."
      }
    ]
  },
  "ci": {
    "level": "recommended",
    "why": "An executed verification pipeline makes project evidence trustworthy and exposes machine-specific assumptions before deployment or an internship review.",
    "concepts": [
      "A repeatable verification command",
      "Build environment and dependency setup",
      "Actual PostgreSQL service availability in CI",
      "Unit versus integration-test discovery",
      "Test reports and deliberately visible failures",
      "G3 reproducibility from documented commands"
    ],
    "practice": [
      {
        "title": "Run meaningful verification",
        "instruction": "Use Week 08 to execute the documented Maven workflow in CI with PostgreSQL checks. Inspect reports to confirm intended tests actually ran."
      },
      {
        "title": "Rehearse G3",
        "instruction": "Repeat app+database startup and verification from the documented path. Record the pipeline revision and an actual result; a workflow file alone is not a passing pipeline."
      }
    ]
  },
  "release": {
    "level": "recommended",
    "why": "Deployment rehearsal, logs and recovery develop operational judgment without buying hosting. A final fresh-checkout demonstration makes portfolio claims inspectable.",
    "concepts": [
      "Packaged revision and externalized runtime configuration",
      "Local Ubuntu/container deployment path",
      "Health checks, logs and smoke requests",
      "Restart persistence and compatible schema changes",
      "Backup restoration in a disposable database",
      "Fresh-checkout demo and accurate known limitations"
    ],
    "practice": [
      {
        "title": "Rehearse operations",
        "instruction": "Use the Week 09 plan to start the tested revision, inspect health/logs, make a smoke request and check restart persistence. Hosting is optional."
      },
      {
        "title": "Prove recovery and release",
        "instruction": "Restore a backup into a disposable database and later repeat the Week 12 clean-checkout demo. Save exact revision/commands and keep remaining limitations visible."
      }
    ]
  },
  "portfolio": {
    "level": "recommended",
    "why": "Internship preparation works best when every statement points to your own decisions, debugging and tests. A truthful small project is a strong foundation.",
    "concepts": [
      "A concise problem and feature explanation",
      "A five-minute controller-to-database walkthrough",
      "One-page CV claims tied to evidence",
      "A debugging story with an observed cause and fix",
      "A design tradeoff and an acknowledged limitation",
      "Actual role eligibility and application-status records"
    ],
    "practice": [
      {
        "title": "Explain one feature",
        "instruction": "Use an existing walkthrough slot to explain one API behavior, its design boundary and the tests that prove it. Note the first explanation you cannot yet support."
      },
      {
        "title": "Make claims inspectable",
        "instruction": "Update the planned CV/demo notes using actual application evidence. Log a suitable role or application honestly; research is not a submitted application."
      }
    ]
  },
  "epam": {
    "level": "essential",
    "why": "This milestone consolidates foundations using independent attempts. It is our preparation benchmark; actual EPAM entrance rules vary by intake and location.",
    "concepts": [
      "Core Java/OOP concept and output-trace reasoning",
      "Typed collection algorithms and complexity explanations",
      "Lambda/stream predictions for normal and edge inputs",
      "I/O, Maven and tests with reproducible evidence",
      "SQL and Spring request/persistence/error explanations",
      "Original timed attempts versus corrections and fresh retries",
      "English explanation and actual intake eligibility checks"
    ],
    "practice": [
      {
        "title": "Assess existing skills independently",
        "instruction": "Use the already scheduled Week 11 A/B assessments and the existing rubric with fresh prompts, without generated solutions. Keep original attempts, results and corrections separate."
      },
      {
        "title": "Retry the weakest component",
        "instruction": "Use the existing Week 12 retry slot only when needed. Link results in issue #37, leave unresolved gaps open and respect AGH deadlines; this evidence index adds no study hours."
      }
    ]
  },
  "python": {
    "level": "essential",
    "why": "Python fluency supports the IBM certificate now and later AI/ML work. Continue the actual enrolled unit rather than forcing an assumed module sequence.",
    "concepts": [
      "Functions, arguments and returned values",
      "Lists, dictionaries and iteration",
      "A small transformation with explained input/output",
      "Files and simple CSV-shaped data",
      "Rerunnable scripts or notebooks",
      "Reading errors and recording a precise next lab step"
    ],
    "practice": [
      {
        "title": "Continue the real unit",
        "instruction": "Record your current IBM course/unit and complete one appropriate practical segment, or use the free Python reference if course access is unavailable."
      },
      {
        "title": "Rerun and explain",
        "instruction": "Rerun the existing notebook/script from its starting state and explain one result and one corrected error. Do not label reference practice as certificate completion."
      }
    ]
  },
  "numpy": {
    "level": "recommended",
    "why": "Arrays are a small numerical foundation for data analysis and later ML. Learn them inside relevant data-lab work when your current unit needs them.",
    "concepts": [
      "An ndarray versus a Python list",
      "Array shape, axes and dimensions",
      "Numeric dtypes and conversions",
      "Indexing, slicing and selected values",
      "Element-wise operations and simple broadcasting",
      "Vectorized output checked against a small explicit example"
    ],
    "practice": [
      {
        "title": "One array comparison",
        "instruction": "When appropriate in the current data lab, compare one list-based calculation with a NumPy array operation. Predict values and explain shape/dtype."
      },
      {
        "title": "Check a selection",
        "instruction": "Run one indexing or slicing example on the same tiny array and explain the result. If the current unit is earlier, continue it and leave this topic unstarted."
      }
    ]
  },
  "pandas": {
    "level": "recommended",
    "why": "Tabular analysis becomes useful when loading, selections and data-quality choices can be reproduced and explained.",
    "concepts": [
      "DataFrame columns, rows and dtypes",
      "Loading a small dataset reproducibly",
      "Selecting, filtering and deriving values",
      "Grouping and summary aggregation",
      "Missing values and explicit handling choices",
      "Before/after row counts and simple invariants"
    ],
    "practice": [
      {
        "title": "Explain a small summary",
        "instruction": "When ready in the existing IBM lab, load a dataset, filter or group it and explain one result in plain language."
      },
      {
        "title": "Make a quality choice visible",
        "instruction": "Inspect missing values or an input-quality issue. Record before/after counts and verify an invariant instead of silently discarding rows."
      }
    ]
  },
  "statistics": {
    "level": "recommended",
    "why": "Descriptive evidence and uncertainty help you avoid overclaiming from plots or a small dataset. Build on comfortable data handling.",
    "concepts": [
      "Population, sample and the unit of observation",
      "Mean, median and distribution shape",
      "Spread, outliers and sensitivity of summaries",
      "Subgroup comparisons and sample-size limits",
      "Plot axes, scales and meaningful visual choices",
      "Association versus causation and honest limitations"
    ],
    "practice": [
      {
        "title": "Compare two subsets",
        "instruction": "If the actual data unit is ready, use the existing exploration lab to summarize two subsets and make one informative plot. Otherwise finish the prerequisite lab."
      },
      {
        "title": "State an honest limitation",
        "instruction": "Write three observations tied to outputs and one limitation involving sampling, missing data or interpretation. Do not infer causality from a descriptive comparison."
      }
    ]
  },
  "evaluation": {
    "level": "recommended",
    "why": "Model scores are meaningful only when evaluation reflects unseen data and the right question. This remains conditional on the actual IBM unit and foundations.",
    "concepts": [
      "A baseline before a more complex model",
      "Training versus held-out evaluation data",
      "Leakage from preprocessing or repeated test use",
      "A metric appropriate to the prediction question",
      "Observed score versus claims of generalization",
      "Reproducible splits and documented limitations"
    ],
    "practice": [
      {
        "title": "Explain the split",
        "instruction": "When the current certificate lab has reached evaluation, explain what each data split is used for and identify one possible leakage path."
      },
      {
        "title": "Compare with a baseline",
        "instruction": "Use the existing lab to report one relevant metric alongside a simple baseline and one limitation. If not ready, continue your actual unit without inventing model progress."
      }
    ]
  },
  "machine-learning": {
    "level": "advanced",
    "why": "ML follows software/data foundations and a capacity review. Google ML is normally after the 12-week cycle, not another course added alongside all current work.",
    "concepts": [
      "Python functions/collections as prerequisites",
      "NumPy and pandas comfort for data manipulation",
      "Algebra, functions and basic linear algebra readiness",
      "Features, labels and a prediction objective",
      "Training/evaluation roles and leakage awareness",
      "Learning capacity after AGH and backend commitments"
    ],
    "practice": [
      {
        "title": "Review readiness before enrolling",
        "instruction": "During the planned end-of-cycle review, compare your evidence with the official Google ML prerequisite checklist. Identify gaps without marking ML complete."
      },
      {
        "title": "Choose a later starting point",
        "instruction": "If prerequisites and capacity are ready, choose one later ML unit that replaces future data-track study time. Otherwise continue the missing foundation; do not add weekly hours."
      }
    ]
  },
  "agh-os": {
    "level": "essential",
    "why": "Your actual OS exercises and required language take priority over a generic learning sequence. Linux course sections support specific gaps without replacing lectures.",
    "concepts": [
      "Bash quoting, pipelines, permissions and arguments",
      "Processes, threads and a shared-state race",
      "IPC, critical sections and synchronization choices",
      "Deadlock conditions and an observed interleaving",
      "Memory, virtual memory and file-system concepts",
      "Sockets and security questions from the current brief"
    ],
    "practice": [
      {
        "title": "Work from the authoritative brief",
        "instruction": "Open the latest OS exercise and identify its required behavior, language and due time. Implement or verify the next required part, using a safe disposable fixture when appropriate."
      },
      {
        "title": "Explain observed behavior",
        "instruction": "Record command/output evidence or a small assigned trace and explain the relevant process, synchronization or memory concept. Preparation is separate from submitted/graded work."
      }
    ]
  },
  "agh-databases": {
    "level": "essential",
    "why": "AGH database tasks may require specific software, schema and reports. Reuse SQL reasoning while keeping the lecturer’s tool and submission rules intact.",
    "concepts": [
      "Required database tool and submission format",
      "Keys, relationships and referential integrity",
      "Normalization and a redundancy anomaly",
      "INNER/LEFT JOIN and zero-match behavior",
      "Grouping, aggregation and predicted results",
      "Transactions, forms or reports when the actual rubric requires them"
    ],
    "practice": [
      {
        "title": "Complete the current rubric slice",
        "instruction": "Use the assigned database/tool to produce the next required schema, query, form or report result. Predict a meaningful result before executing it."
      },
      {
        "title": "Check before submission",
        "instruction": "Compare outputs with the current rubric and record submission evidence or the exact blocker. PostgreSQL portfolio practice does not stand in for a required Base/HSQLDB artifact."
      }
    ]
  },
  "agh-java": {
    "level": "essential",
    "why": "AGH OOP work develops your fundamentals in its own required format. Explain your current code rather than rewriting it to imitate Spring.",
    "concepts": [
      "The current exercise contract and console/input rules",
      "Constructor and initialization traces",
      "Object state, encapsulation and methods",
      "Interfaces or inheritance only when useful or required",
      "Input validation and boundary behavior",
      "Compile/run evidence and required submission files"
    ],
    "practice": [
      {
        "title": "Check the assigned program",
        "instruction": "Compile and run the current Java exercise, then independently check two normal cases and a boundary case derived from its rubric."
      },
      {
        "title": "Explain a design decision",
        "instruction": "Explain a constructor/state/interface choice against your own source. Preserve required console behavior and record remaining submission work honestly."
      }
    ]
  },
  "agh-web": {
    "level": "essential",
    "why": "Web coursework includes browser fundamentals and Flask when assigned. A Spring API gives context but cannot satisfy a Flask submission.",
    "concepts": [
      "Semantic HTML, forms and validation",
      "CSS layout and responsive narrow/wide behavior",
      "JavaScript DOM/events and observed requests",
      "Flask routes, requests, responses and templates",
      "Success/error tests in the required Python project",
      "University-required deployment and submission evidence"
    ],
    "practice": [
      {
        "title": "Verify the current web behavior",
        "instruction": "Use the actual HTML/CSS/JS or Flask rubric to implement one required page/form/route behavior and inspect the corresponding browser or HTTP result."
      },
      {
        "title": "Check an error path",
        "instruction": "Verify one invalid-input/error case and any required responsive or test behavior. Keep Flask assignments in Flask and follow the assigned hosting/tool rules."
      }
    ]
  },
  "agh-assignments": {
    "level": "essential",
    "why": "Real university deadlines override the default 60/20/20 split. Clear sources and a small next action prevent generic preparation from hiding urgent work.",
    "concepts": [
      "Authoritative lecturer/UPEL/Teams exercise sources",
      "Verified due time, time zone and submission channel",
      "Required tooling, language and grading rubric",
      "Earliest unresolved submission and next action",
      "Remaining capacity and rescheduling without resetting progress",
      "Submission receipts versus unverified completion claims"
    ],
    "practice": [
      {
        "title": "Check university commitments first",
        "instruction": "Verify the latest OS, Java, web and database briefs. Record a source and next action for each; explicitly flag unknown dates for follow-up."
      },
      {
        "title": "Rebalance the current week",
        "instruction": "Reserve mandatory coursework time first and move optional study outcomes when necessary. Preserve task evidence and real deadlines; review progress without assuming that a passed calendar week means completion."
      }
    ]
  }
};

export const goalTemplates: GoalTemplate[] = [
  {
    "id": "goal-w01-backend-1",
    "week": 1,
    "track": "backend",
    "title": "Build a small Java model you can explain",
    "description": "Create and exercise your own StudyTask model, typed lookup and deliberate invalid/missing behavior. Use your existing AGH code to repair diagnostic gaps rather than repeat a whole introduction.",
    "skillIds": [
      "core-java",
      "oop",
      "collections"
    ]
  },
  {
    "id": "goal-w01-backend-2",
    "week": 1,
    "track": "backend",
    "title": "Build and test Java with Maven",
    "description": "Run the learner-created Maven exercise with at least four meaningful JUnit tests and explain constructor injection, a dependency and basic GET/POST. Review this evidence before the Week 02 API.",
    "skillIds": [
      "git-maven",
      "junit",
      "http"
    ]
  },
  {
    "id": "goal-w01-data-1",
    "week": 1,
    "track": "data",
    "title": "Complete a lab in your current IBM unit",
    "description": "Continue the actual enrolled course/unit and produce a rerunnable notebook/script with an explained result. If access is unavailable, use matching free Python practice and label it honestly.",
    "skillIds": [
      "python"
    ]
  },
  {
    "id": "goal-w01-agh-1",
    "week": 1,
    "track": "agh",
    "title": "Prepare the next AGH lab or assignment",
    "description": "Check authoritative OS, Java, web and database instructions, record real deadlines and complete the most urgent rubric-derived work. Shell/OOP/web/SQL preparation fills only remaining capacity.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w02-backend-1",
    "week": 2,
    "track": "backend",
    "title": "Build a small REST API with Spring Boot",
    "description": "After G1, adapt the same model into create/read/status HTTP flow with constructor injection. Keep storage in memory and explain controller → service → repository; do not wait for streams or I/O.",
    "skillIds": [
      "spring",
      "http",
      "oop"
    ]
  },
  {
    "id": "goal-w02-backend-2",
    "week": 2,
    "track": "backend",
    "title": "Practice SQL and handle invalid API requests",
    "description": "Run meaningful success/error HTTP checks and practice keys, joins and parameterized-query reasoning in PostgreSQL. Use the G2 evidence to decide whether persistence can begin.",
    "skillIds": [
      "junit",
      "http",
      "sql"
    ]
  },
  {
    "id": "goal-w02-data-1",
    "week": 2,
    "track": "data",
    "title": "Strengthen Python through the current certificate lab",
    "description": "Continue the real unit; if Python review is appropriate, use functions, collections and a small file transformation. Keep rerunnable output and the exact next step instead of assuming a module is finished.",
    "skillIds": [
      "python"
    ]
  },
  {
    "id": "goal-w02-agh-1",
    "week": 2,
    "track": "agh",
    "title": "Meet the next university submission",
    "description": "Follow current processes/OOP/web/database briefs and verify required behavior in the assigned tools. Replace any suggested topic when an earlier deadline or Flask assignment is active.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w03-backend-1",
    "week": 3,
    "track": "backend",
    "title": "Persist the same application in PostgreSQL",
    "description": "After G2, introduce a migration, a short parameterized JDBC operation and JPA storage behind the existing boundary. Demonstrate that an API-created task survives restart.",
    "skillIds": [
      "persistence",
      "sql",
      "spring"
    ]
  },
  {
    "id": "goal-w03-backend-2",
    "week": 3,
    "track": "backend",
    "title": "Practice Collections, Generics and database tests",
    "description": "Run actual PostgreSQL save/reload, missing-ID and constraint checks. Use the existing practice fixture for equality/hash reasoning, collection choice and one small generic method.",
    "skillIds": [
      "service-tests",
      "collections",
      "generics"
    ]
  },
  {
    "id": "goal-w03-data-1",
    "week": 3,
    "track": "data",
    "title": "Produce a trustworthy data summary when ready",
    "description": "Continue the current IBM lab. If Python prerequisites allow, load/filter data and explain a small pandas summary; introduce only the array concepts the lab actually needs.",
    "skillIds": [
      "python",
      "numpy",
      "pandas"
    ]
  },
  {
    "id": "goal-w03-agh-1",
    "week": 3,
    "track": "agh",
    "title": "Align preparation with this week’s real lectures",
    "description": "Work on the earliest current submission. Thread/race, Java collections, Flask routes or database-schema review are options only when the actual briefs support them.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w04-backend-1",
    "week": 4,
    "track": "backend",
    "title": "Model relationships and validate API requests",
    "description": "Add the planned relationship, explicit validation/errors and deletion behavior. Verify foreign-key enforcement and demonstrate predictable 201/204/400/404 client outcomes.",
    "skillIds": [
      "validation",
      "persistence",
      "http"
    ]
  },
  {
    "id": "goal-w04-backend-2",
    "week": 4,
    "track": "backend",
    "title": "Practice lambdas and test relationships",
    "description": "Automate success/failure scenarios in the existing app, then reuse the collection fixture for one Predicate and Comparator. Keep refactoring bounded to a confusing existing layer.",
    "skillIds": [
      "service-tests",
      "lambdas",
      "collections"
    ]
  },
  {
    "id": "goal-w04-data-1",
    "week": 4,
    "track": "data",
    "title": "Make data-quality choices reproducible",
    "description": "Continue the actual IBM unit. If it has reached cleaning, identify missing values, justify a handling choice and record before/after counts; otherwise finish the prerequisite lab.",
    "skillIds": [
      "pandas",
      "python"
    ]
  },
  {
    "id": "goal-w04-agh-1",
    "week": 4,
    "track": "agh",
    "title": "Complete required coursework before optional preparation",
    "description": "Use the latest IPC/Java-exception/Flask/database instructions and retain their required language and tools. Check submission evidence rather than treating a runnable draft as submitted.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w05-backend-1",
    "week": 5,
    "track": "backend",
    "title": "Test services, HTTP and database behavior",
    "description": "Build the behavior/test matrix and isolate a useful repository dependency with Mockito. Demonstrate that assertions catch a real service regression; distinguish mocks from HTTP and actual database evidence.",
    "skillIds": [
      "service-tests",
      "junit"
    ]
  },
  {
    "id": "goal-w05-backend-2",
    "week": 5,
    "track": "backend",
    "title": "Practice Streams and database transactions",
    "description": "Use the planned atomic two-task operation to verify committed rollback state in PostgreSQL. Reuse synthetic tasks for an equivalent loop/stream transformation with edge cases.",
    "skillIds": [
      "transactions",
      "streams",
      "sql"
    ]
  },
  {
    "id": "goal-w05-data-1",
    "week": 5,
    "track": "data",
    "title": "Complete the next useful IBM lab",
    "description": "Finish an appropriate part of the current certificate lab. If SQL/data access is current, execute and explain a relevant query/transformation without repeating already-demonstrated videos or claiming an unseen assessment.",
    "skillIds": [
      "pandas",
      "python"
    ]
  },
  {
    "id": "goal-w05-agh-1",
    "week": 5,
    "track": "agh",
    "title": "Resolve the earliest lab or assignment gap",
    "description": "Prioritize actual synchronization, OOP, Flask-testing or database-transaction requirements. Reuse concepts across tracks while keeping university artifacts and submission rules intact.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w06-backend-1",
    "week": 6,
    "track": "backend",
    "title": "Add filtering and stable pagination",
    "description": "Implement the planned filters/pagination with stable ordering and meaningful checks. Explain one query decision using observed SQL or plan evidence rather than speculative optimization.",
    "skillIds": [
      "transactions",
      "sql",
      "service-tests"
    ]
  },
  {
    "id": "goal-w06-backend-2",
    "week": 6,
    "track": "backend",
    "title": "Handle files safely and consolidate database reasoning",
    "description": "Use the existing UTF-8 fixture to verify round-trip, empty and missing-file behavior. Preserve the planned SQL/transaction review and repeatable test procedure.",
    "skillIds": [
      "io",
      "transactions",
      "git-maven"
    ]
  },
  {
    "id": "goal-w06-data-1",
    "week": 6,
    "track": "data",
    "title": "Create an explained visualization if the unit is ready",
    "description": "Continue actual IBM work; when appropriate, visualize a relevant summary with clear labels and one interpretation. If foundations need repair, use the same outcome slot to finish them first.",
    "skillIds": [
      "pandas",
      "statistics",
      "python"
    ]
  },
  {
    "id": "goal-w06-agh-1",
    "week": 6,
    "track": "agh",
    "title": "Protect time for required university work",
    "description": "Follow current deadlock, Java, Flask and database briefs where assigned. Replace generic practice with the earliest necessary submission and keep unknown deadlines visible.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w07-backend-1",
    "week": 7,
    "track": "backend",
    "title": "Start app and PostgreSQL reproducibly with Compose",
    "description": "Package the same app, document configuration/networking/readiness and execute a working HTTP/database flow. Verify restart persistence through the named volume.",
    "skillIds": [
      "docker",
      "persistence",
      "http"
    ]
  },
  {
    "id": "goal-w07-backend-2",
    "week": 7,
    "track": "backend",
    "title": "Practice algorithms and explain your application",
    "description": "Use existing practice to attempt a small array/String/Map problem with edge cases and complexity reasoning. Repair one Java gap and make startup/reset instructions reproducible.",
    "skillIds": [
      "algorithms",
      "generics",
      "io",
      "docker"
    ]
  },
  {
    "id": "goal-w07-data-1",
    "week": 7,
    "track": "data",
    "title": "Explore data with justified observations",
    "description": "Continue the actual certificate lab. If ready for exploration/statistics, compare two subsets and explain summaries/plots with a limitation; otherwise continue the appropriate prerequisite.",
    "skillIds": [
      "statistics",
      "pandas"
    ]
  },
  {
    "id": "goal-w07-agh-1",
    "week": 7,
    "track": "agh",
    "title": "Practice this week’s OS, web or database topic",
    "description": "Reserve the earliest required work first. Memory, Java, responsive web or schema exercises are provisional preparation topics and must move with the actual AGH schedule.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w08-backend-1",
    "week": 8,
    "track": "backend",
    "title": "Run CI that proves PostgreSQL tests executed",
    "description": "Configure and execute the documented verification workflow. Inspect reports for intended integration cases and record actual pipeline results, not only the presence of a workflow file.",
    "skillIds": [
      "ci",
      "service-tests",
      "git-maven"
    ]
  },
  {
    "id": "goal-w08-backend-2",
    "week": 8,
    "track": "backend",
    "title": "Check project foundations and solve a Java problem",
    "description": "Repeat the documented app/database start and verification path. Use the existing algorithm and thread-review work to explain an edge case or race without adding a concurrency framework.",
    "skillIds": [
      "docker",
      "ci",
      "algorithms",
      "core-java"
    ]
  },
  {
    "id": "goal-w08-data-1",
    "week": 8,
    "track": "data",
    "title": "Continue the current data unit; evaluate only when ready",
    "description": "If the actual lab has reached modeling, explain train/test roles and a leakage risk. Otherwise keep working on the current Python/data/statistics unit without jumping ahead to match Week 08.",
    "skillIds": [
      "evaluation",
      "statistics",
      "pandas"
    ]
  },
  {
    "id": "goal-w08-agh-1",
    "week": 8,
    "track": "agh",
    "title": "Meet current submission and assessment requirements",
    "description": "Use current virtual-memory, Java, Flask and database briefs only as verified. Protect urgent university hours and retain required languages, platforms and evidence.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w09-backend-1",
    "week": 9,
    "track": "backend",
    "title": "Run a local deployment and inspect its behavior",
    "description": "Run the tested revision on Ubuntu using the packaged/containerized path. Record health/log evidence, a smoke request and restart persistence; a paid hosted URL is unnecessary.",
    "skillIds": [
      "release",
      "docker",
      "ci"
    ]
  },
  {
    "id": "goal-w09-backend-2",
    "week": 9,
    "track": "backend",
    "title": "Practice recovery and prepare portfolio evidence",
    "description": "Restore a backup in a disposable database and document the result. Use the existing Java diagnostic/CV work to identify a real gap and support only claims you can demonstrate.",
    "skillIds": [
      "release",
      "portfolio",
      "core-java"
    ]
  },
  {
    "id": "goal-w09-data-1",
    "week": 9,
    "track": "data",
    "title": "Explain evaluation or finish its prerequisite",
    "description": "Continue the actual IBM unit. If ready, report an appropriate metric alongside a simple baseline and a limitation; if not, finish the present lab and record the exact remaining step.",
    "skillIds": [
      "evaluation",
      "statistics",
      "pandas"
    ]
  },
  {
    "id": "goal-w09-agh-1",
    "week": 9,
    "track": "agh",
    "title": "Complete current OS or other coursework",
    "description": "Choose the earliest real assignment across the four AGH subjects. Filesystems, Java, Flask and databases remain provisional study pointers; actual briefs and deadlines determine the outcome.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w10-backend-1",
    "week": 10,
    "track": "backend",
    "title": "Make the API runnable and its limits clear",
    "description": "Bring documentation, safe defaults and demonstration commands into line with observed behavior. A reviewer should reproduce the app and understand its contract without unsupported security claims.",
    "skillIds": [
      "release",
      "validation",
      "http",
      "portfolio"
    ]
  },
  {
    "id": "goal-w10-backend-2",
    "week": 10,
    "track": "backend",
    "title": "Explain design choices and repair the weakest Java topic",
    "description": "Use existing project/CV and targeted-practice time to rehearse request flow, one test choice and one tradeoff. Repair the weakest foundation using a small fixture instead of adding features.",
    "skillIds": [
      "portfolio",
      "core-java",
      "generics",
      "streams",
      "io"
    ]
  },
  {
    "id": "goal-w10-data-1",
    "week": 10,
    "track": "data",
    "title": "Produce an honest analysis artifact or continue the real unit",
    "description": "Continue current IBM assessments. If appropriate, analyze synthetic task data in a rerunnable notebook with data-quality checks; this optional exercise is not a new service or a substitute for unfinished prerequisites.",
    "skillIds": [
      "pandas",
      "statistics",
      "python"
    ]
  },
  {
    "id": "goal-w10-agh-1",
    "week": 10,
    "track": "agh",
    "title": "Prepare your next AGH assessment",
    "description": "Give university requirements first claim on study capacity. Socket, Java, web or database gaps are selected from current briefs; track required outputs and actual submission status.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w11-backend-1",
    "week": 11,
    "track": "backend",
    "title": "Freeze features and fix high-impact findings",
    "description": "Review existing controller/service/repository code and tests, choose a small prioritized set of reproducible fixes and keep the demo stable. Do not broaden the application before readiness assessment.",
    "skillIds": [
      "service-tests",
      "release",
      "portfolio"
    ]
  },
  {
    "id": "goal-w11-backend-2",
    "week": 11,
    "track": "backend",
    "title": "Assess EPAM readiness with independent evidence",
    "description": "Use the existing A/B assessments and internal rubric, keeping original attempts separate from corrections. Record unresolved Java/tool/backend gaps, an English explanation and actual intake eligibility checks without implying an official pass.",
    "skillIds": [
      "epam",
      "algorithms",
      "io",
      "sql",
      "spring"
    ]
  },
  {
    "id": "goal-w11-data-1",
    "week": 11,
    "track": "data",
    "title": "Make current analysis progress reproducible",
    "description": "Continue the actual IBM unit and preserve a rerunnable artifact, assumptions and next action. Consolidate the existing notebook/lab rather than claim completion of the whole certificate.",
    "skillIds": [
      "python",
      "pandas",
      "statistics"
    ]
  },
  {
    "id": "goal-w11-agh-1",
    "week": 11,
    "track": "agh",
    "title": "Put actual course deadlines ahead of assessment practice",
    "description": "Use the real OS-security or other active briefs and submission dates. Move optional portfolio/EPAM work if mandatory university tasks require the time.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  },
  {
    "id": "goal-w12-backend-1",
    "week": 12,
    "track": "backend",
    "title": "Prove the release from a clean checkout",
    "description": "Run the documented application/database setup, verification and demo on a fresh working copy. Record exact revision/results and honest limitations against the final G4 criteria.",
    "skillIds": [
      "release",
      "ci",
      "service-tests",
      "portfolio"
    ]
  },
  {
    "id": "goal-w12-backend-2",
    "week": 12,
    "track": "backend",
    "title": "Close only evidenced gaps and plan the next cycle",
    "description": "Use the bounded readiness retry if needed, preserve unresolved items and continue truthful career follow-through. Choose the next small improvement from evidence instead of treating Week 12 as automatic completion.",
    "skillIds": [
      "epam",
      "portfolio",
      "algorithms"
    ]
  },
  {
    "id": "goal-w12-data-1",
    "week": 12,
    "track": "data",
    "title": "Consolidate data learning and assess later ML readiness",
    "description": "Record actual IBM progress and one reproducible artifact. Review Python/data/math prerequisites and capacity before choosing a later ML unit; preparation or planning does not mean ML is complete.",
    "skillIds": [
      "python",
      "pandas",
      "statistics",
      "evaluation",
      "machine-learning"
    ]
  },
  {
    "id": "goal-w12-agh-1",
    "week": 12,
    "track": "agh",
    "title": "Verify submissions and plan around the next assessments",
    "description": "Check the four subjects’ real submission/assessment evidence, name remaining gaps and reserve their next required work first. Reschedule unfinished optional outcomes without resetting completed work.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-web",
      "agh-databases"
    ]
  }
];

export const learningPaths: LearningPath[] = [
  {
    "id": "core-java",
    "title": "Core Java",
    "description": "Build language fluency and independent reasoning. These skills support both AGH work and EPAM preparation; they are not a requirement to postpone Week 02 Spring until every topic is mastered.",
    "skillIds": [
      "core-java",
      "oop",
      "collections",
      "generics",
      "lambdas",
      "streams",
      "io",
      "algorithms"
    ]
  },
  {
    "id": "backend",
    "title": "Java Backend",
    "description": "Apply Java in one evolving Spring Boot/PostgreSQL application, with tests from the start, reproducible delivery and honest readiness evidence.",
    "skillIds": [
      "git-maven",
      "junit",
      "http",
      "spring",
      "sql",
      "persistence",
      "validation",
      "service-tests",
      "transactions",
      "docker",
      "ci",
      "release",
      "portfolio",
      "epam"
    ]
  },
  {
    "id": "data",
    "title": "Data Science",
    "description": "Continue the actual IBM unit and develop practical Python/data foundations. Evaluation is conditional on readiness; Google ML normally comes after Week 12.",
    "skillIds": [
      "python",
      "numpy",
      "pandas",
      "statistics",
      "evaluation",
      "machine-learning"
    ]
  },
  {
    "id": "agh",
    "title": "AGH coursework",
    "description": "Start with actual assignments and verified deadlines. Subject preparation follows current lectures and required tools; urgent university work wins over the default study ratio.",
    "skillIds": [
      "agh-assignments",
      "agh-os",
      "agh-java",
      "agh-databases",
      "agh-web"
    ]
  }
];
