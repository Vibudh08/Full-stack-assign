import { errorResponse, readJson, successResponse } from "@/lib/api";
import { setRefreshTokenCookie } from "@/lib/auth";
import { authenticateUser, issueTokenPair } from "@/services/auth.service";
import { loginSchema } from "@/validations/auth";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await readJson(request));
    const user = await authenticateUser(input);
    const tokens = await issueTokenPair(user.id);
    await setRefreshTokenCookie(tokens.refreshToken);

    return successResponse(
      {
        user,
        accessToken: tokens.accessToken,
        accessTokenExpiresIn: tokens.accessTokenExpiresIn,
      },
      { message: "Logged in successfully." },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
