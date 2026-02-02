import Link from "next/link";

interface QuickActionsProps {
  className?: string;
}

export default function QuickActions({ className }: QuickActionsProps) {
  return (
    <section className={`grid gap-6 sm:grid-cols-3 ${className || ""}`}>
      <Link
        href="/resume"
        className="border rounded-xl p-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open Resume Builder"
      >
        <p className="font-medium">Resume builder</p>
        <p className="text-sm text-muted-foreground">Tabbed editor with live preview.</p>
      </Link>
      <Link
        href="/analyze"
        className="border rounded-xl p-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open Analysis / ATS scoring"
      >
        <p className="font-medium">ATS scoring</p>
        <p className="text-sm text-muted-foreground">Analyze against a job description.</p>
      </Link>
      <Link
        href="/applications"
        className="border rounded-xl p-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open Applications Tracker"
      >
        <p className="font-medium">Applications</p>
        <p className="text-sm text-muted-foreground">Track status in table or board.</p>
      </Link>
    </section>
  );
}
