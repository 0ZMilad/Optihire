export function AnnouncementBanner() {
  return (
    <div className="flex justify-center py-4">
      <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
        {"New — "}
        <a href="#ats-score" className="underline hover:no-underline">
          ATS Score Breakdown
        </a>
        {" just shipped"}
      </div>
    </div>
  );
}
