import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/validations/auth";

describe("authentication validation", () => {
  it("normalizes a valid registration email", () => {
    const result = registerSchema.parse({
      name: "Test User",
      email: "  USER@Example.COM ",
      password: "secure-password",
    });

    expect(result.email).toBe("user@example.com");
  });

  it("rejects short registration passwords", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("requires a password when logging in", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});
