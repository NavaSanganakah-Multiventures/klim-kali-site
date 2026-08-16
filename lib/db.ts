// In-memory fallback for development without Cloudflare D1
export const memoryDb = {
  users: new Map<string, any>(),
  otps: new Map<string, any>(),
  bookings: new Map<string, any>(),
  donations: new Map<string, any>(),
};

import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getD1() {
  try {
    return getCloudflareContext().env.DB ?? null;
  } catch (e) {
    return null;
  }
}

export function getDb() {
  return memoryDb;
}
