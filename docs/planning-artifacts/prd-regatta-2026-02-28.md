# PRD — Regatta

**Date** : 2026-02-28
**Auteur** : Jacques (Antigravity)
**Version** : 1.0
**Statut** : Draft

---

## 1. Objectif du produit

Regatta est une application web et mobile (PWA) qui fournit des **briefings tactiques intelligents** aux régatiers professionnels, entraîneurs et coachs. L'application collecte automatiquement les données météo, marées, courants et houle, puis utilise l'IA pour générer une analyse tactique contextuelle adaptée au parcours et aux horaires de la régate.

---

## 2. User Stories

### Epic 1 — Configuration de la régate

| ID | Story | Priorité |
|---|---|---|
| US-1.1 | En tant qu'entraîneur, je veux **sélectionner ma zone de navigation sur une carte** pour définir où se déroule la régate | P0 |
| US-1.2 | En tant qu'entraîneur, je veux **choisir le type de parcours** (banane, triangle olympique, côtier, au large) pour que l'analyse soit adaptée | P0 |
| US-1.3 | En tant qu'entraîneur, je veux **placer les bouées du parcours sur la carte** (ou indiquer l'orientation) pour que l'IA analyse chaque bord | P1 |
| US-1.4 | En tant qu'entraîneur, je veux **renseigner les horaires** (heure de départ, durée, nombre de manches) pour cadrer la fenêtre d'analyse | P0 |
| US-1.5 | En tant qu'entraîneur, je veux **sauvegarder mes zones favorites** pour ne pas reconfigurer à chaque fois | P2 |

### Epic 2 — Collecte de données

| ID | Story | Priorité |
|---|---|---|
| US-2.1 | En tant qu'utilisateur, je veux que l'app **récupère automatiquement les prévisions de vent** (direction, force, rafales, rotation) sur ma zone et fenêtre horaire | P0 |
| US-2.2 | En tant qu'utilisateur, je veux que l'app **récupère les horaires et coefficients de marée** pour le port de référence le plus proche | P0 |
| US-2.3 | En tant qu'utilisateur, je veux que l'app **récupère les courants de marée** interpolés selon le coefficient du jour | P0 |
| US-2.4 | En tant qu'utilisateur, je veux que l'app **récupère l'état de la mer** (hauteur de houle, période, direction) | P1 |
| US-2.5 | En tant qu'utilisateur, je veux **voir la date/heure de dernière mise à jour** de chaque source de données | P1 |

### Epic 3 — Analyse tactique IA

| ID | Story | Priorité |
|---|---|---|
| US-3.1 | En tant qu'entraîneur, je veux que l'IA **analyse les interactions vent/courant** (vent contre courant = mer formée, courant portant = gain/perte de VMG) | P0 |
| US-3.2 | En tant qu'entraîneur, je veux que l'IA **identifie le côté favorable du plan d'eau** pour chaque leg du parcours | P0 |
| US-3.3 | En tant qu'entraîneur, je veux que l'IA **détecte les rotations de vent prévues** et leur impact tactique | P0 |
| US-3.4 | En tant qu'entraîneur, je veux que l'IA **identifie les moments clés** (renverse de courant, bascule de vent, étale) | P0 |
| US-3.5 | En tant qu'entraîneur, je veux que l'IA **tienne compte du type de parcours** pour contextualiser ses recommandations | P1 |

### Epic 4 — Briefing tactique

| ID | Story | Priorité |
|---|---|---|
| US-4.1 | En tant qu'entraîneur, je veux recevoir un **résumé des conditions** clair et concis | P0 |
| US-4.2 | En tant qu'entraîneur, je veux une liste des **options favorables** avec explications | P0 |
| US-4.3 | En tant qu'entraîneur, je veux une liste des **options défavorables / pièges** à éviter | P0 |
| US-4.4 | En tant qu'entraîneur, je veux **3-5 recommandations clés** hiérarchisées par importance | P0 |
| US-4.5 | En tant qu'entraîneur, je veux comprendre l'**évolution temporelle** des conditions pendant la course | P0 |
| US-4.6 | En tant qu'entraîneur, je veux pouvoir **partager le briefing** avec mon équipage (lien ou PDF) | P2 |

### Epic 5 — Visualisation cartographique

| ID | Story | Priorité |
|---|---|---|
| US-5.1 | En tant qu'utilisateur, je veux voir une **carte de la zone** avec le parcours superposé | P0 |
| US-5.2 | En tant qu'utilisateur, je veux voir un **overlay des courants** (flèches directionnelles colorées par intensité) | P1 |
| US-5.3 | En tant qu'utilisateur, je veux voir la **direction et force du vent** sur la carte | P1 |
| US-5.4 | En tant qu'utilisateur, je veux voir les **zones favorables/défavorables** colorées sur la carte | P2 |
| US-5.5 | En tant qu'utilisateur, je veux un **slider temporel** pour voir l'évolution des conditions heure par heure | P2 |

### Epic 6 — Authentification et profil

| ID | Story | Priorité |
|---|---|---|
| US-6.1 | En tant qu'utilisateur, je veux pouvoir **créer un compte** (email + mot de passe) | P0 |
| US-6.2 | En tant qu'utilisateur, je veux **me connecter** pour retrouver mes zones et historique | P0 |
| US-6.3 | En tant qu'utilisateur, je veux pouvoir utiliser l'app **sans compte** pour un premier briefing (mode invité) | P1 |

---

## 3. Exigences fonctionnelles

### 3.1 Configuration du parcours

**Entrées obligatoires :**
- Zone de navigation : point central (lat/lng) + rayon, ou sélection sur carte
- Type de parcours : `banane` | `triangle_olympique` | `cotier` | `au_large` | `parcours_permanent`
- Orientation du parcours : axe vent (auto-détecté) ou manuel (degrés)
- Heure de départ : date + heure
- Durée estimée : en minutes (ou heure de fin)

**Entrées optionnelles :**
- Nombre de manches
- Position des bouées (lat/lng)
- Port de référence pour les marées (auto-détecté par défaut)
- Classe de bateau / type de support

### 3.2 Collecte de données

**Vent (Open-Meteo AROME) :**
- Résolution : 1.3 km
- Paramètres : wind_speed_10m, wind_direction_10m, wind_gusts_10m
- Fenêtre : H-2 à H+8 par rapport au départ
- Fréquence : données horaires, mises à jour toutes les heures

**Marées (SHOM API ou WorldTides) :**
- Horaires PM/BM avec hauteurs
- Coefficients de marée
- Port de référence le plus proche

**Courants (SHOM 2D) :**
- Grille de courants pour coefficient 45 (mortes-eaux) et 95 (vives-eaux)
- Interpolation en fonction du coefficient réel du jour
- Heure par heure (H±6 par rapport à la PM)

**Houle (Open-Meteo Marine) :**
- Hauteur significative, période, direction
- Séparation mer de vent / houle

### 3.3 Analyse IA

**Prompt système :** Le prompt utilise la structure fournie par le Product Owner :
- `<navigation_zone>` : coordonnées, caractéristiques locales
- `<race_course>` : type, orientation, legs
- `<race_schedule>` : horaires, durée
- `<current_charts>` : données courants structurées
- `<wind_forecast>` : prévisions horaires
- `<tide_data>` : PM/BM, coefficients, hauteurs

**Modèle IA :** Claude Sonnet (meilleur ratio qualité/coût pour l'analyse)

**Output structuré :**
```
<briefing>
  CONDITIONS_SUMMARY: string
  FAVORABLE_OPTIONS: FavorableOption[]
  UNFAVORABLE_OPTIONS: UnfavorableOption[]
  KEY_RECOMMENDATIONS: Recommendation[] (3-5 items, prioritisés)
  TIMING_CONSIDERATIONS: TimingNote[]
</briefing>
```

### 3.4 Temps de réponse

| Action | Objectif |
|---|---|
| Chargement carte | < 2s |
| Récupération données météo | < 3s |
| Récupération marées/courants | < 3s |
| Génération briefing IA | < 15s |
| Rafraîchissement des données | < 5s |

---

## 4. Exigences non-fonctionnelles

### 4.1 Performance
- L'application doit fonctionner sur mobile 4G (réseau dégradé au large)
- Les données doivent être cachées pour fonctionner en mode dégradé
- Taille de la page < 500 KB (hors tuiles carte)

### 4.2 Disponibilité
- 99.5% uptime (les régates ont lieu le week-end, criticité forte samedi/dimanche)

### 4.3 Sécurité
- Authentification JWT
- HTTPS obligatoire
- Pas de données personnelles sensibles stockées (juste email + préférences)

### 4.4 Compatibilité
- Chrome, Safari, Firefox (dernières versions)
- iOS Safari (iPhone, iPad)
- Android Chrome
- PWA installable

### 4.5 Internationalisation
- MVP : français uniquement
- V2 : anglais, espagnol

---

## 5. Architecture des données

### 5.1 Modèle Session de régate

```typescript
interface RaceSession {
  id: string;
  userId: string;

  // Zone
  zone: {
    center: { lat: number; lng: number };
    radius: number; // km
    name: string; // ex: "Baie de Quiberon"
  };

  // Parcours
  course: {
    type: 'banane' | 'triangle_olympique' | 'cotier' | 'au_large' | 'parcours_permanent';
    orientation: number; // degrés, axe du vent
    marks?: { lat: number; lng: number; name: string }[];
  };

  // Horaires
  schedule: {
    startTime: string; // ISO 8601
    duration: number; // minutes
    races: number; // nombre de manches
  };

  // Données collectées
  data: {
    wind: WindForecast[];
    tide: TideData;
    currents: CurrentGrid;
    waves: WaveData[];
    fetchedAt: string;
  };

  // Briefing généré
  briefing?: TacticalBriefing;

  createdAt: string;
  updatedAt: string;
}
```

### 5.2 Modèle Données météo

```typescript
interface WindForecast {
  time: string; // ISO 8601
  speed: number; // km/h
  direction: number; // degrés
  gusts: number; // km/h
}

interface TideData {
  referencePort: string;
  coefficient: number;
  events: {
    type: 'high' | 'low';
    time: string;
    height: number; // mètres
  }[];
}

interface CurrentGrid {
  coefficient: number; // coefficient interpolé
  timeSlices: {
    time: string; // relatif à PM
    points: {
      lat: number;
      lng: number;
      speed: number; // nœuds
      direction: number; // degrés
    }[];
  }[];
}

interface WaveData {
  time: string;
  height: number; // mètres
  period: number; // secondes
  direction: number; // degrés
}
```

### 5.3 Modèle Briefing

```typescript
interface TacticalBriefing {
  generatedAt: string;
  conditionsSummary: string;
  favorableOptions: {
    title: string;
    description: string;
    area?: string; // zone géographique concernée
  }[];
  unfavorableOptions: {
    title: string;
    description: string;
    risk: 'high' | 'medium' | 'low';
  }[];
  keyRecommendations: {
    priority: number; // 1-5
    recommendation: string;
    timing?: string;
  }[];
  timingConsiderations: {
    time: string;
    event: string;
    impact: string;
  }[];
}
```

---

## 6. Pages et écrans

### 6.1 Arborescence

```
/                           → Landing page
/login                      → Connexion
/signup                     → Inscription
/app                        → Dashboard (liste des sessions)
/app/new                    → Nouvelle session (configuration)
/app/session/[id]           → Vue session (carte + briefing)
/app/session/[id]/briefing  → Briefing détaillé plein écran
/app/session/[id]/share     → Vue partagée (lecture seule)
```

### 6.2 Page principale — Nouvelle session (`/app/new`)

**Layout :**
```
┌──────────────────────────────────────────┐
│  ← Retour          REGATTA              │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │         CARTE INTERACTIVE          │  │
│  │    (cliquer pour placer la zone)   │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Zone : [Baie de Quiberon      ] 📍     │
│                                          │
│  Type de parcours :                      │
│  [Banane] [Triangle] [Côtier] [Large]   │
│                                          │
│  Orientation parcours : [225°]  (auto)   │
│                                          │
│  Date :     [28/02/2026]                │
│  Départ :   [14:00]                      │
│  Durée :    [2h30]                       │
│  Manches :  [3]                          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    🎯 GÉNÉRER LE BRIEFING          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 6.3 Page session — Carte + Briefing (`/app/session/[id]`)

**Layout desktop (split view) :**
```
┌─────────────────────┬────────────────────┐
│                     │                    │
│                     │  CONDITIONS        │
│                     │  ☁ Vent: 15-20 kts │
│   CARTE             │  🌊 Houle: 1.2m   │
│   avec overlays     │  🔄 Coef: 75      │
│   courants + vent   │  ⏰ PM: 15h32     │
│                     │                    │
│                     ├────────────────────│
│                     │                    │
│                     │  BRIEFING          │
│                     │  tactique          │
│                     │  complet           │
│                     │                    │
├─────────────────────┴────────────────────│
│  [Timeline slider: 14h 15h 16h 17h]     │
└──────────────────────────────────────────┘
```

**Layout mobile (tabs) :**
```
┌──────────────────────┐
│  [Carte] [Briefing]  │  ← tabs
├──────────────────────┤
│                      │
│   Contenu actif      │
│                      │
└──────────────────────┘
```

---

## 7. Intégrations API — Spécifications détaillées

### 7.1 Open-Meteo (Vent)

```
GET https://api.open-meteo.com/v1/meteofrance
  ?latitude=47.58
  &longitude=-2.95
  &hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl
  &models=arome_france
  &timezone=Europe/Paris
```

### 7.2 Open-Meteo Marine (Houle)

```
GET https://marine-api.open-meteo.com/v1/marine
  ?latitude=47.58
  &longitude=-2.95
  &hourly=wave_height,wave_direction,wave_period,
          wind_wave_height,swell_wave_height,swell_wave_direction
```

### 7.3 SHOM / WorldTides (Marées)

**WorldTides (MVP, gratuit) :**
```
GET https://www.worldtides.info/api/v3
  ?extremes
  &lat=47.58
  &lon=-2.95
  &key=API_KEY
```

**SHOM (V2, payant, avec coefficients) :**
```
GET https://services.data.shom.fr/spm/tide
  ?port=BREST
  &date=2026-02-28
```

### 7.4 Claude API (Analyse tactique)

```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  system: TACTICAL_ADVISOR_SYSTEM_PROMPT,
  messages: [{
    role: 'user',
    content: buildTacticalPrompt(zone, course, schedule, wind, tide, currents)
  }]
});
```

---

## 8. Plan de livraison

### Sprint 1 — Fondations (Semaine 1)
- Setup projet Next.js + Tailwind + Mapbox
- Page de configuration (zone + parcours + horaires)
- Intégration Open-Meteo (vent)
- Intégration WorldTides (marées)
- Affichage carte avec zone

### Sprint 2 — Analyse IA (Semaine 2)
- Prompt tactique complet pour Claude
- Intégration Claude API
- Page de briefing (affichage structuré)
- Cache des données météo

### Sprint 3 — Courants et visualisation (Semaine 3)
- Intégration courants SHOM 2D (parsing + interpolation)
- Overlay courants sur la carte
- Overlay vent sur la carte
- Timeline slider

### Sprint 4 — Auth et polish (Semaine 4)
- Authentification (inscription/connexion)
- Sauvegarde des sessions
- Dashboard historique
- PWA (manifest + service worker)
- Responsive mobile
- Déploiement Vercel

---

## 9. Critères d'acceptation MVP

- [ ] L'utilisateur peut configurer une zone, un type de parcours et des horaires
- [ ] L'app récupère automatiquement le vent (AROME), les marées et la houle
- [ ] L'IA génère un briefing tactique structuré en < 15 secondes
- [ ] Le briefing contient : conditions, options favorables, défavorables, recommandations, timing
- [ ] La carte affiche la zone avec le parcours
- [ ] L'app fonctionne sur mobile (responsive)
- [ ] L'app est déployée et accessible en ligne

---

## 10. Hors scope MVP

- Intégration polaires bateau
- Mode hors-ligne complet
- App native (React Native)
- Multi-langue
- Overlay courants sur carte (Sprint 3, post-MVP si temps manque)
- Partage PDF du briefing
- Replay post-course
