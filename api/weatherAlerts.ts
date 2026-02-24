import type { VercelRequest, VercelResponse } from "@vercel/node";
import process from 'process';

const WEATHERBIT_BASE = "https://api.weatherbit.io/v2.0";

function pickQuery(req: VercelRequest) {
  const city = typeof req.body.city === "string" ? req.body.city : undefined;
  const country = typeof req.body.country === "string" ? req.body.country : undefined;

  return { city, country };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.WEATHERBIT_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing WEATHERBIT_API_KEY" });

  const { city, country } = pickQuery(req);

  const hasCity = !!city;
  const hasCountry = !!country;

  if (!hasCity && hasCountry) {
    return res.status(400).json({ error: "Provide a city and country" });
  }

  const url = new URL(`${WEATHERBIT_BASE}/alerts`);
  url.searchParams.set("key", key);

  url.searchParams.set("city", city!);
  url.searchParams.set("country", country);

  try {
    const upstream = await fetch(url.toString(), {
      headers: { "accept": "application/json" },
    });

    // Basic cache
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({
        error: "Upstream Weatherbit error",
        status: upstream.status,
        details: text.slice(0, 500),
      });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(502).json({ error: "Network error contacting Weatherbit", details: String(e?.message ?? e) });
  }
}