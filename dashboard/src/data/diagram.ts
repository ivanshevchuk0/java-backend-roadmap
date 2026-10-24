import type { Topic } from './skills';

export type TrackId = Topic['track'];

/** Only topicId denotes a tracked skill. References open an existing topic without adding progress. */
export interface DiagramEntry {
  id: string;
  label: string;
  topicId?: string;
  referenceTopicId?: string;
  optional?: boolean;
  description?: string;
}

export interface DiagramGroup {
  id: string;
  title: string;
  entries: DiagramEntry[];
}

export interface DiagramSection {
  id: string;
  title: string;
  topicId?: string;
  referenceTopicId?: string;
  description?: string;
  optional?: boolean;
  left?: DiagramGroup;
  right?: DiagramGroup;
}

const reference = (id: string, label: string, referenceTopicId: string, optional = false): DiagramEntry => ({
  id, label, referenceTopicId, ...(optional ? { optional: true } : {}),
  description: 'A concept within the linked existing skill. This reference has no separate completion status or additional study hours.',
});
const skill = (topicId: string, label: string): DiagramEntry => ({ id: topicId, label, topicId });
const group = (id: string, title: string, entries: DiagramEntry[]): DiagramGroup => ({ id, title, entries });

/** Curated reading order, not a new prerequisite graph or a replacement for the 12-week schedule. */
export const diagramSections: Record<TrackId, DiagramSection[]> = {
  backend: [
    {
      id: 'java-basics', title: 'Java Basics', topicId: 'core-java',
      left: group('java-language', 'Language essentials', [reference('types', 'Types, strings & arrays', 'core-java'), reference('control-flow', 'Methods & control flow', 'core-java')]),
      right: group('java-runtime', 'Understand execution', [reference('state', 'State & pass-by-value', 'core-java'), reference('jvm', 'JDK, JVM & compilation', 'core-java')]),
    },
    {
      id: 'object-oriented', title: 'OOP', topicId: 'oop',
      left: group('oop-design', 'Model your domain', [reference('encapsulation', 'Classes & encapsulation', 'oop'), reference('composition', 'Composition & inheritance', 'oop')]),
      right: group('oop-contracts', 'Contracts', [reference('interfaces', 'Interfaces & polymorphism', 'oop'), reference('constructors', 'Constructors & injection', 'oop')]),
    },
    {
      id: 'collections-generics', title: 'Collections & Generics', topicId: 'collections',
      left: group('collection-types', 'Choose a collection', [reference('list-set-map', 'List, Set, Map & Queue', 'collections'), reference('equality', 'equals & hashCode', 'collections')]),
      right: group('type-safety', 'Type safety', [skill('generics', 'Generics'), reference('bounds', 'Bounds & wildcards', 'generics')]),
    },
    {
      id: 'functional-java', title: 'Lambdas & Streams', topicId: 'lambdas',
      left: group('lambda-contracts', 'Functional Java', [reference('functional-interfaces', 'Functional interfaces', 'lambdas')]),
      right: group('stream-pipelines', 'Process collections', [skill('streams', 'Streams'), reference('collectors', 'Collectors & Optional', 'streams')]),
    },
    {
      id: 'exception-handling', title: 'Exception Handling', referenceTopicId: 'core-java',
      description: 'A Core Java focus guide, not a separate tracked skill. Use existing Java exercises to explain invalid inputs and deliberate failure outcomes.',
      left: group('exception-types', 'Reason about failures', [reference('checked-unchecked', 'Checked & unchecked', 'core-java')]),
      right: group('exception-contracts', 'Handle failures', [reference('try-catch', 'try, catch, finally & throw', 'core-java')]),
    },
    {
      id: 'java-io', title: 'I/O & Files', topicId: 'io',
      left: group('file-api', 'Read & write', [reference('paths', 'Path, Files & text', 'io')]),
      right: group('resource-safety', 'Close resources', [reference('try-with-resources', 'try-with-resources', 'io')]),
    },
    {
      id: 'concurrency-guide', title: 'Concurrency', referenceTopicId: 'agh-os', optional: true,
      description: 'Optional Java-context guide to existing AGH Operating Systems foundations. Follow the current AGH brief; this adds no Java concurrency project, completion state, or study hours.',
      left: group('concurrency-foundations', 'AGH OS foundations', [reference('processes-threads', 'Processes vs. threads', 'agh-os', true)]),
      right: group('concurrency-safety', 'Coordinate safely', [reference('synchronization', 'Synchronization & deadlocks', 'agh-os', true)]),
    },
    {
      id: 'build-tools', title: 'Maven & Git', topicId: 'git-maven',
      description: 'Use from Week 1. Position in this overview groups the toolchain; it does not delay Maven, JUnit, or the Week 2 Spring Boot gate.',
      left: group('maven-lifecycle', 'Build reproducibly', [reference('lifecycle', 'Lifecycle & dependencies', 'git-maven')]),
      right: group('git-workflow', 'Keep changes reviewable', [reference('commits', 'Commits, branches & diffs', 'git-maven')]),
    },
    {
      id: 'databases', title: 'SQL & JDBC', topicId: 'sql',
      left: group('relational-design', 'Relational foundations', [reference('sql-queries', 'Queries, joins & constraints', 'sql'), reference('jdbc', 'JDBC & prepared statements', 'sql')]),
      right: group('database-behavior', 'Reason about data', [skill('transactions', 'Transactions & query design')]),
    },
    {
      id: 'spring-boot', title: 'Spring Boot', topicId: 'spring',
      description: 'Begin around Week 2 after the existing G1 gate. Earlier diagram sections are a reference order, not extra prerequisites for Spring Boot.',
      left: group('spring-container', 'Application foundations', [reference('spring-di', 'Beans & dependency injection', 'spring')]),
      right: group('spring-configuration', 'Start small', [reference('spring-config', 'Configuration & auto-config', 'spring')]),
    },
    {
      id: 'rest-api', title: 'REST APIs', topicId: 'http',
      left: group('http-contracts', 'Design the contract', [reference('http-methods', 'HTTP methods & status codes', 'http')]),
      right: group('api-errors', 'Handle bad input', [skill('validation', 'Validation & error contracts')]),
    },
    {
      id: 'spring-data', title: 'Spring Data JPA', topicId: 'persistence',
      left: group('persistence-model', 'Map your data', [reference('entities', 'Entities & repositories', 'persistence')]),
      right: group('database-evolution', 'Evolve the database', [reference('postgres-migrations', 'PostgreSQL & migrations', 'persistence')]),
    },
    {
      id: 'testing', title: 'Testing', topicId: 'service-tests',
      description: 'JUnit starts in Week 1. This section gathers testing layers around the same evolving application.',
      left: group('unit-testing', 'Fast feedback', [skill('junit', 'JUnit foundations'), reference('mockito', 'Mockito & test doubles', 'service-tests')]),
      right: group('integration-testing', 'Verify boundaries', [reference('http-database-tests', 'HTTP & database tests', 'service-tests')]),
    },
    {
      id: 'delivery', title: 'Docker & Deployment', topicId: 'docker',
      left: group('reproducible-delivery', 'Reproduce the build', [skill('ci', 'CI & reproducibility')]),
      right: group('ship-application', 'Run the application', [skill('release', 'Deployment rehearsal & release')]),
    },
    {
      id: 'epam-readiness', title: 'EPAM Java Readiness', topicId: 'epam',
      left: group('assessment-practice', 'Solve & explain', [skill('algorithms', 'Algorithms & complexity')]),
      right: group('career-evidence', 'Present your evidence', [skill('portfolio', 'Portfolio & internship preparation')]),
    },
  ],
  data: [
    {
      id: 'python-foundations', title: 'Python', topicId: 'python',
      left: group('python-language', 'IBM foundations', [reference('python-functions', 'Types, functions & collections', 'python')]),
      right: group('python-workflow', 'Practice in notebooks', [reference('python-notebooks', 'Notebooks & small exercises', 'python')]),
    },
    {
      id: 'numpy-foundations', title: 'NumPy', topicId: 'numpy',
      left: group('array-operations', 'Array thinking', [reference('numpy-arrays', 'Shapes, indexing & operations', 'numpy')]),
    },
    {
      id: 'pandas-foundations', title: 'pandas', topicId: 'pandas',
      right: group('data-quality', 'Prepare real data', [reference('pandas-cleaning', 'Missing values & data quality', 'pandas')]),
    },
    {
      id: 'statistics-foundations', title: 'Statistics', topicId: 'statistics',
      left: group('data-exploration', 'Explore before modeling', [reference('descriptive-statistics', 'Summaries & distributions', 'statistics')]),
      right: group('statistical-reasoning', 'Explain the evidence', [reference('correlation', 'Correlation & uncertainty', 'statistics')]),
    },
    {
      id: 'evaluation-foundations', title: 'Model Evaluation', topicId: 'evaluation',
      left: group('honest-evaluation', 'Avoid leakage', [reference('data-splits', 'Train / validation / test splits', 'evaluation')]),
      right: group('model-metrics', 'Measure the result', [reference('evaluation-metrics', 'Baseline & suitable metrics', 'evaluation')]),
    },
    {
      id: 'later-machine-learning', title: 'Machine Learning · later', topicId: 'machine-learning', optional: true,
      description: 'Normally after Week 12, once Python, data handling, statistics, and evaluation are ready. No extra hours are added to the current plan.',
      left: group('later-ml-study', 'After the foundations', [reference('ml-course', 'Google ML Crash Course', 'machine-learning', true)]),
    },
  ],
  agh: [
    {
      id: 'agh-deadlines', title: 'Assignments & Deadlines', topicId: 'agh-assignments',
      description: 'Start here whenever university work is urgent. Lines in the AGH diagram organize subjects; they do not impose prerequisites between courses.',
      left: group('agh-planning', 'Current university brief', [reference('assignment-priority', 'Deadlines before study ratios', 'agh-assignments')]),
      right: group('agh-evidence', 'Submit working evidence', [reference('assignment-check', 'Run the required checks', 'agh-assignments')]),
    },
    {
      id: 'agh-os-subject', title: 'Operating Systems', topicId: 'agh-os',
      left: group('agh-os-processes', 'Processes & coordination', [reference('agh-bash', 'Bash, processes & IPC', 'agh-os'), reference('agh-sync', 'Threads, locks & deadlocks', 'agh-os')]),
      right: group('agh-os-memory', 'Systems foundations', [reference('agh-memory', 'Memory & file systems', 'agh-os'), reference('agh-sockets', 'Sockets & security', 'agh-os')]),
    },
    {
      id: 'agh-database-subject', title: 'Databases I', topicId: 'agh-databases',
      left: group('agh-database-theory', 'Current lecture & lab', [reference('agh-db-model', 'Relational modeling & SQL', 'agh-databases')]),
      right: group('agh-database-practice', 'Prove query behavior', [reference('agh-db-queries', 'Constraints & query cases', 'agh-databases')]),
    },
    {
      id: 'agh-java-subject', title: 'Java OOP', topicId: 'agh-java',
      left: group('agh-java-labs', 'Current Java exercises', [reference('agh-oop', 'Classes, interfaces & objects', 'agh-java')]),
      right: group('agh-java-checks', 'Explain your program', [reference('agh-java-traces', 'Compile, trace & test', 'agh-java')]),
    },
    {
      id: 'agh-web-subject', title: 'Web Technologies', topicId: 'agh-web',
      description: 'Complete Flask assignments in Flask. The Java backend project does not replace the current AGH web brief.',
      left: group('agh-web-browser', 'Browser foundations', [reference('agh-html-css', 'HTML, CSS & JavaScript', 'agh-web')]),
      right: group('agh-web-server', 'Use the assigned stack', [reference('agh-flask', 'Flask, REST & deployment', 'agh-web')]),
    },
  ],
};

export const DIAGRAM_LAYOUT = {
  width: 980,
  centerX: 490,
  centerNodeX: 390,
  centerNodeWidth: 200,
  centerNodeHeight: 46,
  leftGroupX: 30,
  rightGroupX: 670,
  groupWidth: 280,
  groupHeaderHeight: 0,
  groupPadding: 14,
  entryWidth: 252,
  entryHeight: 38,
  entryStep: 44,
  sectionPadding: 20,
  sectionGap: 24,
  minSectionHeight: 150,
  collapsedHeight: 94,
  outerPadding: 40,
} as const;

export interface EntryPlacement {
  entry: DiagramEntry;
  x: number;
  y: number;
  width: number;
  height: number;
  centerY: number;
}
export interface GroupPlacement {
  group: DiagramGroup;
  x: number;
  y: number;
  width: number;
  height: number;
  entries: EntryPlacement[];
}
export interface SectionPlacement {
  section: DiagramSection;
  y: number;
  height: number;
  centerY: number;
  collapsed: boolean;
  left?: GroupPlacement;
  right?: GroupPlacement;
}
export interface DiagramLayout {
  width: number;
  totalHeight: number;
  sections: SectionPlacement[];
}

const groupHeight = (value?: DiagramGroup): number => !value?.entries.length ? 0
  : DIAGRAM_LAYOUT.groupHeaderHeight + DIAGRAM_LAYOUT.groupPadding * 2
    + DIAGRAM_LAYOUT.entryHeight + (value.entries.length - 1) * DIAGRAM_LAYOUT.entryStep;

/** Geometry depends only on the chosen track and collapsed sections, never on progress or status. */
export function layoutDiagram(track: TrackId, collapsedSections: ReadonlySet<string> = new Set()): DiagramLayout {
  return layoutSections(diagramSections[track], collapsedSections);
}

/** The same deterministic geometry also lays out the independent Java Developer map. */
export function layoutSections(sections: readonly DiagramSection[], collapsedSections: ReadonlySet<string> = new Set()): DiagramLayout {
  const d = DIAGRAM_LAYOUT;
  let nextY: number = d.outerPadding;
  const placements = sections.map((section): SectionPlacement => {
    const collapsed = collapsedSections.has(section.id);
    const height = collapsed ? d.collapsedHeight
      : Math.max(d.minSectionHeight, groupHeight(section.left) + d.sectionPadding * 2, groupHeight(section.right) + d.sectionPadding * 2);
    const y = nextY;
    const centerY = y + height / 2;
    const placeGroup = (value: DiagramGroup | undefined, x: number): GroupPlacement | undefined => {
      if (collapsed || !value?.entries.length) return undefined;
      const height = groupHeight(value);
      const y = centerY - height / 2;
      return {
        group: value, x, y, width: d.groupWidth, height,
        entries: value.entries.map((entry, index) => {
          const entryY = y + d.groupHeaderHeight + d.groupPadding + index * d.entryStep;
          return { entry, x: x + d.groupPadding, y: entryY, width: d.entryWidth, height: d.entryHeight, centerY: entryY + d.entryHeight / 2 };
        }),
      };
    };
    nextY += height + d.sectionGap;
    return { section, y, height, centerY, collapsed, left: placeGroup(section.left, d.leftGroupX), right: placeGroup(section.right, d.rightGroupX) };
  });
  return { width: d.width, totalHeight: nextY - d.sectionGap + d.outerPadding, sections: placements };
}
