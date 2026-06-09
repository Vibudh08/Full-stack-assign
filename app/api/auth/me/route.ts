import { errorResponse, successResponse } from "@/lib/api";
import { requireUserId } from "@/lib/auth";
import { getUserProfile } from "@/services/auth.service";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId(request);
    return successResponse(await getUserProfile(userId));
  } catch (error) {
    return errorResponse(error);
  }
}
