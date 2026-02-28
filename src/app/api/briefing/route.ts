import { NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/briefing';
import { fetchWind, fetchWaves } from '@/lib/weather';
import { fetchTides } from '@/lib/tides';
import type { Zone, Course, Schedule } from '@/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { zone, course, schedule } = (await request.json()) as {
      zone: Zone;
      course: Course;
      schedule: Schedule;
    };

    if (!zone || !course || !schedule) {
      return NextResponse.json({ error: 'zone, course et schedule requis' }, { status: 400 });
    }

    const date = schedule.startTime.split('T')[0];

    // Fetch all data in parallel
    const [wind, waves, tide] = await Promise.all([
      fetchWind(zone.center.lat, zone.center.lng, date, date),
      fetchWaves(zone.center.lat, zone.center.lng, date, date),
      fetchTides(zone.center.lat, zone.center.lng, date),
    ]);

    // Filter wind/waves to relevant time window (start - 2h to start + duration + 1h)
    const startTime = new Date(schedule.startTime);
    const windowStart = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    const windowEnd = new Date(startTime.getTime() + (schedule.duration + 60) * 60 * 1000);

    const relevantWind = wind.filter((w) => {
      const t = new Date(w.time);
      return t >= windowStart && t <= windowEnd;
    });

    const relevantWaves = waves.filter((w) => {
      const t = new Date(w.time);
      return t >= windowStart && t <= windowEnd;
    });

    // Auto-définition de l'axe du vent si laisser vide ou 0
    if ((course.orientation === 0 || !course.orientation) && relevantWind.length > 0) {
      // Trouver le vent à l'heure la plus proche de startTime ou la première valeur
      const startWind = relevantWind.find((w) => {
        const t = new Date(w.time);
        return t.getHours() === startTime.getHours();
      }) || relevantWind[0];

      course.orientation = startWind.direction;
    }

    // Generate tactical briefing
    const briefing = await generateBriefing(
      zone,
      course,
      schedule,
      relevantWind,
      relevantWaves,
      tide
    );

    return NextResponse.json({
      briefing,
      course,
      data: {
        wind: relevantWind,
        waves: relevantWaves,
        tide,
      },
    });
  } catch (error: any) {
    console.error('Briefing error:', error);
    return NextResponse.json({
      error: error.message || 'Erreur lors de la génération du briefing'
    }, { status: 500 });
  }
}
