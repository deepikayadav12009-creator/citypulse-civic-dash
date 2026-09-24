import type { CivicEvent, AreaHealth } from '@/lib/types';
import { Sparkles, Link2, AlertTriangle } from 'lucide-react';

interface AreaHealthSummaryProps {
  events: CivicEvent[];
  searchQuery: string;
  correlations: { title: string; description: string; eventIds: string[] }[];
}

export function AreaHealthSummary({ events, searchQuery, correlations }: AreaHealthSummaryProps) {
  const trafficEvents = events.filter((e) => e.type === 'traffic');
  const waterEvents = events.filter((e) => e.type === 'water');
  const complaintEvents = events.filter((e) => e.type === 'complaint');
  const communityEvents = events.filter((e) => e.source === 'community' || e.type === 'community');
  const weatherEvents = events.filter((e) => e.type === 'weather');

  const trafficStatus =
    trafficEvents.some((e) => e.severity === 'critical') ? 'Critical' :
    trafficEvents.some((e) => e.severity === 'high') ? 'Heavy' :
    trafficEvents.length > 0 ? 'Moderate' : 'Clear';

  const aqiEvent = weatherEvents.find((e) => e.category.toLowerCase().includes('air quality'));
  const aqiStatus = aqiEvent ? 'Unhealthy' : weatherEvents.some((e) => e.category.toLowerCase().includes('rain')) ? 'Moderate' : 'Good';

  const weatherStatus =
    weatherEvents.some((e) => e.category.toLowerCase().includes('rain')) ? 'Rain' :
    weatherEvents.some((e) => e.category.toLowerCase().includes('temperature')) ? 'Hot' : 'Clear';

  const health: AreaHealth = {
    traffic: trafficStatus,
    airQuality: aqiStatus,
    weather: weatherStatus,
    waterIssues: waterEvents.length,
    publicComplaints: complaintEvents.length,
    communityUpdates: communityEvents.length,
  };

  const areaName = searchQuery || 'Your Area';

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Area Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-bold text-slate-900">Area Health</h3>
          <p className="mb-4 text-xs text-slate-400">{areaName}</p>
          <div className="space-y-3">
            <HealthRow label="Traffic" value={health.traffic} status={statusColor(health.traffic)} />
            <HealthRow label="Air Quality" value={health.airQuality} status={statusColor(health.airQuality)} />
            <HealthRow label="Weather" value={health.weather} status={statusColor(health.weather)} />
            <div className="border-t border-slate-100 pt-3">
              <HealthRow label="Water Issues" value={`${health.waterIssues} active`} status="text-orange-600" />
              <HealthRow label="Public Complaints" value={`${health.publicComplaints} active`} status="text-violet-600" />
              <HealthRow label="Community Updates" value={`${health.communityUpdates} recent`} status="text-sky-600" />
            </div>
          </div>
        </div>

        {/* AI Civic Summary */}
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What's happening right now?</h3>
              <p className="text-xs text-slate-400">AI-generated summary from live data</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {generateSummary(events)}
          </p>
          <p className="mt-3 text-[11px] italic text-slate-400">
            This summary is generated from available civic data only. It does not confirm cause-and-effect relationships.
          </p>
        </div>

        {/* Correlation / Anomaly Detection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Link2 className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Correlation Detection</h3>
              <p className="text-xs text-slate-400">Rule-based anomaly analysis</p>
            </div>
          </div>
          {correlations.length > 0 ? (
            <div className="space-y-3">
              {correlations.map((c, i) => (
                <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800">{c.title}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-amber-700">{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No significant correlations detected in the current time window.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function HealthRow({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-semibold ${status}`}>{value}</span>
    </div>
  );
}

function statusColor(value: string): string {
  const v = value.toLowerCase();
  if (['critical', 'heavy', 'unhealthy', 'rain'].includes(v)) return 'text-rose-600';
  if (['moderate', 'hot'].includes(v)) return 'text-amber-600';
  if (['clear', 'good'].includes(v)) return 'text-emerald-600';
  return 'text-slate-600';
}

function generateSummary(events: CivicEvent[]): string {
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

  const hasRain = weather.some((e) => e.category.toLowerCase().includes('rain'));
  const hasWaterlog = water.some((e) => e.category.toLowerCase().includes('waterlog'));
  if (hasRain && hasWaterlog) {
    summary += ' Recent rainfall may be related to the reported waterlogging.';
  }

  return summary;
}
