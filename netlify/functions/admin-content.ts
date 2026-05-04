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

    // ----- PATCH (update fields OR atomic cover swap) ------------------------
    if (req.method === 'PATCH') {
      const body = (await req.json()) as {
        ids?: string[];
        patch?: Record<string, unknown>;
        setCover?: { newId: string; oldId?: string };
      };

      // Atomic cover swap — single read-modify-write to avoid race conditions
      if (body.setCover) {
        const { newId, oldId } = body.setCover;
        const additions = await getJSON<Array<Record<string, unknown>>>(store, 'additions', []);
        const updated = additions.map((p) => {
          if (p.id === newId) return { ...p, isPreview: true };
          if (oldId && p.id === oldId) return { ...p, isPreview: false };
          return p;
        });
        await setJSON(store, 'additions', updated);
        return jsonResponse({ success: true });
      }

      const { ids, patch } = body;
      if (!ids?.length) return errorResponse('ids manquants', 400);

      const additions = await getJSON<Array<Record<string, unknown>>>(store, 'additions', []);
      const updated = additions.map((p) =>
        ids.includes(p.id as string) ? { ...p, ...patch } : p
      );
      await setJSON(store, 'additions', updated);

      return jsonResponse({ success: true, updated: ids.length });
    }

    // ----- DELETE (soft-delete by id or ids[]) --------------------------------
    if (req.method === 'DELETE') {
      let body: { id?: string; ids?: string[] } = {};
      const rawText = await req.text();
      if (rawText) {
        try { body = JSON.parse(rawText); } catch { return errorResponse('Corps JSON invalide', 400); }
      }
      const ids: string[] = body.ids ?? (body.id ? [body.id] : []);
      if (!ids.length) return errorResponse('id(s) manquant(s)', 400);

      const deletions = await getJSON<string[]>(store, 'deletions', []);
      const newIds = ids.filter((id) => !deletions.includes(id));
      if (newIds.length) await setJSON(store, 'deletions', [...deletions, ...newIds]);

      const additions = await getJSON<Array<{ id: string }>>(store, 'additions', []);
      const filtered = additions.filter((p) => !ids.includes(p.id));
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
