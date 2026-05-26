import type { ApplicationStatus } from "@/lib/job-types";

export type ApplicationStatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
  triggerClass: string;
  badgeClass: string;
  iconClass: string;
};

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  ApplicationStatusMeta
> = {
  not_applied: {
    label: "Not Applied",
    shortLabel: "Not applied",
    description: "Saved for review, no application action recorded.",
    triggerClass:
      "border-status-not-applied/30 bg-status-not-applied/10 text-status-not-applied hover:bg-status-not-applied/15",
    badgeClass:
      "border-status-not-applied/30 bg-status-not-applied/10 text-status-not-applied",
    iconClass: "text-status-not-applied",
  },
  applied: {
    label: "Applied",
    shortLabel: "Applied",
    description: "Application submitted or marked as started.",
    triggerClass:
      "border-status-applied/30 bg-status-applied/10 text-status-applied hover:bg-status-applied/15",
    badgeClass:
      "border-status-applied/30 bg-status-applied/10 text-status-applied",
    iconClass: "text-status-applied",
  },
  interviewing: {
    label: "Interviewing",
    shortLabel: "Interviewing",
    description: "Interview process is in progress.",
    triggerClass:
      "border-status-interviewing/30 bg-status-interviewing/10 text-status-interviewing hover:bg-status-interviewing/15",
    badgeClass:
      "border-status-interviewing/30 bg-status-interviewing/10 text-status-interviewing",
    iconClass: "text-status-interviewing",
  },
  offer: {
    label: "Offer Received",
    shortLabel: "Offer",
    description: "Offer received or final outcome is positive.",
    triggerClass:
      "border-status-offer/30 bg-status-offer/10 text-status-offer hover:bg-status-offer/15",
    badgeClass: "border-status-offer/30 bg-status-offer/10 text-status-offer",
    iconClass: "text-status-offer",
  },
  rejected: {
    label: "Rejected",
    shortLabel: "Rejected",
    description: "Application was closed or rejected.",
    triggerClass:
      "border-status-rejected/30 bg-status-rejected/10 text-status-rejected hover:bg-status-rejected/15",
    badgeClass:
      "border-status-rejected/30 bg-status-rejected/10 text-status-rejected",
    iconClass: "text-status-rejected",
  },
};

export const APPLICATION_STATUS_OPTIONS = Object.entries(
  APPLICATION_STATUS_META
) as [ApplicationStatus, ApplicationStatusMeta][];
