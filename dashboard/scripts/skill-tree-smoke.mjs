/** Real-browser checks in isolated profiles against a loopback preview only. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
assert(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'QA must never write to the live personal Site.');
const artifacts = join('/tmp', `learning-skill-tree-qa-${Date.now()}`);
await mkdir(artifacts, { recursive: true });
const data = JSON.parse(await readFile('src/data/roadmap.json', 'utf8'));
const source = await readFile('src/data/skills.ts', 'utf8');
const topicList = JSON.parse(source.split('export const topics: Topic[] = ')[1].trim().replace(/;$/, ''));
const core = topicList.find(t => t.id === 'core-java') ?? topicList[0];
const oop = topicList.find(t => t.title.startsWith('OOP'));
const epam = topicList.find(t => t.id.includes('epam'));
const assignments = topicList.find(t => t.track === 'agh' && t.id.includes('assignment'));
const firstTask = data.weeks[0].tasks[0];
const commonTask = data.weeks.flatMap(w => w.tasks).find(t => t.id === core.taskIds[0]);
const storageKey = 'learning-os:java-backend:v1';
const snapshot = await (await fetch(`${base}/api/progress`)).json();
const original = snapshot.progress;
const contexts = [];
const errors = [];
const legacy = {
  format: 'learning-os-progress', version: 1, roadmapId: data.id,
  exportedAt: '2026-10-23T10:00:00.000Z',
  progress: { updatedAt: '2026-10-23T10:00:00.000Z', currentWeek: 2, startDate: '',
    tasks: { [firstTask.id]: { status: 'done', actualMinutes: 35, evidence: 'Legacy diagnostic evidence retained.' } },
    weeklyPlans: {}, milestones: {}, courseNotes: { 'amazon-java': 'Legacy course-unit note.' }, reviews: { '1': 'Legacy weekly review.' } },
};
let browser;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(check, label, limit = 15000) {
  const start = Date.now();
  for (;;) { if (await check()) return; if (Date.now() - start > limit) throw new Error(`Timed out: ${label}`); await pause(120); }
}
const cloud = async () => (await (await fetch(`${base}/api/progress`)).json()).progress;
async function synced(page) { await page.locator('.sync-state.synced').waitFor({ timeout: 20000 }); }
async function openTopic(page, topic) {
  const panel = page.getByRole('dialog');
  if (await panel.count()) await panel.getByRole('button', { name: 'Close topic details', exact: true }).click();
  if (!await page.locator('.map-page').count()) { if(await page.getByRole('button',{name:'Open navigation',exact:true}).isVisible()) await page.getByRole('button',{name:'Open navigation',exact:true}).click(); await page.getByRole('navigation',{name:'Learning navigation'}).getByRole('button',{name:'Skill roadmap',exact:true}).click(); }
  const search = page.getByPlaceholder('Find a skill, topic, or milestone…');
  await search.fill(topic.title);
  await page.locator('.search-results button').filter({ hasText: topic.title }).first().click();
  await page.getByRole('heading', { name: topic.title, exact: true }).waitFor();
  const details = page.getByRole('dialog').locator('.topic-practice-disclosure'); if(await details.count() && !await details.evaluate(el=>el.open)) await details.locator('summary').first().click();
  return page.getByRole('dialog');
}
async function capture(page, name) { await page.screenshot({ path: join(artifacts, name), fullPage: true }); }
async function cleanLocalTestData() {
  async function restoreChanges(changes) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const current = await (await fetch(`${base}/api/progress`)).json();
      const response = await fetch(`${base}/api/progress`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseRevision: current.revision, changes }) });
      if (response.ok) return;
      assert.equal(response.status, 409);
    }
    throw new Error('Could not restore the local QA database.');
  }
  const groups = ['tasks','skills','deadlines','weeklyPlans','milestones','courseNotes','reviews','goals','resources','units','activities'];
  const current = (await (await fetch(`${base}/api/progress`)).json()).progress;
  const reset = { currentWeek: original?.currentWeek ?? 1, startDate: original?.startDate ?? '' };
  const clear = { ...reset };
  for (const group of groups) {
    for (const id of Object.keys(current?.[group] ?? {})) clear[`${group}.${id}`] = null;
    for (const [id, value] of Object.entries(original?.[group] ?? {})) reset[`${group}.${id}`] = value;
  }
  await restoreChanges(clear); await restoreChanges(reset);
}

try {
  let executablePath;
  try { await access(chromium.executablePath()); } catch { executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE; }
  browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }); contexts.push(desktop);
  await desktop.addInitScript(({ storageKey, legacy }) => {
    if (!localStorage.getItem('skill-tree-qa-seeded')) { localStorage.setItem(storageKey, JSON.stringify(legacy)); localStorage.setItem('skill-tree-qa-seeded', '1'); }
  }, { storageKey, legacy });
  let page = await desktop.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await synced(page);
  let saved = await cloud();
  assert.equal(saved.tasks[firstTask.id].status, 'done'); assert.equal(saved.tasks[firstTask.id].actualMinutes, 35);
  assert.equal(saved.courseNotes['amazon-java'], 'Legacy course-unit note.'); assert.equal(saved.reviews['1'], 'Legacy weekly review.');
  assert.equal(saved.currentWeek, 2);
  assert.equal(Object.keys(saved.skills).length, 0, 'Task completion must not fabricate topic mastery.');
  assert(await page.getByRole('button', { name: /Pre-redesign backup/ }).count());
  await page.getByRole('navigation',{name:'Learning navigation'}).getByRole('button',{name:'Skill roadmap',exact:true}).click();
  assert((await page.locator('.react-flow__edge').count()) > 5, 'Graph edges missing.');
  assert(await page.locator('.react-flow__node-skill').count() >= 65, 'Default Java map must expose the detailed skill hierarchy.');
  assert(await page.locator('.react-flow__node-frame').count() > 20, 'Missing outlined concept groups.');
  let panel = await openTopic(page, core);
  const positionsBefore = await page.locator('.react-flow__node').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.getAttribute('data-id'), node.style.transform])));
  await panel.getByRole('button', { name: 'Done', exact: true }).click(); await synced(page);
  await eventually(async () => (await cloud()).skills[core.id]?.status === 'completed', 'topic status cloud save');
  assert.deepEqual(await page.locator('.react-flow__node').evaluateAll(nodes => Object.fromEntries(nodes.map(node => [node.getAttribute('data-id'), node.style.transform]))), positionsBefore, 'Progress must not move roadmap nodes.');
  assert.equal(Object.values((await cloud()).tasks).filter(t => t.status === 'done').length, 1, 'Topic status changed task checkboxes.');
  await page.reload(); await synced(page); panel = await openTopic(page, core);
  assert.equal(await panel.getByRole('button', { name: 'Done', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.close(); page = await desktop.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await synced(page); panel = await openTopic(page, core);
  assert.equal(await panel.getByRole('button', { name: 'Done', exact: true }).getAttribute('aria-pressed'), 'true');
  console.log('PASS: original v1 progress migration, evidence/minutes/notes preservation, refresh and reopening.');

  const second = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }); contexts.push(second);
  let phonePeer = await second.newPage(); phonePeer.on('pageerror', e => errors.push(e.message));
  await phonePeer.goto(base); await synced(phonePeer); let otherPanel = await openTopic(phonePeer, core);
  assert.equal(await otherPanel.getByRole('button', { name: 'Done', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await phonePeer.evaluate(key => JSON.parse(localStorage.getItem(key)).progress.tasks[Object.keys(JSON.parse(localStorage.getItem(key)).progress.tasks)[0]].actualMinutes, storageKey), 35);
  const taskDetailsA = panel.locator('.practice-task').filter({ hasText: commonTask.title }).first();
  const taskDetailsB = otherPanel.locator('.practice-task').filter({ hasText: commonTask.title }).first();
  await taskDetailsA.locator('summary').click();
  await Promise.all([taskDetailsA.getByLabel('Evidence / next action', { exact: true }).fill('Evidence from device A, kept while B marks complete.'), taskDetailsB.getByRole('checkbox').check()]);
  await eventually(async () => { const task = (await cloud()).tasks[commonTask.id]; return task?.status === 'done' && task?.evidence === 'Evidence from device A, kept while B marks complete.'; }, 'concurrent browser edits preserve evidence and status');
  console.log('PASS: independent browser contexts read the same progress; concurrent edits preserve both status and evidence.');

  otherPanel = await openTopic(phonePeer, oop);
  await second.route('**/api/progress', route => route.abort('internetdisconnected'));
  await otherPanel.getByRole('button', { name: 'Learning', exact: true }).click();
  await phonePeer.locator('.sync-state.offline').waitFor();
  await phonePeer.reload(); await phonePeer.locator('.sync-state.offline').waitFor(); otherPanel = await openTopic(phonePeer, oop);
  assert.equal(await otherPanel.getByRole('button', { name: 'Learning', exact: true }).getAttribute('aria-pressed'), 'true');
  await second.unroute('**/api/progress');
  await phonePeer.evaluate(() => window.dispatchEvent(new Event('online'))); await synced(phonePeer);
  await eventually(async () => (await cloud()).skills[oop.id]?.status === 'in-progress', 'offline queue reconnect');
  console.log('PASS: offline edits survive refresh and synchronize after reconnect, with truthful unsynced state.');

  panel = await openTopic(page, epam); assert((await panel.locator('.criteria-list li').count()) > 2);
  assert(await page.locator(`.react-flow__node[data-id="${epam.id}"]`).count(), 'Search failed to expand hidden EPAM topic.');
  await panel.getByRole('button', { name: 'Close topic details', exact: true }).click();
  const viewport = page.locator('.react-flow__viewport'); const beforeZoom = await viewport.getAttribute('style');
  await page.getByRole('button', { name: /zoom in/i }).click();
  await eventually(async () => await viewport.getAttribute('style') !== beforeZoom, 'zoom control changes viewport');
  const canvas = await page.locator('.skill-canvas').boundingBox(); const beforePan = await viewport.getAttribute('style');
  const blank = await page.locator('.skill-canvas').evaluate(element => { const r = element.getBoundingClientRect(); for (let y = r.top + 80; y < Math.min(r.bottom - 80, innerHeight - 70); y += 30) for (let x = r.left + 15; x < r.right - 80; x += 30) if (document.elementFromPoint(x, y)?.classList.contains('react-flow__pane')) return { x, y }; });
  assert(blank, 'No visible canvas area to exercise panning.');
  await page.mouse.move(blank.x, blank.y); await page.mouse.down(); await page.mouse.move(blank.x + 55, blank.y + 25, { steps: 5 }); await page.mouse.up();
  assert.notEqual(await viewport.getAttribute('style'), beforePan, 'Panning did not move the viewport.');
  panel = await openTopic(page, assignments);
  await panel.getByLabel('Assignment name', { exact: true }).fill('QA OS lab deadline');
  await panel.getByLabel('Assignment deadline', { exact: true }).fill(new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
  await panel.getByRole('button', { name: 'Save deadline', exact: true }).click(); await synced(page);
  await panel.getByRole('button', { name: 'Close topic details', exact: true }).click();
  await page.getByRole('navigation', { name: 'Learning navigation' }).getByRole('button', { name: /^Today/ }).click();
  await page.locator('.today-priority').getByText('QA OS lab deadline', { exact: true }).waitFor();
  console.log('PASS: search reveals collapsed skills, zoom/pan work, and a real recorded urgent AGH date takes priority.');

  // Import validates before changing progress; export is a normal versioned backup.
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export', exact: true }).click();
  const downloaded = await download; const file = join(artifacts, 'progress.json'); await downloaded.saveAs(file);
  const backup = JSON.parse(await readFile(file, 'utf8')); assert.equal(backup.format, 'learning-os-progress'); assert.equal(backup.progress.skills[core.id].status, 'completed');
  await page.getByLabel('Import progress JSON', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await page.getByRole('button', { name: /^Restore backup/ }).click();
  await page.getByRole('alert').filter({ hasText: /not valid progress JSON/ }).waitFor();
  assert.equal((await cloud()).skills[core.id].status, 'completed');
  console.log('PASS: export contains current progress; invalid import leaves stored progress unchanged.');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }); contexts.push(mobile);
  const mobilePage = await mobile.newPage(); mobilePage.on('pageerror', e => errors.push(e.message)); await mobilePage.goto(base); await synced(mobilePage);
  assert(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Phone page overflows horizontally.');
  await openTopic(mobilePage, core);
  const rect = await mobilePage.getByRole('dialog').boundingBox(); assert(rect.width >= 388 && rect.x >= -1, 'Phone drawer is not a full-width sheet.');
  await mobilePage.getByRole('dialog').getByRole('heading', { name: 'Build something small' }).scrollIntoViewIfNeeded();
  await capture(mobilePage, 'mobile-topic.png');
  await mobilePage.getByRole('dialog').getByRole('button', { name: 'Close topic details', exact: true }).click(); await capture(mobilePage, 'mobile-roadmap.png');
  await page.getByRole('navigation', { name: 'Learning navigation' }).getByRole('button', { name: 'Skill roadmap', exact: true }).click();
  await capture(page, 'desktop-roadmap.png');
  assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
  console.log('PASS: phone drawer, scrolling, touch controls, desktop/mobile rendering; no browser runtime errors.');
  console.log(`Artifacts: ${artifacts}`);
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  if (browser) await browser.close();
  await cleanLocalTestData();
}
