/**
 * /api/admin/content  (GET | POST | DELETE)
 * Protected — requires Bearer token.
 */
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { isAuthenticated, jsonResponse, errorResponse } from './_utils';

async function getJSON<T>(store: ReturnType<typeof getStore>, key: string, fallback: T): Promise<T> {
  const value = await store.get(key, { type: 'json' }) as T | null;
  return value ?? fallback;
}

async function setJSON(store: ReturnType<typeof getStore>, key: string, value: unknown): Promise<void> {
  await store.set(key, JSON.stringify(value));
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (!isAuthenticated(req)) return errorResponse('Non autorisé — token invalide ou expiré', 401);

    const store = getStore('content-db');

    // ----- GET ---------------------------------------------------------------
    if (req.method === 'GET') {
      const additions = await getJSON<unknown[]>(store, 'additions', []);
      const deletions = await getJSON<string[]>(store, 'deletions', []);
      return jsonResponse({ additions, deletions });
    }

    // ----- POST (add photo(s)) -----------------------------------------------
    if (req.method === 'POST') {
      const body = await req.json();
      const newPhotos: unknown[] = Array.isArray(body) ? body : [body];

      const current = await getJSON<unknown[]>(store, 'additions', []);
      const updated = [...current, ...newPhotos];
      await setJSON(store, 'additions', updated);

      return jsonResponse({ success: true, total: updated.length });
    }

    // ----- DELETE (soft-delete by id) ----------------------------------------
    if (req.method === 'DELETE') {
      const { id } = (await req.json()) as { id: string };
      if (!id) return errorResponse('id manquant', 400);

      const deletions = await getJSON<string[]>(store, 'deletions', []);
      if (!deletions.includes(id)) {
        await setJSON(store, 'deletions', [...deletions, id]);
      }

      const additions = await getJSON<Array<{ id: string }>>(store, 'additions', []);
      const filtered = additions.filter((p) => p.id !== id);
      await setJSON(store, 'additions', filtered);

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
