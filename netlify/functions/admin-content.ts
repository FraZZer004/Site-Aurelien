/**
 * /api/admin/content  (GET | POST | DELETE)
 * Protected — requires Bearer token.
 *
 * GET    → { additions: Photo[], deletions: string[] }
 * POST   → body: Photo | Photo[]  → adds to "additions" list
 * DELETE → body: { id: string }   → adds ID to "deletions" list and removes from additions
 */
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { isAuthenticated, jsonResponse, errorResponse } from './_utils';

export default async function handler(req: Request): Promise<Response> {
  try {
    if (!isAuthenticated(req)) return errorResponse('Non autorisé — token invalide ou expiré', 401);

    const store = getStore('content-db');

    // ----- GET ---------------------------------------------------------------
    if (req.method === 'GET') {
      const additions = (await store.getJSON('additions')) as unknown[] | null ?? [];
      const deletions = (await store.getJSON('deletions')) as string[] | null ?? [];
      return jsonResponse({ additions, deletions });
    }

    // ----- POST (add photo(s)) -----------------------------------------------
    if (req.method === 'POST') {
      const body = await req.json();
      const newPhotos: unknown[] = Array.isArray(body) ? body : [body];

      const current = (await store.getJSON('additions')) as unknown[] | null ?? [];
      const updated = [...current, ...newPhotos];
      await store.setJSON('additions', updated);

      return jsonResponse({ success: true, total: updated.length });
    }

    // ----- DELETE (soft-delete by id) ----------------------------------------
    if (req.method === 'DELETE') {
      const { id } = (await req.json()) as { id: string };
      if (!id) return errorResponse('id manquant', 400);

      const deletions = (await store.getJSON('deletions')) as string[] | null ?? [];
      if (!deletions.includes(id)) {
        await store.setJSON('deletions', [...deletions, id]);
      }

      const additions = (await store.getJSON('additions')) as Array<{ id: string }> | null ?? [];
      const filtered = additions.filter((p) => p.id !== id);
      await store.setJSON('additions', filtered);

      return jsonResponse({ success: true });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[admin-content] Error:', message);
    return errorResponse(`Erreur serveur: ${message}`, 500);
  }
}

export const config: Config = {
  path: '/api/admin/content',
};
