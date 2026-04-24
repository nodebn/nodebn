import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { storeSlugExists } from "@/lib/stores";

const RESERVED_FIRST_SEGMENTS = new Set([
  "api",
  "_next",
  "not-found",
  "favicon.ico",
  "dashboard",
  "login",
  "auth",
  "seller-register",
  "verify-seller",
  "upgrade",
  "forgot-password",
  "reset-password",
  "complete-invitation",
  "legal",
]);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

function copyAuthCookies(from: NextResponse, to: NextResponse) {
  const list = from.headers.getSetCookie?.() ?? [];
  if (list.length) {
    for (const c of list) {
      to.headers.append("Set-Cookie", c);
    }
    return to;
  }
  const single = from.headers.get("Set-Cookie");
  if (single) {
    to.headers.append("Set-Cookie", single);
  }
  return to;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user: { id: string } | null = null;

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return copyAuthCookies(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  if (pathname.startsWith("/login") && user) {
    return copyAuthCookies(
      supabaseResponse,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  if (pathname === "/") {
    return supabaseResponse;
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first || RESERVED_FIRST_SEGMENTS.has(first)) {
    return supabaseResponse;
  }

  if (!url || !key) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
    return supabaseResponse;
  }

  const supabaseAnon = createClient(url, key);
  const exists = await storeSlugExists(supabaseAnon, first);

  if (!exists) {
    const notFoundUrl = request.nextUrl.clone();
    notFoundUrl.pathname = "/not-found";
    const rewrite = NextResponse.rewrite(notFoundUrl);
    return copyAuthCookies(supabaseResponse, rewrite);
  }

  return supabaseResponse;
}
