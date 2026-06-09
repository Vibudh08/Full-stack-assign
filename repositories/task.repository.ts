import { Types } from "mongoose";

import { ensureDatabaseConnection } from "@/lib/db";
import { Task, type TaskDocument } from "@/models/Task";

type TaskListOptions = {
  userId: string;
  search?: string;
  status?: "pending" | "completed";
  page: number;
  limit: number;
};

type TaskUpdate = Partial<
  Pick<TaskDocument, "title" | "description" | "status" | "dueDate">
>;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createTaskFilter(
  options: Pick<TaskListOptions, "userId" | "search" | "status">,
) {
  const filter: {
    userId: string;
    status?: "pending" | "completed";
    $or?: Array<{ title: RegExp } | { description: RegExp }>;
  } = { userId: options.userId };

  if (options.status) {
    filter.status = options.status;
  }

  if (options.search) {
    const searchPattern = new RegExp(escapeRegex(options.search), "i");
    filter.$or = [{ title: searchPattern }, { description: searchPattern }];
  }

  return filter;
}

export async function findTasks(options: TaskListOptions) {
  await ensureDatabaseConnection();

  const filter = createTaskFilter(options);
  const skip = (options.page - 1) * options.limit;

  const [items, total, statusCounts] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit),
    Task.countDocuments(filter),
    Task.aggregate<{ _id: "pending" | "completed"; count: number }>([
      {
        $match: { userId: Types.ObjectId.createFromHexString(options.userId) },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const completed =
    statusCounts.find((item) => item._id === "completed")?.count ?? 0;
  const pending =
    statusCounts.find((item) => item._id === "pending")?.count ?? 0;
  const taskTotal = completed + pending;

  return {
    items,
    total,
    metrics: {
      total: taskTotal,
      completed,
      pending,
      completionPercentage:
        taskTotal === 0 ? 0 : Math.round((completed / taskTotal) * 100),
    },
  };
}

export async function findTaskById(userId: string, taskId: string) {
  await ensureDatabaseConnection();
  return Task.findOne({ _id: taskId, userId });
}

export async function createTask(
  userId: string,
  input: Pick<TaskDocument, "title" | "description" | "status" | "dueDate">,
) {
  await ensureDatabaseConnection();
  return Task.create({ ...input, userId });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: TaskUpdate,
) {
  await ensureDatabaseConnection();
  return Task.findOneAndUpdate({ _id: taskId, userId }, input, {
    new: true,
    runValidators: true,
  });
}

export async function deleteTask(userId: string, taskId: string) {
  await ensureDatabaseConnection();
  return Task.findOneAndDelete({ _id: taskId, userId });
}
