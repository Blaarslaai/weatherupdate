import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const APP_ACCESS_TOKEN = process.env.APP_ACCESS_TOKEN!;

function setCookie(res: VercelResponse, name: string, value: string) {
  // Secure should be true in prod (https). Vercel is https.
  const cookie = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    "Max-Age=86400", // 1 day
  ].join("; ");
  res.setHeader("Set-Cookie", cookie);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!JWT_SECRET || !APP_ACCESS_TOKEN) {
    return res.status(500).json({ error: "Server auth not configured" });
  }

  const { token } = req.body ?? {};
  if (typeof token !== "string" || token.length < 6) {
    return res.status(400).json({ error: "Missing token" });
  }

  // Simple validation: compare to env token
  if (token !== APP_ACCESS_TOKEN) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const sessionJwt = jwt.sign({ role: "user" }, JWT_SECRET, { expiresIn: "1d" });

  setCookie(res, "session", sessionJwt);
  return res.status(200).json({ ok: true });
}