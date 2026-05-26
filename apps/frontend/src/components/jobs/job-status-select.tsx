"use client";

import { CheckCircle2, Clock, Minus, Trophy, XCircle } from "lucide-react";
import type { ElementType } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@/lib/job-types";
import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_OPTIONS,
} from "@/lib/status-styles";
import { cn } from "@/lib/utils";

export const STATUS_ICON_MAP: Record<ApplicationStatus, ElementType> = {
  not_applied: Minus,
  applied: CheckCircle2,
  interviewing: Clock,
  offer: Trophy,
  rejected: XCircle,
};

interface JobStatusSelectProps {
  status: ApplicationStatus;
  onChange: (status: ApplicationStatus) => void | Promise<void>;
  ariaLabel: string;
  className?: string;
}

export function JobStatusSelect({
  status,
  onChange,
  ariaLabel,
  className,
}: JobStatusSelectProps) {
  const meta = APPLICATION_STATUS_META[status];
  const StatusIcon = STATUS_ICON_MAP[status];

  return (
    <Select
      value={status}
      onValueChange={(value) => void onChange(value as ApplicationStatus)}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "h-9 min-w-40 justify-start gap-2 rounded-lg border px-3 text-xs font-medium",
          meta.triggerClass,
          className
        )}
      >
        <StatusIcon className={cn("size-3.5 shrink-0", meta.iconClass)} />
        <SelectValue placeholder="Application status" />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STATUS_OPTIONS.map(([value, option]) => {
          const OptionIcon = STATUS_ICON_MAP[value];
          return (
            <SelectItem
              key={value}
              value={value}
              textValue={option.label}
              className="text-xs"
            >
              <div className="flex items-center gap-2">
                <OptionIcon
                  className={cn("size-3.5 shrink-0", option.iconClass)}
                  aria-hidden
                />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
