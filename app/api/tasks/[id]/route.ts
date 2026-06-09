import { errorResponse, readJson, successResponse } from "@/lib/api";
import { requireUserId } from "@/lib/auth";
import {
  deleteUserTask,
  getUserTask,
  updateUserTask,
} from "@/services/task.service";
import { updateTaskSchema } from "@/validations/task";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getTaskId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const id = await getTaskId(context);

    return successResponse(await getUserTask(userId, id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const id = await getTaskId(context);
    const input = updateTaskSchema.parse(await readJson(request));

    return successResponse(await updateUserTask(userId, id, input), {
      message: "Task updated successfully.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const userId = await requireUserId(request);
    const id = await getTaskId(context);

    await deleteUserTask(userId, id);
    return successResponse(null, { message: "Task deleted successfully." });
  } catch (error) {
    return errorResponse(error);
  }
}
