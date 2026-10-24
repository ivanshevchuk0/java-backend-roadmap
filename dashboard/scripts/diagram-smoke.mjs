/** Read-only diagram QA. Personal progress is never edited by this check. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const output = `/tmp/curated-roadmap-qa-${Date.now()}`; await mkdir(output);
const browser = await chromium.launch({headless:true});
const errors = [];
async function closePanel(page) { const panel=page.getByRole('dialog'); if(await panel.count()) await panel.getByRole('button',{name:'Close topic details',exact:true}).click(); }
async function openMap(page) { if(!await page.locator('.map-page').count()){if(await page.getByRole('button',{name:'Open navigation',exact:true}).isVisible())await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('navigation',{name:'Learning navigation'}).getByRole('button',{name:'Skill roadmap',exact:true}).click();}await page.getByRole('group',{name:'Choose roadmap'}).getByRole('button',{name:'Backend',exact:true}).click(); }
async function search(page,name) { await openMap(page); await closePanel(page); await page.getByLabel('Search roadmap skills').fill(name); await page.locator('.search-results button').filter({hasText:name}).first().click(); await page.getByRole('dialog').waitFor(); }
try {
 const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('.sync-state.synced').waitFor();await openMap(page);await page.waitForTimeout(300);
 assert.equal(await page.locator('.map-page').getAttribute('data-diagram-theme'),'light');
 assert.equal(await page.locator('.react-flow__node-skill').count(),22);
 assert.equal(await page.locator('.react-flow__node[data-id="python"]').count(),0);
 const geometry=await page.evaluate(()=>{
  const viewport=document.querySelector('.react-flow__viewport');const scale=new DOMMatrix(getComputedStyle(viewport).transform).a;
  const nodeEls=[...document.querySelectorAll('.react-flow__node-skill,.react-flow__node-concept')];
  const nodes=nodeEls.map(n=>{const matrix=new DOMMatrix(n.style.transform);const r=n.getBoundingClientRect();return {id:n.dataset.id,x:matrix.e,y:matrix.f,w:r.width/scale,h:r.height/scale,main:!!n.querySelector('.main-topic')};});
  const overlaps=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];if(a.x < b.x+b.w-1 && a.x+a.w > b.x+1 && a.y < b.y+b.h-1 && a.y+a.h > b.y+1)overlaps.push([a.id,b.id]);}
  const intrusions=[],unrouted=[];
  for(const edge of document.querySelectorAll('.react-flow__edge')){
   const p=edge.querySelector('path.react-flow__edge-path');if(!p)continue;const length=p.getTotalLength();const first=p.getPointAtLength(0),last=p.getPointAtLength(length);
   if(!Number.isFinite(length)||length<2)unrouted.push(edge.dataset.id);
   for(let d=3;d<length-3;d+=3){const q=p.getPointAtLength(d);for(const n of nodes){const isEndpoint=(Math.abs(first.x-n.x)<2 || Math.abs(first.x-n.x-n.w)<2 || Math.abs(first.y-n.y)<2 || Math.abs(first.y-n.y-n.h)<2) && first.x>=n.x-2&&first.x<=n.x+n.w+2&&first.y>=n.y-2&&first.y<=n.y+n.h+2;const isTarget=last.x>=n.x-2&&last.x<=n.x+n.w+2&&last.y>=n.y-2&&last.y<=n.y+n.h+2;if(!isEndpoint&&!isTarget&&q.x>n.x+1&&q.x<n.x+n.w-1&&q.y>n.y+1&&q.y<n.y+n.h-1){intrusions.push([edge.dataset.id,n.id]);break;}}}
  }
  const main=nodes.filter(n=>n.main).sort((a,b)=>a.y-b.y);
  const frames=[...document.querySelectorAll('.react-flow__node-frame')].map(n=>{const m=new DOMMatrix(n.style.transform);const r=n.getBoundingClientRect();return {x:m.e,y:m.f,w:r.width/scale,h:r.height/scale};});
  const outside=nodes.filter(n=>!n.main&&!frames.some(f=>n.x>f.x&&n.x+n.w<f.x+f.w&&n.y>f.y&&n.y+n.h<f.y+f.h)).map(n=>n.id);
  const paths=[...document.querySelectorAll('.react-flow__edge-path')].map(p=>({start:p.getPointAtLength(0),end:p.getPointAtLength(p.getTotalLength()),stroke:getComputedStyle(p).stroke,dashed:getComputedStyle(p).strokeDasharray}));
  return {overlaps,intrusions,unrouted,outside,main,paths,background:getComputedStyle(document.querySelector('.react-flow')).backgroundColor};
 });
 assert.deepEqual(geometry.overlaps,[],'Topic rectangles overlap');assert.deepEqual(geometry.intrusions,[],'A connector crosses an unrelated node');assert.deepEqual(geometry.unrouted,[]);assert.deepEqual(geometry.outside,[],'Branch row escaped its group');assert(geometry.main.every(n=>Math.abs(n.x-390)<1),'Main topics leave central spine');assert(geometry.paths.some(p=>p.dashed!=='none'),'Optional dotted lines missing');
 await page.screenshot({path:`${output}/desktop-light.png`,fullPage:true});
 const initial=await page.locator('.react-flow__node').count();await page.getByRole('button',{name:'Collapse all',exact:true}).click();assert.equal(await page.locator('.react-flow__node').count(),15);await search(page,'Generics');assert(await page.locator('.react-flow__node[data-id="generics"]').count());await closePanel(page);await page.getByRole('button',{name:'Expand all',exact:true}).click();assert.equal(await page.locator('.react-flow__node').count(),initial);
 await page.getByRole('button',{name:'Use dark roadmap theme'}).click();await page.reload();await page.locator('.sync-state.synced').waitFor();await openMap(page);assert.equal(await page.locator('.map-page').getAttribute('data-diagram-theme'),'dark');await page.screenshot({path:`${output}/desktop-dark.png`,fullPage:true});await page.getByRole('button',{name:'Use light roadmap theme'}).click();
 await page.getByRole('group',{name:'Choose roadmap'}).getByRole('button',{name:/Data Science/}).click();assert.equal(await page.locator('.react-flow__node-skill').count(),6);assert.equal(await page.locator('.react-flow__node[data-id="core-java"]').count(),0);await page.waitForTimeout(250);await page.screenshot({path:`${output}/data-science.png`,fullPage:true});
 await page.getByRole('group',{name:'Choose roadmap'}).getByRole('button',{name:/AGH/}).click();assert.equal(await page.locator('.react-flow__node-skill').count(),5);await page.waitForTimeout(250);await page.screenshot({path:`${output}/agh-subjects.png`,fullPage:true});
 await search(page,'Spring Boot');assert(await page.getByRole('heading',{name:'Spring Boot & DI',exact:true}).count());assert(await page.getByRole('heading',{name:'Java Backend Development',exact:true}).count());assert.equal(await page.getByRole('dialog').getByRole('link').count()>2,true);await closePanel(page);
 await page.getByRole('button',{name:'Start',exact:true}).click();await page.locator('.react-flow__node[data-id="reference-types"]').click();assert(await page.getByText('Reading focus: Types, strings & arrays',{exact:true}).count());await closePanel(page);
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));await phone.goto(base);await phone.locator('.sync-state.synced').waitFor();await openMap(phone);assert(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert((await phone.locator('.main-topic').first().boundingBox()).width>=170);await phone.screenshot({path:`${output}/mobile-light.png`,fullPage:true});await search(phone,'Core Java');const panel=await phone.getByRole('dialog').boundingBox();assert(panel.width>=388);await phone.getByRole('heading',{name:'Build something small'}).scrollIntoViewIfNeeded();await phone.screenshot({path:`${output}/mobile-panel.png`,fullPage:true});await mobile.close();await context.close();
 const advanced=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
 const snapshot=await (await fetch(`${base}/api/progress`)).json();
 const advancedProgress={...(snapshot.progress??{}),currentWeek:1,startDate:'',tasks:{},skills:Object.fromEntries(['core-java','oop','collections','generics'].map(id=>[id,{status:'completed',updatedAt:new Date().toISOString()}])),deadlines:{},weeklyPlans:{},milestones:{},courseNotes:{},reviews:{}};
 await advanced.route('**/api/progress',route=>route.request().method()==='GET'?route.fulfill({json:{revision:0,progress:advancedProgress}}):route.abort());
 const resumed=await advanced.newPage();resumed.on('pageerror',e=>errors.push(e.message));await resumed.goto(base);await resumed.locator('.sync-state.synced').waitFor();await openMap(resumed);await resumed.waitForTimeout(250);
 const nextRect=await resumed.locator('.react-flow__node[data-id="git-maven"]').boundingBox();const canvasRect=await resumed.locator('.curated-canvas').boundingBox();assert(nextRect.y>=canvasRect.y&&nextRect.y<canvasRect.y+300,'Saved progress does not resume at the next skill');
 await advanced.close();assert.deepEqual(errors,[]);
 console.log('PASS: central spine, grouped rows, no overlapping nodes or connectors through unrelated nodes, optional dotted routes.');
 console.log('PASS: collapse/search/expansion, independent track navigation, real materials, theme persistence, mobile readability and panels.');
 console.log(`Screenshots: ${output}`);
}finally{await browser.close();}
