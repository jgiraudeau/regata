# Architecture Technique — Regatta

**Date** : 2026-02-28
**Auteur** : Jacques (Antigravity)
**Version** : 1.0

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                             │
│  Next.js 15 (App Router) + Tailwind + Mapbox GL JS      │
│  PWA (Service Worker + manifest)                         │
├─────────────────────────────────────────────────────────┤
│                    API ROUTES                            │
│  /api/weather    /api/tides    /api/briefing             │
│  /api/auth       /api/sessions                           │
├──────────┬──────────┬──────────┬────────────────────────┤
│ Open-    │ World    │ SHOM     │ Claude                  │
│ Meteo    │ Tides    │ 2D       │ API                     │
│ (vent +  │ (marées) │ (courants│ (analyse                │
│  houle)  │          │  marée)  │  tactique)              │
├──────────┴──────────┴──────────┴────────────────────────┤
│                    STORAGE                               │
│  Supabase (auth + sessions + favoris)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR, API Routes, même stack que PostInsta |
| **UI** | Tailwind CSS | Rapid prototyping, responsive |
| **Cartographie** | Mapbox GL JS | Performance, personnalisable, overlays vectoriels |
| **Base de données** | Supabase (PostgreSQL) | Auth intégrée, gratuit 500 MB, API auto-générée |
| **Auth** | Supabase Auth | Email/password, JWT, session management |
| **IA** | Claude API (Sonnet) | Meilleur pour l'analyse structurée et le raisonnement |
| **Données vent** | Open-Meteo (AROME) | Gratuit, JSON, haute résolution France |
| **Données houle** | Open-Meteo Marine (MFWAM) | Gratuit, JSON, modèle Météo-France |
| **Données marées** | WorldTides API | JSON, simple, MVP (SHOM en V2) |
| **Courants marée** | SHOM 2D open data | Gratuit Etalab, données de référence France |
| **Déploiement** | Vercel | Edge, preview deploys, même infra que PostInsta |
| **PWA** | next-pwa | Installable, cache offline basique |

---

## 3. Structure du projet

```
regatta/
├── _bmad/                          # Framework BMAD
├── docs/                           # Artifacts BMAD
│   ├── planning-artifacts/
│   └── implementation-artifacts/
├── public/
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # App icons
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + providers
│   │   ├── page.tsx                # Landing page
│   │   ├── login/page.tsx          # Auth
│   │   ├── signup/page.tsx         # Inscription
│   │   ├── app/
│   │   │   ├── layout.tsx          # App layout (auth guard)
│   │   │   ├── page.tsx            # Dashboard sessions
│   │   │   ├── new/page.tsx        # Nouvelle session (config)
│   │   │   └── session/
│   │   │       └── [id]/
│   │   │           ├── page.tsx    # Vue session (carte + briefing)
│   │   │           └── share/page.tsx  # Vue partagée
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── signup/route.ts
│   │       ├── sessions/
│   │       │   ├── route.ts        # GET list, POST create
│   │       │   └── [id]/route.ts   # GET, PUT, DELETE
│   │       ├── weather/
│   │       │   └── route.ts        # Proxy Open-Meteo (vent + houle)
│   │       ├── tides/
│   │       │   └── route.ts        # Proxy WorldTides
│   │       ├── currents/
│   │       │   └── route.ts        # Parsing SHOM 2D
│   │       └── briefing/
│   │           └── route.ts        # Claude API (analyse tactique)
│   ├── components/
│   │   ├── map/
│   │   │   ├── Map.tsx             # Composant carte Mapbox
│   │   │   ├── CourseOverlay.tsx   # Parcours sur la carte
│   │   │   ├── WindOverlay.tsx     # Flèches de vent
│   │   │   └── CurrentOverlay.tsx  # Flèches de courant
│   │   ├── briefing/
│   │   │   ├── BriefingCard.tsx    # Briefing complet
│   │   │   ├── ConditionsSummary.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── TimingBar.tsx       # Barre timeline
│   │   ├── config/
│   │   │   ├── ZoneSelector.tsx    # Sélection zone sur carte
│   │   │   ├── CourseTypePicker.tsx # Choix type parcours
│   │   │   └── ScheduleForm.tsx    # Horaires
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Tabs.tsx
│   │       └── Spinner.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Client Supabase
│   │   ├── weather.ts             # Fetch Open-Meteo
│   │   ├── tides.ts               # Fetch WorldTides
│   │   ├── currents.ts            # Parse SHOM 2D data
│   │   ├── briefing.ts            # Claude API wrapper
│   │   └── prompts/
│   │       └── tactical.ts        # Prompt système tactique
│   └── types/
│       └── index.ts               # Types TypeScript
├── data/
│   └── shom/                      # Données SHOM 2D pré-traitées
│       ├── manche.json            # Courants Manche
│       ├── atlantique.json        # Courants Atlantique
│       └── README.md
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Flux de données

### 4.1 Création d'une session

```
Utilisateur                  Frontend               API Routes              External APIs
    │                           │                       │                       │
    │  Configure zone +         │                       │                       │
    │  parcours + horaires      │                       │                       │
    ├──────────────────────────►│                       │                       │
    │                           │  POST /api/sessions   │                       │
    │                           ├──────────────────────►│                       │
    │                           │                       │  Sauvegarde Supabase  │
    │                           │                       ├──────────────────────►│
    │                           │  GET /api/weather     │                       │
    │                           ├──────────────────────►│  Open-Meteo           │
    │                           │                       ├──────────────────────►│
    │                           │  GET /api/tides       │                       │
    │                           ├──────────────────────►│  WorldTides           │
    │                           │                       ├──────────────────────►│
    │                           │  GET /api/currents    │                       │
    │                           ├──────────────────────►│  SHOM (local data)    │
    │                           │                       ├──────────────────────►│
    │                           │                       │                       │
    │                           │  POST /api/briefing   │                       │
    │                           ├──────────────────────►│  Claude API           │
    │                           │                       ├──────────────────────►│
    │                           │                       │  ◄── Briefing JSON    │
    │  ◄── Affiche briefing     │  ◄── Update session   │                       │
    │      + carte              │                       │                       │
```

### 4.2 Cache et optimisation

```
┌─────────────────────────────────────────┐
│              CACHE STRATEGY              │
├─────────────────────────────────────────┤
│                                          │
│  Open-Meteo ──► Cache 30 min (API)      │
│                 (AROME update = 1h)      │
│                                          │
│  WorldTides ──► Cache 24h (API)         │
│                 (données prédictives)    │
│                                          │
│  SHOM 2D   ──► Static JSON (build)      │
│                 (données de référence)   │
│                                          │
│  Briefing  ──► Cache par session        │
│                 (invalidé si données     │
│                  changent)               │
│                                          │
│  Carte     ──► Service Worker (PWA)     │
│                 (tuiles en cache)         │
│                                          │
└─────────────────────────────────────────┘
```

---

## 5. Schéma base de données (Supabase)

```sql
-- Utilisateurs (géré par Supabase Auth)

-- Sessions de régate
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Zone
  zone_name TEXT NOT NULL,
  zone_lat DOUBLE PRECISION NOT NULL,
  zone_lng DOUBLE PRECISION NOT NULL,
  zone_radius INTEGER DEFAULT 5, -- km

  -- Parcours
  course_type TEXT NOT NULL CHECK (course_type IN ('banane', 'triangle_olympique', 'cotier', 'au_large', 'parcours_permanent')),
  course_orientation INTEGER, -- degrés
  course_marks JSONB, -- array de {lat, lng, name}

  -- Horaires
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  races INTEGER DEFAULT 1,

  -- Données collectées (JSONB pour flexibilité)
  weather_data JSONB,
  tide_data JSONB,
  current_data JSONB,
  wave_data JSONB,
  data_fetched_at TIMESTAMPTZ,

  -- Briefing
  briefing JSONB,
  briefing_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zones favorites
CREATE TABLE favorite_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius INTEGER DEFAULT 5,
  default_course_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_start ON sessions(start_time DESC);
CREATE INDEX idx_favorites_user ON favorite_zones(user_id);

-- RLS (Row Level Security)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own favorites"
  ON favorite_zones FOR ALL
  USING (auth.uid() = user_id);
```

---

## 6. API Routes — Détail

### 6.1 `/api/weather` — Vent + Houle

```typescript
// GET /api/weather?lat=47.58&lng=-2.95&start=2026-02-28T14:00&hours=6
// Proxy vers Open-Meteo, retourne données unifiées

interface WeatherResponse {
  wind: { time: string; speed: number; direction: number; gusts: number }[];
  waves: { time: string; height: number; period: number; direction: number }[];
  model: string; // "arome_france"
  fetchedAt: string;
}
```

### 6.2 `/api/tides` — Marées

```typescript
// GET /api/tides?lat=47.58&lng=-2.95&date=2026-02-28
// Proxy vers WorldTides

interface TidesResponse {
  referencePort: string;
  coefficient: number; // calculé ou estimé
  events: { type: 'high' | 'low'; time: string; height: number }[];
  fetchedAt: string;
}
```

### 6.3 `/api/currents` — Courants de marée

```typescript
// GET /api/currents?lat=47.58&lng=-2.95&coefficient=75&pmTime=2026-02-28T15:32
// Lecture données SHOM 2D pré-traitées + interpolation

interface CurrentsResponse {
  coefficient: number;
  timeSlices: {
    label: string; // "PM-3", "PM-2", etc.
    time: string;
    points: { lat: number; lng: number; speed: number; direction: number }[];
  }[];
}
```

### 6.4 `/api/briefing` — Analyse tactique

```typescript
// POST /api/briefing
// Body: { sessionId: string } ou { zone, course, schedule, weather, tides, currents }
// Appelle Claude avec le prompt tactique structuré

interface BriefingResponse {
  conditionsSummary: string;
  favorableOptions: { title: string; description: string }[];
  unfavorableOptions: { title: string; description: string; risk: string }[];
  keyRecommendations: { priority: number; recommendation: string }[];
  timingConsiderations: { time: string; event: string; impact: string }[];
  generatedAt: string;
}
```

---

## 7. Prompt tactique — Architecture

```typescript
function buildTacticalPrompt(session: RaceSession): string {
  return `You will be acting as an AI sailing race tactical advisor...

<navigation_zone>
Zone: ${session.zone.name}
Centre: ${session.zone.center.lat}°N, ${session.zone.center.lng}°W
Rayon: ${session.zone.radius} km
Caractéristiques: ${getZoneCharacteristics(session.zone)}
</navigation_zone>

<race_course>
Type: ${session.course.type}
Orientation: ${session.course.orientation}°
${session.course.marks ? formatMarks(session.course.marks) : ''}
</race_course>

<race_schedule>
Départ: ${session.schedule.startTime}
Durée: ${session.schedule.duration} minutes
Manches: ${session.schedule.races}
</race_schedule>

<wind_forecast>
${formatWindData(session.data.wind)}
</wind_forecast>

<tide_data>
Port de référence: ${session.data.tide.referencePort}
Coefficient: ${session.data.tide.coefficient}
${formatTideEvents(session.data.tide.events)}
</tide_data>

<current_charts>
${formatCurrentData(session.data.currents)}
</current_charts>

[... suite du prompt avec instructions d'analyse ...]`;
}
```

---

## 8. Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# APIs externes
WORLDTIDES_API_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Open-Meteo : pas de clé nécessaire (gratuit)
# SHOM 2D : données statiques embarquées (pas d'API key)
```

---

## 9. Déploiement

```
GitHub (jgiraudeau/regatta)
    │
    ▼
Vercel (auto-deploy on push)
    │
    ├── Frontend: Edge (CDN global)
    ├── API Routes: Serverless (eu-west)
    └── Static data: /data/shom/*.json

Supabase (hosted PostgreSQL)
    │
    ├── Auth: Supabase Auth
    ├── DB: sessions + favorites
    └── RLS: isolation par utilisateur
```

---

## 10. Décisions d'architecture

| Décision | Choix | Alternative rejetée | Raison |
|---|---|---|---|
| BDD | Supabase | Google Sheets | Données structurées + auth intégrée + RLS |
| Carte | Mapbox GL JS | Leaflet | Meilleure perf vectorielle, overlays custom |
| Courants SHOM | JSON statique pré-traité | API temps réel | Données de référence stables, pas de latence |
| Auth | Supabase Auth | JWT custom | Plus simple, token refresh, providers OAuth futurs |
| Marées MVP | WorldTides | SHOM API | JSON simple, gratuit pour prototyper (SHOM en V2) |
| IA | Claude Sonnet | GPT-4 / Haiku | Meilleur raisonnement pour l'analyse tactique complexe |
