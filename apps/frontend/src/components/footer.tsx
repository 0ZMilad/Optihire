import { Github, Linkedin, X } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t sm:mt-20 lg:mt-24">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Optihire
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:flex">
              <a
                href="#benefits"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Benefits
              </a>
              <a
                href="#process"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Process
              </a>
              <Link
                href="/privacy"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Terms of Service
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="X (Twitter)"
              >
                <X className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#"
                className="rounded-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
