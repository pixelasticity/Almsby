/**
 * The Content-Security-Policy applied to every response (see middleware.ts).
 *
 * Lives in a pure module for one reason: this list has to be updated whenever
 * the app starts loading a resource from a new origin, and that omission is
 * INVISIBLE until something silently fails to render. It happened: photo
 * uploads worked, the URLs were correct, and every story photo was blocked by
 * `img-src 'self' data: blob:` — so the gallery and the studio thumbnails were
 * simply blank in the browser. Keeping the builder pure lets tests pin the
 * directive list instead of trusting a reviewer to remember.
 *
 * When you add an external resource (analytics, a CDN, a browser-side API),
 * add its host to the matching directive HERE.
 */
export type CspOptions = {
  /** Per-request nonce for Next.js's own scripts. */
  nonce: string;
  /**
   * The bucket's public host (R2_PUBLIC_DOMAIN), no scheme. Optional because
   * the value is only known in a configured environment — see imgSrcDirective.
   */
  r2PublicDomain?: string;
};

/**
 * `img-src` — the origins allowed to serve images.
 *
 * Story photos live in Cloudflare R2, a DIFFERENT origin from the app, and they
 * are rendered as plain <img> on three surfaces (studio thumbnails, the phone
 * preview, and the public story page).
 *
 *   - `https://*.r2.dev` — the bucket's r2.dev host, which is what local dev and
 *     any r2.dev-served deployment actually use.
 *   - the configured host — the bucket's custom production domain, knowable only
 *     from env.
 *
 * This is defence-in-depth, not the restriction itself: what may be STORED is
 * gated in lib/story/photos.ts (our own host, story-photos/ only). A stray
 * third-party URL never reaches the database, so the wildcard cannot be turned
 * into an arbitrary image proxy by a hostile value.
 */
export function imgSrcDirective(r2PublicDomain?: string): string {
  const host = (r2PublicDomain ?? "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  return [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    "https://*.r2.dev",
    host ? `https://${host}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** The full policy string, in directive order, ready for the CSP header. */
export function contentSecurityPolicy({ nonce, r2PublicDomain }: CspOptions): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    imgSrcDirective(r2PublicDomain),
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
