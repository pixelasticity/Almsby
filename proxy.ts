import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

const PUBLIC_ONLY = ["/sign-in", "/sign-up"];
const PROTECTED_PREFIXES = ["/dashboard", "/products", "/settings"];
const DEV_SESSION_COOKIE = "almsby_dev_session";

/**
 * Session source. Dev uses fake credentials (a local cookie — no Supabase
 * network calls, no env access); production uses the real Supabase session.
 * The redirect logic in `proxy` below is identical for both: there is
 * intentionally NO dev bypass.
 *
 * Next.js 16 convention: this file (proxy.ts) replaces middleware.ts.
 */
async function resolveSession(request: NextRequest): Promise<
  { id: string; email?: string | null } | null
> {
  if (process.env.NODE_ENV === "development") {
    return request.cookies.get(DEV_SESSION_COOKIE)
      ? { id: "dev-user", email: "dev@almsby.local" }
      : null;
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function proxy(request: NextRequest) {
  const user = await resolveSession(request);
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && PUBLIC_ONLY.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/dashboard/:path*",
    "/products/:path*",
    "/settings/:path*",
  ],
};