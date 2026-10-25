import { getReferenceGuide, getReferenceRoadmap, isReferenceMap, ReferenceNodeNotFound } from '../../../../src/lib/server-reference-roadmaps';

// This is personal-use upstream content. Keep the existing Site owner-private;
// the Sites dispatch access boundary protects this route as well as progress.
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': status === 200 ? 'private, max-age=600' : 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export async function GET(request: Request, context: { params: Promise<{ roadmap: string }> | { roadmap: string } }) {
  const { roadmap } = await context.params;
  if (!isReferenceMap(roadmap)) return response({ error: 'Choose the Java or Backend reference roadmap.' }, 404);
  const node = new URL(request.url).searchParams.get('node');
  try { return response(node === null ? await getReferenceRoadmap(roadmap) : await getReferenceGuide(roadmap, node)); }
  catch (error) {
    console.warn('[reference-roadmaps] upstream request failed:', error instanceof Error ? error.message : 'Unknown source error');
    if (error instanceof ReferenceNodeNotFound) return response({ error: 'This skill guide is not in the current official roadmap.' }, 404);
    return response({ error: `The official ${roadmap === 'java' ? 'Java' : 'Backend'} roadmap is temporarily unavailable. Retry later; your saved progress is unchanged.` }, 503);
  }
}
