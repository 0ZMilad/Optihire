import { Badge } from "@/components/ui/badge";

export function AnnouncementBanner() {
  return (
    <div className="flex justify-center py-1 sm:py-2">
      <Badge className="h-auto rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm md:px-5">
        <span className="hidden xs:inline">{"New — "}</span>
        <a href="#ats-score" className="underline hover:no-underline">
          ATS Score Breakdown
        </a>
        <span className="hidden xs:inline">{" just shipped"}</span>
        <span className="inline xs:hidden"> - New!</span>
      </Badge>
    </div>
  );
}
