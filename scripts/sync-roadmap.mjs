// Markdown stays the editorial source. Stable IDs keep saved progress across rebuilds.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const check = process.argv.includes('--check');
const clean = (text) => text.replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
const codes = { B: 'backend', I: 'data', A: 'agh' };
const backendTitles = [
  [], [],
  ['Database & first migration', 'JDBC to JPA', 'Connect the repository', 'PostgreSQL integration tests', 'Java & SQL practice', 'Prove restart persistence', 'Review the persistence checkpoint'],
  ['Validate API requests', 'Link tasks to courses', 'Consistent errors & deletion', 'Test the relationship', 'Collections & joins', 'Update the API contract', 'Review relationships & errors'],
  ['Map behaviors to tests', 'Isolate service behavior', 'Make a batch atomic', 'Prove transaction rollback', 'Java & transaction practice', 'Repeat the database checks', 'Review the testing checkpoint'],
  ['Design filters & page limits', 'Implement stable pagination', 'Test page boundaries', 'Inspect SQL & query plans', 'Sorting & SQL practice', 'Run the query regression suite', 'Review queries & tradeoffs'],
  ['Package the application', 'Compose app & PostgreSQL', 'Add startup readiness', 'Verify a clean environment', 'Review internship requirements', 'Write the run guide', 'Review reproducibility'],
  ['One full verification command', 'Run tests in CI', 'Prove CI catches failures', 'Check test isolation', 'Practice the project walkthrough', 'Document local CI reproduction', 'Review the reproducibility gate'],
  ['Plan a deployment rehearsal', 'Deploy the tested revision', 'Inspect logs & restart behavior', 'Back up & restore data', 'Draft CV & practice SQL', 'Rehearse compatible rollback', 'Review deployment evidence'],
  ['Review input & configuration', 'Document the API', 'Prepare the project README', 'Close a demonstrated quality gap', 'Refine CV & technical explanations', 'Rehearse the five-minute demo', 'Review portfolio evidence'],
  ['Freeze features & review code', 'Fix the highest-impact findings', 'Practice a mock interview', 'Explain the project & solve SQL', 'Prepare suitable applications', 'Tell two debugging stories', 'Review release readiness'],
  ['Verify a clean checkout', 'Fix release blockers', 'Capture the final demo', 'Record the release evidence', 'Interview & application follow-through', 'Choose the next backend issue', 'Review the next learning cycle'],
];
const phases = ['Foundation', 'First API', 'Persistence', 'Data integrity', 'Testing', 'Query design', 'Containers', 'Continuous integration', 'Deployment', 'Portfolio', 'Interview readiness', 'Release'];
const checkpoints = [
  'Java model + G1 prerequisite demo', 'In-memory REST create/read/status + G2',
  'PostgreSQL migrations + restart persistence', 'Relationship + consistent 400/404 + delete',
  'Service isolation + DB integration + rollback', 'Filters + stable pages + query explanation',
  'Compose startup + volume persistence', 'CI includes PostgreSQL integration + G3',
  'Deployment rehearsal + restore', 'Documented API/demo + safe configuration',
  'Feature freeze + mock interview + CV', 'Fresh-checkout release/demo + G4',
];
const data = {
  schemaVersion: 1,
  id: 'java-backend-12-week-v1',
  title: 'Java Backend / Learning Roadmap',
  defaultWeeklyHours: 20,
  tracks: [
    { id: 'backend', label: 'Java / Backend', short: 'Backend', ratio: 0.6 },
    { id: 'data', label: 'Data Science', short: 'Data Science', ratio: 0.2 },
    { id: 'agh', label: 'AGH preparation', short: 'AGH', ratio: 0.2 },
  ],
  courses: [
    { id: 'amazon-java', provider: 'Amazon', title: 'Programming with Java', track: 'backend', url: 'https://www.coursera.org/learn/programming-with-java', scope: 'Selected Java and OOP sections; skip material you can demonstrate.' },
    { id: 'amazon-sql', provider: 'Amazon', title: 'Database Management with Java and SQL', track: 'backend', url: 'https://www.coursera.org/learn/database-management-with-java-and-sql', scope: 'SQL, JDBC and persistence support for the same application.' },
    { id: 'amazon-spring', provider: 'Amazon', title: 'Full Stack Web Development', track: 'backend', url: 'https://www.coursera.org/learn/fullstack-web-development', scope: 'Start selected Spring sections in week 2 after G1.' },
    { id: 'ibm-data', provider: 'IBM', title: 'Data Science Professional Certificate', track: 'data', url: 'https://www.coursera.org/professional-certificates/ibm-data-science', scope: 'Continue your current enrolled unit. 48 hours is a budget, not a certificate completion promise.' },
    { id: 'ibm-linux', provider: 'IBM', title: 'Linux Commands & Shell Scripting', track: 'agh', url: 'https://www.coursera.org/learn/hands-on-introduction-to-linux-commands-and-shell-scripting', scope: 'Selected shell sections for current AGH labs; later OS topics use lecturer materials.' },
    { id: 'ibm-flask', provider: 'IBM', title: 'Python & Flask Applications', track: 'agh', url: 'https://www.coursera.org/learn/python-project-for-ai-application-development', scope: 'Selected Flask sections for actual AGH requirements. Spring never substitutes for Flask.' },
    { id: 'google-ml', provider: 'Google', title: 'Machine Learning Crash Course', track: 'data', url: 'https://developers.google.com/machine-learning/crash-course/prereqs-and-prework', scope: 'After week 12, when Python, data and math foundations are ready.', later: true },
  ],
  weeks: [],
};

for (let week = 1; week <= 12; week++) {
  const source = `weeks/week-${String(week).padStart(2, '0')}.md`;
  const md = await readFile(path.join(root, source), 'utf8');
  const title = md.match(/^# Week \d+ — (.+)$/m)?.[1];
  if (!title) throw new Error(`Missing title: ${source}`);
  const tasks = [];
  function addTask(day, code, minutes, title, description, criteria) {
    const track = codes[code];
    const index = tasks.filter(t => t.day === day && t.track === track).length + 1;
    const id = `w${String(week).padStart(2, '0')}-d${day}-${code.toLowerCase()}-${index}`;
    const courseIds = [];
    if (track === 'data') courseIds.push('ibm-data');
    if (track === 'backend') {
      if (week === 1 || /Java|collection|OOP/i.test(title)) courseIds.push('amazon-java');
      if (week >= 2) courseIds.push('amazon-spring');
      if (/SQL|JPA|database|migration|transaction|query|persistence|PostgreSQL/i.test(title)) courseIds.push('amazon-sql');
    }
    if (track === 'agh' && /OS|process|Bash|shell/i.test(title) && week <= 2) courseIds.push('ibm-linux');
    if (track === 'agh' && day === 5 && week >= 3) courseIds.push('ibm-flask');
    tasks.push({ id, day, track, title: clean(title), description: clean(description), criteria: clean(criteria), estimatedMinutes: minutes, priority: track === 'agh' || (track === 'backend' && !/reading|lookup|preview/i.test(title)) ? 'high' : 'medium', courseIds });
  }
  if (week <= 2) {
    let day = 0;
    for (const line of md.split('\n')) {
      const heading = line.match(/^## Day (\d)/);
      if (heading) day = Number(heading[1]);
      if (line.startsWith('## Exit')) break;
      const task = line.match(/^- \[[ xX]\] \*\*([BIA]) · (\d+)m: (.+?)\.\*\* (.+?) \*\*Done:\*\* (.+)$/);
      if (task) addTask(day, task[1], Number(task[2]), task[3], task[4], task[5]);
    }
  } else {
    for (const row of md.split('\n').filter(line => /^\| [1-7] \/ /.test(line))) {
      const day = Number(row.match(/^\| (\d)/)[1]);
      const slots = [...row.matchAll(/\*\*([BIA]) (\d+)m:\*\* ([\s\S]*?)(?=\*\*[BIA] \d+m:\*\*|\s*\|$)/g)];
      for (const slot of slots) {
        const [description, criteria] = slot[3].split('**Done:**');
        if (!criteria) throw new Error(`Missing criteria ${source}, day ${day}`);
        const title = slot[1] === 'B' ? backendTitles[week - 1][day - 1]
          : slot[1] === 'I' ? (day === 6 ? 'IBM certificate lab' : 'Continue your IBM unit')
          : clean(description).split(/[.!?]/)[0];
        addTask(day, slot[1], Number(slot[2]), title, description, criteria);
      }
    }
  }
  const totals = Object.fromEntries(Object.values(codes).map(track => [track, tasks.filter(t => t.track === track).reduce((n, t) => n + t.estimatedMinutes, 0)]));
  if (totals.backend !== 720 || totals.data !== 240 || totals.agh !== 240 || new Set(tasks.map(t => t.day)).size !== 7) throw new Error(`Invalid daily budget: ${source} ${JSON.stringify(totals)}`);
  const checkpoint = clean(md.match(/\*\*Checkpoint(?: G4)?:\*\* (.+)/)?.[1] || checkpoints[week - 1]);
  data.weeks.push({ number: week, title, phase: phases[week - 1], source, checkpoint, milestone: { id: `m${week}`, title: checkpoints[week - 1], dependsOn: week === 1 ? [] : [`m${week - 1}`] }, tasks });
}
const ids = data.weeks.flatMap(w => w.tasks.map(t => t.id));
if (new Set(ids).size !== ids.length) throw new Error('Duplicate task IDs');
const output = path.join(root, 'dashboard/src/data/roadmap.json');
const json = JSON.stringify(data, null, 2) + '\n';
const diagram = [
  '<!-- roadmap-dependencies:start -->',
  '## Learning dependencies', '',
  'These dependencies apply to backend milestones. IBM Data Science and current AGH work run in parallel; AGH deadlines take priority. Verify checkpoint evidence before expanding backend scope.', '',
  '```mermaid', 'flowchart LR',
  '  subgraph Backend["Java / Backend — 60%"]',
  ...data.weeks.map(w => `    W${w.number}["W${String(w.number).padStart(2, '0')} · ${w.phase}${[1,2,8,12].includes(w.number) ? ' · '+({1:'G1',2:'G2',8:'G3',12:'G4'}[w.number]) : ''}"]`),
  '    W1 --> W2 --> W3 --> W4 --> W5 --> W6 --> W7 --> W8 --> W9 --> W10 --> W11 --> W12',
  '  end',
  '  subgraph Parallel["Parallel learning"]',
  '    DS["IBM Data Science · 20% · current unit"]',
  '    AGH["AGH · 20% baseline · actual deadlines first"]',
  '    ML["Google ML · later · Python/data/math gate"]',
  '    DS -. "after foundations + capacity review" .-> ML',
  '  end',
  '  AGH -. "reallocate study time when required" .-> W1',
  '  classDef backend fill:#123d31,stroke:#5ee2b7,color:#e6fff6;',
  '  classDef data fill:#242147,stroke:#b7a2ff,color:#f0eaff;',
  '  classDef agh fill:#422e18,stroke:#edbc73,color:#fff2dd;',
  '  class W1,W2,W3,W4,W5,W6,W7,W8,W9,W10,W11,W12 backend;',
  '  class DS,ML data;', '  class AGH agh;', '```',
  '<!-- roadmap-dependencies:end -->',
].join('\n');
const roadmapPath = path.join(root, 'ROADMAP.md');
const original = await readFile(roadmapPath, 'utf8');
const block = /<!-- roadmap-dependencies:start -->[\s\S]*?<!-- roadmap-dependencies:end -->/;
const updated = block.test(original) ? original.replace(block, diagram) : original.trimEnd() + '\n\n' + diagram + '\n';
if (check) {
  if (await readFile(output, 'utf8') !== json || updated !== original) throw new Error('Roadmap data is stale. Run node scripts/sync-roadmap.mjs');
} else {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, json);
  await writeFile(roadmapPath, updated);
}
console.log(`${check ? 'Verified' : 'Generated'} ${data.weeks.length} weeks, ${ids.length} tasks, 240 planned hours and the Mermaid dependency diagram.`);
