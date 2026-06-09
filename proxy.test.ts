// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { SESSION_MARKER_COOKIE_NAME } from "@/lib/auth-constants";
import { proxy } from "@/proxy";

describe("dashboard route proxy", () => {
  it("redirects unauthenticated dashboard requests to login", () => {
    const response = proxy(new NextRequest("http://localhost/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });

  it("allows requests with a refresh cookie to continue", () => {
    const request = new NextRequest("http://localhost/tasks", {
      headers: {
        cookie: `${SESSION_MARKER_COOKIE_NAME}=active`,
      },
    });

    expect(proxy(request).status).toBe(200);
  });
});
