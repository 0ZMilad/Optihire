"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Check, Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSaveStatus, useAutoSaveEnabled, useResumeBuilderStore } from "@/stores/resume-builder-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SaveStatusIndicatorProps {
  className?: string;
  showAutoSaveToggle?: boolean;
}

export default function SaveStatusIndicator({ 
  className,
  showAutoSaveToggle = true,
}: SaveStatusIndicatorProps) {
  const { isDirty, saveStatus, lastSaved } = useSaveStatus();
  const autoSaveEnabled = useAutoSaveEnabled();
  const setAutoSaveEnabled = useResumeBuilderStore((state) => state.setAutoSaveEnabled);
  const saveDraft = useResumeBuilderStore((state) => state.saveDraft);
  
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  // Memoized handlers
  const handleSaveNow = useCallback(() => {
    saveDraft();
  }, [saveDraft]);

  const handleToggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(!autoSaveEnabled);
  }, [setAutoSaveEnabled, autoSaveEnabled]);

  // Format the last saved time
  useEffect(() => {
    if (!lastSaved) {
      setFormattedTime(null);
      return;
    }

    const updateTime = () => {
      const date = new Date(lastSaved);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);

      if (diffSecs < 10) {
        setFormattedTime("just now");
      } else if (diffSecs < 60) {
        setFormattedTime(`${diffSecs}s ago`);
      } else if (diffMins < 60) {
        setFormattedTime(`${diffMins}m ago`);
      } else {
        setFormattedTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusIcon = () => {
    if (saveStatus === 'saving') {
      return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
    }
    if (saveStatus === 'error') {
      return <AlertCircle className="size-4 text-destructive" />;
    }
    if (isDirty) {
      return <Cloud className="size-4 text-muted-foreground" />;
    }
    if (saveStatus === 'saved') {
      return <Check className="size-4 text-green-600" />;
    }
    return <Cloud className="size-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (saveStatus === 'saving') return "Saving...";
    if (saveStatus === 'error') return "Save failed";
    if (isDirty) return "Unsaved changes";
    if (saveStatus === 'saved' && formattedTime) return `Saved ${formattedTime}`;
    return "All changes saved";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Status indicator */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {getStatusIcon()}
              <span className="hidden sm:inline">{getStatusText()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
            {autoSaveEnabled && <p className="text-xs">Auto-save enabled</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Manual save button (shown when there are unsaved changes) */}
      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveNow}
          disabled={saveStatus === 'saving'}
          className="h-7 px-2"
        >
          Save now
        </Button>
      )}

      {/* Auto-save toggle */}
      {showAutoSaveToggle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAutoSave}
                className={cn(
                  "h-7 px-2",
                  !autoSaveEnabled && "text-muted-foreground"
                )}
              >
                {autoSaveEnabled ? (
                  <Cloud className="size-4" />
                ) : (
                  <CloudOff className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{autoSaveEnabled ? "Disable auto-save" : "Enable auto-save"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
