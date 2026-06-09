"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type CreateTaskInput,
  type TaskFilters,
  type UpdateTaskInput,
} from "@/features/tasks/services/task-api";
import {
  applyCreatedTask,
  applyDeletedTask,
  applyUpdatedTask,
  createOptimisticTask,
  mergeTaskUpdate,
} from "@/features/tasks/utils/task-cache";
import { getApiErrorMessage } from "@/services/api-client";
import type { TaskListData } from "@/types/api";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", filters] as const,
};

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => getTasks(filters),
    placeholderData: (previous) => previous,
  });
}

function useTaskMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
  successMessage: string,
  optimistic?: (
    snapshots: Array<[QueryKey, TaskListData | undefined]>,
    variables: TVariables,
    setData: (key: QueryKey, data: TaskListData) => void,
  ) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshots = queryClient.getQueriesData<TaskListData>({
        queryKey: taskKeys.all,
      });
      if (optimistic) {
        optimistic(snapshots, variables, (key, data) =>
          queryClient.setQueryData(key, data),
        );
      }
      return { snapshots };
    },
    onError: (error, _variables, context) => {
      context?.snapshots.forEach(
        ([key, data]: [QueryKey, TaskListData | undefined]) =>
          queryClient.setQueryData(key, data),
      );
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: () => toast.success(successMessage),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useCreateTask() {
  return useTaskMutation<CreateTaskInput>(
    createTask,
    "Task created.",
    (snapshots, input, setData) => {
      const timestamp = new Date().toISOString();
      const task = createOptimisticTask(
        input,
        `optimistic-${crypto.randomUUID()}`,
        timestamp,
      );

      snapshots.forEach(([key, data]) => {
        const filters = getFiltersFromKey(key);
        if (data && filters) {
          setData(key, applyCreatedTask(data, filters, task));
        }
      });
    },
  );
}

export function useUpdateTask() {
  return useTaskMutation<{ id: string; input: UpdateTaskInput }>(
    ({ id, input }) => updateTask(id, input),
    "Task updated.",
    (snapshots, variables, setData) => {
      const originalTask = findTaskInSnapshots(snapshots, variables.id);
      if (!originalTask) return;

      const updatedTask = mergeTaskUpdate(
        originalTask,
        variables.input,
        new Date().toISOString(),
      );

      snapshots.forEach(([key, data]) => {
        const filters = getFiltersFromKey(key);
        if (data && filters) {
          setData(
            key,
            applyUpdatedTask(data, filters, originalTask, updatedTask),
          );
        }
      });
    },
  );
}

export function useDeleteTask() {
  return useTaskMutation<string>(
    deleteTask,
    "Task deleted.",
    (snapshots, id, setData) => {
      const task = findTaskInSnapshots(snapshots, id);
      if (!task) return;

      snapshots.forEach(([key, data]) => {
        const filters = getFiltersFromKey(key);
        if (data && filters) {
          setData(key, applyDeletedTask(data, filters, task));
        }
      });
    },
  );
}

function getFiltersFromKey(key: QueryKey) {
  const filters = key[1];

  if (
    typeof filters !== "object" ||
    filters === null ||
    !("search" in filters) ||
    !("status" in filters) ||
    !("page" in filters) ||
    !("limit" in filters)
  ) {
    return null;
  }

  return filters as TaskFilters;
}

function findTaskInSnapshots(
  snapshots: Array<[QueryKey, TaskListData | undefined]>,
  id: string,
) {
  for (const [, data] of snapshots) {
    const task = data?.items.find((item) => item.id === id);
    if (task) return task;
  }

  return null;
}
