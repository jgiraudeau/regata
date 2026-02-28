import type { Zone, Course, Schedule, WindPoint, WavePoint, TideData, CurrentGrid } from '@/types';

function formatWind(wind: WindPoint[]): string {
  return wind.map((w) =>
    `${w.time} — ${w.speed.toFixed(0)} km/h (${(w.speed / 1.852).toFixed(0)} kts) dir ${w.direction}°, rafales ${w.gusts.toFixed(0)} km/h`
  ).join('\n');
}

function formatWaves(waves: WavePoint[]): string {
  return waves.map((w) =>
    `${w.time} — Hs ${w.height.toFixed(1)}m, T ${w.period.toFixed(0)}s, dir ${w.direction}°${w.swellHeight ? `, houle ${w.swellHeight.toFixed(1)}m` : ''}`
  ).join('\n');
}

function formatTide(tide: TideData): string {
  const events = tide.events.map((e) =>
    `${e.type === 'high' ? 'PM' : 'BM'} : ${e.time} — ${e.height.toFixed(2)}m`
  ).join('\n');
  return `Port de référence : ${tide.referencePort}\nCoefficient : ${tide.coefficient}\n${events}`;
}

function formatCurrents(currents: CurrentGrid | undefined): string {
  if (!currents || currents.timeSlices.length === 0) {
    return 'Données de courants non disponibles pour cette zone.';
  }
  return currents.timeSlices.map((slice) => {
    const avgSpeed = slice.points.reduce((s, p) => s + p.speed, 0) / slice.points.length;
    const avgDir = slice.points.reduce((s, p) => s + p.direction, 0) / slice.points.length;
    return `${slice.label} (${slice.time}) — Courant moyen ${avgSpeed.toFixed(1)} kts, direction ${avgDir.toFixed(0)}°`;
  }).join('\n');
}

const courseTypeLabels: Record<string, string> = {
  banane: 'Parcours banane (au près / vent arrière)',
  triangle_olympique: 'Triangle olympique (près / largue / vent arrière)',
  cotier: 'Parcours côtier (bouées fixes)',
  au_large: 'Parcours au large',
  parcours_permanent: 'Parcours permanent (bouées fixes)',
};

export function buildTacticalPrompt(
  zone: Zone,
  course: Course,
  schedule: Schedule,
  wind: WindPoint[],
  waves: WavePoint[],
  tide: TideData,
  currents?: CurrentGrid
): string {
  return `You will be acting as an AI sailing race tactical advisor. Your role is to analyze marine navigation conditions and provide strategic recommendations to racing sailors (régatiers) to help them make optimal tactical decisions during a regatta.

Here is the navigation zone information:
<navigation_zone>
Zone : ${zone.name}
Centre : ${zone.center.lat}°N, ${zone.center.lng}°${zone.center.lng < 0 ? 'W' : 'E'}
Rayon : ${zone.radius} km
</navigation_zone>

Here is the race course information (including location, course type, and layout):
<race_course>
Type : ${courseTypeLabels[course.type] || course.type}
Orientation axe de vent : ${course.orientation}°
${course.marks ? `Bouées :\n${course.marks.map((m) => `  - ${m.name} : ${m.lat}°N, ${m.lng}°`).join('\n')}` : 'Bouées non spécifiées (parcours standard)'}
</race_course>

Here is the race schedule (including start times and duration):
<race_schedule>
Départ prévu : ${schedule.startTime}
Durée estimée : ${schedule.duration} minutes (${(schedule.duration / 60).toFixed(1)}h)
Nombre de manches : ${schedule.races}
</race_schedule>

Here is the wind forecast:
<wind_forecast>
Modèle : AROME Météo-France (résolution 1.3 km)
${formatWind(wind)}
</wind_forecast>

Here is the tide data (including times, coefficients, and heights):
<tide_data>
${formatTide(tide)}
</tide_data>

Here are the marine current charts for the area:
<current_charts>
${formatCurrents(currents)}
</current_charts>

Here is the sea state:
<sea_state>
${formatWaves(waves)}
</sea_state>

Your task is to analyze all of this information and provide a comprehensive tactical briefing for the race. Before providing your briefing, use the scratchpad to work through your analysis systematically.

In your <scratchpad>, you should:
1. Identify the key time windows during the race based on the schedule
2. Analyze the current patterns during those time windows using the current charts
3. Analyze the wind conditions (direction, strength, shifts) during the race period
4. Analyze the tide situation (state of tide, tidal currents, timing of slack water or maximum flow)
5. Identify how currents, wind, and tide interact in this specific navigation zone
6. Consider the race course layout and identify which legs or areas will be most affected by conditions
7. Determine favorable and unfavorable tactical options (which side of the course to favor, which tacks/jibes to prioritize)
8. Identify specific risks or opportunities at different points in the race

After your analysis in the scratchpad, provide your tactical briefing inside <briefing> tags with EXACTLY this JSON structure:

<briefing>
{
  "conditionsSummary": "Résumé clair des conditions attendues...",
  "favorableOptions": [
    { "title": "Titre court", "description": "Explication détaillée...", "area": "Zone concernée" }
  ],
  "unfavorableOptions": [
    { "title": "Titre court", "description": "Explication détaillée...", "risk": "high|medium|low" }
  ],
  "keyRecommendations": [
    { "priority": 1, "recommendation": "Recommandation concrète et actionnable...", "timing": "Quand appliquer" }
  ],
  "timingConsiderations": [
    { "time": "HH:MM", "event": "Événement", "impact": "Impact tactique" }
  ]
}
</briefing>

IMPORTANT:
- Écris le briefing en FRANÇAIS
- Sois spécifique sur les directions (bâbord/tribord), les côtés du plan d'eau (gauche/droite en regardant le vent), les horaires
- Utilise le vocabulaire de la voile de compétition
- Les recommandations doivent être immédiatement actionnables par un régatier
- Priorise les recommandations de 1 (plus important) à 5`;
}
