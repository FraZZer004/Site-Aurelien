/**
 * POST /api/admin/upload
 * Protected — requires Bearer token.
 *
 * Accepts a JSON body with the image encoded in base64:
 * { filename: string, contentType: string, data: string (base64) }
 *
 * The client compresses/resizes the image before sending to stay under
 * the Netlify Functions 6MB body limit.
 *
 * Returns: { url: string, key: string }
 */
import type { Config } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { isAuthenticated, jsonResponse, errorResponse } from './_utils';
import { randomBytes } from 'crypto';

export default async function handler(req: Request): Promise<Response> {
  if (!isAuthenticated(req)) return errorResponse('Non autorisé', 401);
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = (await req.json()) as {
      filename: string;
      contentType: string;
      data: string; // base64
    };

    if (!body.data || !body.filename) {
      return errorResponse('Données manquantes (filename, data)', 400);
    }

    const ext = body.filename.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;

    const buffer = Buffer.from(body.data, 'base64');
    const store = getStore('images');
    await store.set(key, buffer, {
      metadata: { contentType: body.contentType || 'image/jpeg' },
    });

    return jsonResponse({ url: `/api/images/${key}`, key });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return errorResponse(`Erreur upload: ${message}`, 500);
  }
}

export const config: Config = {
  path: '/api/admin/upload',
};
