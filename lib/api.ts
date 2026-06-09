import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorDetails = Record<string, string[] | undefined>;

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function successResponse<T>(
  data: T,
  options?: { message?: string; status?: number },
) {
  return NextResponse.json(
    {
      success: true,
      message: options?.message,
      data,
    },
    { status: options?.status ?? 200 },
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Please check the submitted fields.",
          details: error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status },
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "An account with this email already exists." },
      },
      { status: 409 },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: { message: "Something went wrong. Please try again." },
    },
    { status: 500 },
  );
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError("Request body must be valid JSON.", 400);
  }
}
