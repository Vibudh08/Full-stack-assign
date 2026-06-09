import { ApiError, errorResponse, successResponse } from "@/lib/api";
import { deleteRefreshTokenCookie, getRefreshTokenCookie } from "@/lib/auth";
import { refreshAccessToken } from "@/services/auth.service";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenCookie();

    if (!refreshToken) {
      throw new ApiError("Refresh token is required.", 401);
    }

    const tokens = await refreshAccessToken(refreshToken);

    return successResponse({
      accessToken: tokens.accessToken,
      accessTokenExpiresIn: tokens.accessTokenExpiresIn,
    });
  } catch (error) {
    await deleteRefreshTokenCookie();
    return errorResponse(error);
  }
}
