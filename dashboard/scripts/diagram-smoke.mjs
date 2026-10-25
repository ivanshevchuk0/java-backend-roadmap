/** Read-only visual regression. Upstream roadmap content stays in the private runtime;
 * this script saves only personal QA screenshots outside the repository. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a loopback preview.');
const output = `/tmp/roadmap-diagram-qa-${Date.now()}`;
await mkdir(output);
const browser = await chromium.launch({ headless: true });
const errors = [], writes = [], contexts = [], payloads = {};
async function context(options) {
  const c = await browser.newContext({ reducedMotion: 'reduce', ...options });
  contexts.push(c);
  await c.route('**/api/progress**', route => {
    if (route.request().method() !== 'GET') { writes.push(route.request().method()); return route.abort(); }
    return route.continue();
  });
  return c;
}
async function page(c) { const p = await c.newPage(); p.on('pageerror', error => errors.push(error.message)); await p.goto(base); await p.locator('.sync-state.synced').waitFor({ timeout: 30000 }); return p; }
async function navigate(p) {
  if (await p.locator('.map-page').count()) return;
  const menu = p.getByRole('button', { name: 'Open navigation', exact: true });
  if (await menu.isVisible()) await menu.click();
  await p.getByRole('navigation', { name: 'Learning navigation' }).getByRole('button', { name: 'Roadmaps', exact: true }).click();
}
async function chooseMap(p, map) {
  await navigate(p);
  await p.getByRole('group', { name: 'Choose roadmap' }).getByRole('button', { name: { java: 'Java Developer', backend: 'Backend', data: /Data Science/, agh: /AGH/ }[map], exact: true }).click();
  if (payloads[map]) await p.locator(`.reference-map[data-reference-node-count="${payloads[map].roadmap.nodes.length}"]`).waitFor({ timeout: 30000 });
  else await p.locator('.curated-canvas').waitFor();
  await p.waitForTimeout(180);
}
const geometry = p => p.locator('.react-flow__node').evaluateAll(nodes => Object.fromEntries(nodes.map(node => {
  const transform = new DOMMatrix(node.style.transform);
  return [node.dataset.id, { x: transform.e, y: transform.f, w: parseFloat(node.style.width), h: parseFloat(node.style.height) }];
})));
const viewport = p => p.locator('.react-flow__viewport').evaluate(node => getComputedStyle(node).transform);
async function controls(p) {
  const before = await geometry(p), select = p.getByLabel('Jump to roadmap section');
  const last = await select.locator('option').last().getAttribute('value');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  const start = await viewport(p);
  await select.selectOption(last); await p.waitForTimeout(160);
  assert.notEqual(await viewport(p), start, 'Section navigation should move the camera');
  const jumped = await viewport(p);
  await p.locator('.react-flow__controls-zoomin').click(); await p.waitForTimeout(260);
  assert.notEqual(await viewport(p), jumped, 'Zoom control should change the camera');
  await p.locator('.react-flow__controls-fitview').click(); await p.waitForTimeout(260);
  const fit = await viewport(p), box = await p.locator('.react-flow').boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.wheel(0, 120); await p.waitForTimeout(180);
  assert.notEqual(await viewport(p), fit, 'Scrolling should pan the map');
  assert.deepEqual(await geometry(p), before, 'Navigation must not change skill coordinates');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
}
async function searchTopic(p, title) {
  await p.getByLabel('Search roadmap skills').fill(title);
  await p.locator('.search-results button').filter({ hasText: title }).first().click();
  const panel = p.getByRole('dialog'); await panel.waitFor();
  assert(await panel.getByRole('heading', { name: title, exact: true }).count(), 'Search should open the selected skill panel');
  assert(await panel.locator('a[href^="http"]').count() > 0, 'Topic panel should link to learning materials');
  await panel.getByRole('button', { name: 'Close topic details', exact: true }).click();
  await p.getByLabel('Search roadmap skills').fill('');
}
async function reference(p, map) {
  const payload = payloads[map]; await chooseMap(p, map);
  await p.getByRole('button', { name: 'Full Roadmap', exact: true }).click();
  const actual = await geometry(p);
  assert.deepEqual(Object.keys(actual).sort(), payload.roadmap.nodes.map(node => node.id).sort());
  for (const raw of payload.roadmap.nodes) {
    const a = actual[raw.id];
    for (const dimension of ['x', 'y']) assert(Math.abs(a[dimension] - raw.position[dimension]) <= .011, `${map}:${raw.id} ${dimension} changed`);
    for (const [dimension, key, fallback] of [['w', 'width', 200], ['h', 'height', 48]]) {
      const value = raw[key] ?? raw.measured?.[key] ?? parseFloat(raw.style?.[key]);
      const expected = Number.isFinite(value) && value > 0 ? value : fallback;
      assert(Math.abs(a[dimension] - expected) <= .011, `${map}:${raw.id} ${key} changed`);
    }
  }
  const edgeIds = await p.locator('.react-flow__edge').evaluateAll(edges => edges.map(edge => edge.dataset.id));
  assert.deepEqual(edgeIds.sort(), payload.roadmap.edges.map(edge => edge.id).sort());
  const paths = await p.locator('.react-flow__edge-path').evaluateAll(paths => paths.map(path => ({ id: path.parentElement.dataset.id, length: path.getTotalLength(), stroke: getComputedStyle(path).stroke })));
  // The live Java source includes one same-node/same-side y2→y1 loop. Its
  // coincident endpoints are retained faithfully, without inventing a new route.
  const coincident = new Set(payload.roadmap.edges.filter(edge => edge.source === edge.target && edge.sourceHandle?.[0] === edge.targetHandle?.[0]).map(edge => edge.id));
  assert(paths.every(path => Number.isFinite(path.length) && (path.length > 0 || coincident.has(path.id))), 'Every non-coincident source connector should render');
  assert.equal(await p.locator('.reference-section').count(), payload.roadmap.nodes.filter(node => node.type === 'section').length);
  assert.equal(await p.locator('.reference-line-svg').count(), payload.roadmap.nodes.filter(node => ['horizontal', 'vertical'].includes(node.type)).length);
  await p.getByRole('button', { name: 'My Learning Path', exact: true }).click();
  assert.deepEqual(await geometry(p), actual, 'Personal mode must preserve the full source graph');
  assert.equal(await p.locator('.react-flow__edge').count(), edgeIds.length);
  await controls(p);
  await searchTopic(p, map === 'java' ? 'Bazel' : 'Kafka');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  await p.screenshot({ path: `${output}/${map}-desktop.png`, fullPage: true });
  console.log(`PASS ${map}: all ${actual && Object.keys(actual).length} source elements and ${edgeIds.length} edges; exact positions/dimensions; identical Full/Personal geometry; navigation.`);
}
async function retained(p, map, count) {
  await chooseMap(p, map);
  assert.equal(await p.locator('.react-flow__node-skill').count(), count);
  assert.equal(await p.locator('.reference-map').count(), 0);
  const result = await p.evaluate(() => {
    const boxes = selector => [...document.querySelectorAll(selector)].map(node => {
      const m = new DOMMatrix(node.style.transform);
      return { id: node.dataset.id, x: m.e, y: m.f, w: parseFloat(node.style.width), h: parseFloat(node.style.height), main: !!node.querySelector('.main-topic') };
    });
    const nodes = boxes('.react-flow__node-skill,.react-flow__node-concept'), frames = boxes('.react-flow__node-frame'), overlaps = [], outside = [];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.x < b.x + b.w - 1 && a.x + a.w > b.x + 1 && a.y < b.y + b.h - 1 && a.y + a.h > b.y + 1) overlaps.push([a.id, b.id]);
    }
    for (const n of nodes) if (!n.main && !frames.some(f => n.x > f.x && n.x + n.w < f.x + f.w && n.y > f.y && n.y + n.h < f.y + f.h)) outside.push(n.id);
    const paths = [...document.querySelectorAll('.react-flow__edge-path')].map(path => ({ length: path.getTotalLength(), dash: getComputedStyle(path).strokeDasharray }));
    return { main: nodes.filter(n => n.main), overlaps, outside, paths };
  });
  assert.deepEqual(result.overlaps, [], `${map}: topic rectangles overlap`);
  assert.deepEqual(result.outside, [], `${map}: branch escaped its group`);
  assert(result.main.every(node => Math.abs(node.x - 390) < .01), `${map}: central spine moved`);
  assert(result.paths.every(path => path.length > 0 && Number.isFinite(path.length)));
  const before = await geometry(p);
  await p.getByRole('button', { name: 'Collapse all', exact: true }).click();
  assert.equal(await p.locator('.react-flow__node').count(), result.main.length);
  await p.getByRole('button', { name: 'Expand all', exact: true }).click();
  assert.deepEqual(await geometry(p), before);
  await controls(p);
  await p.screenshot({ path: `${output}/${map}-desktop.png`, fullPage: true });
  console.log(`PASS ${map}: ${count} preserved skills, aligned spine, grouped branches, no rectangle overlaps, collapse/expand/navigation.`);
}
try {
  for (const map of ['java', 'backend']) {
    const response = await fetch(`${base}/api/reference-roadmaps/${map}`);
    assert.equal(response.status, 200, `${map}: complete runtime reference is unavailable`);
    payloads[map] = await response.json();
  }
  const desktop = await context({ viewport: { width: 1440, height: 1100 } }), p = await page(desktop);
  for (const map of ['java', 'backend']) await reference(p, map);
  await p.getByRole('button', { name: 'Use dark roadmap theme' }).click();
  await p.reload(); await p.locator('.sync-state.synced').waitFor(); await chooseMap(p, 'java');
  assert.equal(await p.locator('.map-page').getAttribute('data-diagram-theme'), 'dark');
  await p.screenshot({ path: `${output}/java-dark.png`, fullPage: true });
  await p.getByRole('button', { name: 'Use light roadmap theme' }).click();
  await retained(p, 'data', 6); await retained(p, 'agh', 5);
  for (const width of [320, 390]) {
    const phoneContext = await context({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    const phone = await page(phoneContext);
    for (const map of ['java', 'backend', 'data', 'agh']) {
      await chooseMap(phone, map);
      assert(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${map}: overflow at ${width}px`);
      const canvas = await phone.locator(payloads[map] ? '.reference-map' : '.curated-canvas').boundingBox();
      assert(canvas.width <= width && canvas.width >= width - 40);
      const before = await geometry(phone);
      await phone.getByLabel('Jump to roadmap section').selectOption({ index: 1 });
      await phone.locator('.react-flow__controls-fitview').click(); await phone.waitForTimeout(180);
      assert.deepEqual(await geometry(phone), before, `${map}: mobile navigation moved nodes`);
      const zoom = await phone.locator('.react-flow__controls-zoomin').boundingBox();
      assert(zoom.width >= 44 && zoom.height >= 44, 'Mobile zoom target must be at least 44px');
      await phone.screenshot({ path: `${output}/${map}-${width}px.png`, fullPage: true });
    }
    await phoneContext.close();
  }
  assert.deepEqual(writes, [], 'Read-only diagram QA attempted to edit personal progress');
  assert.deepEqual(errors, [], 'The rendered app raised JavaScript errors');
  console.log('PASS theme persistence, 320px/390px layouts, touch-size zoom controls and stable mobile map geometry. No progress writes.');
  console.log(`Screenshots: ${output}`);
} finally { for (const c of contexts) await c.close().catch(() => {}); await browser.close(); }
