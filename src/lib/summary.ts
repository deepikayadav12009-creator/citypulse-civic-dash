import type { CivicEvent } from './types';

export function generateCivicSummary(events: CivicEvent[]): string {
  if (events.length === 0) {
    return 'No significant civic activity reported in the last hour. The city appears calm.';
  }

  const recent = events.slice(0, 20);
  const parts: string[] = [];

  const traffic = recent.filter((e) => e.type === 'traffic');
  const water = recent.filter((e) => e.type === 'water');
  const weather = recent.filter((e) => e.type === 'weather');
  const complaints = recent.filter((e) => e.type === 'complaint');
  const transit = recent.filter((e) => e.type === 'transit');

  if (traffic.length > 0) {
    const heavy = traffic.filter((e) => e.category.toLowerCase().includes('heavy'));
    const accidents = traffic.filter((e) => e.category.toLowerCase().includes('accident'));
    if (heavy.length > 0) {
      parts.push(`Traffic is currently heavy near ${heavy[0].location_text.split(',')[0]}`);
    }
    if (accidents.length > 0) {
      parts.push(`a road accident was reported on ${accidents[0].location_text.split(',')[0]}`);
    }
  }

  if (water.length > 0) {
    const waterlog = water.filter((e) => e.category.toLowerCase().includes('waterlog'));
    if (waterlog.length > 0) {
      parts.push(`${waterlog.length} waterlogging report${waterlog.length > 1 ? 's were' : ' was'} submitted recently`);
    } else {
      parts.push(`${water.length} water issue${water.length > 1 ? 's' : ''} reported`);
    }
  }

  if (weather.length > 0) {
    const rain = weather.filter((e) => e.category.toLowerCase().includes('rain'));
    if (rain.length > 0) {
      parts.push('rainfall is currently active in the area');
    }
    const aqi = weather.filter((e) => e.category.toLowerCase().includes('air quality'));
    if (aqi.length > 0) {
      parts.push('air quality is elevated');
    }
  }

  if (complaints.length > 0) {
    parts.push(`${complaints.length} civic complaint${complaints.length > 1 ? 's' : ''} were filed`);
  }

  if (transit.length > 0) {
    parts.push(`${transit.length} transit delay${transit.length > 1 ? 's' : ''} reported`);
  }

  if (parts.length === 0) {
    return 'Minor civic activity reported. No critical situations at this time.';
  }

  let summary = parts.slice(0, 3).join(', ') + '.';
  summary = summary.charAt(0).toUpperCase() + summary.slice(1);

  // Add correlation note if rainfall + waterlogging
  const hasRain = weather.some((e) => e.category.toLowerCase().includes('rain'));
  const hasWaterlog = water.some((e) => e.category.toLowerCase().includes('waterlog'));
  if (hasRain && hasWaterlog) {
    summary += ' Recent rainfall may be related to the reported waterlogging.';
  }

  return summary;
}
