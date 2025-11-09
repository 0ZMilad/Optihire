import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          request.cookies.set(name, "");
          supabaseResponse.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if ((pathname === "/login" || pathname === "/sign-up") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/login", "/sign-up"],
};
