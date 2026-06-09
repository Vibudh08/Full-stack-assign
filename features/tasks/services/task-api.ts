import type { z } from "zod";

import { apiClient } from "@/services/api-client";
import type { ApiSuccess, Task, TaskListData, TaskStatus } from "@/types/api";
import type { createTaskSchema, updateTaskSchema } from "@/validations/task";

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = {
  search: string;
  status: TaskStatus | "all";
  page: number;
  limit: number;
};

export async function getTasks(filters: TaskFilters) {
  const { data } = await apiClient.get<ApiSuccess<TaskListData>>("/tasks", {
    params: {
      search: filters.search || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      page: filters.page,
      limit: filters.limit,
    },
  });
  return data.data;
}

export async function createTask(input: CreateTaskInput) {
  const { data } = await apiClient.post<ApiSuccess<Task>>("/tasks", input);
  return data.data;
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const { data } = await apiClient.patch<ApiSuccess<Task>>(
    `/tasks/${id}`,
    input,
  );
  return data.data;
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/tasks/${id}`);
}
