import type { VercelRequest } from "@vercel/node";
import jwt from "jsonwebtoken";

function parseCookies(cookieHeader: string | undefined) {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  cookieHeader.split(";").forEach((part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

export function requireSession(req: VercelRequest) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.session;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as { role: string; iat: number; exp: number };
  } catch {
    return null;
  }
}