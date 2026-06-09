"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  Check,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { Task } from "@/types/api";

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  now,
  pending,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  now: number;
  pending?: boolean;
}) {
  const completed = task.status === "completed";
  const dueDate = new Date(task.dueDate);
  const overdue = !completed && dueDate.getTime() < now;

  return (
    <Card className="group p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start gap-3">
        <button
          className={cn(
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition",
            completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-transparent hover:border-primary",
          )}
          onClick={onToggle}
          disabled={pending}
          aria-label={completed ? "Mark pending" : "Mark completed"}
        >
          <Check className="size-3.5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className={cn(
                  "font-semibold leading-6",
                  completed && "text-muted",
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  {task.description}
                </p>
              )}
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0"
                  aria-label="Open task actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-36 rounded-xl border bg-white p-1 shadow-lg"
                >
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100"
                    onSelect={onEdit}
                  >
                    <Pencil className="size-4" />
                    Edit task
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
                    onSelect={onDelete}
                  >
                    <Trash2 className="size-4" />
                    Delete task
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  completed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }
              >
                {completed ? (
                  <Check className="mr-1 size-3" />
                ) : (
                  <Circle className="mr-1 size-3" />
                )}
                {completed ? "Completed" : "Pending"}
              </Badge>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs text-muted",
                  overdue && "font-semibold text-red-600",
                )}
              >
                <CalendarDays className="size-3.5" />
                {overdue ? "Overdue · " : ""}
                {dueDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
