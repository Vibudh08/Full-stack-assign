import type { TaskDocument } from "@/models/Task";

type UserLike = {
  _id: { toString(): string };
  name: string;
  email: string;
  createdAt: Date;
};

export function serializeUser(user: UserLike) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeTask(task: TaskDocument & { _id: unknown }) {
  return {
    id: String(task._id),
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
