import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { ApiError } from "@/lib/api";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  SESSION_MARKER_COOKIE_NAME,
} from "@/lib/auth-constants";
import { REFRESH_TOKEN_DURATION_SECONDS } from "@/lib/refresh-token";
import { getServerEnv } from "@/validations/env";

export const ACCESS_TOKEN_DURATION_SECONDS = 60 * 5;

type AccessTokenPayload = {
  userId: string;
  type: "access";
};

function getSecret() {
  return new TextEncoder().encode(getServerEnv().JWT_SECRET);
}

export async function createAccessToken(userId: string) {
  return new SignJWT({ userId, type: "access" } satisfies AccessTokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("taskflow")
    .setAudience("taskflow-api")
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: "taskflow",
      audience: "taskflow-api",
    });

    if (payload.type !== "access" || typeof payload.userId !== "string") {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  const sharedOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_DURATION_SECONDS,
  } as const;

  cookieStore.set(REFRESH_COOKIE_NAME, "", {
    ...sharedOptions,
    maxAge: 0,
    path: "/",
  });
  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    ...sharedOptions,
    path: REFRESH_COOKIE_PATH,
  });
  cookieStore.set(SESSION_MARKER_COOKIE_NAME, "active", {
    ...sharedOptions,
    path: "/",
  });
}

export async function getRefreshTokenCookie() {
  return (await cookies()).get(REFRESH_COOKIE_NAME)?.value ?? null;
}

export async function deleteRefreshTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: REFRESH_COOKIE_PATH,
  });
  cookieStore.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  cookieStore.set(SESSION_MARKER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

export async function requireUserId(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError("Authentication required.", 401);
  }

  const session = await verifyAccessToken(authorization.slice(7));

  if (!session) {
    throw new ApiError("Access token is invalid or expired.", 401);
  }

  return session.userId;
}
