// Runs only against our local dashboard in fresh, isolated browser contexts.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const artifacts = await mkdtemp(join(tmpdir(), 'learning-dashboard-qa-'));
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4179', '--strictPort'], { stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', value => { serverOutput += value; });
server.stderr.on('data', value => { serverOutput += value; });
let browser;
try {
  let ready = false;
  for (let n = 0; n < 80; n++) {
    if (server.exitCode !== null) throw new Error(`Preview failed: ${serverOutput}`);
    try { if ((await fetch('http://127.0.0.1:4179')).ok) { ready = true; break; } } catch { /* still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(ready, `Preview did not start: ${serverOutput}`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4179');
  await page.getByRole('heading', { name: 'Make progress, on purpose.' }).waitFor();
  const firstTask = page.getByRole('checkbox', { name: 'Complete tool and Git check', exact: true });
  await firstTask.check();
  await page.reload();
  assert(await firstTask.isChecked(), 'Checkbox did not persist after refresh');
  assert.match(await page.locator('.metric-card').nth(1).innerText(), /0\s*\/\s*20h/, 'Checkbox fabricated logged hours');
  await page.getByRole('button', { name: /^tool and Git check/ }).click();
  await page.getByLabel('Logged minutes', { exact: true }).fill('60');
  await page.getByLabel('Evidence & next action', { exact: true }).fill('Compiled the diagnostic and explained object construction.');
  await page.getByRole('button', { name: 'Save task', exact: true }).click();
  assert.match(await page.locator('.metric-card').nth(1).innerText(), /1\s*\/\s*20h/);

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress', exact: true }).click();
  const downloaded = await downloadEvent;
  const exportedPath = join(artifacts, 'progress.json');
  await downloaded.saveAs(exportedPath);
  const backup = JSON.parse(await readFile(exportedPath, 'utf8'));
  assert.equal(backup.progress.tasks['w01-d1-b-1'].actualMinutes, 60);
  assert.equal(backup.progress.tasks['w01-d1-b-1'].status, 'done');
  backup.progress.currentWeek = 2;
  backup.progress.tasks['w01-d1-b-1'].actualMinutes = 90;
  await page.getByLabel('Import progress JSON', { exact: true }).setInputFiles({ name: 'restore.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByRole('button', { name: 'Replace & restore', exact: true }).click();
  assert.equal(await page.getByLabel('View week', { exact: true }).inputValue(), '2');
  await page.reload();
  assert.equal(await page.getByLabel('View week', { exact: true }).inputValue(), '2');
  await page.getByLabel('Import progress JSON', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  assert.match(await page.getByRole('alert').innerText(), /not valid progress JSON/);
  assert.equal(await page.getByLabel('View week', { exact: true }).inputValue(), '2');
  await page.getByRole('button', { name: 'Dismiss import error' }).click();

  await page.getByRole('button', { name: 'Plan settings', exact: true }).click();
  await page.getByLabel('Weekly capacity (hours)', { exact: true }).fill('20');
  await page.getByLabel('AGH reserve (hours)', { exact: true }).fill('10');
  await page.getByLabel('Plan start date (optional)', { exact: true }).fill('2026-10-22');
  await page.getByRole('button', { name: 'Save weekly plan', exact: true }).click();
  assert.match(await page.locator('.plan-dates').innerText(), /Oct.*Nov/);
  assert.match(await page.locator('.allocation-rows').innerText(), /7\.5h/);
  assert.match(await page.locator('.allocation-rows').innerText(), /37\.5%/);
  assert.match(await page.locator('.allocation-rows').innerText(), /2\.5h/);
  assert.match(await page.locator('.allocation-rows').innerText(), /10h/);
  await page.getByLabel('Filter learning track', { exact: true }).selectOption('agh');
  assert.equal(await page.locator('.task-row').count(), 4);
  await page.getByRole('button', { name: 'Day 2', exact: true }).click();
  await page.getByRole('heading', { name: 'No tasks in this view' }).waitFor();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  assert((await page.locator('.task-row').count()) > 4);

  await page.getByRole('button', { name: 'Course library', exact: true }).click();
  await page.getByRole('button', { name: 'Update course note', exact: false }).first().click();
  await page.getByLabel('Current unit, assessments & next step', { exact: true }).fill('Current unit: collections. Next: finish the lab.');
  await page.getByRole('button', { name: 'Save course note', exact: true }).click();
  assert.match(await page.locator('.course-note-preview').first().innerText(), /collections/);

  await page.getByRole('button', { name: 'Project milestones', exact: true }).click();
  await page.locator('.milestone-item').first().click();
  assert(await page.getByRole('checkbox', { name: /I demonstrated this checkpoint/ }).isDisabled());
  await page.getByLabel('Reproducible evidence', { exact: true }).fill('G1: domain demo and four independently explained tests.');
  await page.getByRole('checkbox', { name: /I demonstrated this checkpoint/ }).check();
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
  await page.locator('.milestone-item').nth(1).click();
  await page.getByLabel('Reproducible evidence', { exact: true }).fill('G2: create, read, status flow, with 400 and 404 examples.');
  await page.getByRole('checkbox', { name: /I demonstrated this checkpoint/ }).check();
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
  assert.equal(await page.locator('.milestone-item.verified').count(), 2);
  await page.locator('.milestone-item').first().click();
  await page.getByRole('checkbox', { name: /I demonstrated this checkpoint/ }).uncheck();
  await page.getByRole('button', { name: 'Save checkpoint', exact: true }).click();
  assert.equal(await page.locator('.milestone-item.verified').count(), 0, 'Dependent milestone stayed verified after prerequisite reopened');

  await page.getByRole('button', { name: 'Weekly review', exact: true }).click();
  await page.getByLabel('Evidence, real deadlines & the next three outcomes', { exact: true }).fill('Next AGH lab comes first. Keep only two carryovers.');
  await page.reload();
  await page.getByRole('button', { name: 'Weekly review', exact: true }).click();
  assert.match(await page.getByLabel('Evidence, real deadlines & the next three outcomes').inputValue(), /AGH lab/);
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await page.screenshot({ path: join(artifacts, 'desktop.png'), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Desktop page overflows horizontally');
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile page overflows horizontally');
  await page.screenshot({ path: join(artifacts, 'mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('button', { name: 'Course library', exact: true }).click();
  assert(await page.getByRole('heading', { name: 'Learn what you’ll actually use.' }).isVisible());

  const denied = await browser.newContext();
  await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }));
  const deniedPage = await denied.newPage();
  await deniedPage.goto('http://127.0.0.1:4179');
  await deniedPage.getByRole('alert').waitFor();
  assert.match(await deniedPage.getByRole('alert').innerText(), /could not save progress/);
  await deniedPage.getByRole('checkbox', { name: 'Complete tool and Git check', exact: true }).check();
  assert(await deniedPage.getByRole('checkbox', { name: 'Complete tool and Git check', exact: true }).isChecked());

  const corrupted = await browser.newContext();
  await corrupted.addInitScript(() => localStorage.setItem('learning-os:java-backend:v1', '{damaged backup'));
  const corruptedPage = await corrupted.newPage();
  await corruptedPage.goto('http://127.0.0.1:4179');
  await corruptedPage.getByRole('button', { name: 'Download recovery copy', exact: true }).waitFor();
  const recoveryEvent = corruptedPage.waitForEvent('download');
  await corruptedPage.getByRole('button', { name: 'Download recovery copy', exact: true }).click();
  await (await recoveryEvent).saveAs(join(artifacts, 'recovery.json'));
  assert.equal(await readFile(join(artifacts, 'recovery.json'), 'utf8'), '{damaged backup');
  assert.deepEqual(errors, [], 'Browser runtime errors occurred');
  console.log('PASS: persistence; independent time accounting; JSON export/import; invalid import safety; capacity override; filters; course notes; checkpoint gates; review persistence; mobile navigation; storage failure/recovery; no runtime errors.');
  console.log(`Screenshots and test exports: ${artifacts}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
