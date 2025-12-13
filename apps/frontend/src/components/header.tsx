"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

import { useAuth } from "./auth-provider";

import { authService } from "@/middle-service/supabase";

import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  const router = useRouter();

  const handleSignout = async () => {
    await authService.signOut();

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container relative mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/optihire.png"
            alt="Optihire Logo"
            width={50}
            height={50}
            className="h-8 w-auto"
            priority
            unoptimized
          />
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {pathname === "/" ? (
                <Link href="/dashboard">
                  <Button size="sm">View Dashboard</Button>
                </Link>
              ) : (
                <>
                  <span className="hidden text-sm text-muted-foreground sm:inline-block">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignout}>
                    Logout
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up" className="hidden md:block">
                <Button size="sm" className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
