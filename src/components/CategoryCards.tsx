import { Car, CloudRain, Droplets, Megaphone, ChevronRight } from 'lucide-react';
import type { CivicEvent } from '@/lib/types';

interface CategoryCardsProps {
  events: CivicEvent[];
  onCategoryClick: (type: string) => void;
}

const mainCategories = [
  {
    type: 'traffic',
    label: 'Traffic & Road Accidents',
    icon: Car,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    ring: 'ring-rose-100',
    subcategories: ['Traffic congestion', 'Road accidents', 'Road blockage', 'Road conditions'],
  },
  {
    type: 'weather',
    label: 'Weather & Air Quality',
    icon: CloudRain,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    ring: 'ring-sky-100',
    subcategories: ['Current weather', 'Rain alerts', 'Temperature', 'AQI & Pollution'],
  },
  {
    type: 'water',
    label: 'Water Issues',
    icon: Droplets,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
    subcategories: ['Waterlogging', 'Flooded roads', 'Water supply', 'Leakage reports'],
  },
  {
    type: 'complaint',
    label: 'Public Complaints',
    icon: Megaphone,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
    subcategories: ['Civic complaints', 'Garbage', 'Streetlights', 'Damaged roads'],
  },
];

export function CategoryCards({ events, onCategoryClick }: CategoryCardsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Key Civic Categories
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mainCategories.map((cat) => {
          const Icon = cat.icon;
          const count = events.filter((e) => e.type === cat.type).length;
          const recent = events.filter(
            (e) => e.type === cat.type && Date.now() - new Date(e.timestamp).getTime() < 60 * 60_000,
          ).length;

          return (
            <button
              key={cat.type}
              onClick={() => onCategoryClick(cat.type)}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${cat.bg} ring-1 ${cat.ring}`}>
                  <Icon className={`h-5.5 w-5.5 ${cat.color}`} strokeWidth={2} />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {count} active
                </span>
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900">{cat.label}</h3>
              <ul className="mt-2.5 space-y-1">
                {cat.subcategories.map((sub) => (
                  <li key={sub} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    {sub}
                  </li>
                ))}
              </ul>
              {recent > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                  </span>
                  {recent} in the last hour
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors group-hover:text-violet-600">
                View details
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary Civic Updates */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Other Civic Updates
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SecondaryCard
            label="Noise Complaints"
            count={events.filter((e) => e.type === 'noise').length}
            color="text-amber-600"
            bg="bg-amber-50"
            dotClass="bg-amber-400"
            onClick={() => onCategoryClick('noise')}
          />
          <SecondaryCard
            label="Bus Delays"
            count={events.filter((e) => e.type === 'transit' && e.category.toLowerCase().includes('bus')).length}
            color="text-teal-600"
            bg="bg-teal-50"
            dotClass="bg-teal-400"
            onClick={() => onCategoryClick('transit')}
          />
          <SecondaryCard
            label="Train Delays"
            count={events.filter((e) => e.type === 'transit' && e.category.toLowerCase().includes('train')).length}
            color="text-teal-600"
            bg="bg-teal-50"
            dotClass="bg-teal-400"
            onClick={() => onCategoryClick('transit')}
          />
        </div>
      </div>
    </section>
  );
}

function SecondaryCard({
  label,
  count,
  color,
  bg,
  dotClass,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  dotClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-slate-300 hover:shadow-sm"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <div className="flex-1">
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{count} active</p>
      </div>
    </button>
  );
}
