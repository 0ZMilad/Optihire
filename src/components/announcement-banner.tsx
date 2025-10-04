export function AnnouncementBanner() {
  return (
    <div className="flex justify-center py-1 sm:py-2">
      <div className="bg-primary/10 text-primary px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
        <span className="hidden xs:inline">{"New — "}</span>
        <a href="#ats-score" className="underline hover:no-underline">
          ATS Score Breakdown
        </a>
        <span className="hidden xs:inline">{" just shipped"}</span>
        <span className="inline xs:hidden"> - New!</span>
      </div>
    </div>
  );
}
