import { useState } from 'react';
import type { CivicEvent, Severity } from '@/lib/types';
import { CITY_CENTER } from '@/lib/simulatedData';
import { computeVerificationStatus } from '@/lib/verification';
import { X, Camera, MapPin, Check, ChevronRight, AlertCircle } from 'lucide-react';

interface ReportProblemProps {
  events: CivicEvent[];
  onSubmit: (event: CivicEvent) => void;
  onClose: () => void;
}

const complaintCategories = [
  { value: 'Road Damage', icon: '🛣' },
  { value: 'Water Issue', icon: '💧' },
  { value: 'Garbage', icon: '🗑' },
  { value: 'Streetlight', icon: '💡' },
  { value: 'Traffic Issue', icon: '🚗' },
  { value: 'Pollution', icon: '🏭' },
  { value: 'Other', icon: '📋' },
];

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700 ring-slate-200' },
  { value: 'moderate', label: 'Moderate', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700 ring-orange-200' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-50 text-rose-700 ring-rose-200' },
];

const typeMap: Record<string, string> = {
  'Road Damage': 'complaint',
  'Water Issue': 'water',
  'Garbage': 'complaint',
  'Streetlight': 'complaint',
  'Traffic Issue': 'traffic',
  'Pollution': 'complaint',
  'Other': 'complaint',
};

export function ReportProblem({ events, onSubmit, onClose }: ReportProblemProps) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
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
      source: 'formal' as const,
      type: (typeMap[category] ?? 'complaint') as CivicEvent['type'],
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

  const canProceed = step === 0 ? !!category : step === 1 ? true : step === 2 ? !!locationText : step === 3 ? !!description : true;

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Complaint submitted successfully</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your formal civic complaint for "{category}" has been recorded. You can track its status on the dashboard.
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
          <h2 className="text-lg font-bold text-slate-900">Report a Problem</h2>
          <p className="text-xs text-slate-400">Formal civic complaint — Step {step + 1} of 5</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? 'bg-violet-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Step 0: Category */}
        {step === 0 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Select complaint type</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {complaintCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                    category === cat.value
                      ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{cat.value}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Photo */}
        {step === 1 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Take or upload a photo</label>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Uploaded" className="h-48 w-full rounded-lg object-cover" />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition-colors hover:border-violet-400 hover:bg-violet-50/50">
                <Camera className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-sm text-slate-500">Click to upload or take a photo</span>
                <span className="mt-0.5 text-xs text-slate-400">Optional but helps verification</span>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Confirm location</label>
            <div className="space-y-3">
              <button
                onClick={useMyLocation}
                disabled={usingLocation}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" />
                {usingLocation ? 'Detecting location...' : 'Use my current location'}
              </button>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Or type an address / landmark"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>
        )}

        {/* Step 3: Description */}
        {step === 3 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Short description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the problem..."
              maxLength={200}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{description.length}/200</p>
          </div>
        )}

        {/* Step 4: Severity */}
        {step === 4 && (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Select severity</label>
            <div className="grid grid-cols-2 gap-2.5">
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSeverity(opt.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium ring-1 transition-all ${
                    severity === opt.value
                      ? `${opt.color} border-transparent ring-2`
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Summary preview */}
            <div className="mt-5 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">Review</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-medium">Type:</span> {category}</p>
                <p><span className="font-medium">Location:</span> {locationText || 'Not set'}</p>
                <p><span className="font-medium">Description:</span> {description || 'None'}</p>
                <p><span className="font-medium">Severity:</span> {severity}</p>
                <p><span className="font-medium">Photo:</span> {photo ? 'Attached' : 'None'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed}
              className="flex items-center gap-1 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
            >
              <AlertCircle className="h-4 w-4" />
              Submit Complaint
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        This is a formal complaint to the civic system. For quick community updates, use Community Updates instead.
      </p>
    </div>
  );
}
