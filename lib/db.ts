// In-memory fallback for development without Cloudflare D1
export const memoryDb = {
  users: new Map<string, any>(),
  otps: new Map<string, any>(),
  bookings: new Map<string, any>(),
  donations: new Map<string, any>(),
};

export function getDb() {
  // In a real Cloudflare Workers environment, you would access the D1 binding via context or process.env (if using next-on-pages).
  // For this Node.js preview environment, we use an in-memory mock.
  return memoryDb;
}
