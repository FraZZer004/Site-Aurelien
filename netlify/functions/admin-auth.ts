/**
 * POST /api/admin/auth
 * Login with the shared admin password.
 * Returns a signed JWT-like token valid for 7 days.
 */
import type { Config } from '@netlify/functions';
import { createToken, jsonResponse, errorResponse } from './_utils';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = (await req.json()) as { password?: string };

    if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
      // Wait a bit to slow down brute force
      await new Promise((r) => setTimeout(r, 500));
      return errorResponse('Mot de passe incorrect', 401);
    }

    const token = createToken();
    return jsonResponse({ token });
  } catch {
    return errorResponse('Requête invalide', 400);
  }
}

export const config: Config = {
  path: '/api/admin/auth',
};
