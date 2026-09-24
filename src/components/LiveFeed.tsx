import { useState } from 'react';
import type { CivicEvent, EventType, Severity, FilterState } from '@/lib/types';
import { timeAgo, severityLabel, severityDot, typeLabel } from '@/lib/uiHelpers';
import { verificationLabel, verificationColor } from '@/lib/verification';
import { Users, ShieldCheck, Filter, ChevronDown } from 'lucide-react';

interface LiveFeedProps {
  events: CivicEvent[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onSelectEvent: (e: CivicEvent) => void;
}

const typeFilters: { value: EventType; label: string; color: string }[] = [
  { value: 'traffic', label: 'Traffic', color: 'bg-rose-100 text-rose-700' },
  { value: 'weather', label: 'Weather/Air', color: 'bg-sky-100 text-sky-700' },
  { value: 'water', label: 'Water', color: 'bg-blue-100 text-blue-700' },
  { value: 'complaint', label: 'Complaints', color: 'bg-violet-100 text-violet-700' },
  { value: 'community', label: 'Community', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'noise', label: 'Noise', color: 'bg-amber-100 text-amber-700' },
  { value: 'transit', label: 'Transit', color: 'bg-teal-100 text-teal-700' },
];

const severityFilters: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600' },
  { value: 'moderate', label: 'Moderate', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-100 text-rose-700' },
];

const timeFilters: { value: 'all' | '1h' | '6h' | '24h'; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6h' },
  { value: '24h', label: 'Last 24h' },
];

export function LiveFeed({ events, filters, setFilters, onSelectEvent }: LiveFeedProps) {
  const [showFilters, setShowFilters] = useState(false);

  function toggleType(type: EventType) {
    const newTypes = new Set(filters.types);
    if (newTypes.has(type)) newTypes.delete(type);
    else newTypes.add(type);
    setFilters({ ...filters, types: newTypes });
  }

  function toggleSeverity(sev: Severity) {
    const newSev = new Set(filters.severity);
    if (newSev.has(sev)) newSev.delete(sev);
    else newSev.add(sev);
    setFilters({ ...filters, severity: newSev });
  }

  function setTimeRange(range: 'all' | '1h' | '6h' | '24h') {
    setFilters({ ...filters, timeRange: range });
  }

  function clearFilters() {
    setFilters({ types: new Set(), severity: new Set(), timeRange: 'all' });
  }

  const filtered = events.filter((e) => {
    if (filters.types.size > 0 && !filters.types.has(e.type as EventType)) return false;
    if (filters.severity.size > 0 && !filters.severity.has(e.severity)) return false;
    if (filters.timeRange !== 'all') {
      const hours = filters.timeRange === '1h' ? 1 : filters.timeRange === '6h' ? 6 : 24;
      const diffHr = (Date.now() - new Date(e.timestamp).getTime()) / (60 * 60_000);
      if (diffHr > hours) return false;
    }
    return true;
  });

  const activeFilterCount = filters.types.size + filters.severity.size + (filters.timeRange !== 'all' ? 1 : 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Happening Now</h2>
          <p className="text-xs text-slate-400">{filtered.length} live updates</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filter by type</span>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-violet-600 hover:text-violet-700">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((f) => {
              const active = filters.types.has(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => toggleType(f.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active ? `${f.color} ring-2 ring-offset-1` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Severity</div>
          <div className="flex flex-wrap gap-2">
            {severityFilters.map((f) => {
              const active = filters.severity.has(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => toggleSeverity(f.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active ? `${f.color} ring-2 ring-offset-1` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Time</div>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTimeRange(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filters.timeRange === f.value
                    ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-200 ring-offset-1'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-400">No updates match the current filters.</p>
          </div>
        ) : (
          filtered.map((event, i) => (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:shadow-md"
              style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.04}s both` }}
            >
              <div className="flex items-stretch">
                {/* Left accent bar */}
                <div className={`w-1 ${severityDot(event.severity)}`} />

                <div className="flex flex-1 items-start gap-3 p-4">
                  {/* Photo thumbnail */}
                  {event.photo_url && (
                    <div className="shrink-0">
                      <img src={event.photo_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${typeColor(event.type)}`}>
                        {typeLabel(event.type)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-medium text-slate-700">{event.category}</span>
                      {event.source === 'formal' && (
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                          Formal
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{event.description}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${severityDot(event.severity)}`} />
                        {severityLabel(event.severity)}
                      </span>
                      <span>· {event.location_text}</span>
                      <span>· {timeAgo(event.timestamp)}</span>
                      <span className="flex items-center gap-0.5">
                        · <Users className="h-3 w-3" /> {event.supporting_count}
                      </span>
                      <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${verificationColor(event.verification_status)}`}>
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {verificationLabel(event.verification_status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function typeColor(type: string): string {
  return {
    traffic: 'text-rose-600',
    weather: 'text-sky-600',
    water: 'text-blue-600',
    complaint: 'text-violet-600',
    noise: 'text-amber-600',
    transit: 'text-teal-600',
    community: 'text-indigo-600',
  }[type] ?? 'text-slate-600';
}


