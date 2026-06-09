import { errorResponse, readJson, successResponse } from "@/lib/api";
import { requireUserId } from "@/lib/auth";
import { createUserTask, listUserTasks } from "@/services/task.service";
import { createTaskSchema, taskQuerySchema } from "@/validations/task";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId(request);
    const { searchParams } = new URL(request.url);
    const query = taskQuerySchema.parse(Object.fromEntries(searchParams));

    return successResponse(await listUserTasks(userId, query));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId(request);
    const input = createTaskSchema.parse(await readJson(request));

    return successResponse(await createUserTask(userId, input), {
      message: "Task created successfully.",
      status: 201,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
