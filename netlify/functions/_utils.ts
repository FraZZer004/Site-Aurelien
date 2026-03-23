import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Token helpers (HMAC-SHA256, no external dependencies)
// ---------------------------------------------------------------------------

interface TokenPayload {
  exp: number;
  jti: string; // random nonce
}

export function createToken(): string {
  const secret = process.env.ADMIN_PASSWORD!;
  const payload: TokenPayload = {
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    jti: randomBytes(8).toString('hex'),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): boolean {
  try {
    const secret = process.env.ADMIN_PASSWORD!;
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return false;
    const data = token.slice(0, dotIndex);
    const sig = token.slice(dotIndex + 1);

    const expectedSig = createHmac('sha256', secret).update(data).digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

    const payload: TokenPayload = JSON.parse(
      Buffer.from(data, 'base64url').toString()
    );
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAuthenticated(req: Request): boolean {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return verifyToken(auth.slice(7));
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
