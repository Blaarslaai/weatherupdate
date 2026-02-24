import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSession } from "./auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireSession(req);

  if (!session) {
    return res.status(200).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    role: session.role,
  });
}