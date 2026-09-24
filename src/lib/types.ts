export type EventType =
  | 'traffic'
  | 'weather'
  | 'water'
  | 'complaint'
  | 'noise'
  | 'transit'
  | 'community';

export type EventSource = 'formal' | 'community' | 'simulated';

export type Severity = 'low' | 'moderate' | 'high' | 'critical';

export type VerificationStatus =
  | 'corroborated'
  | 'likely_credible'
  | 'needs_verification'
  | 'conflicting_reports'
  | 'potentially_misleading';

export interface CivicEvent {
  id: string;
  source: EventSource;
  type: EventType;
  category: string;
  description: string;
  location_text: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: Severity;
  photo_url: string | null;
  verification_status: VerificationStatus;
  supporting_count: number;
}

export interface AreaHealth {
  traffic: string;
  airQuality: string;
  weather: string;
  waterIssues: number;
  publicComplaints: number;
  communityUpdates: number;
}

export interface Correlation {
  title: string;
  description: string;
  eventIds: string[];
}

export interface FilterState {
  types: Set<EventType>;
  severity: Set<Severity>;
  timeRange: 'all' | '1h' | '6h' | '24h';
}
