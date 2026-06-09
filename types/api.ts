export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
    details?: Record<string, string[] | undefined>;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type TaskStatus = "pending" | "completed";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskMetrics = {
  total: number;
  completed: number;
  pending: number;
  completionPercentage: number;
};

export type TaskListData = {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metrics: TaskMetrics;
};

export type AuthData = {
  user: User;
  accessToken: string;
  accessTokenExpiresIn: number;
};
