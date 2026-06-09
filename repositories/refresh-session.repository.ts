import { ensureDatabaseConnection } from "@/lib/db";
import { RefreshSession } from "@/models/RefreshSession";

export async function createRefreshSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  await ensureDatabaseConnection();
  return RefreshSession.create({ userId, tokenHash, expiresAt });
}

export async function findValidRefreshSession(tokenHash: string) {
  await ensureDatabaseConnection();

  return RefreshSession.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
}

export async function revokeRefreshSession(tokenHash: string) {
  await ensureDatabaseConnection();
  await RefreshSession.deleteOne({ tokenHash });
}
