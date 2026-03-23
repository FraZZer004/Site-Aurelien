/**
 * GET /api/images/:key
 * Public — serves images stored in Netlify Blobs.
 * Long cache since images are content-addressed (key includes timestamp).
 */
import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export default async function handler(req: Request, context: Context): Promise<Response> {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  const key = context.params['key'];
  if (!key) return new Response('Not found', { status: 404 });

  try {
    const store = getStore('images');
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' });

    if (!result) return new Response('Not found', { status: 404 });

    const contentType =
      (result.metadata?.contentType as string) || 'image/jpeg';

    return new Response(result.data as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

export const config: Config = {
  path: '/api/images/:key',
};
