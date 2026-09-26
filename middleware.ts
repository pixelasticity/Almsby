import { NextResponse, type NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/csp";

/**
 * Edge security headers — set here because the next.config.ts headers()
 * API is unreliable on Vercel edge (headers were silently dropped in
 * production responses).
 *
 * CSP uses a per-request nonce + 'strict-dynamic' so Next.js injected
 * hydration/chunk scripts work without individual nonces. The policy itself is
 * built in lib/csp.ts — a pure module with tests, because forgetting to add a
 * new external host there fails silently (story photos were blank until
 * `img-src` learned about R2).
 *
 * R2_PUBLIC_DOMAIN is read here for the bucket's custom production host. It must
 * be present in the environment this middleware is BUILT and RUN in (Vercel
 * project env / .env.local), which is the same requirement the upload path
 * already has — but note the failure mode differs: if it is missing there, the
 * header falls back to the r2.dev wildcard only. Verify the header on staging
 * after a deploy.
 */
export function middleware(_request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = contentSecurityPolicy({
    nonce,
    r2PublicDomain: process.env.R2_PUBLIC_DOMAIN,
  });

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
