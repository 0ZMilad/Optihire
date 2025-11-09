import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useAuth } from "./auth-provider";

import { authService } from "@/middle-service/supabase";

import { useRouter } from "next/navigation";

export function Header() {
  const { user } = useAuth();

  const router = useRouter();

  const handleSignout = async () => {
    await authService.signOut();

    router.push("/");
  };

  // const navLinks = [
  //   { name: "Start Here", href: "#start" },
  //   { name: "Benefits", href: "#benefits" },
  //   { name: "Process", href: "#process" },
  //   { name: "FAQs", href: "#faqs" },
  // ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container relative mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/optihire.png"
            alt="OptiHire Logo"
            width={50}
            height={50}
            className="h-8 w-auto"
            priority
            unoptimized
          />
        </Link>

        {/* <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
          <div className="flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Button
                key={link.name}
                variant="ghost"
                asChild
                className="font-normal text-muted-foreground transition-colors hover:text-foreground"
              >
                <a href={link.href}>{link.name}</a>
              </Button>
            ))}
          </div>
        </nav> */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline-block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button size="sm" variant="ghost">
                  {"Login"}
                </Button>
              </Link>
              <Link href="/sign-up" className="hidden md:block">
                <Button size="sm">{"Sign up"}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
