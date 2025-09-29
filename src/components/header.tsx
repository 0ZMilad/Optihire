import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-card">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                O
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">OptiHire</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#start"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Here
            </a>
            <a
              href="#benefits"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </a>
            <a
              href="#process"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Process
            </a>
            <a
              href="#faqs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQs
            </a>
          </div>

          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Go to Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
