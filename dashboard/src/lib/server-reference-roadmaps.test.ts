import { describe, expect, it, vi } from 'vitest';
import { createReferenceRoadmapService, ReferenceNodeNotFound } from './server-reference-roadmaps';

// Invented fixtures, not copied official graph or guide content.
const a = 'testNodeAlpha123456789', b = 'testNodeBravo123456789', section = 'testSection1234567890';
const graph = () => ({ slug: 'java', updatedAt: '2026-10-24T10:00:00Z', nodes: [{ id: a, type: 'topic', position: { x: 1, y: 2 }, data: { label: 'Invented topic' } }, { id: b, type: 'subtopic', position: { x: 3, y: 4 }, data: { label: 'Invented subtopic', oldId: 'oldIdentity1234567890' } }, { id: section, type: 'section', position: { x: 0, y: 0 }, data: {} }], edges: [{ id: 'edge-test', source: a, target: b }] });
const files = () => [{ type: 'file', name: `invented@${a}.md`, download_url: 'https://attacker.invalid/ignored' }, { type: 'file', name: `invented@${b}.md` }];
function mockSource() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('https://roadmap.sh/api/v1-official-roadmap/')) return Response.json(graph());
    if (url.startsWith('https://api.github.com/repos/nilbuild/developer-roadmap/contents/')) return Response.json(files());
    if (url.startsWith('https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/roadmaps/')) return new Response('# Invented test guide\nNo copied upstream text.');
    throw Error('Unexpected upstream URL.');
  });
}
describe('private runtime reference source', () => {
  it('returns the complete graph unchanged, exact audit counts, all matched guides and a content revision', async () => {
    const fetcher = mockSource(), service = createReferenceRoadmapService(fetcher as typeof fetch, () => 1000);
    const result = await service.getMap('java');
    expect(result.roadmap).toEqual(graph());
    expect(result.audit).toEqual({ nodes: 3, edges: 1, skills: 2, groups: 1 });
    expect(Object.keys(result.guides)).toEqual([a, b]);
    expect(result.guides[a]).toBe(`https://raw.githubusercontent.com/nilbuild/developer-roadmap/master/roadmaps/java/content/${encodeURIComponent(`invented@${a}.md`)}`);
    expect(result.source.revision).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.source.checkedAt).toBe('1970-01-01T00:00:01.000Z');
    expect(result.source.licenseUrl).toContain('/blob/master/license');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('deduplicates concurrent requests and expires its in-memory cache after ten minutes', async () => {
    let now = 0; const fetcher = mockSource(), service = createReferenceRoadmapService(fetcher as typeof fetch, () => now);
    const [one, two] = await Promise.all([service.getMap('backend'), service.getMap('backend')]);
    expect(one).toBe(two); expect(fetcher).toHaveBeenCalledTimes(2);
    now = 599999; await service.getMap('backend'); expect(fetcher).toHaveBeenCalledTimes(2);
    now = 600001; await service.getMap('backend'); expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it('fetches only a matched guide from the static raw GitHub allowlist', async () => {
    const fetcher = mockSource(), service = createReferenceRoadmapService(fetcher as typeof fetch);
    const result = await service.getGuide('java', a);
    expect(result.markdown).toContain('Invented test guide');
    expect(result.url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/nilbuild\/developer-roadmap\/master\/roadmaps\/java\/content\//);
    expect(fetcher).toHaveBeenCalledTimes(3);
    await service.getGuide('java', a); expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls.every(([url]) => !String(url).includes('attacker'))).toBe(true);
  });
  it('rejects arbitrary URLs, unknown nodes and non-skill decorative nodes', async () => {
    const fetcher = mockSource(), service = createReferenceRoadmapService(fetcher as typeof fetch);
    await expect(service.getGuide('java', 'https://attacker.invalid')).rejects.toBeInstanceOf(ReferenceNodeNotFound);
    expect(fetcher).not.toHaveBeenCalled();
    await expect(service.getGuide('java', 'unknownNode1234567890')).rejects.toBeInstanceOf(ReferenceNodeNotFound);
    await expect(service.getGuide('java', section)).rejects.toBeInstanceOf(ReferenceNodeNotFound);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('fails visibly when guide coverage is incomplete rather than returning a reduced roadmap', async () => {
    const normal = mockSource();
    const fetcher = vi.fn(async (input: RequestInfo | URL) => String(input).startsWith('https://api.github.com/') ? Response.json(files().slice(0, 1)) : normal(input));
    const service = createReferenceRoadmapService(fetcher as typeof fetch);
    await expect(service.getMap('java')).rejects.toThrow('inconsistent');
  });
  it('requires exact current IDs and never aliases oldId or duplicate .md.md files', async () => {
    for (const replacement of ['invented@oldIdentity1234567890.md', `invented@${b}.md.md`]) {
      const normal = mockSource();
      const fetcher = vi.fn(async (input: RequestInfo | URL) => String(input).startsWith('https://api.github.com/') ? Response.json([files()[0], { type: 'file', name: replacement }]) : normal(input));
      await expect(createReferenceRoadmapService(fetcher as typeof fetch).getMap('java')).rejects.toThrow('inconsistent');
    }
  });
  it('does not retain failed upstream responses in the cache', async () => {
    const fetcher = vi.fn(async () => new Response('unavailable', { status: 503 }));
    const service = createReferenceRoadmapService(fetcher as typeof fetch);
    await expect(service.getMap('java')).rejects.toThrow();
    await expect(service.getMap('java')).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it('rejects guides above 100 KB', async () => {
    const normal = mockSource();
    const fetcher = vi.fn(async (input: RequestInfo | URL) => String(input).startsWith('https://raw.githubusercontent.com/') ? new Response('x'.repeat(100001)) : normal(input));
    const service = createReferenceRoadmapService(fetcher as typeof fetch);
    await expect(service.getGuide('java', a)).rejects.toThrow('limit');
  });
  it('rejects malformed graphs and unsupported roadmap names', async () => {
    const fetcher = vi.fn(async () => Response.json({ nodes: [], edges: [] }));
    const service = createReferenceRoadmapService(fetcher as typeof fetch);
    await expect(service.getMap('java')).rejects.toThrow('graph');
    await expect(service.getMap('other' as 'java')).rejects.toThrow('Unsupported');
  });
});
