import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  const navLinks = [
    { name: "Start Here", href: "#start" },
    { name: "Benefits", href: "#benefits" },
    { name: "Process", href: "#process" },
    { name: "FAQs", href: "#faqs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary sm:h-8 sm:w-8">
            <span className="text-xs font-bold text-primary-foreground sm:text-sm">
              O
            </span>
          </div>
          <span className="text-lg font-bold text-foreground sm:text-xl">
            OptiHire
          </span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
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
        </nav>

        <div className="flex items-center">
          <Link href="/login" className="hidden md:block">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
