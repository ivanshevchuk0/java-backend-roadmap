// Skill metadata complements the original weekly tasks; it never changes task IDs or infers completion.
// Weeks are study suggestions. AGH briefs and the current IBM unit always take precedence.
export interface Topic {
  id: string;
  title: string;
  track: 'backend' | 'data' | 'agh';
  week: number;
  group: string;
  description: string;
  prerequisites: string[];
  exercise: string;
  criteria: string[];
  resources: { title: string; url: string; kind: 'course' | 'reference' }[];
  taskIds: string[];
  issueNumbers: number[];
  milestone?: boolean;
}
export interface TopicGroup {
  id: string;
  title: string;
  track: 'backend' | 'data' | 'agh';
  description: string;
}

export const topicGroups: TopicGroup[] = [
  {
    "id": "java-foundations",
    "title": "Java foundations",
    "track": "backend",
    "description": "Small Java exercises, typed collections and build/test tools. Spring begins after the G1 gate."
  },
  {
    "id": "functional-java",
    "title": "Functional Java & problem solving",
    "track": "backend",
    "description": "Week 03–08 practice in existing slots: types, lambdas, streams, files and algorithms."
  },
  {
    "id": "backend-app",
    "title": "Build one backend",
    "track": "backend",
    "description": "The same Spring Boot + PostgreSQL application evolves from Week 02."
  },
  {
    "id": "delivery",
    "title": "Deliver & prove readiness",
    "track": "backend",
    "description": "Reproducibility, deployment, career evidence and the bounded EPAM assessment."
  },
  {
    "id": "data-foundations",
    "title": "Data foundations",
    "track": "data",
    "description": "Continue the actual IBM unit; Python and data readiness determine pace."
  },
  {
    "id": "data-ml",
    "title": "Evaluation & later ML",
    "track": "data",
    "description": "Prerequisites and spare capacity first; Google ML normally follows Week 12."
  },
  {
    "id": "agh",
    "title": "AGH coursework first",
    "track": "agh",
    "description": "Actual assignments override provisional weekly topics and the default study ratio."
  }
];

export const topics: Topic[] = [
  {
    "id": "core-java",
    "title": "Core Java",
    "track": "backend",
    "week": 1,
    "group": "java-foundations",
    "description": "Types, Strings, arrays, methods, state and exceptions. Start with a diagnostic of your own AGH code, then repair the first observed gap.",
    "prerequisites": [],
    "exercise": "Trace constructors and static/instance calls, then run a tiny object-based program. Predict four short traces covering equality, wrappers, arrays and pass-by-value.",
    "criteria": [
      "The program compiles and runs from the terminal.",
      "Explain class/object, constructor timing, local/field state and argument/return.",
      "Predicted and actual traces agree, or the remaining gap is recorded."
    ],
    "resources": [
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      },
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d1-b-2",
      "w01-d5-b-1"
    ],
    "issueNumbers": [
      1
    ]
  },
  {
    "id": "oop",
    "title": "OOP & interfaces",
    "track": "backend",
    "week": 1,
    "group": "java-foundations",
    "description": "Encapsulation, composition, inheritance, interfaces and constructor injection in the same evolving StudyTask model.",
    "prerequisites": [
      "core-java"
    ],
    "exercise": "Create two independent tasks and a repository interface. Change one task, perform a lookup and explain a justified interface/composition choice.",
    "criteria": [
      "Two objects retain independent state.",
      "Explain interface versus abstract class, overload versus override, and private state.",
      "Invalid and missing data have deliberate outcomes."
    ],
    "resources": [
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      },
      {
        "title": "Classes, objects and constructors",
        "url": "https://dev.java/learn/language/oop/classes-objects/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d2-b-1",
      "w01-d2-b-2",
      "w01-d3-b-1",
      "w01-d3-b-2",
      "w01-d5-b-2"
    ],
    "issueNumbers": [
      1
    ]
  },
  {
    "id": "collections",
    "title": "Collections & equality",
    "track": "backend",
    "week": 1,
    "group": "java-foundations",
    "description": "Use typed List/Map storage early; revisit Set/Queue, equality, hashing and operation costs in Week 03.",
    "prerequisites": [
      "oop"
    ],
    "exercise": "Store three tasks and find present/missing IDs. In Week 03 use equal value keys to compare List, Set and Map behavior.",
    "criteria": [
      "Normal and missing lookups behave as intended.",
      "Choose a collection and explain lookup/iteration costs.",
      "Equal keys use consistent equals/hashCode; record empty/duplicate results."
    ],
    "resources": [
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      },
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d3-b-1",
      "w01-d3-b-2",
      "w03-d5-b-1"
    ],
    "issueNumbers": [
      1,
      7
    ]
  },
  {
    "id": "generics",
    "title": "Generics",
    "track": "backend",
    "week": 3,
    "group": "java-foundations",
    "description": "Move from typed collections to one generic method, invariance and the smallest bounded/wildcard explanation needed. No generic repository framework.",
    "prerequisites": [
      "collections"
    ],
    "exercise": "Write a tiny type-safe generic helper in the existing fixture and explain why List<Integer> is not List<Number>.",
    "criteria": [
      "The helper compiles without raw collections or unchecked casts.",
      "Explain the compiler error from an unsafe assignment.",
      "If bounds/wildcards remain unclear, record one repair target."
    ],
    "resources": [
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      },
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w03-d5-b-1",
      "w07-d5-b-1"
    ],
    "issueNumbers": [
      7,
      19
    ]
  },
  {
    "id": "git-maven",
    "title": "Git & Maven",
    "track": "backend",
    "week": 1,
    "group": "java-foundations",
    "description": "Reproducible source/test layout, dependencies, scopes and terminal builds; small reviewable commits throughout the project.",
    "prerequisites": [
      "core-java"
    ],
    "exercise": "Check tool versions, create the small Maven exercise and run its tests. Review the diff and explain one dependency and the compile/test/package lifecycle.",
    "criteria": [
      "Versions and actual commands are recorded.",
      "Tests run from the terminal and reports are located.",
      "Explain dependency scope; make only focused, reviewed commits."
    ],
    "resources": [
      {
        "title": "Maven getting started",
        "url": "https://maven.apache.org/guides/getting-started/",
        "kind": "reference"
      },
      {
        "title": "Pro Git",
        "url": "https://git-scm.com/book/en/v2",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d1-b-1",
      "w01-d4-b-1",
      "w01-d4-b-2"
    ],
    "issueNumbers": [
      1
    ]
  },
  {
    "id": "junit",
    "title": "JUnit foundations",
    "track": "backend",
    "week": 1,
    "group": "java-foundations",
    "description": "Tests begin before Spring: verify domain and service behavior, including invalid and missing data.",
    "prerequisites": [
      "oop",
      "git-maven"
    ],
    "exercise": "Add normal, boundary and negative tests. Deliberately break one rule, observe the failure, restore it and rerun.",
    "criteria": [
      "At least four meaningful early JUnit tests pass.",
      "A deliberate regression produces a failing assertion.",
      "Tests run independently and the report/command is recorded."
    ],
    "resources": [
      {
        "title": "JUnit user guide",
        "url": "https://docs.junit.org/current/user-guide/",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      }
    ],
    "taskIds": [
      "w01-d4-b-1",
      "w01-d4-b-2",
      "w01-d5-b-3"
    ],
    "issueNumbers": [
      1
    ]
  },
  {
    "id": "lambdas",
    "title": "Lambdas & functional interfaces",
    "track": "backend",
    "week": 4,
    "group": "functional-java",
    "description": "Predicate, Comparator, the single abstract method and capture rules, practiced on the existing collection fixture.",
    "prerequisites": [
      "generics"
    ],
    "exercise": "Create a Predicate and Comparator for synthetic tasks. Predict empty-input or duplicate-key behavior before running.",
    "criteria": [
      "Two runnable lambda examples have explained inputs/results.",
      "Explain the functional interface and capture rule.",
      "The existing app tests still pass."
    ],
    "resources": [
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      }
    ],
    "taskIds": [
      "w04-d5-b-1"
    ],
    "issueNumbers": [
      10
    ]
  },
  {
    "id": "streams",
    "title": "Streams",
    "track": "backend",
    "week": 5,
    "group": "functional-java",
    "description": "Compare a stream pipeline with a loop; distinguish intermediate and terminal operations without shared mutation.",
    "prerequisites": [
      "lambdas"
    ],
    "exercise": "Filter, map and aggregate the existing task fixture; implement an equivalent loop and compare outputs.",
    "criteria": [
      "Loop and stream results agree for normal, empty and duplicate-containing inputs.",
      "Explain laziness and terminal operations.",
      "No parallel streams, new endpoint or shared mutable accumulator is introduced."
    ],
    "resources": [
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      }
    ],
    "taskIds": [
      "w05-d5-b-1"
    ],
    "issueNumbers": [
      13
    ]
  },
  {
    "id": "io",
    "title": "Files, I/O & resources",
    "track": "backend",
    "week": 6,
    "group": "functional-java",
    "description": "UTF-8 Path/Files operations, checked exceptions and reader/writer lifetimes in one tiny fixed-format fixture.",
    "prerequisites": [
      "core-java"
    ],
    "exercise": "Round-trip a small UTF-8 file and exercise empty-file and missing-file cases. Keep the format simple.",
    "criteria": [
      "Round-trip equality is verified.",
      "Empty and missing files have deliberate outcomes.",
      "Explain try-with-resources and the checked I/O exception."
    ],
    "resources": [
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      }
    ],
    "taskIds": [
      "w06-d5-b-1",
      "w07-d5-b-1"
    ],
    "issueNumbers": [
      16,
      19
    ]
  },
  {
    "id": "algorithms",
    "title": "Algorithms & complexity",
    "track": "backend",
    "week": 7,
    "group": "functional-java",
    "description": "Small array, String or Map problems with edge cases and defensible time/space reasoning; no competitive-programming backlog.",
    "prerequisites": [
      "collections"
    ],
    "exercise": "Attempt one fresh array/String/Map problem within the existing practice slot. State its contract before coding and test normal/empty/duplicate input.",
    "criteria": [
      "An independent runnable solution matches expected results.",
      "Edge-case checks are recorded.",
      "Explain the selected data structure and time/space cost."
    ],
    "resources": [
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      }
    ],
    "taskIds": [
      "w07-d5-b-1",
      "w08-d5-b-1"
    ],
    "issueNumbers": [
      19,
      22
    ]
  },
  {
    "id": "http",
    "title": "HTTP & REST",
    "track": "backend",
    "week": 1,
    "group": "backend-app",
    "description": "URLs, methods, JSON, status codes and the request/response contract. A small preview precedes the Week 02 API.",
    "prerequisites": [
      "core-java"
    ],
    "exercise": "Predict GET/POST behavior, then document success and failure statuses for create/read/status-change requests.",
    "criteria": [
      "Explain GET versus POST and a task identifier.",
      "Predict 201, 400 and 404 behavior before executing.",
      "Predict request/response pairs for the Week 01 preview. Actual Week 02 HTTP results add later evidence; running a Spring API is not an HTTP entry requirement."
    ],
    "resources": [
      {
        "title": "Amazon: Full Stack Web Development",
        "url": "https://www.coursera.org/learn/fullstack-web-development",
        "kind": "course"
      },
      {
        "title": "Spring REST guide",
        "url": "https://spring.io/guides/gs/rest-service/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d6-b-1",
      "w02-d1-b-1",
      "w02-d1-b-2",
      "w02-d1-b-3",
      "w02-d3-b-1"
    ],
    "issueNumbers": [
      1,
      4
    ]
  },
  {
    "id": "spring",
    "title": "Spring Boot & DI",
    "track": "backend",
    "week": 2,
    "group": "backend-app",
    "description": "Start in Week 02 after the G1 Java/JUnit gate. Framework annotations and constructor injection connect the existing plain Java model; streams and I/O are not prerequisites.",
    "prerequisites": [
      "oop",
      "git-maven",
      "junit",
      "http"
    ],
    "exercise": "Build the in-memory create/read/status vertical slice. Follow controller → service → repository and demonstrate a valid request plus 400/404 errors.",
    "criteria": [
      "G1: class/interface, a basic typed List/Map lookup, invalid/missing handling, at least four JUnit tests, a Maven dependency and GET/POST meanings are demonstrated. Full Week 03 collections/equality mastery is not required.",
      "Create returns 201 with generated ID and Location; read/status flow works.",
      "Explain DI and annotations versus plain Java; memory-only reset behavior is stated."
    ],
    "resources": [
      {
        "title": "Amazon: Full Stack Web Development",
        "url": "https://www.coursera.org/learn/fullstack-web-development",
        "kind": "course"
      },
      {
        "title": "Spring REST guide",
        "url": "https://spring.io/guides/gs/rest-service/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w02-d1-b-1",
      "w02-d1-b-2",
      "w02-d1-b-3",
      "w02-d2-b-1",
      "w02-d2-b-2",
      "w02-d2-b-3",
      "w02-d3-b-1",
      "w02-d3-b-2",
      "w02-d3-b-3"
    ],
    "issueNumbers": [
      4
    ],
    "milestone": true
  },
  {
    "id": "sql",
    "title": "SQL & relational foundations",
    "track": "backend",
    "week": 2,
    "group": "backend-app",
    "description": "Keys, joins, grouping and parameterized SQL; practice PostgreSQL while the first API still uses memory.",
    "prerequisites": [
      "core-java"
    ],
    "exercise": "Predict and run five small schema/query operations, including a zero-task course and an intentional FK violation.",
    "criteria": [
      "Executed results and predicted-versus-actual notes are saved.",
      "Explain PK/FK, INNER/LEFT JOIN and grouping.",
      "Explain SQL parameters versus concatenation; blocked setup is reported honestly."
    ],
    "resources": [
      {
        "title": "Amazon: Database Management with Java and SQL",
        "url": "https://www.coursera.org/learn/database-management-with-java-and-sql",
        "kind": "course"
      },
      {
        "title": "PostgreSQL tutorial",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d6-b-1",
      "w01-d6-b-2",
      "w02-d5-b-1",
      "w02-d5-b-2",
      "w03-d2-b-1"
    ],
    "issueNumbers": [
      1,
      4,
      7
    ]
  },
  {
    "id": "persistence",
    "title": "PostgreSQL, JPA & migrations",
    "track": "backend",
    "week": 3,
    "group": "backend-app",
    "description": "Persist the same application after the G2 HTTP/SQL gate. A short JDBC operation builds understanding before JPA integration.",
    "prerequisites": [
      "spring",
      "sql"
    ],
    "exercise": "Apply a migration, parameterize one JDBC operation, then switch repository storage to PostgreSQL. Restart the app and reload a task.",
    "criteria": [
      "An empty database migrates and a second start makes no destructive schema change.",
      "A task survives restart and the changed layer is explained.",
      "Real PostgreSQL save/reload, missing-ID and constraint checks run."
    ],
    "resources": [
      {
        "title": "Amazon: Database Management with Java and SQL",
        "url": "https://www.coursera.org/learn/database-management-with-java-and-sql",
        "kind": "course"
      },
      {
        "title": "Spring JPA guide",
        "url": "https://spring.io/guides/gs/accessing-data-jpa/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w03-d1-b-1",
      "w03-d2-b-1",
      "w03-d3-b-1",
      "w03-d4-b-1",
      "w03-d6-b-1"
    ],
    "issueNumbers": [
      7
    ],
    "milestone": true
  },
  {
    "id": "validation",
    "title": "Validation & error contracts",
    "track": "backend",
    "week": 4,
    "group": "backend-app",
    "description": "Request/response DTOs, course/task relationships, deliberate client errors and deletion behavior.",
    "prerequisites": [
      "persistence"
    ],
    "exercise": "Add Course persistence and a task association, validate requests, define a small error shape and verify delete behavior.",
    "criteria": [
      "Valid creation/linking succeeds; missing course and invalid payload fail deliberately.",
      "Blank title, invalid status and malformed input return 400.",
      "Delete returns 204 and subsequent read returns 404; FK enforcement is checked."
    ],
    "resources": [
      {
        "title": "Amazon: Full Stack Web Development",
        "url": "https://www.coursera.org/learn/fullstack-web-development",
        "kind": "course"
      },
      {
        "title": "Spring web testing",
        "url": "https://spring.io/guides/gs/testing-web/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w04-d1-b-1",
      "w04-d2-b-1",
      "w04-d3-b-1",
      "w04-d4-b-1"
    ],
    "issueNumbers": [
      10
    ]
  },
  {
    "id": "service-tests",
    "title": "Testing: mocks, HTTP & database",
    "track": "backend",
    "week": 5,
    "group": "backend-app",
    "description": "Separate what unit tests, Mockito isolation, HTTP tests and actual PostgreSQL integration tests prove. HTTP tests begin in Week 02.",
    "prerequisites": [
      "junit",
      "spring",
      "persistence"
    ],
    "exercise": "Build a behavior/test matrix, isolate one repository dependency with Mockito and test meaningful success/failure paths against the appropriate layer.",
    "criteria": [
      "Five meaningful HTTP success/error scenarios run from Week 02.",
      "A service regression is caught by assertions.",
      "Real PostgreSQL checks and mock-only checks are identified separately; commands/reports are reproducible."
    ],
    "resources": [
      {
        "title": "JUnit user guide",
        "url": "https://docs.junit.org/current/user-guide/",
        "kind": "reference"
      },
      {
        "title": "Mockito API",
        "url": "https://javadoc.io/doc/org.mockito/mockito-core/latest/org.mockito/org/mockito/Mockito.html",
        "kind": "reference"
      },
      {
        "title": "Spring testing reference",
        "url": "https://docs.spring.io/spring-boot/reference/testing/index.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w02-d4-b-1",
      "w02-d4-b-2",
      "w05-d1-b-1",
      "w05-d2-b-1",
      "w05-d4-b-1",
      "w05-d6-b-1"
    ],
    "issueNumbers": [
      4,
      13
    ]
  },
  {
    "id": "transactions",
    "title": "Transactions & query design",
    "track": "backend",
    "week": 5,
    "group": "backend-app",
    "description": "Atomic writes, rollback evidence, deterministic filters/pagination and inspection of the actual database behavior.",
    "prerequisites": [
      "validation",
      "service-tests"
    ],
    "exercise": "Force the second write in a two-task batch to fail and inspect committed database state. Add stable query/filter behavior in Week 06.",
    "criteria": [
      "Successful batch persists both rows; failure persists neither.",
      "The test setup does not hide behavior in a surrounding test transaction.",
      "Queries/pagination have deterministic expected results and reset instructions."
    ],
    "resources": [
      {
        "title": "Amazon: Database Management with Java and SQL",
        "url": "https://www.coursera.org/learn/database-management-with-java-and-sql",
        "kind": "course"
      },
      {
        "title": "PostgreSQL tutorial",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w05-d3-b-1",
      "w05-d4-b-1",
      "w05-d5-b-1",
      "w06-d1-b-1",
      "w06-d2-b-1",
      "w06-d3-b-1",
      "w06-d4-b-1"
    ],
    "issueNumbers": [
      13,
      16
    ]
  },
  {
    "id": "docker",
    "title": "Docker & Compose",
    "track": "backend",
    "week": 7,
    "group": "delivery",
    "description": "Package the existing application with PostgreSQL, service networking, readiness and durable storage.",
    "prerequisites": [
      "transactions"
    ],
    "exercise": "Start the app and database from documented Compose commands; exercise an API flow, restart services and confirm persistence.",
    "criteria": [
      "App+DB start without relying on a forgotten host process.",
      "Readiness, configuration and volume behavior are explained.",
      "A task survives restart; destructive reset commands are clearly identified."
    ],
    "resources": [
      {
        "title": "Docker Compose quickstart",
        "url": "https://docs.docker.com/compose/gettingstarted/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w07-d1-b-1",
      "w07-d2-b-1",
      "w07-d3-b-1",
      "w07-d4-b-1",
      "w07-d6-b-1"
    ],
    "issueNumbers": [
      19
    ]
  },
  {
    "id": "ci",
    "title": "CI & reproducibility",
    "track": "backend",
    "week": 8,
    "group": "delivery",
    "description": "A green build must actually execute intended unit, HTTP and real PostgreSQL integration tests.",
    "prerequisites": [
      "docker",
      "service-tests"
    ],
    "exercise": "Configure the documented Maven verification workflow in CI, inspect test reports and repeat from a clean environment.",
    "criteria": [
      "CI includes actual PostgreSQL tests, not only mocks or H2.",
      "Test discovery/reports show the intended integration cases ran.",
      "G3 documented app+DB startup and verification are reproducible."
    ],
    "resources": [
      {
        "title": "Maven getting started",
        "url": "https://maven.apache.org/guides/getting-started/",
        "kind": "reference"
      },
      {
        "title": "GitHub Actions documentation",
        "url": "https://docs.github.com/en/actions",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w08-d1-b-1",
      "w08-d2-b-1",
      "w08-d3-b-1",
      "w08-d4-b-1",
      "w08-d6-b-1",
      "w08-d7-b-1"
    ],
    "issueNumbers": [
      22
    ],
    "milestone": true
  },
  {
    "id": "release",
    "title": "Deployment rehearsal & release",
    "track": "backend",
    "week": 9,
    "group": "delivery",
    "description": "Local deployment, health/logs, restart persistence and backup restore are sufficient. Hosted deployment is optional; final clean-checkout release is Week 12.",
    "prerequisites": [
      "ci"
    ],
    "exercise": "Run the packaged/containerized app on Ubuntu, inspect health/logs and restore a backup in a disposable database. Rehearse from a fresh checkout at Week 12.",
    "criteria": [
      "Exact revision, commands and HTTP smoke evidence are recorded.",
      "Restart persistence and a disposable restore are verified.",
      "Final demo and limitations are accurate; no paid hosting is required."
    ],
    "resources": [
      {
        "title": "Existing deployment and scope rules",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/blob/main/ROADMAP.md#deployment-and-scope-control",
        "kind": "reference"
      },
      {
        "title": "Docker Compose quickstart",
        "url": "https://docs.docker.com/compose/gettingstarted/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w09-d1-b-1",
      "w09-d2-b-1",
      "w09-d3-b-1",
      "w09-d4-b-1",
      "w09-d6-b-1",
      "w12-d1-b-1",
      "w12-d2-b-1",
      "w12-d3-b-1",
      "w12-d4-b-1",
      "w12-d6-b-1",
      "w12-d7-b-1"
    ],
    "issueNumbers": [
      25,
      34
    ],
    "milestone": true
  },
  {
    "id": "portfolio",
    "title": "Portfolio & internship preparation",
    "track": "backend",
    "week": 10,
    "group": "delivery",
    "description": "Explain only what your own tested application demonstrates; prepare a focused CV and short debugging/tradeoff stories.",
    "prerequisites": [
      "spring"
    ],
    "exercise": "Practice a five-minute project explanation, prepare a one-page CV and log suitable role requirements or applications honestly.",
    "criteria": [
      "CV claims link to demonstrated behavior and test evidence.",
      "Explain one debugging story and one design tradeoff.",
      "Actual intake eligibility and deadlines are checked before applying."
    ],
    "resources": [
      {
        "title": "Existing internship preparation",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/blob/main/ROADMAP.md#internship-practice-within-the-backend-budget",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w09-d5-b-1",
      "w10-d5-b-1",
      "w10-d6-b-1",
      "w11-d5-b-1",
      "w11-d6-b-1"
    ],
    "issueNumbers": [
      25,
      28,
      31
    ]
  },
  {
    "id": "epam",
    "title": "EPAM Java Readiness",
    "track": "backend",
    "week": 11,
    "group": "delivery",
    "description": "Our internal evidence checkpoint, not an EPAM certificate or official cutoff. Assessment A/B use existing Week 11 slots; one bounded retry replaces Week 12 mock time.",
    "prerequisites": [
      "generics",
      "lambdas",
      "streams",
      "io",
      "algorithms",
      "git-maven",
      "junit",
      "sql",
      "spring",
      "service-tests"
    ],
    "exercise": "Independently attempt A (120m) and B (120m) with fresh prompts. Keep original results separate from corrections; retry the weakest component for up to 60m in Week 12.",
    "criteria": [
      "A: at least 8/10 reasoned concept answers plus independent typed algorithm and stream attempts with edge cases and complexity explanations.",
      "B: reproducible I/O, JUnit/Maven, SQL and Spring evidence, plus an English explanation.",
      "Issue #37 records all ten requirements; unresolved gaps remain open. Its evidence index adds zero study hours."
    ],
    "resources": [
      {
        "title": "EPAM official Java skills roadmap",
        "url": "https://campus.epam.com/en/skills-roadmap/Java",
        "kind": "reference"
      },
      {
        "title": "Assessment prompts and internal rubric",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/blob/main/EPAM_READINESS.md",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w11-d3-b-1",
      "w11-d4-b-1",
      "w11-d7-b-1",
      "w12-d5-b-1"
    ],
    "issueNumbers": [
      31,
      34,
      37
    ],
    "milestone": true
  },
  {
    "id": "python",
    "title": "Python foundations",
    "track": "data",
    "week": 1,
    "group": "data-foundations",
    "description": "Continue the actual current IBM unit. Functions, collections, files and rerunnable notebooks come before later data topics. No certificate completion is inferred. ",
    "prerequisites": [],
    "exercise": "Produce a small runnable script/notebook, explain inputs/outputs and load or transform a tiny dataset when ready.",
    "criteria": [
      "Record the actual IBM course/unit, or label work as free-reference practice.",
      "The artifact reruns and one error/fix is explained.",
      "A precise next lab step is recorded inside the 4h weekly budget."
    ],
    "resources": [
      {
        "title": "IBM: Data Science Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
        "kind": "course"
      },
      {
        "title": "Python tutorial · free reference",
        "url": "https://docs.python.org/3/tutorial/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d2-i-1",
      "w01-d4-i-1",
      "w01-d6-i-1",
      "w02-d2-i-1",
      "w02-d4-i-1",
      "w02-d6-i-1"
    ],
    "issueNumbers": [
      2,
      5
    ]
  },
  {
    "id": "numpy",
    "title": "NumPy basics",
    "track": "data",
    "week": 3,
    "group": "data-foundations",
    "description": "A small array prerequisite inside relevant existing data-lab time; this is not an additional weekly assignment.",
    "prerequisites": [
      "python"
    ],
    "exercise": "When the current IBM unit needs arrays, compare one Python list operation with a NumPy array operation and explain shape/dtype.",
    "criteria": [
      "One array result reruns with predicted output.",
      "Explain its shape, dtype and one indexing operation.",
      "If the enrolled unit has not reached arrays, keep this topic unstarted rather than add hours."
    ],
    "resources": [
      {
        "title": "IBM: Data Science Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
        "kind": "course"
      },
      {
        "title": "NumPy absolute beginner guide",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w03-d2-i-1",
      "w03-d4-i-1",
      "w03-d6-i-1"
    ],
    "issueNumbers": [
      8
    ]
  },
  {
    "id": "pandas",
    "title": "pandas & data quality",
    "track": "data",
    "week": 3,
    "group": "data-foundations",
    "description": "Loading, filtering, grouping and missing-value checks. Calendar weeks are suggestions; unresolved Python prerequisites take precedence.",
    "prerequisites": [
      "python"
    ],
    "exercise": "Load a small dataset, create an explained summary and verify a missing-value or row-count invariant.",
    "criteria": [
      "Notebook/script reruns from raw input.",
      "One selection or aggregate is interpreted in plain language.",
      "Missing-value handling and before/after counts are explicit."
    ],
    "resources": [
      {
        "title": "IBM: Data Science Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
        "kind": "course"
      },
      {
        "title": "pandas getting started",
        "url": "https://pandas.pydata.org/docs/getting_started/index.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w03-d2-i-1",
      "w03-d4-i-1",
      "w03-d6-i-1",
      "w04-d2-i-1",
      "w04-d4-i-1",
      "w04-d6-i-1",
      "w05-d2-i-1",
      "w05-d4-i-1",
      "w05-d6-i-1"
    ],
    "issueNumbers": [
      8,
      11,
      14
    ]
  },
  {
    "id": "statistics",
    "title": "Statistics & exploration",
    "track": "data",
    "week": 7,
    "group": "data-foundations",
    "description": "Descriptive summaries, exploration and plot interpretation after basic data handling. Use the current certificate unit rather than force the date.",
    "prerequisites": [
      "numpy",
      "pandas"
    ],
    "exercise": "Summarize a small dataset and compare two subsets with a meaningful visualization and one limitation.",
    "criteria": [
      "Outputs rerun and plots have explained axes.",
      "Three observations are supported by the data.",
      "Distinguish descriptive findings from unsupported causal claims."
    ],
    "resources": [
      {
        "title": "IBM: Data Science Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
        "kind": "course"
      },
      {
        "title": "Statistics learning reference",
        "url": "https://docs.scipy.org/doc/scipy/tutorial/stats.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w06-d2-i-1",
      "w06-d4-i-1",
      "w06-d6-i-1",
      "w07-d2-i-1",
      "w07-d4-i-1",
      "w07-d6-i-1"
    ],
    "issueNumbers": [
      17,
      20
    ]
  },
  {
    "id": "evaluation",
    "title": "Splits & model evaluation",
    "track": "data",
    "week": 8,
    "group": "data-ml",
    "description": "Only when the current IBM lab and foundations are ready: separate train/test data, use a simple baseline and identify leakage.",
    "prerequisites": [
      "statistics"
    ],
    "exercise": "In the existing certificate lab, explain a valid split and compare a baseline using an appropriate metric. Otherwise continue the actual current unit.",
    "criteria": [
      "Training and held-out evaluation roles are explained.",
      "One relevant metric and limitation are recorded.",
      "No prerequisite is skipped or certificate progress invented to match Week 08."
    ],
    "resources": [
      {
        "title": "IBM: Data Science Professional Certificate",
        "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
        "kind": "course"
      },
      {
        "title": "Google ML prerequisite checklist",
        "url": "https://developers.google.com/machine-learning/crash-course/prereqs-and-prework",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w08-d2-i-1",
      "w08-d4-i-1",
      "w08-d6-i-1",
      "w09-d2-i-1",
      "w09-d4-i-1",
      "w09-d6-i-1"
    ],
    "issueNumbers": [
      23,
      26
    ]
  },
  {
    "id": "machine-learning",
    "title": "Machine Learning · later",
    "track": "data",
    "week": 13,
    "group": "data-ml",
    "description": "Normally after Week 12. Review Python/data skills, algebra/functions, basic linear algebra and available capacity before starting Google ML.",
    "prerequisites": [
      "python",
      "numpy",
      "pandas",
      "statistics",
      "evaluation"
    ],
    "exercise": "Use Week 12 consolidation to assess the official prerequisites. Schedule the first ML unit only when ready, replacing future IBM study time rather than adding hours.",
    "criteria": [
      "Python/data/math prerequisite checklist has honest evidence.",
      "AGH deadlines and backend gaps have capacity reserved.",
      "A specific later learning slot is chosen; planning alone does not complete this skill."
    ],
    "resources": [
      {
        "title": "Google: Machine Learning Crash Course",
        "url": "https://developers.google.com/machine-learning/crash-course/prereqs-and-prework",
        "kind": "course"
      },
      {
        "title": "Google Machine Learning Crash Course",
        "url": "https://developers.google.com/machine-learning/crash-course/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w12-d2-i-1",
      "w12-d4-i-1",
      "w12-d6-i-1"
    ],
    "issueNumbers": [
      35
    ]
  },
  {
    "id": "agh-os",
    "title": "Operating Systems",
    "track": "agh",
    "week": 1,
    "group": "agh",
    "description": "Follow the actual AGH Bash/process/thread/IPC/synchronization/memory/filesystem/socket/security brief. Week outlines are provisional, not lecture dates.",
    "prerequisites": [],
    "exercise": "Read the latest exercise and verify one required behavior with commands or a trace, using the assigned language and safe disposable fixtures.",
    "criteria": [
      "Authoritative brief, required tools and real deadline are recorded.",
      "Observed output or an interleaving supports the explanation.",
      "Required submission evidence is recorded separately from practice."
    ],
    "resources": [
      {
        "title": "IBM: Linux Commands & Shell Scripting",
        "url": "https://www.coursera.org/learn/hands-on-introduction-to-linux-commands-and-shell-scripting",
        "kind": "course"
      },
      {
        "title": "Linux manual pages",
        "url": "https://man7.org/linux/man-pages/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d1-a-1",
      "w01-d1-a-2",
      "w02-d1-a-1",
      "w03-d1-a-1",
      "w04-d1-a-1",
      "w05-d1-a-1",
      "w06-d1-a-1",
      "w07-d1-a-1",
      "w08-d1-a-1",
      "w09-d1-a-1",
      "w10-d1-a-1",
      "w11-d1-a-1",
      "w12-d1-a-1"
    ],
    "issueNumbers": [
      3,
      6,
      9,
      12,
      15,
      18,
      21,
      24,
      27,
      30,
      33,
      36
    ]
  },
  {
    "id": "agh-databases",
    "title": "Databases I",
    "track": "agh",
    "week": 1,
    "group": "agh",
    "description": "Reuse SQL concepts while preserving the lecturer’s required database/tooling. PostgreSQL practice does not replace a Base/HSQLDB assignment.",
    "prerequisites": [],
    "exercise": "Execute the current required schema/query/form/report task; predict join or aggregation results, including a zero-match case when relevant.",
    "criteria": [
      "Current rubric and actual tool are verified.",
      "Required outputs match predictions or differences are explained.",
      "Submission status and outstanding work are recorded honestly."
    ],
    "resources": [
      {
        "title": "Record the actual AGH brief and deadline",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/issues/3#agh-brief",
        "kind": "reference"
      },
      {
        "title": "Amazon: Database Management with Java and SQL",
        "url": "https://www.coursera.org/learn/database-management-with-java-and-sql",
        "kind": "course"
      },
      {
        "title": "PostgreSQL tutorial",
        "url": "https://www.postgresql.org/docs/current/tutorial.html",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d6-a-1",
      "w02-d6-a-1",
      "w03-d6-a-1",
      "w04-d6-a-1",
      "w05-d6-a-1",
      "w06-d6-a-1",
      "w07-d6-a-1",
      "w08-d6-a-1",
      "w09-d6-a-1",
      "w10-d6-a-1",
      "w11-d6-a-1",
      "w12-d6-a-1"
    ],
    "issueNumbers": [
      3,
      6,
      9,
      12,
      15,
      18,
      21,
      24,
      27,
      30,
      33,
      36
    ]
  },
  {
    "id": "agh-java",
    "title": "AGH Java OOP",
    "track": "agh",
    "week": 1,
    "group": "agh",
    "description": "University Java tasks remain distinct from the portfolio app. Trace the learner’s own code and meet the current console/input/file rules.",
    "prerequisites": [],
    "exercise": "Compile/run the current assigned Java task and check two normal cases plus a boundary case from its rubric.",
    "criteria": [
      "The required program compiles and runs.",
      "Checks demonstrate the actual assigned behaviors.",
      "Explain an OOP decision and record the submission receipt or remaining blocker."
    ],
    "resources": [
      {
        "title": "Record the actual AGH brief and deadline",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/issues/3#agh-brief",
        "kind": "reference"
      },
      {
        "title": "Amazon: Programming with Java",
        "url": "https://www.coursera.org/learn/programming-with-java",
        "kind": "course"
      },
      {
        "title": "Dev.java · learn Java",
        "url": "https://dev.java/learn/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d3-a-1",
      "w02-d3-a-1",
      "w03-d3-a-1",
      "w04-d3-a-1",
      "w05-d3-a-1",
      "w06-d3-a-1",
      "w07-d3-a-1",
      "w08-d3-a-1",
      "w09-d3-a-1",
      "w10-d3-a-1",
      "w11-d3-a-1",
      "w12-d3-a-1"
    ],
    "issueNumbers": [
      3,
      6,
      9,
      12,
      15,
      18,
      21,
      24,
      27,
      30,
      33,
      36
    ]
  },
  {
    "id": "agh-web",
    "title": "Web Technologies & Flask",
    "track": "agh",
    "week": 1,
    "group": "agh",
    "description": "HTML/CSS, responsive layout, JavaScript, HTTP and Flask as assigned. Spring Boot never substitutes for a Flask submission.",
    "prerequisites": [],
    "exercise": "Implement or verify one rubric-derived page/form/route behavior and one invalid-input path in the required stack.",
    "criteria": [
      "Wide/narrow layout or required route behavior is observed.",
      "Request/response and error-path evidence are recorded.",
      "Current Flask, testing or deployment requirements are met in the assigned tools."
    ],
    "resources": [
      {
        "title": "IBM: Python & Flask Applications",
        "url": "https://www.coursera.org/learn/python-project-for-ai-application-development",
        "kind": "course"
      },
      {
        "title": "MDN web development",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development",
        "kind": "reference"
      },
      {
        "title": "Flask tutorial",
        "url": "https://flask.palletsprojects.com/en/stable/tutorial/",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d5-a-1",
      "w02-d5-a-1",
      "w03-d5-a-1",
      "w04-d5-a-1",
      "w05-d5-a-1",
      "w06-d5-a-1",
      "w07-d5-a-1",
      "w08-d5-a-1",
      "w09-d5-a-1",
      "w10-d5-a-1",
      "w11-d5-a-1",
      "w12-d5-a-1"
    ],
    "issueNumbers": [
      3,
      6,
      9,
      12,
      15,
      18,
      21,
      24,
      27,
      30,
      33,
      36
    ]
  },
  {
    "id": "agh-assignments",
    "title": "Assignments & deadlines",
    "track": "agh",
    "week": 1,
    "group": "agh",
    "description": "Always check university work first. Unknown deadlines need verification; urgent required work replaces generic preparation and may rebalance 60/20/20.",
    "prerequisites": [],
    "exercise": "Check all four current briefs, record the verified due time/time zone, and choose the earliest required next action. Reschedule remaining study without resetting evidence.",
    "criteria": [
      "Every subject has an authoritative source and next action, or an explicit follow-up for unknown information.",
      "Mandatory work is reserved before optional study.",
      "Completed tasks, original milestones and comments are preserved when rescheduling."
    ],
    "resources": [
      {
        "title": "Record the actual AGH brief and deadline",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/issues/3#agh-brief",
        "kind": "reference"
      },
      {
        "title": "Weekly reset and rescheduling",
        "url": "https://github.com/ivanshevchuk0/java-backend-roadmap/blob/main/GITHUB_PROJECTS.md#weekly-reset",
        "kind": "reference"
      }
    ],
    "taskIds": [
      "w01-d1-a-1"
    ],
    "issueNumbers": [
      3
    ],
    "milestone": true
  }
];
