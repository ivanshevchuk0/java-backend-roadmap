/** Original project ideas, not another course checklist or a promise of completed work.
 * Choose the evolving StudyTask application first. Other entries are alternatives or
 * later experiments that replace optional scope; they add no hours to the 12-week plan.
 * Repository links, evidence and status belong to the user's project progress record.
 */
export interface ProjectDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'CLI' | 'Backend API' | 'Database' | 'Full-Stack';
  skillIds: string[];
  objectives: string[];
  criteria: string[];
  extensions?: string[];
}

export const projectCatalog: ProjectDefinition[] = [
  {
    id: 'study-task-backend',
    title: 'StudyTask — your evolving backend',
    description: 'Primary portfolio choice: continue the same Course/StudyTask Spring Boot + PostgreSQL application from the roadmap. Grow it through tested vertical slices instead of starting a new tutorial app. Link existing evidence here; this catalogue does not duplicate or automatically complete weekly tasks.',
    difficulty: 'intermediate', category: 'Backend API',
    skillIds: ['oop', 'spring', 'http', 'sql', 'persistence', 'validation', 'service-tests', 'docker', 'ci', 'release'],
    objectives: [
      'Model tasks and courses with a small, explainable controller/service/repository boundary.',
      'Persist data with explicit migrations, deliberate client errors and predictable query results.',
      'Prove behavior through unit, HTTP and actual PostgreSQL checks, then document a reproducible local run.',
    ],
    criteria: [
      'Create a course and task, read it, change status and delete it; verify expected 201/200/204 responses and relevant response data.',
      'Invalid input returns 400 and missing resources return 404; meaningful automated tests cover those paths and a deliberate regression is detected.',
      'An API-created task survives restart; migrations run on an empty PostgreSQL database and a repeat startup does not destroy existing data.',
      'Documented verification actually executes unit and PostgreSQL tests; inspect reports rather than count a green build that skipped them.',
      'A fresh checkout starts app + PostgreSQL using documented local/Compose commands; record the revision, smoke result and limitations. No paid hosting is required.',
    ],
    extensions: [
      'Use the existing later roadmap slots for CI, health/log evidence and a disposable backup-restore rehearsal.',
      'Only after core behavior is stable, choose one bounded extension from this catalogue instead of adding several new services.',
    ],
  },
  {
    id: 'library-cli', title: 'Library Lending CLI',
    description: 'An optional small plain-Java alternative for practicing OOP and collections. Keep books and loans in memory, with a fixed demonstration fixture or a few console commands. Prefer your existing StudyTask model if it already proves these skills.',
    difficulty: 'beginner', category: 'CLI',
    skillIds: ['core-java', 'oop', 'collections', 'junit', 'git-maven'],
    objectives: [
      'Express available/borrowed state through methods that protect valid transitions.',
      'Choose a typed collection for ID lookup and explain missing/duplicate behavior.',
      'Separate console handling from domain logic so rules can be tested without interactive input.',
    ],
    criteria: [
      'List a tiny book fixture, borrow one available book and return it; the displayed state matches each operation.',
      'An unknown ID and a second borrow of an already borrowed book produce deliberate outcomes without corrupting another book.',
      'Terminal JUnit tests verify normal borrowing, return and one invalid transition; explain the collection and object-state choices.',
    ],
    extensions: ['Add one search/filter operation only if the current domain tests remain clear; defer persistence and Spring.'],
  },
  {
    id: 'study-file-report', title: 'UTF-8 Study Session Report',
    description: 'A bounded file-I/O exercise using synthetic study sessions. Read a documented fixed line format and report minutes by subject. This can be a small fixture in an existing exercise repository, not another application to maintain.',
    difficulty: 'beginner', category: 'CLI',
    skillIds: ['io', 'java-path-files', 'java-buffered-io', 'java-try-resources', 'collections', 'junit'],
    objectives: [
      'Define a simple input contract with an explicit UTF-8 encoding and malformed-row policy.',
      'Separate parsing, aggregation and output while owning resource closure.',
      'Explain normal, empty, missing-file and invalid-row outcomes from observed results.',
    ],
    criteria: [
      'A tiny fixture containing a non-ASCII subject name produces the predicted per-subject totals.',
      'Empty input, a missing file and one malformed row have documented, tested behavior; no invalid row is silently counted.',
      'Output can be reproduced from the same input; tests exercise parsing/aggregation without relying on personal files or machine-specific paths.',
    ],
    extensions: ['Compare a loop and stream summary on the same fixture without changing the file contract.'],
  },
  {
    id: 'course-schema', title: 'Course & Task SQL Lab',
    description: 'A focused relational-schema option that directly supports the main StudyTask backend. Reuse your existing SQL exercises and query evidence if available. University database tasks still use the lecturer’s required tools and submission rules.',
    difficulty: 'beginner', category: 'Database',
    skillIds: ['sql', 'transactions', 'persistence'],
    objectives: [
      'Model course/task identity and referential integrity with a tiny relational fixture.',
      'Predict join and aggregation results, including a course with no tasks.',
      'Explain constraint failures and commit/rollback using actual database state.',
    ],
    criteria: [
      'The documented schema creates successfully in disposable PostgreSQL and rejects a task referencing a missing course.',
      'An executed LEFT JOIN/group-count query includes a zero-task course with the predicted count; filters return the expected fixed-fixture results.',
      'A small transaction success/failure demonstration shows the predicted committed rows, with reset commands and tool/version noted.',
    ],
    extensions: ['Inspect one query plan and justify an index only from observed query needs; avoid speculative tuning.'],
  },
  {
    id: 'jdbc-mini-catalog', title: 'JDBC Repository Fixture',
    description: 'An optional small direct-JDBC fixture for understanding what JPA wraps. Reuse the main app’s disposable schema or a tiny synthetic catalogue; do not build a second full CRUD backend just to finish a database course.',
    difficulty: 'intermediate', category: 'Database',
    skillIds: ['java-jdbc', 'java-prepared-statements', 'java-try-resources', 'sql', 'transactions', 'junit'],
    objectives: [
      'Bind values through PreparedStatement rather than concatenate SQL input.',
      'Map a result and represent a missing lookup deliberately.',
      'Demonstrate resource ownership and a transaction boundary against actual PostgreSQL.',
    ],
    criteria: [
      'A parameterized insert/lookup round-trip returns the expected synthetic value; a missing ID has a deliberate result.',
      'A two-write operation commits both values on success and neither after a forced second-write failure; inspect committed database state.',
      'Tests use an explicit disposable database/reset path, resources close on success/failure and configuration instructions contain no credentials.',
    ],
    extensions: ['Compare this boundary with the existing JPA repository and explain which boilerplate moved without rewriting the application.'],
  },
  {
    id: 'study-task-web-client', title: 'A Small StudyTask Web Client',
    description: 'An optional thin client for the existing backend, using HTML/CSS and a little JavaScript or the UI tooling you already know. It extends the same application rather than introducing another backend. It does not substitute for AGH Flask assignments.',
    difficulty: 'intermediate', category: 'Full-Stack',
    skillIds: ['http', 'spring', 'validation', 'persistence', 'service-tests'],
    objectives: [
      'Turn the existing documented API contract into a small usable create/list/status flow.',
      'Present loading, empty, success and error states with readable controls.',
      'Explain browser requests and backend validation rather than hide failures behind a success message.',
    ],
    criteria: [
      'Create a task, reload the page and change its status through the existing API; the displayed state matches PostgreSQL-backed results.',
      'An empty list, invalid title and unavailable API produce distinct understandable UI states; failed writes are not shown as completed.',
      'The focused page works at narrow and wide widths with keyboard-accessible labeled controls, and its run steps use the existing local backend.',
    ],
    extensions: ['Add one course/status filter that matches the existing API, then stop before authentication or a new frontend framework becomes a separate project.'],
  },
  {
    id: 'webhook-inbox', title: 'Retry-Safe Event Inbox',
    description: 'A later advanced extension for learning delivery semantics with synthetic task events. A local queue stub or direct retry fixture is sufficient; RabbitMQ/Kafka and cloud services are unnecessary. Choose this instead of other optional extensions.',
    difficulty: 'advanced', category: 'Backend API',
    skillIds: ['spring', 'persistence', 'transactions', 'service-tests', 'java-concurrency'],
    objectives: [
      'Define an event identifier and an observable processing result.',
      'Make repeated delivery safe through a deliberate idempotency boundary.',
      'Distinguish accepted delivery, failed processing, retry and successful acknowledgement.',
    ],
    criteria: [
      'A valid synthetic event changes the intended state once; a repeated event ID does not apply the change twice.',
      'A controlled processing failure leaves the defined database state intact and a later retry can reach the documented successful state.',
      'Automated checks cover duplicate, failure/retry and malformed-input cases; explain acknowledgement and ordering assumptions without claiming universal exactly-once delivery.',
    ],
    extensions: ['Only in a later cycle, replace the local delivery stub with one local broker and rerun the same contract checks.'],
  },
  {
    id: 'cached-course-report', title: 'A Cache with a Clear Freshness Rule',
    description: 'A later advanced experiment on one read-only course/task summary. A tiny in-process cache is enough to practice keys, expiry and invalidation; Redis is optional later. Keep the original uncached query as the correctness reference.',
    difficulty: 'advanced', category: 'Backend API',
    skillIds: ['sql', 'java-jpa-queries', 'transactions', 'service-tests', 'java-concurrency'],
    objectives: [
      'Define a cache key, stored result and freshness contract for one summary.',
      'Compare misses, hits and post-update behavior against the uncached result.',
      'Use a controllable time source or explicit invalidation to make verification deterministic.',
    ],
    criteria: [
      'For a fixed fixture, first read, repeated read and an update/expiry sequence return the documented values and observable hit/miss behavior.',
      'A deterministic test demonstrates stale-data prevention under the selected invalidation/TTL rule without sleeping to guess timing.',
      'Explain one concurrency/failure limitation and report any measurement separately; the presence of a cache is not evidence of a speedup.',
    ],
    extensions: ['If later using local Redis, preserve the same freshness tests and define behavior when the cache is unavailable.'],
  },
  {
    id: 'study-notes-assistant', title: 'Structured Study Notes Assistant',
    description: 'A later optional AI-integration experiment after core backend work. Start with a deterministic local stub that returns structured summaries of synthetic notes; a real free provider is optional. A stub demonstrates integration behavior, not model quality or ML mastery.',
    difficulty: 'advanced', category: 'Full-Stack',
    skillIds: ['spring', 'http', 'validation', 'service-tests', 'python'],
    objectives: [
      'Define a small request/response schema and isolate the provider behind an adapter.',
      'Treat provider output as untrusted data with explicit validation and length limits.',
      'Show clear loading/failure behavior without uploading private coursework or adding paid dependencies.',
    ],
    criteria: [
      'A valid synthetic note request produces a schema-valid response through the stub adapter and a readable UI result.',
      'Malformed provider output, an empty note and a simulated timeout are handled explicitly; the UI does not claim a successful summary after failure.',
      'Tests cover adapter success/failure and output validation; documentation identifies the stub, data boundary and any untested real-provider behavior.',
    ],
    extensions: ['Only if a genuinely free provider fits later capacity, swap the adapter and assess a small fixed evaluation set without committing credentials or claiming the stub validated the model.'],
  },
];
