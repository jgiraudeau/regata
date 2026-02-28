// === Zone de navigation ===
export interface Zone {
  center: { lat: number; lng: number };
  radius: number; // km
  name: string;
}

// === Parcours ===
export type CourseType = 'banane' | 'triangle_olympique' | 'cotier' | 'au_large' | 'parcours_permanent';

export interface Mark {
  lat: number;
  lng: number;
  name: string;
}

export interface Course {
  type: CourseType;
  orientation: number; // degrés
  marks?: Mark[];
}

// === Horaires ===
export interface Schedule {
  startTime: string; // ISO 8601
  duration: number; // minutes
  races: number;
}

// === Données météo ===
export interface WindPoint {
  time: string;
  speed: number; // km/h
  direction: number; // degrés
  gusts: number; // km/h
}

export interface WavePoint {
  time: string;
  height: number; // mètres
  period: number; // secondes
  direction: number; // degrés
  windWaveHeight?: number;
  swellHeight?: number;
  swellDirection?: number;
}

// === Marées ===
export interface TideEvent {
  type: 'high' | 'low';
  time: string;
  height: number; // mètres
}

export interface TideData {
  referencePort: string;
  coefficient: number;
  events: TideEvent[];
}

// === Courants ===
export interface CurrentPoint {
  lat: number;
  lng: number;
  speed: number; // noeuds
  direction: number; // degrés
}

export interface CurrentTimeSlice {
  label: string; // "PM-3", "PM", "PM+2", etc.
  time: string;
  points: CurrentPoint[];
}

export interface CurrentGrid {
  coefficient: number;
  timeSlices: CurrentTimeSlice[];
}

// === Briefing tactique ===
export interface FavorableOption {
  title: string;
  description: string;
  area?: string;
}

export interface UnfavorableOption {
  title: string;
  description: string;
  risk: 'high' | 'medium' | 'low';
}

export interface Recommendation {
  priority: number;
  recommendation: string;
  timing?: string;
}

export interface TimingNote {
  time: string;
  event: string;
  impact: string;
}

export interface TacticalBriefing {
  generatedAt: string;
  conditionsSummary: string;
  favorableOptions: FavorableOption[];
  unfavorableOptions: UnfavorableOption[];
  keyRecommendations: Recommendation[];
  timingConsiderations: TimingNote[];
}

// === Session de régate ===
export interface RaceSession {
  id: string;
  user_id: string;
  zone: Zone;
  course: Course;
  schedule: Schedule;
  weather_data?: {
    wind: WindPoint[];
    waves: WavePoint[];
    fetchedAt: string;
  };
  tide_data?: TideData;
  current_data?: CurrentGrid;
  briefing?: TacticalBriefing;
  created_at: string;
  updated_at: string;
}
