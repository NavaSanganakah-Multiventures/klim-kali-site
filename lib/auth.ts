const SECRET = process.env.JWT_SECRET || "super-secret-kali-mata-key";

export async function signToken(payload: any): Promise<string> {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${body}`));
  const signature = Buffer.from(signatureBuffer).toString("base64url");
  
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<any | null> {
  try {
    const [header, body, signature] = token.split(".");
    
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const expectedSignatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${body}`));
    const expectedSignature = Buffer.from(expectedSignatureBuffer).toString("base64url");
    
    if (signature === expectedSignature) {
      return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    }
    return null;
  } catch (e) {
    return null;
  }
}
