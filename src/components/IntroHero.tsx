import { Car, CloudRain, Droplets, Megaphone, Activity } from 'lucide-react';

const problems = [
  { icon: Car, label: 'Traffic & Accidents', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: CloudRain, label: 'Weather & Air Quality', color: 'text-sky-600', bg: 'bg-sky-50' },
  { icon: Droplets, label: 'Water Issues', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Megaphone, label: 'Public Complaints', color: 'text-violet-600', bg: 'bg-violet-50' },
];

export function IntroHero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-violet-50/60 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
              <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">CityPulse</span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            A live civic health dashboard that brings traffic, weather, water and public complaints
            into one place — so you always know what's happening around you.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {problems.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md ${p.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${p.color}`} strokeWidth={2} />
                  </span>
                  <span className="text-xs font-medium text-slate-700">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
