import { z } from "zod";

const taskFields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title cannot exceed 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters."),
  status: z.enum(["pending", "completed"]),
  dueDate: z.coerce.date({
    error: "Due date is required.",
  }),
};

export const createTaskSchema = z.object({
  title: taskFields.title,
  description: taskFields.description.default(""),
  status: taskFields.status.default("pending"),
  dueDate: taskFields.dueDate,
});

export const updateTaskSchema = z
  .object({
    title: taskFields.title.optional(),
    description: taskFields.description.optional(),
    status: taskFields.status.optional(),
    dueDate: taskFields.dueDate.optional(),
  })
  .refine((values) => Object.keys(values).length > 0, {
    message: "Provide at least one field to update.",
  });

export const taskQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(["pending", "completed"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
