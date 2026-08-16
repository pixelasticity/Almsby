import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

const PUBLIC_ONLY = ["/sign-in", "/sign-up"];
const PROTECTED_PREFIXES = ["/dashboard", "/products", "/settings"];
/**
 * Auth guard (Next.js 16 `proxy` convention). Resolves the session from the
 * Supabase client (request cookies). In dev the local Supabase CLI (GoTrue)
 * provides it; in production the hosted project does. There is no dev bypass.
 */
async function resolveSession(request: NextRequest): Promise<
  { id: string; email?: string | null } | null
> {
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