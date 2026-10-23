import { env } from 'cloudflare:workers';
import { applyProgressPatch, assertProgressLoadable, MAX_PROGRESS_BYTES, sameOriginMutation, validateProgressPatch, type ProgressDocument } from '../../../src/lib/server-progress';

// SECURITY: production dispatch MUST keep this Site owner-private. The existing
// Sites access boundary authenticates the sole owner before this worker runs.
// Owner service requests intentionally have no browser visitor-identity header.
// A shared constant key preserves that owner's data across browser and service
// access. This is not suitable for a public or multi-user Site without changing
// the data model and checking an authenticated, stable server-side identity.
const OWNER_RECORD = 'owner';
type Row = { revision: number; progress_json: string };
const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
function document(row: Row | null) {
  return { revision: row?.revision ?? 0, progress: row ? JSON.parse(row.progress_json) as ProgressDocument : null };
}
async function read(db: D1Database) {
  return db.prepare('SELECT revision, progress_json FROM progress_state WHERE id = ?').bind(OWNER_RECORD).first<Row>();
}
async function boundedJson(request: Request) {
  if (Number(request.headers.get('content-length')) > MAX_PROGRESS_BYTES) throw new Error('size');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const decoder = new TextDecoder(); let bytes = 0; let body = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_PROGRESS_BYTES) { await reader.cancel(); throw new Error('size'); }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body) as unknown;
  } finally { reader.releaseLock(); }
}
export async function GET() {
  if (!env.DB) return response({ error: 'Progress storage is temporarily unavailable.' }, 503);
  try { return response(document(await read(env.DB))); }
  catch { return response({ error: 'Progress storage is temporarily unavailable.' }, 503); }
}
export async function PATCH(request: Request) {
  if (!sameOriginMutation(request)) return response({ error: 'Cross-origin changes are not allowed.' }, 403);
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return response({ error: 'Use application/json.' }, 415);
  let patch;
  try { patch = validateProgressPatch(await boundedJson(request)); }
  catch { return response({ error: 'Invalid progress update (maximum 2 MB).' }, 400); }
  if (!env.DB) return response({ error: 'Progress storage is temporarily unavailable.' }, 503);
  try {
    const current = await read(env.DB);
    if ((current?.revision ?? 0) !== patch.baseRevision) return response(document(current), 409);
    const now = new Date().toISOString();
    let next: ProgressDocument;
    try {
      next = applyProgressPatch(document(current).progress, patch.changes, now);
      assertProgressLoadable(next);
    } catch { return response({ error: 'Progress violates roadmap constraints or exceeds the 2 MB limit.' }, 400); }
    // Atomic compare-and-swap: an update racing this read cannot be overwritten.
    const statement = current
      ? env.DB.prepare('UPDATE progress_state SET revision = revision + 1, progress_json = ?, updated_at = ? WHERE id = ? AND revision = ? RETURNING revision, progress_json')
        .bind(JSON.stringify(next), now, OWNER_RECORD, patch.baseRevision)
      : env.DB.prepare('INSERT INTO progress_state (id, revision, progress_json, updated_at) VALUES (?, 1, ?, ?) ON CONFLICT (id) DO NOTHING RETURNING revision, progress_json')
        .bind(OWNER_RECORD, JSON.stringify(next), now);
    const saved = await statement.first<Row>();
    if (!saved) return response(document(await read(env.DB)), 409);
    return response(document(saved));
  } catch { return response({ error: 'Progress storage is temporarily unavailable.' }, 503); }
}
