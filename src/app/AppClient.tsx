'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Download, FileText, Share2 } from 'lucide-react';
import type { Zone, Course, CourseType, TacticalBriefing, WindPoint, WavePoint, TideData, Mark } from '@/types';
import MapLoader from '@/components/MapLoader';

const courseTypes: { value: CourseType; label: string; icon: string }[] = [
  { value: 'banane', label: 'Banane', icon: '🍌' },
  { value: 'triangle_olympique', label: 'Triangle', icon: '🔺' },
  { value: 'cotier', label: 'Côtier', icon: '🏖️' },
  { value: 'au_large', label: 'Au large', icon: '🌊' },
  { value: 'parcours_permanent', label: 'Permanent', icon: '📍' },
];

// Étapes de construction du parcours par type
const courseSteps: Record<CourseType, { name: string; instruction: string; tip: string }[]> = {
  banane: [
    { name: 'Ligne de départ', instruction: 'Placez le bateau comité (côté tribord de la ligne)', tip: 'Cliquez sur la carte à l\'emplacement du comité de course' },
    { name: 'Bouée au vent', instruction: 'Placez la bouée au vent (face au vent dominant)', tip: 'Placez-la dans l\'axe du vent par rapport à la ligne de départ' },
    { name: 'Bouée sous le vent', instruction: 'Placez la bouée sous le vent (optionnel)', tip: 'Optionnel : entre la ligne et la bouée au vent, décalée' },
  ],
  triangle_olympique: [
    { name: 'Ligne de départ', instruction: 'Placez le bateau comité (côté tribord de la ligne)', tip: 'Cliquez sur la carte à l\'emplacement du comité de course' },
    { name: 'Bouée au vent', instruction: 'Placez la bouée au vent (marque 1)', tip: 'Face au vent, en haut du parcours' },
    { name: 'Bouée de largue', instruction: 'Placez la bouée de largue (marque 2)', tip: 'À ~120° de l\'axe vent, crée le bord de largue' },
    { name: 'Bouée sous le vent', instruction: 'Placez la bouée sous le vent (marque 3, optionnel)', tip: 'Optionnel : complète le triangle' },
  ],
  cotier: [
    { name: 'Ligne de départ', instruction: 'Placez le bateau comité (départ)', tip: 'Cliquez sur la carte à l\'emplacement du comité de course' },
    { name: 'Marque côtière 1', instruction: 'Placez la première marque de passage', tip: 'Point de passage le long de la côte' },
    { name: 'Marque côtière 2', instruction: 'Placez les marques suivantes du parcours côtier', tip: 'Continuez à poser les marques de passage' },
  ],
  au_large: [
    { name: 'Ligne de départ', instruction: 'Placez le bateau comité (départ)', tip: 'Cliquez sur la carte à l\'emplacement du comité de course' },
    { name: 'Waypoint 1', instruction: 'Placez le premier waypoint au large', tip: 'Point de passage vers le large' },
    { name: 'Waypoints suivants', instruction: 'Continuez à placer les waypoints', tip: 'Ajoutez autant de points que nécessaire' },
  ],
  parcours_permanent: [
    { name: 'Départ', instruction: 'Placez le point de départ du parcours permanent', tip: 'Cliquez sur la carte au point de départ' },
    { name: 'Marque 1', instruction: 'Placez la première marque permanente', tip: 'Bouée ou amer fixe' },
    { name: 'Marques suivantes', instruction: 'Continuez à placer les marques du parcours', tip: 'Ajoutez toutes les marques du parcours permanent' },
  ],
};

interface PresetZone {
  name: string;
  lat: number;
  lng: number;
  info: string;
  subZones?: { name: string; lat: number; lng: number; info: string }[];
}

const zonesByRegion: { region: string; zones: PresetZone[] }[] = [
  {
    region: 'Manche',
    zones: [
      {
        name: 'Saint-Malo', lat: 48.65, lng: -2.00, info: 'Marnage 12m+, courants forts', subZones: [
          { name: 'Anse de Dinard', lat: 48.63, lng: -2.07, info: 'Plan d\'eau abrité, courants Rance' },
          { name: 'Large Cézembre', lat: 48.68, lng: -2.05, info: 'Exposé, forts courants' },
          { name: 'Baie de Saint-Malo', lat: 48.66, lng: -1.96, info: 'Devant les remparts' },
        ]
      },
      { name: 'Granville', lat: 48.84, lng: -1.60, info: 'Forts courants, marnage extrême' },
      {
        name: 'Cherbourg', lat: 49.64, lng: -1.62, info: 'Raz Blanchard à proximité', subZones: [
          { name: 'Petite rade', lat: 49.64, lng: -1.63, info: 'Abritée, courants modérés' },
          { name: 'Grande rade', lat: 49.67, lng: -1.60, info: 'Exposée Nord, courants forts' },
        ]
      },
      { name: 'Deauville', lat: 49.36, lng: 0.07, info: 'Baie de Seine, courants modérés' },
      { name: 'Saint-Vaast', lat: 49.59, lng: -1.26, info: 'Courants de marée complexes' },
      { name: 'Carantec', lat: 48.66, lng: -3.91, info: 'Ile Callot, courants forts et îlots' },
      { name: 'Roscoff', lat: 48.73, lng: -3.98, info: 'Île de Batz, courants variables' },
    ],
  },
  {
    region: 'Bretagne Nord',
    zones: [
      {
        name: 'Rade de Brest', lat: 48.35, lng: -4.50, info: 'Plan d\'eau fermé, courants goulet', subZones: [
          { name: 'Moulin Blanc', lat: 48.39, lng: -4.43, info: 'Fond de rade, abrité, peu de courant' },
          { name: 'Anse de l\'Auberlac\'h', lat: 48.34, lng: -4.38, info: 'Milieu de rade, courant modéré' },
          { name: 'Le Goulet', lat: 48.33, lng: -4.55, info: 'Courants très forts, 4-5 nds' },
          { name: 'Presqu\'île de Crozon', lat: 48.30, lng: -4.50, info: 'Rade Sud, plus exposé' },
          { name: 'Île Longue', lat: 48.31, lng: -4.47, info: 'Centre rade, courants traversiers' },
          { name: 'Roscanvel', lat: 48.33, lng: -4.55, info: 'Près du goulet, courants forts' },
          { name: 'Lanvéoc', lat: 48.29, lng: -4.46, info: 'Rade Sud-Ouest, abrité du NE' },
        ]
      },
      { name: 'Baie de Morlaix', lat: 48.65, lng: -3.87, info: 'Chenal d\'approche, courants' },
      { name: 'Carantec', lat: 48.66, lng: -3.91, info: 'Ile Callot, courants forts et îlots' },
      { name: 'Perros-Guirec', lat: 48.82, lng: -3.44, info: 'Archipel des 7 Îles' },
      { name: 'Saint-Quay', lat: 48.68, lng: -2.83, info: 'Baie de Saint-Brieuc' },
      { name: 'Paimpol', lat: 48.78, lng: -3.05, info: 'Île de Bréhat, courants forts' },
    ],
  },
  {
    region: 'Bretagne Sud',
    zones: [
      {
        name: 'Baie de Quiberon', lat: 47.48, lng: -3.10, info: 'Plan d\'eau mythique, courant de Teignouse', subZones: [
          { name: 'Devant Port Haliguen', lat: 47.48, lng: -3.10, info: 'Proche port, courant modéré' },
          { name: 'Teignouse', lat: 47.44, lng: -3.08, info: 'Passage, courants 3-4 nds' },
          { name: 'Milieu de baie', lat: 47.50, lng: -3.05, info: 'Plan d\'eau dégagé' },
          { name: 'Vers Belle-Île', lat: 47.40, lng: -3.15, info: 'Large, exposé houle SW' },
          { name: 'Devant La Trinité', lat: 47.55, lng: -3.02, info: 'Entrée rivière de Crac\'h' },
        ]
      },
      { name: 'La Trinité-sur-Mer', lat: 47.58, lng: -3.03, info: 'Capitale de la voile, rivière de Crac\'h' },
      {
        name: 'Lorient', lat: 47.73, lng: -3.38, info: 'Île de Groix, courants Coureau', subZones: [
          { name: 'Coureau de Groix', lat: 47.70, lng: -3.42, info: 'Entre côte et Groix, courants forts' },
          { name: 'Rade de Lorient', lat: 47.72, lng: -3.36, info: 'Plan d\'eau abrité' },
          { name: 'Large de Groix', lat: 47.65, lng: -3.48, info: 'Exposé, houle SW' },
        ]
      },
      { name: 'Concarneau', lat: 47.87, lng: -3.92, info: 'Baie fermée, Glénan à proximité' },
      { name: 'Îles Glénan', lat: 47.72, lng: -3.99, info: 'Archipel, eaux turquoise, courants' },
      { name: 'Douarnenez', lat: 48.10, lng: -4.33, info: 'Baie ouverte, Raz de Sein proche' },
      { name: 'Bénodet', lat: 47.87, lng: -4.11, info: 'Estuaire Odet, courants rivière' },
    ],
  },
  {
    region: 'Atlantique',
    zones: [
      {
        name: 'La Rochelle', lat: 46.15, lng: -1.15, info: 'Pertuis d\'Antioche, Île de Ré', subZones: [
          { name: 'Pertuis d\'Antioche', lat: 46.12, lng: -1.20, info: 'Entre Ré et Oléron, courants forts' },
          { name: 'Pertuis Breton', lat: 46.22, lng: -1.30, info: 'Nord Île de Ré, courants E-W' },
          { name: 'Devant le port', lat: 46.15, lng: -1.16, info: 'Proche Minimes, abrité' },
          { name: 'Anse de l\'Aiguillon', lat: 46.28, lng: -1.10, info: 'Fond de pertuis, peu profond' },
        ]
      },
      { name: 'Île de Ré', lat: 46.20, lng: -1.40, info: 'Forts courants pertuis Breton' },
      { name: 'Île d\'Oléron', lat: 45.90, lng: -1.30, info: 'Pertuis de Maumusson' },
      { name: 'Les Sables-d\'Olonne', lat: 46.49, lng: -1.80, info: 'Départ Vendée Globe, côte exposée' },
      { name: 'Pornic', lat: 47.11, lng: -2.10, info: 'Baie de Bourgneuf' },
      {
        name: 'Arcachon', lat: 44.66, lng: -1.17, info: 'Bassin, courants passe Nord/Sud', subZones: [
          { name: 'Bassin intérieur', lat: 44.67, lng: -1.10, info: 'Abrité, courants de marée' },
          { name: 'Passes du bassin', lat: 44.58, lng: -1.25, info: 'Courants très forts, dangereux' },
          { name: 'Devant Arcachon', lat: 44.66, lng: -1.17, info: 'Côté ville, abrité du SW' },
        ]
      },
      { name: 'Royan', lat: 45.62, lng: -1.03, info: 'Estuaire Gironde, forts courants' },
    ],
  },
  {
    region: 'Méditerranée',
    zones: [
      {
        name: 'Marseille', lat: 43.27, lng: 5.37, info: 'Mistral, Rade Nord/Sud, Frioul', subZones: [
          { name: 'Rade Nord', lat: 43.35, lng: 5.35, info: 'Devant l\'Estaque, Mistral canalisé' },
          { name: 'Rade Sud', lat: 43.25, lng: 5.35, info: 'Devant les Calanques, mer de vent Mistral' },
          { name: 'Frioul', lat: 43.28, lng: 5.31, info: 'Îles du Frioul, effets de cap' },
          { name: 'Vieux-Port / Prado', lat: 43.27, lng: 5.37, info: 'Proche côte, thermique' },
          { name: 'Baie de La Ciotat', lat: 43.18, lng: 5.60, info: 'Protégée du Mistral, thermique' },
          { name: 'Pointe Rouge', lat: 43.24, lng: 5.37, info: 'Devant le CNM, référence régates' },
        ]
      },
      {
        name: 'Toulon Le Mourillon', lat: 43.10, lng: 5.94, info: 'Plages du Mourillon, Rade des Vignettes'
      },
      {
        name: 'Hyères', lat: 43.08, lng: 6.15, info: 'Îles d\'Or, thermique fiable', subZones: [
          { name: 'Rade d\'Hyères', lat: 43.05, lng: 6.18, info: 'Devant la presqu\'île de Giens' },
          { name: 'L\'Almanarre', lat: 43.05, lng: 6.13, info: 'Spot mythique, exposé Mistral (Ouest)' },
          { name: 'Devant Porquerolles', lat: 43.00, lng: 6.20, info: 'Large, thermique stable' },
          { name: 'Passe de Porquerolles', lat: 43.02, lng: 6.15, info: 'Effets de cap, accélérations' },
        ]
      },
      { name: 'La Ciotat', lat: 43.17, lng: 5.61, info: 'Baie protégée, thermique' },
      { name: 'Bandol', lat: 43.13, lng: 5.75, info: 'Thermique régulière' },
      {
        name: 'Cannes', lat: 43.55, lng: 7.02, info: 'Îles de Lérins, régates internationales', subZones: [
          { name: 'Golfe de la Napoule', lat: 43.53, lng: 6.97, info: 'Ouest Cannes, ouvert SW' },
          { name: 'Devant la Croisette', lat: 43.54, lng: 7.03, info: 'Parcours classique YCIF' },
          { name: 'Îles de Lérins', lat: 43.51, lng: 7.05, info: 'Effets d\'abri, bascules' },
        ]
      },
      { name: 'Saint-Tropez', lat: 43.27, lng: 6.64, info: 'Golfe, Les Voiles de St-Tropez' },
      {
        name: 'Martigues — Étang de Berre', lat: 43.46, lng: 5.10, info: 'Plan d\'eau fermé, Mistral canalisé, eau plate', subZones: [
          { name: 'Plan d\'eau central', lat: 43.46, lng: 5.10, info: 'Grand fetch NW/SE, Mistral très fort et régulier' },
          { name: 'Devant Martigues', lat: 43.41, lng: 5.06, info: 'Entrée canal de Caronte, thermique d\'après-midi' },
          { name: 'Golfe de Saint-Chamas', lat: 43.53, lng: 5.04, info: 'Nord-Ouest de l\'étang, accélérations Mistral' },
          { name: 'Bras de Berre', lat: 43.47, lng: 5.19, info: 'Nord-Est, abri relatif, thermique marin' },
          { name: 'Devant Istres', lat: 43.51, lng: 4.98, info: 'Rive Ouest, plan d\'eau dégagé, base nautique' },
        ]
      },
      { name: 'Sète', lat: 43.40, lng: 3.70, info: 'Tramontane/Marin, mer formée' },
      { name: 'Port-Camargue', lat: 43.53, lng: 4.13, info: 'Golfe du Lion, Mistral' },
      { name: 'Menton', lat: 43.77, lng: 7.50, info: 'Proche Italie, protection cap Martin' },
    ],
  },
  {
    region: 'Corse',
    zones: [
      {
        name: 'Ajaccio', lat: 41.92, lng: 8.74, info: 'Golfe protégé, thermique été', subZones: [
          { name: 'Golfe d\'Ajaccio Nord', lat: 41.93, lng: 8.72, info: 'Devant la ville, abrité' },
          { name: 'Golfe d\'Ajaccio Sud', lat: 41.87, lng: 8.73, info: 'Vers les Sanguinaires, exposé' },
        ]
      },
      { name: 'Calvi', lat: 42.57, lng: 8.76, info: 'Baie ouverte, Libeccio' },
      { name: 'Bonifacio', lat: 41.39, lng: 9.16, info: 'Bouches, courants et vent fort' },
    ],
  },
  {
    region: 'Lacs du Sud',
    zones: [
      { name: 'Lac de Sainte-Croix', lat: 43.76, lng: 6.15, info: 'Sainte-Croix-du-Verdon, thermique estival' },
      {
        name: 'Lac de Serre-Ponçon', lat: 44.53, lng: 6.40, info: 'Lac alpin, thermique puissant et vents tournants', subZones: [
          { name: 'Club nautique d\'Embrun', lat: 44.56, lng: 6.49, info: 'Bassin d\'Embrun et sortie sur le lac' },
          { name: 'Vers Savines et le Pont', lat: 44.53, lng: 6.40, info: 'Pont de Savines-le-Lac, passage encaissé' },
        ]
      },
    ],
  },
];

type Step = 'config' | 'loading' | 'briefing';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('config');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  }

  // Config state
  const [zoneName, setZoneName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [marks, setMarks] = useState<Mark[]>([]);
  const [courseType, setCourseType] = useState<CourseType>('banane');
  const [orientation, setOrientation] = useState('');
  const [raceDate, setRaceDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [duration, setDuration] = useState('150');
  const [races, setRaces] = useState('3');

  // Results
  const [briefing, setBriefing] = useState<TacticalBriefing | null>(null);
  const [weatherData, setWeatherData] = useState<{ wind: WindPoint[]; waves: WavePoint[]; tide: TideData } | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const [activeRegion, setActiveRegion] = useState(zonesByRegion[0].region);
  const [selectedParentZone, setSelectedParentZone] = useState<PresetZone | null>(null);

  function buildBriefingText(): string {
    if (!briefing) return '';
    const lines: string[] = [
      `BRIEFING TACTIQUE — ${zoneName}`,
      `${raceDate} | Départ ${startTime} | ${courseTypes.find(c => c.value === courseType)?.label}`,
      '='.repeat(60),
      '',
      'CONDITIONS',
      briefing.conditionsSummary,
      '',
    ];
    if (weatherData) {
      const idx = weatherData.wind.findIndex((w: WindPoint) => w.time.includes(startTime.split(':')[0]));
      const w = weatherData.wind[idx >= 0 ? idx : 0];
      lines.push(`Vent : ${(w?.speed / 1.852).toFixed(0)} kts — ${w?.direction}° | Rafales : ${(w?.gusts / 1.852).toFixed(0)} kts`);
      lines.push('');
    }
    lines.push('RECOMMANDATIONS', '-'.repeat(40));
    briefing.keyRecommendations
      .sort((a: TacticalBriefing['keyRecommendations'][0], b: TacticalBriefing['keyRecommendations'][0]) => a.priority - b.priority)
      .forEach((r: TacticalBriefing['keyRecommendations'][0]) => { lines.push(`${r.priority}. ${r.recommendation}${r.timing ? ` [${r.timing}]` : ''}`); });
    lines.push('', 'OPTIONS FAVORABLES', '-'.repeat(40));
    briefing.favorableOptions.forEach((o: TacticalBriefing['favorableOptions'][0]) => {
      lines.push(`• ${o.title} : ${o.description}${o.area ? ` (${o.area})` : ''}`);
    });
    lines.push('', 'POINTS DE VIGILANCE', '-'.repeat(40));
    briefing.unfavorableOptions.forEach((o: TacticalBriefing['unfavorableOptions'][0]) => {
      lines.push(`• [${o.risk.toUpperCase()}] ${o.title} : ${o.description}`);
    });
    if (briefing.timingConsiderations.length > 0) {
      lines.push('', 'TIMELINE', '-'.repeat(40));
      briefing.timingConsiderations.forEach((t: TacticalBriefing['timingConsiderations'][0]) => { lines.push(`${t.time} — ${t.event} : ${t.impact}`); });
    }
    lines.push('', `Généré le ${new Date().toLocaleString('fr-FR')} via Regata`);
    return lines.join('\n');
  }

  function exportTxt() {
    const text = buildBriefingText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `briefing-${zoneName.replace(/\s+/g, '-').toLowerCase()}-${raceDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() { window.print(); }

  async function shareBriefing() {
    const text = buildBriefingText();
    if (navigator.share) {
      await navigator.share({ title: `Briefing Tactique — ${zoneName}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Briefing copié dans le presse-papier !');
    }
  }

  function selectPreset(preset: PresetZone | { name: string; lat: number; lng: number; info: string }) {
    setZoneName(preset.name);
    setLat(preset.lat.toString());
    setLng(preset.lng.toString());
    setMarks([{ lat: preset.lat, lng: preset.lng, name: preset.name }]);
    // Si c'est une zone parent avec sous-zones, on l'ouvre
    if ('subZones' in preset && preset.subZones) {
      setSelectedParentZone(preset as PresetZone);
    } else {
      setSelectedParentZone(null);
    }
  }

  function selectSubZone(sub: { name: string; lat: number; lng: number; info: string }, parentName: string) {
    const fullName = `${parentName} — ${sub.name}`;
    setZoneName(fullName);
    setLat(sub.lat.toString());
    setLng(sub.lng.toString());
    setMarks([{ lat: sub.lat, lng: sub.lng, name: fullName }]);
  }

  function handleAddMark(newLat: number, newLng: number) {
    const steps = courseSteps[courseType];
    const stepIndex = Math.min(marks.length, steps.length - 1);
    const name = steps[stepIndex].name;

    const newMarks = [...marks, { lat: newLat, lng: newLng, name }];
    setMarks(newMarks);

    if (newMarks.length === 1) {
      setLat(newLat.toFixed(5));
      setLng(newLng.toFixed(5));
      if (!zoneName || zoneName.startsWith("Point:") || zoneName.startsWith("Parcours:")) {
        setZoneName(`Parcours: ${newLat.toFixed(2)}, ${newLng.toFixed(2)}`);
      }
    }
  }

  function clearMarks() {
    setMarks([]);
  }

  async function handleGenerate() {
    if (!lat || !lng || !zoneName) {
      setError('Sélectionnez une zone de navigation');
      return;
    }

    setStep('loading');
    setError('');
    setProgress('Récupération des données météo et marées...');

    try {
      const zone: Zone = {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: 5,
        name: zoneName,
      };
      const course: Course = {
        type: courseType,
        orientation: parseInt(orientation) || 0,
        marks: marks.length > 0 ? marks : undefined,
      };
      const schedule = {
        startTime: `${raceDate}T${startTime}:00`,
        duration: parseInt(duration),
        races: parseInt(races),
      };

      setProgress('Analyse tactique en cours...');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone, course, schedule }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not JSON, it might be an HTML error page (e.g. 504 Timeout or 500 error)
        throw new Error(`Erreur serveur: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) throw new Error(data.error || 'Erreur');

      setBriefing(data.briefing);
      setWeatherData(data.data);
      if (data.course && data.course.orientation !== undefined) {
        setOrientation(data.course.orientation.toString());
      }
      setStep('briefing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('config');
    }
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-slate-700">{progress}</p>
          <p className="mt-2 text-sm text-slate-500">Cela peut prendre jusqu&apos;à 30 secondes</p>
        </div>
      </div>
    );
  }

  if (step === 'briefing' && briefing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 relative">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <button onClick={() => setStep('config')} className="text-sm text-slate-500 hover:text-slate-700">
            ← Nouvelle analyse
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTxt}
              title="Télécharger en .txt"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              <FileText className="w-4 h-4" /> TXT
            </button>
            <button
              onClick={exportPdf}
              title="Imprimer / Enregistrer en PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={shareBriefing}
              title="Partager"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition"
            >
              <Share2 className="w-4 h-4" /> Partager
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Briefing Tactique</h1>
          <p className="mt-1 text-sm text-slate-500">
            {zoneName} — {raceDate} à {startTime} — {courseTypes.find((c) => c.value === courseType)?.label}
          </p>
        </div>

        {/* Conditions météo rapides */}
        {weatherData && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(() => {
              const startIdx = weatherData.wind.findIndex((w) => w.time.includes(startTime.split(':')[0]));
              const w = weatherData.wind[startIdx >= 0 ? startIdx : 0];
              const wv = weatherData.waves[0];
              return (
                <>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Vent</p>
                    <p className="text-2xl font-bold">{(w?.speed / 1.852).toFixed(0)} kts</p>
                    <p className="text-xs text-slate-400">{w?.direction}°</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Rafales</p>
                    <p className="text-2xl font-bold">{(w?.gusts / 1.852).toFixed(0)} kts</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Houle</p>
                    <p className="text-2xl font-bold">{wv?.height?.toFixed(1)}m</p>
                    <p className="text-xs text-slate-400">T={wv?.period?.toFixed(0)}s</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Coef marée</p>
                    <p className="text-2xl font-bold">{weatherData.tide.coefficient}</p>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Résumé des conditions */}
        <div className="mb-6 rounded-xl bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-blue-900">Conditions</h2>
          <p className="mt-2 text-blue-800">{briefing.conditionsSummary}</p>
        </div>

        {/* Recommandations clés */}
        <div className="mb-6 rounded-xl bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Recommandations clés</h2>
          <div className="mt-3 space-y-3">
            {briefing.keyRecommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-800">
                    {rec.priority}
                  </span>
                  <div>
                    <p className="text-amber-900">{rec.recommendation}</p>
                    {rec.timing && <p className="text-xs text-amber-600">{rec.timing}</p>}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Options favorables */}
        <div className="mb-6 rounded-xl bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">Options favorables</h2>
          <div className="mt-3 space-y-4">
            {briefing.favorableOptions.map((opt, i) => (
              <div key={i}>
                <h3 className="font-medium text-green-800">{opt.title}</h3>
                <p className="mt-1 text-sm text-green-700">{opt.description}</p>
                {opt.area && <p className="mt-1 text-xs text-green-500">Zone : {opt.area}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Options défavorables */}
        <div className="mb-6 rounded-xl bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Options défavorables</h2>
          <div className="mt-3 space-y-4">
            {briefing.unfavorableOptions.map((opt, i) => (
              <div key={i} className="flex gap-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${opt.risk === 'high' ? 'bg-red-500' : opt.risk === 'medium' ? 'bg-orange-400' : 'bg-yellow-400'
                  }`} />
                <div>
                  <h3 className="font-medium text-red-800">{opt.title}</h3>
                  <p className="mt-1 text-sm text-red-700">{opt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {briefing.timingConsiderations.length > 0 && (
          <div className="mb-6 rounded-xl bg-purple-50 p-6">
            <h2 className="text-lg font-semibold text-purple-900">Timeline</h2>
            <div className="mt-3 space-y-3">
              {briefing.timingConsiderations.map((t, i) => (
                <div key={i} className="flex gap-4">
                  <span className="shrink-0 font-mono text-sm font-bold text-purple-700">{t.time}</span>
                  <div>
                    <p className="font-medium text-purple-800">{t.event}</p>
                    <p className="text-sm text-purple-600">{t.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wind forecast table */}
        {weatherData && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Prévisions vent détaillées</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-slate-500">
                    <th className="pb-2 pr-4">Heure</th>
                    <th className="pb-2 pr-4">Vent (kts)</th>
                    <th className="pb-2 pr-4">Dir</th>
                    <th className="pb-2">Rafales</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherData.wind.map((w, i) => {
                    const hour = new Date(w.time).getHours();
                    return (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1.5 pr-4 font-mono">{hour}h</td>
                        <td className="py-1.5 pr-4 font-medium">{(w.speed / 1.852).toFixed(0)}</td>
                        <td className="py-1.5 pr-4">{w.direction}°</td>
                        <td className="py-1.5">{(w.gusts / 1.852).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === CONFIG VIEW ===
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 relative">
      <div className="absolute top-8 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
          title="Quitter le pont"
        >
          <span className="hidden sm:inline">Quitter</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-8 text-center pt-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Regata</h1>
        <p className="mt-2 text-lg text-slate-500">Briefing tactique pour la régate</p>
      </div>

      <div className="space-y-6">
        {/* Zone de navigation */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Zone de navigation</h2>

          {/* Onglets régions */}
          <div className="mt-3 flex flex-wrap gap-1 border-b pb-2">
            {zonesByRegion.map((r) => (
              <button
                key={r.region}
                onClick={() => setActiveRegion(r.region)}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition ${activeRegion === r.region
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
                  }`}
              >
                {r.region}
              </button>
            ))}
          </div>

          {/* Spots de la région */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {zonesByRegion
              .find((r) => r.region === activeRegion)
              ?.zones.map((z) => (
                <button
                  key={z.name}
                  onClick={() => selectPreset(z)}
                  className={`flex flex-col rounded-lg p-3 text-left transition ${zoneName === z.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <span className={`text-sm font-medium ${zoneName === z.name ? 'text-white' : 'text-slate-800'}`}>
                    {z.name}
                  </span>
                  <span className={`mt-0.5 text-xs ${zoneName === z.name ? 'text-blue-100' : 'text-slate-400'}`}>
                    {z.info}
                  </span>
                </button>
              ))}
          </div>

          {/* Sous-zones */}
          {selectedParentZone?.subZones && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">
                Précisez la zone de course dans {selectedParentZone.name} :
              </p>
              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {selectedParentZone.subZones.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => selectSubZone(sub, selectedParentZone.name)}
                    className={`flex flex-col rounded-lg p-2.5 text-left transition ${zoneName === `${selectedParentZone.name} — ${sub.name}`
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-blue-100'
                      }`}
                  >
                    <span className={`text-sm font-medium ${zoneName === `${selectedParentZone.name} — ${sub.name}` ? 'text-white' : 'text-blue-900'
                      }`}>
                      {sub.name}
                    </span>
                    <span className={`text-xs ${zoneName === `${selectedParentZone.name} — ${sub.name}` ? 'text-blue-100' : 'text-blue-400'
                      }`}>
                      {sub.info}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Carte interactive et coordonnées */}
          <div className="mt-6">
            {/* Guide contextuel de construction du parcours */}
            <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-semibold text-blue-900">
                  Dessinez votre parcours sur la carte
                </h3>
                {marks.length > 0 && (
                  <button onClick={clearMarks} className="text-xs font-medium text-red-500 hover:text-red-700 transition">
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Étapes visuelles */}
              {(() => {
                const steps = courseSteps[courseType];
                const currentStep = Math.min(marks.length, steps.length - 1);
                const isComplete = marks.length >= steps.length;

                return (
                  <>
                    {/* Barre de progression */}
                    <div className="flex items-center gap-1 mb-3">
                      {steps.map((s, i) => (
                        <div key={i} className="flex items-center flex-1">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                            i < marks.length
                              ? 'bg-green-500 text-white'
                              : i === currentStep && !isComplete
                                ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1'
                                : 'bg-slate-200 text-slate-400'
                          }`}>
                            {i < marks.length ? '✓' : i + 1}
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${i < marks.length ? 'bg-green-300' : 'bg-slate-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Noms des étapes */}
                    <div className="flex gap-1 mb-3">
                      {steps.map((s, i) => (
                        <div key={i} className="flex-1 min-w-0">
                          <p className={`text-[10px] leading-tight truncate ${
                            i < marks.length
                              ? 'text-green-600'
                              : i === currentStep && !isComplete
                                ? 'text-blue-700 font-semibold'
                                : 'text-slate-400'
                          }`}>
                            {s.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Instruction courante */}
                    {!isComplete ? (
                      <div className="flex items-start gap-2 rounded-md bg-white/70 p-3 border border-blue-100">
                        <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-xs">&#10132;</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {steps[currentStep].instruction}
                          </p>
                          <p className="text-xs text-blue-500 mt-0.5">
                            {steps[currentStep].tip}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 rounded-md bg-green-50 p-3 border border-green-200">
                        <span className="text-green-600 text-sm mt-0.5">&#10003;</span>
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Parcours complet ({marks.length} marques)
                          </p>
                          <p className="text-xs text-green-600 mt-0.5">
                            Vous pouvez ajouter des marques supplémentaires ou passer à la configuration des horaires.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-xl border border-slate-200">
              <MapLoader
                marks={marks}
                onAddMark={handleAddMark}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="col-span-3 sm:col-span-1">
                <label className="text-xs text-slate-500">Zone</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Nom de la zone"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="47.58"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-slate-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Longitude</label>
                <input
                  type="number"
                  step="0.01"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-3.03"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm bg-slate-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Type de parcours */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Type de parcours</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {courseTypes.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setCourseType(ct.value)}
                className={`flex flex-col items-center rounded-lg p-3 text-sm transition ${courseType === ct.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <span className="text-2xl">{ct.icon}</span>
                <span className="mt-1">{ct.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-xs text-slate-500">Orientation parcours (degrés, 0 = auto)</label>
            <input
              type="number"
              min="0"
              max="360"
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              placeholder="Auto (axe du vent)"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Horaires */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Horaires de la régate</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-slate-500">Date</label>
              <input
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Heure de départ</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Durée (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Manches</label>
              <input
                type="number"
                min="1"
                max="10"
                value={races}
                onChange={(e) => setRaces(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bouton */}
        <button
          onClick={handleGenerate}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Générer le briefing tactique
        </button>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Données : AROME Météo-France (vent) + MFWAM (houle) + WorldTides (marées)
      </p>
    </div>
  );
}
