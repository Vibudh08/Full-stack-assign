import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required.")
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a valid MongoDB connection string.",
    ),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must contain at least 32 characters."),
  DNS_SERVERS: z.string().optional(),
});

let cachedEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  cachedEnv ??= serverEnvSchema.parse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    DNS_SERVERS: process.env.DNS_SERVERS,
  });

  return cachedEnv;
}
