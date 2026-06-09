import { errorResponse, readJson, successResponse } from "@/lib/api";
import { setRefreshTokenCookie } from "@/lib/auth";
import { issueTokenPair, registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validations/auth";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await readJson(request));
    const user = await registerUser(input);
    const tokens = await issueTokenPair(user.id);
    await setRefreshTokenCookie(tokens.refreshToken);

    return successResponse(
      {
        user,
        accessToken: tokens.accessToken,
        accessTokenExpiresIn: tokens.accessTokenExpiresIn,
      },
      {
        message: "Account created successfully.",
        status: 201,
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
