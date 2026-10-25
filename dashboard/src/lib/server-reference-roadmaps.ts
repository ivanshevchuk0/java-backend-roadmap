/**
 * Private, personal-use proxy. Official graph and guide content is fetched only
 * at runtime and cached briefly in memory; never add upstream payloads to Git,
 * database records, static assets, or a distributable application bundle.
 * Production access relies on the same owner-private Sites boundary as progress.
 */
import type { RawRoadmap } from './reference-roadmaps';
export type ReferenceMap = 'java' | 'backend';
export interface ReferencePayload {
  roadmap: RawRoadmap;
  guides: Record<string, string>;
  source: { url: string; revision: string; checkedAt: string; licenseUrl: string; updatedAt?: string };
  audit: { nodes: number; edges: number; skills: number; groups: number };
}
const CACHE_MS = 10 * 60 * 1000;
const ID = /^[A-Za-z0-9_-]{8,80}$/;
const LICENSE_URL = 'https://github.com/nilbuild/developer-roadmap/blob/master/license';
export class ReferenceNodeNotFound extends Error {}
export function isReferenceMap(value: unknown): value is ReferenceMap { return value === 'java' || value === 'backend'; }
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid official response.');
  return value as Record<string, unknown>;
}
async function boundedText(response: Response, limit: number): Promise<string> {
  if (!response.ok || Number(response.headers.get('content-length')) > limit) throw Error('Official source unavailable.');
  const reader = response.body?.getReader();
  if (!reader) throw Error('Official source was empty.');
  const decoder = new TextDecoder(); let result = ''; let count = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      count += next.value.byteLength;
      if (count > limit) { await reader.cancel(); throw Error('Official response exceeded its limit.'); }
      result += decoder.decode(next.value, { stream: true });
    }
    return result + decoder.decode();
  } finally { reader.releaseLock(); }
}
function validateGraph(value: unknown): RawRoadmap {
  const graph = record(value);
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges) || !graph.nodes.length || graph.nodes.length > 2000 || graph.edges.length > 5000) throw Error('Invalid official graph.');
  const ids = new Set<string>();
  for (const raw of graph.nodes) {
    const node = record(raw), data = record(node.data), position = record(node.position);
    if (typeof node.id !== 'string' || !ID.test(node.id) || ids.has(node.id) || typeof node.type !== 'string' || (data.label !== undefined && typeof data.label !== 'string') || ((node.type === 'topic' || node.type === 'subtopic') && typeof data.label !== 'string') || typeof position.x !== 'number' || !Number.isFinite(position.x) || typeof position.y !== 'number' || !Number.isFinite(position.y)) throw Error('Invalid official node.');
    ids.add(node.id);
  }
  for (const raw of graph.edges) {
    const edge = record(raw);
    if (typeof edge.id !== 'string' || typeof edge.source !== 'string' || !ids.has(edge.source) || typeof edge.target !== 'string' || !ids.has(edge.target)) throw Error('Invalid official edge.');
  }
  return graph as unknown as RawRoadmap;
}
async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return `sha256:${[...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
}
/** Factory keeps tests isolated and allows deterministic cache-expiry checks. */
export function createReferenceRoadmapService(fetcher: typeof fetch = fetch, clock: () => number = Date.now) {
  const maps = new Map<ReferenceMap, { expires: number; promise: Promise<ReferencePayload> }>();
  const guides = new Map<string, { expires: number; promise: Promise<{ markdown: string; url: string }> }>();
  const read = async (url: string, limit: number, accept = 'application/json') => boundedText(await fetcher(url, { headers: { Accept: accept, 'User-Agent': 'PersonalLearningRoadmap/1.0' }, redirect: 'manual', signal: AbortSignal.timeout(15000) }), limit);
  async function load(map: ReferenceMap): Promise<ReferencePayload> {
    const [raw, listing] = await Promise.all([
      read(`https://roadmap.sh/api/v1-official-roadmap/${map}`, 3_000_000),
      read(`https://api.github.com/repos/nilbuild/developer-roadmap/contents/roadmaps/${map}/content`, 2_000_000),
    ]);
    const roadmap = validateGraph(JSON.parse(raw));
    const files: unknown = JSON.parse(listing);
    if (!Array.isArray(files) || files.length > 2000) throw Error('Official guide listing unavailable.');
    const names = files.map(value => record(value)).filter(file => file.type === 'file' && typeof file.name === 'string').map(file => file.name as string);
    const skills = roadmap.nodes.filter(node => node.type === 'topic' || node.type === 'subtopic');
    if (!skills.length) throw Error('Official graph contains no skills.');
    const matched: Record<string, string> = {};
    for (const node of skills) {
      const name = names.find(file => file.length <= 300 && !file.includes('/') && !file.includes('\\') && file.endsWith(`@${node.id}.md`));
      if (!name) throw Error('The official graph and guides are temporarily inconsistent.');
      matched[node.id] = `https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/roadmaps/${map}/content/${encodeURIComponent(name)}`;
    }
    const updatedAt = record(roadmap).updatedAt;
    return { roadmap, guides: matched, source: { url: `https://roadmap.sh/${map}`, revision: await sha256(JSON.stringify(roadmap)), checkedAt: new Date(clock()).toISOString(), licenseUrl: LICENSE_URL, ...(typeof updatedAt === 'string' ? { updatedAt } : {}) }, audit: { nodes: roadmap.nodes.length, edges: roadmap.edges.length, skills: skills.length, groups: roadmap.nodes.filter(node => node.type === 'section').length } };
  }
  async function getMap(map: ReferenceMap): Promise<ReferencePayload> {
    if (!isReferenceMap(map)) throw Error('Unsupported reference roadmap.');
    const cached = maps.get(map);
    if (cached && cached.expires > clock()) return cached.promise;
    const entry = { expires: clock() + CACHE_MS, promise: load(map) };
    maps.set(map, entry);
    try { return await entry.promise; } catch (error) { if (maps.get(map) === entry) maps.delete(map); throw error; }
  }
  async function getGuide(map: ReferenceMap, nodeId: string): Promise<{ markdown: string; url: string }> {
    if (!ID.test(nodeId)) throw new ReferenceNodeNotFound('Unknown reference skill.');
    const payload = await getMap(map), url = payload.guides[nodeId];
    if (!url) throw new ReferenceNodeNotFound('Unknown reference skill.');
    const cached = guides.get(url);
    if (cached && cached.expires > clock()) return cached.promise;
    const entry = { expires: clock() + CACHE_MS, promise: read(url, 100_000, 'text/plain').then(markdown => ({ markdown, url })) };
    guides.set(url, entry);
    try { return await entry.promise; } catch (error) { if (guides.get(url) === entry) guides.delete(url); throw error; }
  }
  return { getMap, getGuide };
}
const service = createReferenceRoadmapService();
export const getReferenceRoadmap = service.getMap;
export const getReferenceGuide = service.getGuide;
