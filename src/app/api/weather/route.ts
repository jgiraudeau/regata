import { NextResponse } from 'next/server';
import { fetchWind, fetchWaves } from '@/lib/weather';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 });
    }

    const wind = await fetchWind(lat, lng, date, date);
    const waves = await fetchWaves(lat, lng, date, date);

    return NextResponse.json({
      wind,
      waves,
      model: 'arome_france',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération météo' }, { status: 500 });
  }
}
