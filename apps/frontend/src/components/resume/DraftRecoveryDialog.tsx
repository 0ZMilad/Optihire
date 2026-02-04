"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Clock } from "lucide-react";

interface DraftRecoveryDialogProps {
  open: boolean;
  onRecover: () => void;
  onDiscard: () => void;
  lastSaved: string | null;
}

export default function DraftRecoveryDialog({
  open,
  onRecover,
  onDiscard,
  lastSaved,
}: DraftRecoveryDialogProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDiscard()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Resume Draft Found
          </DialogTitle>
          <DialogDescription>
            You have an unsaved resume draft from a previous session.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>Last saved: {formatDate(lastSaved)}</span>
          </div>
          <p className="mt-3 text-sm">
            Would you like to continue where you left off, or start fresh?
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onDiscard} className="w-full sm:w-auto">
            Start Fresh
          </Button>
          <Button onClick={onRecover} className="w-full sm:w-auto">
            Continue Editing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
