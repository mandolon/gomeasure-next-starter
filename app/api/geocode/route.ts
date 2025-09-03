// app/api/geocode/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NominatimItem = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  class?: string;
  type?: string;
  address?: {
    house_number?: string;
    road?: string;
    residential?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
  };
};

type OutItem = {
  primary: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
};

// simple in-memory TTL cache
const TTL_MS = 1000 * 60 * 5;
const MAX_KEYS = 200;
const cache = new Map<string, { ts: number; data: OutItem[] }>();

const CA_VIEWBOX = "-124.48,32.53,-114.13,42.01";

function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ");
}

function pickPrimaryRoad(a: NominatimItem["address"]) {
  if (!a) return "";
  return a.road || a.pedestrian || a.residential || a.footway || a.path || "";
}

function isCalifornia(a: NominatimItem["address"]) {
  if (!a) return false;
  return a.state === "California" || a.state_code === "CA";
}

function isLikelyHomeLike(item: NominatimItem) {
  const cls = (item.class || "").toLowerCase();
  const typ = (item.type || "").toLowerCase();

  const blockedClasses = new Set([
    "highway",
    "railway",
    "natural",
    "waterway",
    "aeroway",
    "amenity",
    "shop",
    "tourism",
    "leisure",
    "landuse",
    "place_of_worship",
    "man_made",
    "historic",
    "military",
    "office",
    "boundary",
  ]);

  if (blockedClasses.has(cls)) return false;

  const homey = new Set([
    "building",
    "house",
    "residential",
    "apartments",
    "detached",
    "semi",
    "yes",
    "address",
    "addr",
    "place",
    "dwelling",
  ]);

  const address = item.address || {};
  const looksStreetAddress =
    !!address.house_number && !!pickPrimaryRoad(address);

  return looksStreetAddress || homey.has(cls) || homey.has(typ);
}

function toOut(item: NominatimItem): OutItem {
  const a = item.address || {};
  const num = a.house_number || "";
  const road = pickPrimaryRoad(a);
  const primary =
    num && road ? `${num} ${road}` : item.display_name.split(",")[0];

  const city =
    a.city ||
    a.town ||
    a.village ||
    a.hamlet ||
    a.municipality ||
    a.county ||
    "";

  const zip = a.postcode || "";

  return {
    primary: primary.trim(),
    city: (city || "").toString(),
    zip: (zip || "").toString(),
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  };
}

function dedupe(items: OutItem[]) {
  const seen = new Set<string>();
  const out: OutItem[] = [];
  for (const it of items) {
    const key = `${it.primary}|${it.city}|${it.zip}`.toLowerCase();
    if (it.primary && !seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") || "";
  const query = normalizeQuery(raw);

  if (query.length < 3) {
    return NextResponse.json<OutItem[]>([]);
  }

  const cacheKey = query.toLowerCase();
  const hit = cache.get(cacheKey);
  const now = Date.now();
  if (hit && now - hit.ts < TTL_MS) {
    return NextResponse.json<OutItem[]>(hit.data);
  }

  // prune cache (simple)
  if (cache.size > MAX_KEYS) {
    const keys = [...cache.keys()];
    for (let i = 0; i < Math.ceil(MAX_KEYS / 4); i++) {
      cache.delete(keys[i]);
    }
  }

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=jsonv2&addressdetails=1&limit=10&countrycodes=us` +
    `&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(query)}&dedupe=1`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "GoMeasure/1.0 (contact@gomeasure.example)",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://gomeasure.example",
      },
      signal: controller.signal,
      // ensure no caching at the edge layer
      cache: "no-store",
      next: { revalidate: 0 },
    });

    clearTimeout(t);

    if (!res.ok) {
      return NextResponse.json<OutItem[]>([]);
    }

    const rawData = (await res.json()) as NominatimItem[];

    const shaped = rawData
      .filter((d) => isCalifornia(d.address))
      .filter((d) => isLikelyHomeLike(d))
      .map(toOut);

    const final = dedupe(shaped).slice(0, 6);

    cache.set(cacheKey, { ts: now, data: final });

    return NextResponse.json<OutItem[]>(final);
  } catch (_) {
    clearTimeout(t);
    return NextResponse.json<OutItem[]>([]);
  }
}
