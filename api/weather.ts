import type { VercelRequest, VercelResponse } from "@vercel/node";
import process from 'process';

const WEATHERBIT_BASE = "https://api.weatherbit.io/v2.0";

function pickQuery(req: VercelRequest) {
  const lat = typeof req.query.lat === "string" ? req.query.lat : undefined;
  const lon = typeof req.query.lon === "string" ? req.query.lon : undefined;
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const country = typeof req.query.country === "string" ? req.query.country : undefined;

  return { lat, lon, city, country };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.WEATHERBIT_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing WEATHERBIT_API_KEY" });

  const { lat, lon, city, country } = pickQuery(req);

  // Require either lat+lon or city
  const hasCoords = !!lat && !!lon;
  const hasCity = !!city;

  if (!hasCoords && !hasCity) {
    return res.status(400).json({ error: "Provide lat+lon or city" });
  }

  const url = new URL(`${WEATHERBIT_BASE}/current`);
  url.searchParams.set("key", key);

  if (hasCoords) {
    url.searchParams.set("lat", lat!);
    url.searchParams.set("lon", lon!);
  } else {
    url.searchParams.set("city", city!);
    if (country) url.searchParams.set("country", country);
  }

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