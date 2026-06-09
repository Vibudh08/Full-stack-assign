import bcrypt from "bcryptjs";

import { ApiError } from "@/lib/api";
import { ACCESS_TOKEN_DURATION_SECONDS, createAccessToken } from "@/lib/auth";
import {
  createRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_DURATION_SECONDS,
} from "@/lib/refresh-token";
import { serializeUser } from "@/lib/serializers";
import {
  createRefreshSession,
  findValidRefreshSession,
  revokeRefreshSession,
} from "@/repositories/refresh-session.repository";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "@/repositories/user.repository";
import type { loginSchema, registerSchema } from "@/validations/auth";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export async function registerUser(input: RegisterInput) {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new ApiError("An account with this email already exists.", 409);
  }

  const user = await createUser({
    name: input.name,
    email: input.email,
    passwordHash: await bcrypt.hash(input.password, 12),
  });

  return serializeUser(user);
}

export async function authenticateUser(input: LoginInput) {
  const user = await findUserByEmail(input.email, true);

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new ApiError("Invalid email or password.", 401);
  }

  return serializeUser(user);
}

export async function getUserProfile(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError("User account no longer exists.", 401);
  }

  return serializeUser(user);
}

export async function issueTokenPair(userId: string) {
  const refreshToken = createRefreshToken();

  await createRefreshSession(
    userId,
    hashRefreshToken(refreshToken),
    new Date(Date.now() + REFRESH_TOKEN_DURATION_SECONDS * 1000),
  );

  return {
    accessToken: await createAccessToken(userId),
    accessTokenExpiresIn: ACCESS_TOKEN_DURATION_SECONDS,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const session = await findValidRefreshSession(hashRefreshToken(refreshToken));

  if (!session) {
    throw new ApiError("Refresh token is invalid or expired.", 401);
  }

  return {
    accessToken: await createAccessToken(session.userId.toString()),
    accessTokenExpiresIn: ACCESS_TOKEN_DURATION_SECONDS,
  };
}

export async function revokeRefreshToken(refreshToken: string | null) {
  if (refreshToken) {
    await revokeRefreshSession(hashRefreshToken(refreshToken));
  }
}
