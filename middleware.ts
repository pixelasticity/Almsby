import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge security headers — set here because the next.config.ts headers()
 * API is unreliable on Vercel edge (headers were silently dropped in
 * production responses).
 *
 * CSP uses a per-request nonce + 'strict-dynamic' so Next.js injected
 * hydration/chunk scripts work without individual nonces.
 *
 * NOTE: if you add external resources (analytics, CDN, browser-side
 * APIs), update the relevant CSP directives here:
 *   - script-src: external JS
 *   - connect-src: fetch/XHR/WebSocket endpoints (Supabase listed)
 *   - img-src / font-src / style-src: hosts for those resource types
 */
export function middleware(_request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("X-Nonce", nonce);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
