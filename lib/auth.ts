import { createHmac } from "crypto";

const SECRET = process.env.JWT_SECRET || "super-secret-kali-mata-key";

export function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSignature = createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    if (signature === expectedSignature) {
      return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    }
    return null;
  } catch (e) {
    return null;
  }
}
