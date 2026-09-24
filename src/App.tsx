import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { IntroHero } from '@/components/IntroHero';
import { HeroSearch } from '@/components/HeroSearch';
import { CategoryCards } from '@/components/CategoryCards';
import { CityMap } from '@/components/CityMap';
import { AreaHealthSummary } from '@/components/AreaHealthSummary';
import { LiveFeed } from '@/components/LiveFeed';
import { ActiveAlerts } from '@/components/ActiveAlerts';
import { ReportProblem } from '@/components/ReportProblem';
import { CommunityUpdate } from '@/components/CommunityUpdate';
import { SIMULATED_EVENTS } from '@/lib/simulatedData';
import { detectCorrelations } from '@/lib/correlation';
import { supabase } from '@/lib/supabase';
import type { CivicEvent, EventType, FilterState } from '@/lib/types';
import { Megaphone, MessageSquarePlus, ArrowRight } from 'lucide-react';

type View = 'dashboard' | 'map' | 'report' | 'community';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [events, setEvents] = useState<CivicEvent[]>(SIMULATED_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CivicEvent | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    types: new Set(),
    severity: new Set(),
    timeRange: 'all',
  });

  // Load user-submitted events from Supabase
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('civic_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const userEvents: CivicEvent[] = data.map((row) => ({
          id: row.id,
          source: row.source,
          type: row.type,
          category: row.category,
          description: row.description,
          location_text: row.location_text,
          latitude: row.latitude,
          longitude: row.longitude,
          timestamp: row.created_at,
          severity: row.severity,
          photo_url: row.photo_url,
          verification_status: row.verification_status,
          supporting_count: row.supporting_count,
        }));
        setEvents([...userEvents, ...SIMULATED_EVENTS]);
      }
    })();
  }, []);

  const correlations = detectCorrelations(events);

  const handleNavigate = useCallback((v: string) => {
    setView(v as View);
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleUseLocation = useCallback(() => {
    setLocationStatus('Detecting your location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus(`Location set: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setTimeout(() => setLocationStatus(null), 4000);
        },
        () => {
          setLocationStatus('Using default city center');
          setTimeout(() => setLocationStatus(null), 3000);
        },
      );
    } else {
      setLocationStatus('Geolocation not available. Using default city center.');
      setTimeout(() => setLocationStatus(null), 3000);
    }
  }, []);

  const handleCategoryClick = useCallback((type: string) => {
    const newTypes = new Set<EventType>();
    newTypes.add(type as EventType);
    setFilters({ types: newTypes, severity: new Set(), timeRange: 'all' });
    setView('dashboard');
    setTimeout(() => {
      const feed = document.getElementById('live-feed');
      feed?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleReportSubmit = useCallback(async (event: CivicEvent) => {
    setEvents((prev) => [event, ...prev]);

    // Persist to Supabase
    await supabase.from('civic_events').insert({
      id: event.id,
      source: event.source,
      type: event.type,
      category: event.category,
      description: event.description,
      location_text: event.location_text,
      latitude: event.latitude,
      longitude: event.longitude,
      severity: event.severity,
      photo_url: event.photo_url,
      verification_status: event.verification_status,
      supporting_count: event.supporting_count,
    });
  }, []);

  const handleCommunitySubmit = useCallback(async (event: CivicEvent) => {
    setEvents((prev) => [event, ...prev]);

    await supabase.from('civic_events').insert({
      id: event.id,
      source: event.source,
      type: event.type,
      category: event.category,
      description: event.description,
      location_text: event.location_text,
      latitude: event.latitude,
      longitude: event.longitude,
      severity: event.severity,
      photo_url: event.photo_url,
      verification_status: event.verification_status,
      supporting_count: event.supporting_count,
    });
  }, []);

  const handleDismissAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(id));
  }, []);

  const visibleEvents = events.filter((e) => !dismissedAlerts.has(e.id));

  // Report a Problem view
  if (view === 'report') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeView={view} onNavigate={handleNavigate} />
        <ReportProblem
          events={events}
          onSubmit={handleReportSubmit}
          onClose={() => handleNavigate('dashboard')}
        />
      </div>
    );
  }

  // Community Update view
  if (view === 'community') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeView={view} onNavigate={handleNavigate} />
        <CommunityUpdate
          events={events}
          onSubmit={handleCommunitySubmit}
          onClose={() => handleNavigate('dashboard')}
        />
      </div>
    );
  }

  // Map view
  if (view === 'map') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeView={view} onNavigate={handleNavigate} />
        <CityMap
          events={visibleEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          filters={filters.types}
        />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeView={view} onNavigate={handleNavigate} />
      <IntroHero />
      <HeroSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onUseLocation={handleUseLocation}
        locationStatus={locationStatus}
      />
      <ActiveAlerts events={visibleEvents} onDismiss={handleDismissAlert} />
      <CategoryCards events={visibleEvents} onCategoryClick={handleCategoryClick} />
      <AreaHealthSummary
        events={visibleEvents}
        searchQuery={searchQuery}
        correlations={correlations}
      />
      <CityMap
        events={visibleEvents}
        selectedEvent={selectedEvent}
        onSelectEvent={setSelectedEvent}
        filters={filters.types}
      />

      {/* Quick action section */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => handleNavigate('report')}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50">
              <Megaphone className="h-6 w-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Report a Problem</h3>
              <p className="text-xs text-slate-500">Formal complaint to the civic system</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-violet-500" />
          </button>
          <button
            onClick={() => handleNavigate('community')}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
              <MessageSquarePlus className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900">Post Community Update</h3>
              <p className="text-xs text-slate-500">Inform others about what's happening now</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-500" />
          </button>
        </div>
      </section>

      <div id="live-feed">
        <LiveFeed
          events={visibleEvents}
          filters={filters}
          setFilters={setFilters}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400">
            CityPulse — Know what's happening around you. Data shown is demo/simulated for illustration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
