import { NextResponse } from 'next/server';
import { fetchTides } from '@/lib/tides';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 });
    }

    const tides = await fetchTides(lat, lng, date);

    return NextResponse.json(tides);
  } catch (error) {
    console.error('Tides API error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des marées' }, { status: 500 });
  }
}
