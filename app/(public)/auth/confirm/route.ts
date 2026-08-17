import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Email-confirmation callback for the Supabase PKCE flow.
 *
 * The confirmation email links to `/auth/confirm?token_hash=…&type=email&next=…`
 * (site URL is configured per-project in Supabase). Exchanging the token here
 * signs the user in and forwards the session cookies back to the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (tokenHash && type === "email") {
    const response = NextResponse.redirect(`${origin}${safeNext}`);
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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: tokenHash,
    });
    if (!error) return response;
  }

  return NextResponse.redirect(
    `${origin}/sign-in?message=${encodeURIComponent(
      "Email confirmed — please sign in."
    )}`
  );
}