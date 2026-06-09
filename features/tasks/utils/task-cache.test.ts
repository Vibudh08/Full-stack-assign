import { describe, expect, it } from "vitest";

import type { TaskFilters } from "@/features/tasks/services/task-api";
import {
  applyCreatedTask,
  applyDeletedTask,
  applyUpdatedTask,
} from "@/features/tasks/utils/task-cache";
import type { Task, TaskListData } from "@/types/api";

const pendingTask: Task = {
  id: "task-1",
  title: "Prepare assignment",
  description: "Finish the dashboard",
  status: "pending",
  dueDate: "2030-01-15T00:00:00.000Z",
  createdAt: "2030-01-01T00:00:00.000Z",
  updatedAt: "2030-01-01T00:00:00.000Z",
};

const allFilters: TaskFilters = {
  search: "",
  status: "all",
  page: 1,
  limit: 8,
};

function createEmptyData(): TaskListData {
  return {
    items: [],
    pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
    metrics: {
      total: 0,
      completed: 0,
      pending: 0,
      completionPercentage: 0,
    },
  };
}

describe("optimistic task cache updates", () => {
  it("adds a created task and updates metrics immediately", () => {
    const data = applyCreatedTask(createEmptyData(), allFilters, pendingTask);

    expect(data.items).toEqual([pendingTask]);
    expect(data.pagination.total).toBe(1);
    expect(data.metrics).toEqual({
      total: 1,
      completed: 0,
      pending: 1,
      completionPercentage: 0,
    });
  });

  it("moves an updated task out of a pending filter", () => {
    const initial = applyCreatedTask(
      createEmptyData(),
      { ...allFilters, status: "pending" },
      pendingTask,
    );
    const completedTask = { ...pendingTask, status: "completed" as const };
    const data = applyUpdatedTask(
      initial,
      { ...allFilters, status: "pending" },
      pendingTask,
      completedTask,
    );

    expect(data.items).toHaveLength(0);
    expect(data.pagination.total).toBe(0);
    expect(data.metrics.completed).toBe(1);
    expect(data.metrics.pending).toBe(0);
    expect(data.metrics.completionPercentage).toBe(100);
  });

  it("removes a deleted task and updates metrics", () => {
    const initial = applyCreatedTask(
      createEmptyData(),
      allFilters,
      pendingTask,
    );
    const data = applyDeletedTask(initial, allFilters, pendingTask);

    expect(data.items).toHaveLength(0);
    expect(data.pagination.total).toBe(0);
    expect(data.metrics.total).toBe(0);
  });
});
