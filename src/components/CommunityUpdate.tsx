import { useState } from 'react';
import type { CivicEvent, Severity } from '@/lib/types';
import { CITY_CENTER } from '@/lib/simulatedData';
import { computeVerificationStatus } from '@/lib/verification';
import { X, Camera, MapPin, Check, Send } from 'lucide-react';

interface CommunityUpdateProps {
  events: CivicEvent[];
  onSubmit: (event: CivicEvent) => void;
  onClose: () => void;
}

const updateCategories = [
  { value: 'Accident', icon: '🚑', type: 'traffic' },
  { value: 'Heavy Traffic', icon: '🚗', type: 'traffic' },
  { value: 'Fire/Smoke', icon: '🔥', type: 'community' },
  { value: 'Road Blocked', icon: '🚧', type: 'traffic' },
  { value: 'Waterlogging', icon: '💧', type: 'water' },
  { value: 'Public Safety', icon: '⚠️', type: 'community' },
  { value: 'Large Crowd', icon: '👥', type: 'community' },
  { value: 'Other Event', icon: '📍', type: 'community' },
];

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700 ring-slate-200' },
  { value: 'moderate', label: 'Moderate', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700 ring-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-50 text-rose-700 ring-rose-200' },
];

export function CommunityUpdate({ events, onSubmit, onClose }: CommunityUpdateProps) {
  const [category, setCategory] = useState('');
  const [eventType, setEventType] = useState('community');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [locationText, setLocationText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [usingLocation, setUsingLocation] = useState(false);
  const [coords, setCoords] = useState({ lat: CITY_CENTER.lat, lng: CITY_CENTER.lng });

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function useMyLocation() {
    setUsingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationText(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setUsingLocation(false);
        },
        () => {
          setLocationText('Central District');
          setUsingLocation(false);
        },
      );
    } else {
      setLocationText('Central District');
      setUsingLocation(false);
    }
  }

  function handleSubmit() {
    const baseEvent = {
      source: 'community' as const,
      type: eventType as CivicEvent['type'],
      category,
      description: description || 'No description provided',
      location_text: locationText || 'Central District',
      latitude: coords.lat,
      longitude: coords.lng,
      severity,
      photo_url: photo,
      timestamp: new Date().toISOString(),
    };

    const { status, supportingCount } = computeVerificationStatus(events, baseEvent);

    const newEvent: CivicEvent = {
      ...baseEvent,
      id: crypto.randomUUID(),
      verification_status: status,
      supporting_count: supportingCount,
    };

    onSubmit(newEvent);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Update posted successfully</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your community update about "{category}" is now visible to other residents on the live feed and map.
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Post Community Update</h2>
          <p className="text-xs text-slate-400">Quickly share what's happening right now</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Photo */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Photo or video</label>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Uploaded" className="h-40 w-full rounded-lg object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition-colors hover:border-violet-400 hover:bg-violet-50/50">
              <Camera className="h-7 w-7 text-slate-400" />
              <span className="mt-2 text-sm text-slate-500">Upload photo or video</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">What's happening?</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {updateCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setEventType(cat.type);
                }}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all ${
                  category === cat.value
                    ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[11px] font-medium text-slate-700">{cat.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
          <div className="space-y-2">
            <button
              onClick={useMyLocation}
              disabled={usingLocation}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              {usingLocation ? 'Detecting...' : 'Use my location'}
            </button>
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Or type a location"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Short description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's happening right now?"
            maxLength={150}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Severity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Severity</label>
          <div className="flex flex-wrap gap-2">
            {severityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSeverity(opt.value)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ring-1 transition-all ${
                  severity === opt.value
                    ? `${opt.color} border-transparent ring-2`
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!category}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 active:scale-[0.99] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Post Update
        </button>
      </div>

      <div className="mt-4 rounded-lg bg-violet-50 p-3">
        <p className="text-center text-xs text-violet-600">
          Community Updates inform other people about what's happening right now. This is not a formal complaint.
        </p>
      </div>
    </div>
  );
}
