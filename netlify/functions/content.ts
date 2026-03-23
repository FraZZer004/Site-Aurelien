/**
 * GET /api/content
 * Public endpoint — returns dynamic additions and deletions stored in Netlify Blobs.
 * The frontend merges this with the static photos.ts to get the full photo list.
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
    const additions = (await store.getJSON('additions')) as unknown[] | null ?? [];
    const deletions = (await store.getJSON('deletions')) as string[] | null ?? [];
    return jsonResponse({ additions, deletions });
  } catch {
    // Blobs not available in local dev without netlify dev — return empty gracefully
    return jsonResponse({ additions: [], deletions: [] });
  }
}

export const config: Config = {
  path: '/api/content',
};
