import type { VercelRequest, VercelResponse } from "@vercel/node";
import process from 'process';
import { requireSession } from '../auth/auth.js';

const WEATHERBIT_BASE = "https://api.weatherbit.io/v2.0";

function formatDateUTC(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLastThreeDayRangeUtc() {
  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  end.setUTCDate(end.getUTCDate());
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 3);

  return {
    startDate: formatDateUTC(start),
    endDate: formatDateUTC(end),
  };
}

function pickQuery(req: VercelRequest) {
  const city = typeof req.body.city === "string" ? req.body.city : undefined;
  const country = typeof req.body.country === "string" ? req.body.country : undefined;
  const refresh =
    req.query.refresh === "1" ||
    req.query.refresh === "true" ||
    req.body?.refresh === true;

  return { city, country, refresh };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const key = process.env.WEATHERBIT_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing WEATHERBIT_API_KEY" });

  const { city, country, refresh } = pickQuery(req);

  const hasCity = !!city;
  const hasCountry = !!country;

  if (!hasCity && hasCountry) {
    return res.status(400).json({ error: "Provide a city and country" });
  }

  const { startDate, endDate } = getLastThreeDayRangeUtc();

  const url = new URL(`${WEATHERBIT_BASE}/history/daily`);
  url.searchParams.set("key", key);
  url.searchParams.set("city", city!);
  url.searchParams.set("country", country);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  try {
    const upstream = await fetch(url.toString(), {
      headers: { "accept": "application/json" },
      cache: refresh ? "no-store" : "default",
    });

    if (refresh) {
      res.setHeader("Cache-Control", "no-store");
    } else {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    }

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
    return res.status(502).json({
      error: "Network error contacting Weatherbit",
      details: String(e?.message ?? e),
    });
  }
}
