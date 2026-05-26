import { ClipboardCheck, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface QuickActionsProps {
  className?: string;
}

export default memo(function QuickActions({ className }: QuickActionsProps) {
  const actions = [
    {
      href: "/dashboard/resumes",
      label: "Resume builder",
      description: "Create, edit, and download resume versions.",
      icon: FileText,
      ariaLabel: "Open Resume Builder",
    },
    {
      href: "/dashboard/audit",
      label: "ATS audit",
      description: "Compare a resume against a job description.",
      icon: ClipboardCheck,
      ariaLabel: "Open ATS Audit",
    },
    {
      href: "/dashboard/jobs",
      label: "Job matches",
      description: "Review curated roles and update application status.",
      icon: FolderOpen,
      ariaLabel: "Open Job Matches",
    },
  ];

  return (
    <section className={`space-y-3 ${className || ""}`}>
      <div>
        <h2 className="text-base font-semibold">Core workflows</h2>
        <p className="text-sm text-muted-foreground">
          Move from resume readiness to audit insight to job-match review.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-lg border bg-card p-5 transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={action.ariaLabel}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-4 font-medium">{action.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
});
