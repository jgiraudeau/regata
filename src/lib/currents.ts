import type { Zone, TideData, CurrentGrid, CurrentTimeSlice, CurrentPoint } from '@/types';
import { hasTides } from './geo';

export function fetchCurrents(zone: Zone, tideData: TideData, startDate: string): CurrentGrid | undefined {
  if (!hasTides(zone.center.lat, zone.center.lng)) {
    return undefined;
  }

  // Base direction for flood (flot) - roughly East/NorthEast in Atlantic/Channel
  const floodDir = 70;
  // Base direction for ebb (jusant) - roughly West/SouthWest
  const ebbDir = 250;

  // Max speed depends on the coefficient (e.g. 3.5 knots for coef 120, 1 knot for coef 45)
  const maxSpeed = (tideData.coefficient / 120) * 4.0;

  const timeSlices: CurrentTimeSlice[] = [];

  // Generate an hourly time slice from 08:00 to 20:00 for the simulation
  // Or better, generate slices based on the tide events. We will just generate 24 hourly slices for the given date.
  const baseDate = new Date(startDate);
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    const sliceTime = new Date(baseDate.getTime() + i * 60 * 60 * 1000);
    
    // Find the state of the tide at sliceTime
    let tideState: 'rising' | 'falling' = 'rising';
    let prevEventTime = baseDate.getTime() - 12 * 60 * 60 * 1000;
    let nextEventTime = baseDate.getTime() + 24 * 60 * 60 * 1000;
    let prevEventType = 'low';

    // Find the closest previous and next tide events
    for (const event of tideData.events) {
      const eventTime = new Date(event.time).getTime();
      if (eventTime <= sliceTime.getTime() && eventTime > prevEventTime) {
        prevEventTime = eventTime;
        prevEventType = event.type;
      }
      if (eventTime > sliceTime.getTime() && eventTime < nextEventTime) {
        nextEventTime = eventTime;
      }
    }

    tideState = prevEventType === 'low' ? 'rising' : 'falling';

    // Calculate speed based on sinusoidal rule of twelfths (max speed midway between tides)
    const tideDuration = nextEventTime - prevEventTime;
    const timeSincePrev = sliceTime.getTime() - prevEventTime;
    let phase = 0;
    if (tideDuration > 0) {
      phase = Math.sin((timeSincePrev / tideDuration) * Math.PI);
    }
    const currentSpeed = maxSpeed * phase;
    const currentDir = tideState === 'rising' ? floodDir : ebbDir;

    // Generate a 3x3 grid around the zone center
    const points: CurrentPoint[] = [];
    const gridSize = 3;
    const latStep = 0.02;
    const lngStep = 0.03;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const lat = zone.center.lat + (r - 1) * latStep;
        const lng = zone.center.lng + (c - 1) * lngStep;
        
        // Add a bit of noise/variation
        const noiseSpeed = currentSpeed * (0.8 + Math.random() * 0.4);
        const noiseDir = currentDir + (Math.random() * 20 - 10);

        if (noiseSpeed > 0.1) {
          points.push({
            lat,
            lng,
            speed: parseFloat(noiseSpeed.toFixed(1)),
            direction: Math.round((noiseDir + 360) % 360),
          });
        }
      }
    }

    // Label relative to closest PM (High Tide)
    let pmTime = new Date().getTime();
    tideData.events.forEach(e => {
        if (e.type === 'high') {
            const et = new Date(e.time).getTime();
            if (Math.abs(et - sliceTime.getTime()) < Math.abs(pmTime - sliceTime.getTime())) {
                pmTime = et;
            }
        }
    });
    
    const diffHours = Math.round((sliceTime.getTime() - pmTime) / (1000 * 60 * 60));
    let label = 'PM';
    if (diffHours > 0) label = `PM+${diffHours}`;
    else if (diffHours < 0) label = `PM${diffHours}`;

    timeSlices.push({
      label,
      time: sliceTime.toISOString(),
      points,
    });
  }

  return {
    coefficient: tideData.coefficient,
    timeSlices,
  };
}
