import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'GoMeasure/1.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json([]);
  }
}