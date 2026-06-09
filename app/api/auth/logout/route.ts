import { errorResponse, successResponse } from "@/lib/api";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "@/lib/auth";
import { revokeRefreshToken } from "@/services/auth.service";

export async function POST() {
  try {
    await revokeRefreshToken(await getRefreshTokenCookie());
    await deleteRefreshTokenCookie();

    return successResponse(null, { message: "Logged out successfully." });
  } catch (error) {
    await deleteRefreshTokenCookie();
    return errorResponse(error);
  }
}
