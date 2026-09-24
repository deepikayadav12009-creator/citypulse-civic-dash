import type { CivicEvent, Correlation } from './types';
import { haversineKm } from './verification';

export function detectCorrelations(events: CivicEvent[]): Correlation[] {
  const correlations: Correlation[] = [];
  const TIME_WINDOW_MIN = 45;
  const DISTANCE_KM = 2.0;
  const now = Date.now();

  const recent = events.filter((e) => {
    const diffMin = (now - new Date(e.timestamp).getTime()) / 60_000;
    return diffMin <= TIME_WINDOW_MIN;
  });

  // Rule: rainfall + waterlogging + traffic in same area/time
  const weatherRain = recent.filter(
    (e) => e.type === 'weather' && e.category.toLowerCase().includes('rain'),
  );
  const waterLogs = recent.filter(
    (e) => e.type === 'water' && e.category.toLowerCase().includes('waterlog'),
  );
  const trafficHeavy = recent.filter(
    (e) => e.type === 'traffic' && e.category.toLowerCase().includes('heavy'),
  );

  if (weatherRain.length > 0 && waterLogs.length > 0) {
    const eventIds = [...weatherRain, ...waterLogs, ...trafficHeavy].map((e) => e.id);
    const allInArea = [...weatherRain, ...waterLogs, ...trafficHeavy].every((e) =>
      haversineKm(e.latitude, e.longitude, weatherRain[0].latitude, weatherRain[0].longitude) <= DISTANCE_KM,
    );

    if (allInArea) {
      correlations.push({
        title: 'Possible connection detected',
        description:
          'Recent rainfall, waterlogging reports and increased traffic are occurring in the same area. These events may be related, though this has not been independently confirmed.',
        eventIds,
      });
    }
  }

  // Rule: accident + traffic congestion in same area
  const accidents = recent.filter(
    (e) => e.type === 'traffic' && e.category.toLowerCase().includes('accident'),
  );
  if (accidents.length > 0 && trafficHeavy.length > 0) {
    const matched = trafficHeavy.filter((t) =>
      accidents.some(
        (a) => haversineKm(a.latitude, a.longitude, t.latitude, t.longitude) <= DISTANCE_KM,
      ),
    );
    if (matched.length > 0) {
      correlations.push({
        title: 'Possible connection detected',
        description:
          'A road accident and heavy traffic congestion are reported in the same area. The congestion may be related to the accident, though this has not been independently confirmed.',
        eventIds: [...accidents, ...matched].map((e) => e.id),
      });
    }
  }

  return correlations;
}
