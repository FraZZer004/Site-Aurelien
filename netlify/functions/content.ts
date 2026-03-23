/**
 * GET /api/content
 * Public endpoint — returns dynamic additions and deletions stored in Netlify Blobs.
 */
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { jsonResponse } from './_utils';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const store = getStore('content-db');
    const additions = await store.get('additions', { type: 'json' }) as unknown[] | null ?? [];
    const deletions = await store.get('deletions', { type: 'json' }) as string[] | null ?? [];
    return jsonResponse({ additions, deletions });
  } catch {
    return jsonResponse({ additions: [], deletions: [] });
  }
}

export const config: Config = {
  path: '/api/content',
};
