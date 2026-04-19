import type { WindPoint, WavePoint } from '@/types';
import { hasSwell } from './geo';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/meteofrance';
const MARINE_BASE = 'https://marine-api.open-meteo.com/v1/marine';

async function fetchWithRetry(url: string, retries = 3, delayMs = 1000): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw new Error('Limite de requêtes météo atteinte, réessayez dans quelques minutes.');
    }
    return res;
  }
  throw new Error('Impossible de contacter le service météo.');
}

export async function fetchWind(lat: number, lng: number, startDate: string, endDate: string): Promise<WindPoint[]> {
  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('hourly', 'wind_speed_10m,wind_direction_10m,wind_gusts_10m');
  url.searchParams.set('models', 'arome_france');
  url.searchParams.set('timezone', 'Europe/Paris');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  const res = await fetchWithRetry(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();
  const hourly = data.hourly;

  if (!hourly?.time) return [];

  return hourly.time.map((time: string, i: number) => ({
    time,
    speed: hourly.wind_speed_10m[i] ?? 0,
    direction: hourly.wind_direction_10m[i] ?? 0,
    gusts: hourly.wind_gusts_10m[i] ?? 0,
  }));
}

export async function fetchWaves(lat: number, lng: number, startDate: string, endDate: string): Promise<WavePoint[]> {
  const url = new URL(MARINE_BASE);
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('hourly', 'wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction');
  url.searchParams.set('timezone', 'Europe/Paris');
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);

  const res = await fetchWithRetry(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo Marine error: ${res.status}`);

  const data = await res.json();
  const hourly = data.hourly;

  if (!hourly?.time) return [];

  const swellPresent = hasSwell(lat, lng);

  return hourly.time.map((time: string, i: number) => {
    const rawHeight = hourly.wave_height[i] ?? 0;
    const windWave = hourly.wind_wave_height?.[i] ?? 0;

    return {
      time,
      height: swellPresent ? rawHeight : windWave,
      period: hourly.wave_period[i] ?? 0,
      direction: hourly.wave_direction[i] ?? 0,
      windWaveHeight: windWave,
      swellHeight: swellPresent ? hourly.swell_wave_height?.[i] : 0,
      swellDirection: swellPresent ? hourly.swell_wave_direction?.[i] : undefined,
    };
  });
}
