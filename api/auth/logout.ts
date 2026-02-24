import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    "session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0"
  );
  res.status(200).json({ ok: true });
}