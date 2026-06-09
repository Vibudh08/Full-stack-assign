import { describe, expect, it } from "vitest";

import { createTaskSchema, updateTaskSchema } from "@/validations/task";

describe("task validation", () => {
  it("coerces a valid due date", () => {
    const result = createTaskSchema.parse({
      title: "Ship assignment",
      dueDate: "2030-01-15",
    });

    expect(result.dueDate).toBeInstanceOf(Date);
    expect(result.status).toBe("pending");
    expect(result.description).toBe("");
  });

  it("returns a meaningful error for an empty due date", () => {
    const result = createTaskSchema.safeParse({
      title: "Ship assignment",
      dueDate: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.dueDate).toContain(
        "Due date is required.",
      );
    }
  });

  it("rejects empty update payloads", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });
});
