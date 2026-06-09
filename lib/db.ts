import "server-only";

import dns from "node:dns";

import mongoose from "mongoose";

import { getServerEnv } from "@/validations/env";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache = globalForMongoose.mongooseCache ?? {
  connection: null,
  promise: null,
};

globalForMongoose.mongooseCache = cache;

let dnsConfigured = false;

function configureDevelopmentDns() {
  if (dnsConfigured || process.env.NODE_ENV === "production") {
    return;
  }

  const dnsServers = getServerEnv()
    .DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  dnsConfigured = true;
}

export async function ensureDatabaseConnection() {
  if (cache.connection) {
    return cache.connection;
  }

  configureDevelopmentDns();

  cache.promise ??= mongoose.connect(getServerEnv().MONGODB_URI, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
