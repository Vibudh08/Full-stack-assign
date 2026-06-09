import { createHash, randomBytes } from "node:crypto";

export const REFRESH_TOKEN_DURATION_SECONDS = 60 * 60 * 24 * 7;

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
