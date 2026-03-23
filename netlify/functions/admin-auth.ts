/**
 * POST /api/admin/auth
 * Login with the shared admin password.
 * Returns a signed token valid for 7 days.
 */
import type { Config } from '@netlify/functions';
import { createToken, jsonResponse, errorResponse } from './_utils';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    if (!process.env.ADMIN_PASSWORD) {
      return errorResponse('ADMIN_PASSWORD non configuré sur Netlify', 500);
    }

    const body = (await req.json()) as { password?: string };

    if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
      await new Promise((r) => setTimeout(r, 500));
      return errorResponse('Mot de passe incorrect', 401);
    }

    const token = createToken();
    return jsonResponse({ token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[admin-auth] Error:', message);
    return errorResponse(`Erreur serveur: ${message}`, 500);
  }
}

export const config: Config = {
  path: '/api/admin/auth',
};
