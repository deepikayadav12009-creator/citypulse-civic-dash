import { useState } from 'react';
import { Locate, Search, MapPin } from 'lucide-react';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onUseLocation: () => void;
  locationStatus: string | null;
}

export function HeroSearch({ searchQuery, setSearchQuery, onUseLocation, locationStatus }: HeroSearchProps) {
  const [focused, setFocused] = useState(false);

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            What's happening around you?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Real-time civic health dashboard for your city. Search an area to see traffic, weather, water issues and more.
          </p>

          <div className={`mt-6 flex flex-col gap-2 sm:flex-row sm:items-center`}>
            <div
              className={`relative flex flex-1 items-center rounded-xl border bg-white transition-all duration-200 ${
                focused
                  ? 'border-violet-400 ring-2 ring-violet-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Search className="ml-3.5 h-4.5 w-4.5 shrink-0 text-slate-400" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search an area, road or neighbourhood..."
                className="w-full bg-transparent px-3 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              onClick={onUseLocation}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-violet-700 active:scale-[0.98]"
            >
              <Locate className="h-4 w-4" strokeWidth={2.5} />
              Use my location
            </button>
          </div>

          {locationStatus && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-violet-500" />
              {locationStatus}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
