import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CivicEvent, EventType } from '@/lib/types';
import { severityDot, severityLabel, timeAgo } from '@/lib/uiHelpers';
import { verificationLabel, verificationColor, verificationExplanation } from '@/lib/verification';
import { CITY_CENTER } from '@/lib/simulatedData';
import { MapPin, X, Clock, Users, ShieldCheck, AlertCircle } from 'lucide-react';

interface CityMapProps {
  events: CivicEvent[];
  selectedEvent: CivicEvent | null;
  onSelectEvent: (e: CivicEvent | null) => void;
  filters: Set<EventType>;
}

const typeEmoji: Record<string, string> = {
  traffic: '🚗',
  weather: '🌧',
  water: '💧',
  complaint: '📋',
  noise: '🔊',
  transit: '🚌',
  community: '📍',
};

const typeHexColor: Record<string, string> = {
  traffic: '#e11d48',
  weather: '#0284c7',
  water: '#2563eb',
  complaint: '#7c3aed',
  noise: '#d97706',
  transit: '#0d9488',
  community: '#6366f1',
};

const typeLabelMap: Record<string, string> = {
  traffic: 'Traffic/Accident',
  weather: 'Weather',
  water: 'Water Issue',
  complaint: 'Complaint',
  noise: 'Noise',
  transit: 'Bus/Train',
  community: 'Community',
};

function createCustomIcon(event: CivicEvent, isSelected: boolean): L.DivIcon {
  const color = typeHexColor[event.type] ?? '#64748b';
  const emoji = typeEmoji[event.type] ?? '📍';
  const size = isSelected ? 44 : 36;
  const pulseClass = event.severity === 'high' || event.severity === 'critical' ? 'cp-marker-pulse' : '';

  return L.divIcon({
    className: 'cp-custom-marker',
    html: `
      <div class="cp-marker-wrap ${pulseClass}" style="--marker-color: ${color}; width: ${size}px; height: ${size}px;">
        <div class="cp-marker-pin">
          <span class="cp-marker-emoji">${emoji}</span>
        </div>
        <div class="cp-marker-shadow"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

function MapController({
  selectedEvent,
  events,
}: {
  selectedEvent: CivicEvent | null;
  events: CivicEvent[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedEvent) {
      map.flyTo([selectedEvent.latitude, selectedEvent.longitude], 14, {
        duration: 0.8,
      });
    }
  }, [selectedEvent, map]);

  return null;
}

export function CityMap({ events, selectedEvent, onSelectEvent, filters }: CityMapProps) {
  const filtered = events.filter((e) => filters.size === 0 || filters.has(e.type as EventType));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live City Map</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
              Demo / Simulated Civic Data
            </span>
            Click a marker to see details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Leaflet Map */}
        <div className="relative col-span-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={[CITY_CENTER.lat, CITY_CENTER.lng]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
              style={{ background: '#e5e7eb' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController selectedEvent={selectedEvent} events={filtered} />

              {filtered.map((event) => (
                <Marker
                  key={event.id}
                  position={[event.latitude, event.longitude]}
                  icon={createCustomIcon(event, selectedEvent?.id === event.id)}
                  eventHandlers={{
                    click: () => onSelectEvent(event),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                        {typeEmoji[event.type]} {event.category}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {event.location_text}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {timeAgo(event.timestamp)} · {severityLabel(event.severity)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map legend overlay */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Marker Types
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(typeHexColor).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {typeLabelMap[type]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {selectedEvent ? (
            <EventDetailPanel event={selectedEvent} onClose={() => onSelectEvent(null)} />
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-slate-500">Select a marker</p>
              <p className="mt-1 text-xs text-slate-400">
                Click any marker on the map to see full details about that civic event.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EventDetailPanel({ event, onClose }: { event: CivicEvent; onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${typeHexColor[event.type]}15` }}
          >
            <span className="text-sm">{typeEmoji[event.type] ?? '📍'}</span>
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{event.category}</h3>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="h-3 w-3" /> {event.location_text}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <p className="text-sm leading-relaxed text-slate-600">{event.description}</p>

        {event.photo_url && (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <img src={event.photo_url} alt="Report" className="h-40 w-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={Clock} label="Time" value={timeAgo(event.timestamp)} />
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
            <span className={`h-2.5 w-2.5 rounded-full ${severityDot(event.severity)}`} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Severity</p>
              <p className="text-xs font-semibold text-slate-700">{severityLabel(event.severity)}</p>
            </div>
          </div>
          <InfoItem
            icon={Users}
            label="Supporting Reports"
            value={String(event.supporting_count)}
          />
          <InfoItem
            icon={AlertCircle}
            label="Source"
            value={
              event.source === 'formal'
                ? 'Formal Complaint'
                : event.source === 'community'
                  ? 'Community'
                  : 'Simulated'
            }
          />
        </div>

        {/* Verification status */}
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-semibold text-slate-700">AI Verification</span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${verificationColor(event.verification_status)}`}
            >
              {verificationLabel(event.verification_status)}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            {verificationExplanation(event.verification_status, event.supporting_count)}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
