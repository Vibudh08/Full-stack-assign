"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/types/api";

export function TaskDeleteDialog({
  task,
  pending,
  onOpenChange,
  onConfirm,
}: {
  task: Task | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <Dialog open={Boolean(task)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Delete this task?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. The task will be permanently removed.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={pending} onClick={onConfirm}>
            Delete task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
