import type { CivicEvent, VerificationStatus } from './types';

export function computeVerificationStatus(
  events: CivicEvent[],
  newEvent: Omit<CivicEvent, 'verification_status' | 'supporting_count' | 'id' | 'timestamp'>,
): { status: VerificationStatus; supportingCount: number } {
  const TIME_WINDOW_MIN = 30;
  const DISTANCE_KM = 1.5;

  const nearby = events.filter((e) => {
    if (e.type !== newEvent.type) return false;
    const dist = haversineKm(e.latitude, e.longitude, newEvent.latitude, newEvent.longitude);
    const timeDiffMin = (Date.now() - new Date(e.timestamp).getTime()) / 60_000;
    return dist <= DISTANCE_KM && timeDiffMin <= TIME_WINDOW_MIN;
  });

  const supportingCount = nearby.length + 1;

  const conflicting = nearby.some(
    (e) => e.category !== newEvent.category && e.verification_status !== 'needs_verification',
  );

  if (conflicting) return { status: 'conflicting_reports', supportingCount };
  if (supportingCount >= 3) return { status: 'corroborated', supportingCount };
  if (supportingCount === 2) return { status: 'likely_credible', supportingCount };
  if (newEvent.photo_url) return { status: 'likely_credible', supportingCount };
  return { status: 'needs_verification', supportingCount };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function verificationLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    corroborated: 'Corroborated',
    likely_credible: 'Likely Credible',
    needs_verification: 'Needs Verification',
    conflicting_reports: 'Conflicting Reports',
    potentially_misleading: 'Potentially Misleading',
  };
  return labels[status];
}

export function verificationColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    corroborated: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    likely_credible: 'bg-sky-50 text-sky-700 ring-sky-200',
    needs_verification: 'bg-amber-50 text-amber-700 ring-amber-200',
    conflicting_reports: 'bg-orange-50 text-orange-700 ring-orange-200',
    potentially_misleading: 'bg-rose-50 text-rose-700 ring-rose-200',
  };
  return colors[status];
}

export function verificationExplanation(status: VerificationStatus, count: number): string {
  switch (status) {
    case 'corroborated':
      return `${count} independent reports from this area were submitted within a short time window.`;
    case 'likely_credible':
      return count > 1
        ? `${count} reports from this area appear consistent. Photo evidence may be available.`
        : 'Report includes photo evidence or matches a nearby pattern.';
    case 'needs_verification':
      return 'Only one report so far. Awaiting additional reports or photo evidence for verification.';
    case 'conflicting_reports':
      return 'Multiple reports from this area describe different situations. Details may not be consistent.';
    case 'potentially_misleading':
      return 'Report pattern does not match other nearby reports. Content may be inaccurate.';
  }
}
