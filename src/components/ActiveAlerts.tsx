import type { CivicEvent } from '@/lib/types';
import { AlertTriangle, CloudRain, Droplets, Car, X } from 'lucide-react';

interface ActiveAlertsProps {
  events: CivicEvent[];
  onDismiss: (id: string) => void;
}

export function ActiveAlerts({ events, onDismiss }: ActiveAlertsProps) {
  const recent = events.filter((e) => {
    const diffMin = (Date.now() - new Date(e.timestamp).getTime()) / 60_000;
    return diffMin <= 60 && (e.severity === 'high' || e.severity === 'critical');
  });

  if (recent.length === 0) return null;

  const alerts = recent.slice(0, 4);

  function getAlertIcon(event: CivicEvent) {
    if (event.type === 'traffic') return { Icon: Car, color: 'text-rose-600', bg: 'bg-rose-50' };
    if (event.type === 'weather') return { Icon: CloudRain, color: 'text-sky-600', bg: 'bg-sky-50' };
    if (event.type === 'water') return { Icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' };
    return { Icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' };
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        <h2 className="text-sm font-bold text-slate-900">Active Alerts</h2>
        <span className="text-xs text-slate-400">{alerts.length} active</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {alerts.map((alert) => {
          const { Icon, color, bg } = getAlertIcon(alert);
          return (
            <div
              key={alert.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4.5 w-4.5 ${color}`} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">{alert.category}</p>
                <p className="truncate text-xs text-slate-500">{alert.location_text}</p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="shrink-0 rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
