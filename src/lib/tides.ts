import type { TideData, TideEvent } from '@/types';

const WORLDTIDES_BASE = 'https://www.worldtides.info/api/v3';

export async function fetchTides(lat: number, lng: number, date: string): Promise<TideData> {
  const apiKey = process.env.WORLDTIDES_API_KEY;

  if (!apiKey) {
    // Fallback : données simulées pour dev sans clé
    return getMockTides(date);
  }

  const url = new URL(WORLDTIDES_BASE);
  url.searchParams.set('extremes', '');
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lng.toString());
  url.searchParams.set('date', date);
  url.searchParams.set('days', '1');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`WorldTides error: ${res.status}`);

  const data = await res.json();

  const events: TideEvent[] = (data.extremes || []).map((e: { type: string; date: string; height: number }) => ({
    type: e.type === 'High' ? 'high' : 'low',
    time: e.date,
    height: Math.round(e.height * 100) / 100,
  }));

  // WorldTides ne fournit pas les coefficients (concept français)
  // On estime grossièrement à partir du marnage
  const coefficient = estimateCoefficient(events);

  return {
    referencePort: `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°W`,
    coefficient,
    events,
  };
}

function estimateCoefficient(events: TideEvent[]): number {
  if (events.length < 2) return 70; // défaut

  const highs = events.filter((e) => e.type === 'high').map((e) => e.height);
  const lows = events.filter((e) => e.type === 'low').map((e) => e.height);

  if (highs.length === 0 || lows.length === 0) return 70;

  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const range = maxHigh - minLow;

  // Estimation très approximative basée sur le marnage
  // Marnage moyen en France : ~4m (coef 70), max ~14m (coef 120, Mont St Michel)
  const coef = Math.round(20 + (range / 14) * 100);
  return Math.min(120, Math.max(20, coef));
}

function getMockTides(date: string): TideData {
  return {
    referencePort: 'Données simulées',
    coefficient: 75,
    events: [
      { type: 'low', time: `${date}T06:15:00+01:00`, height: 1.2 },
      { type: 'high', time: `${date}T12:30:00+01:00`, height: 5.1 },
      { type: 'low', time: `${date}T18:45:00+01:00`, height: 1.4 },
    ],
  };
}
