import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs sm:text-sm">
                O
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              OptiHire
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <a
              href="#start"
              className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Here
            </a>
            <a
              href="#benefits"
              className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </a>
            <a
              href="#process"
              className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              Process
            </a>
            <a
              href="#faqs"
              className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQs
            </a>
          </div>

          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5">
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
