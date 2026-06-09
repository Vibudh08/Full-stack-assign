import { isValidObjectId } from "mongoose";
import type { z } from "zod";

import { ApiError } from "@/lib/api";
import { serializeTask } from "@/lib/serializers";
import {
  createTask,
  deleteTask,
  findTaskById,
  findTasks,
  updateTask,
} from "@/repositories/task.repository";
import type {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "@/validations/task";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type TaskQuery = z.infer<typeof taskQuerySchema>;

function assertValidTaskId(taskId: string) {
  if (!isValidObjectId(taskId)) {
    throw new ApiError("Task not found.", 404);
  }
}

export async function listUserTasks(userId: string, query: TaskQuery) {
  const result = await findTasks({ userId, ...query });

  return {
    items: result.items.map(serializeTask),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    },
    metrics: result.metrics,
  };
}

export async function getUserTask(userId: string, taskId: string) {
  assertValidTaskId(taskId);
  const task = await findTaskById(userId, taskId);

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  return serializeTask(task);
}

export async function createUserTask(userId: string, input: CreateTaskInput) {
  return serializeTask(await createTask(userId, input));
}

export async function updateUserTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  assertValidTaskId(taskId);
  const task = await updateTask(userId, taskId, input);

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }

  return serializeTask(task);
}

export async function deleteUserTask(userId: string, taskId: string) {
  assertValidTaskId(taskId);
  const task = await deleteTask(userId, taskId);

  if (!task) {
    throw new ApiError("Task not found.", 404);
  }
}
