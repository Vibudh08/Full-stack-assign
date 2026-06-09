"use client";

import { CalendarDays, Check, Circle, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskCard } from "@/features/tasks/components/task-card";
import { cn } from "@/lib/cn";
import type { Task } from "@/types/api";

type TaskActions = {
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskTable({
  tasks,
  now,
  pending,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  now: number;
  pending?: boolean;
} & TaskActions) {
  return (
    <>
      <div className="grid gap-3 md:hidden">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            now={now}
            pending={pending}
            onToggle={() => onToggle(task)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
          />
        ))}
      </div>
      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead className="border-b bg-slate-50/80">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="w-14 px-5 py-4">
                  <span className="sr-only">Complete</span>
                </th>
                <th className="px-3 py-4">Task</th>
                <th className="w-36 px-3 py-4">Status</th>
                <th className="w-40 px-3 py-4">Due date</th>
                <th className="w-36 px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => {
                const completed = task.status === "completed";
                const dueDate = new Date(task.dueDate);
                const overdue = !completed && dueDate.getTime() < now;

                return (
                  <tr
                    key={task.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4 align-top">
                      <button
                        className={cn(
                          "grid size-6 place-items-center rounded-full border-2 transition",
                          completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-transparent hover:border-primary",
                        )}
                        onClick={() => onToggle(task)}
                        disabled={pending}
                        aria-label={
                          completed ? "Mark pending" : "Mark completed"
                        }
                      >
                        <Check className="size-3.5" />
                      </button>
                    </td>
                    <td className="max-w-md px-3 py-4 align-top">
                      <p
                        className={cn(
                          "font-semibold",
                          completed && "text-muted",
                        )}
                      >
                        {task.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                        {task.description || "No description"}
                      </p>
                    </td>
                    <td className="px-3 py-4 align-top">
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
                    </td>
                    <td className="px-3 py-4 align-top">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm text-muted",
                          overdue && "font-semibold text-red-600",
                        )}
                      >
                        <CalendarDays className="size-4" />
                        {dueDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {overdue && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Overdue
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(task)}
                          aria-label="Edit task"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(task)}
                          aria-label="Delete task"
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
