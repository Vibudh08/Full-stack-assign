import type {
  CreateTaskInput,
  TaskFilters,
  UpdateTaskInput,
} from "@/features/tasks/services/task-api";
import type { Task, TaskListData, TaskMetrics, TaskStatus } from "@/types/api";

function updateMetrics(
  metrics: TaskMetrics,
  status: TaskStatus,
  amount: 1 | -1,
) {
  const total = Math.max(0, metrics.total + amount);
  const completed = Math.max(
    0,
    metrics.completed + (status === "completed" ? amount : 0),
  );
  const pending = Math.max(
    0,
    metrics.pending + (status === "pending" ? amount : 0),
  );

  return {
    total,
    completed,
    pending,
    completionPercentage:
      total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

function updatePagination(
  data: TaskListData,
  totalChange: -1 | 0 | 1,
): TaskListData["pagination"] {
  const total = Math.max(0, data.pagination.total + totalChange);

  return {
    ...data.pagination,
    total,
    totalPages: Math.ceil(total / data.pagination.limit),
  };
}

export function taskMatchesFilters(task: Task, filters: TaskFilters) {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    task.title.toLowerCase().includes(search) ||
    task.description.toLowerCase().includes(search);
  const matchesStatus =
    filters.status === "all" || task.status === filters.status;

  return matchesSearch && matchesStatus;
}

export function createOptimisticTask(
  input: CreateTaskInput,
  id: string,
  timestamp: string,
): Task {
  return {
    id,
    title: input.title,
    description: input.description,
    status: input.status,
    dueDate: input.dueDate.toISOString(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function mergeTaskUpdate(
  task: Task,
  input: UpdateTaskInput,
  timestamp: string,
): Task {
  return {
    ...task,
    ...input,
    dueDate: input.dueDate ? input.dueDate.toISOString() : task.dueDate,
    updatedAt: timestamp,
  };
}

export function applyCreatedTask(
  data: TaskListData,
  filters: TaskFilters,
  task: Task,
) {
  const matches = taskMatchesFilters(task, filters);

  return {
    ...data,
    items:
      matches && filters.page === 1
        ? [task, ...data.items].slice(0, filters.limit)
        : data.items,
    pagination: updatePagination(data, matches ? 1 : 0),
    metrics: updateMetrics(data.metrics, task.status, 1),
  };
}

export function applyUpdatedTask(
  data: TaskListData,
  filters: TaskFilters,
  originalTask: Task,
  updatedTask: Task,
) {
  const matchedBefore = taskMatchesFilters(originalTask, filters);
  const matchesNow = taskMatchesFilters(updatedTask, filters);
  const currentIndex = data.items.findIndex(
    (task) => task.id === originalTask.id,
  );
  const withoutOriginal = data.items.filter(
    (task) => task.id !== originalTask.id,
  );
  let items = withoutOriginal;

  if (matchesNow && currentIndex >= 0) {
    items = withoutOriginal.toSpliced(currentIndex, 0, updatedTask);
  } else if (matchesNow && !matchedBefore && filters.page === 1) {
    items = [updatedTask, ...withoutOriginal].slice(0, filters.limit);
  }

  let metrics = data.metrics;
  if (originalTask.status !== updatedTask.status) {
    metrics = updateMetrics(metrics, originalTask.status, -1);
    metrics = updateMetrics(metrics, updatedTask.status, 1);
  }

  return {
    ...data,
    items,
    pagination: updatePagination(
      data,
      matchedBefore === matchesNow ? 0 : matchesNow ? 1 : -1,
    ),
    metrics,
  };
}

export function applyDeletedTask(
  data: TaskListData,
  filters: TaskFilters,
  task: Task,
) {
  const matches = taskMatchesFilters(task, filters);

  return {
    ...data,
    items: data.items.filter((item) => item.id !== task.id),
    pagination: updatePagination(data, matches ? -1 : 0),
    metrics: updateMetrics(data.metrics, task.status, -1),
  };
}
