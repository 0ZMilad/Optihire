import { type CookieOptions, createServerClient } from "@supabase/ssr";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const supabaseResponse = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const pathname = request.nextUrl.pathname;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set(name, value);
        supabaseResponse.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set(name, "");
        supabaseResponse.cookies.set(name, "", options);
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (pathname === "/auth/callback") {
    return supabaseResponse;
  }

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/sign-up") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/sign-up", "/auth/callback"],
};
