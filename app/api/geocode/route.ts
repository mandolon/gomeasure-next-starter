import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  const CA_VIEWBOX = "-124.48,32.53,-114.13,42.01";

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "GoMeasure/1.0",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const data = await response.json();
    const filtered = data
      .filter((d: any) => {
        const a = d.address || {};
        return a.state === "California" || a.state_code === "CA";
      })
      .slice(0, 5)
      .map((d: any) => {
        const a = d.address || {};
        const num = a.house_number || "";
        const road = a.road || a.pedestrian || a.footway || a.path || "";
        const primary =
          num && road ? `${num} ${road}` : d.display_name.split(",")[0];
        const city =
          a.city ||
          a.town ||
          a.village ||
          a.hamlet ||
          a.municipality ||
          a.county ||
          "";
        const zip = a.postcode || "";
        return { primary, city, zip, lat: d.lat, lon: d.lon };
      });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json([]);
  }
}
