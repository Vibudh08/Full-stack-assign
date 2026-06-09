"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskDeleteDialog } from "@/features/tasks/components/task-delete-dialog";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskMetrics } from "@/features/tasks/components/task-metrics";
import { TaskTable } from "@/features/tasks/components/task-table";
import { TaskToolbar } from "@/features/tasks/components/task-toolbar";
import { TASK_PAGE_SIZE } from "@/features/tasks/constants";
import {
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks/use-tasks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Task, TaskStatus } from "@/types/api";

export function Dashboard({
  view = "dashboard",
}: {
  view?: "dashboard" | "tasks";
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [now] = useState(() => Date.now());
  const debouncedSearch = useDebouncedValue(search);
  const filters = {
    search: debouncedSearch,
    status,
    page,
    limit: TASK_PAGE_SIZE,
  };
  const tasksQuery = useTasks(filters);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  useEffect(() => {
    const open = () => {
      setEditingTask(null);
      setFormOpen(true);
    };
    window.addEventListener("taskflow:create-task", open);
    return () => window.removeEventListener("taskflow:create-task", open);
  }, []);

  const data = tasksQuery.data;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge className="mb-3 bg-indigo-50 text-primary">
            {view === "dashboard" ? "Dashboard" : "My tasks"}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {view === "dashboard"
              ? "Keep your day moving."
              : "Manage every task."}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {view === "dashboard"
              ? "Review progress, manage priorities, and finish what matters."
              : "Search, filter, update, and organize all your work."}
          </p>
        </div>
        <Button
          className="sm:hidden"
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>

      {view === "dashboard" && (
        <TaskMetrics metrics={data?.metrics} loading={tasksQuery.isLoading} />
      )}

      <section className={view === "dashboard" ? "mt-7" : "mt-6"}>
        <TaskToolbar
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {tasksQuery.isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          {tasksQuery.isError && (
            <Card className="col-span-full p-8 text-center">
              <AlertCircle className="mx-auto size-8 text-red-500" />
              <h3 className="mt-3 font-semibold">Unable to load tasks</h3>
              <p className="mt-1 text-sm text-muted">
                Check your connection and try again.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => tasksQuery.refetch()}
              >
                Try again
              </Button>
            </Card>
          )}
          {!tasksQuery.isLoading &&
            !tasksQuery.isError &&
            data &&
            (view === "tasks" ? (
              <div className="col-span-full">
                <TaskTable
                  tasks={data.items}
                  now={now}
                  pending={updateMutation.isPending}
                  onToggle={(task) =>
                    updateMutation.mutate({
                      id: task.id,
                      input: {
                        status:
                          task.status === "completed" ? "pending" : "completed",
                      },
                    })
                  }
                  onEdit={(task) => {
                    setEditingTask(task);
                    setFormOpen(true);
                  }}
                  onDelete={setDeletingTask}
                />
              </div>
            ) : (
              data.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  now={now}
                  pending={updateMutation.isPending}
                  onToggle={() =>
                    updateMutation.mutate({
                      id: task.id,
                      input: {
                        status:
                          task.status === "completed" ? "pending" : "completed",
                      },
                    })
                  }
                  onEdit={() => {
                    setEditingTask(task);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeletingTask(task)}
                />
              ))
            ))}
          {!tasksQuery.isLoading &&
            !tasksQuery.isError &&
            data?.items.length === 0 && (
              <Card className="col-span-full p-10 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-primary">
                  <ClipboardList className="size-6" />
                </div>
                <h3 className="mt-4 font-semibold">No tasks found</h3>
                <p className="mt-1 text-sm text-muted">
                  {search || status !== "all"
                    ? "Try changing your search or filter."
                    : "Create your first task to start making progress."}
                </p>
                {!search && status === "all" && (
                  <Button className="mt-4" onClick={() => setFormOpen(true)}>
                    <Plus className="size-4" />
                    Create task
                  </Button>
                )}
              </Card>
            )}
        </div>

        {(data?.pagination.totalPages ?? 0) > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-muted">
              Page {data?.pagination.page} of {data?.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                disabled={page >= (data?.pagination.totalPages ?? 1)}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {formOpen && (
        <TaskFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          task={editingTask}
        />
      )}
      <TaskDeleteDialog
        task={deletingTask}
        pending={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null);
        }}
        onConfirm={async () => {
          if (!deletingTask) return;
          await deleteMutation.mutateAsync(deletingTask.id);
          setDeletingTask(null);
        }}
      />
    </main>
  );
}
