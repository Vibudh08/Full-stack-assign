"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types/api";
import { createTaskSchema } from "@/validations/task";

type Fields = {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}) {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<Fields>(getInitialFields(task));
  const pending = createMutation.isPending || updateMutation.isPending;
  const hasChanges = task
    ? Object.entries(getInitialFields(task)).some(
        ([name, value]) => fields[name as keyof Fields] !== value,
      )
    : true;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = createTaskSchema.safeParse({
      ...fields,
      dueDate: fields.dueDate,
    });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] ??= issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    if (task) {
      await updateMutation.mutateAsync({ id: task.id, input: result.data });
    } else {
      await createMutation.mutateAsync(result.data);
    }
    onOpenChange(false);
  }

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{task ? "Edit task" : "Create a new task"}</DialogTitle>
        <DialogDescription>
          {task
            ? "Update the task details and keep your plan current."
            : "Add the details needed to move this work forward."}
        </DialogDescription>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="Task title" error={errors.title}>
            <Input
              placeholder="What needs to be done?"
              value={fields.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <Textarea
              placeholder="Add useful context..."
              value={fields.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date" error={errors.dueDate}>
              <Input
                type="date"
                value={fields.dueDate}
                onChange={(event) => update("dueDate", event.target.value)}
              />
            </Field>
            <Field label="Status" error={errors.status}>
              <select
                className="h-11 w-full rounded-xl border bg-white px-3.5 text-sm shadow-sm"
                value={fields.status}
                onChange={(event) => update("status", event.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={pending || !hasChanges}>
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getInitialFields(task?: Task | null): Fields {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "pending",
    dueDate: task?.dueDate.slice(0, 10) ?? "",
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
