import { ensureDatabaseConnection } from "@/lib/db";
import { User } from "@/models/User";

export async function findUserByEmail(email: string, includePassword = false) {
  await ensureDatabaseConnection();

  const query = User.findOne({ email });
  return includePassword ? query.select("+passwordHash") : query;
}

export async function findUserById(userId: string) {
  await ensureDatabaseConnection();
  return User.findById(userId);
}

export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  await ensureDatabaseConnection();
  return User.create(input);
}
