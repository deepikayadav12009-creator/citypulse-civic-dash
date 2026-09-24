/*
# Create civic_events table for CityPulse

1. New Tables
- `civic_events` — stores both formal civic complaints and informal community updates
  - id (uuid, primary key)
  - source (text: 'formal' for Report a Problem, 'community' for Community Updates)
  - type (text: 'traffic' | 'weather' | 'water' | 'complaint' | 'noise' | 'transit')
  - category (text: specific subcategory e.g. 'Road Damage', 'Garbage', 'Heavy Traffic')
  - description (text: short user-provided description)
  - location_text (text: human-readable location)
  - latitude (double precision)
  - longitude (double precision)
  - severity (text: 'low' | 'moderate' | 'high' | 'critical')
  - photo_url (text, nullable: uploaded photo URL)
  - verification_status (text: 'corroborated' | 'likely_credible' | 'needs_verification' | 'conflicting_reports' | 'potentially_misleading')
  - supporting_count (integer, default 1: number of users who corroborated)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS on civic_events.
- This is a public/no-auth civic platform: all data is intentionally shared and visible to everyone.
- Allow anon + authenticated full CRUD with USING (true) / WITH CHECK (true).

3. Indexes
- Index on created_at for time-based queries (live feed).
- Index on type for category filtering.
- Index on source for separating formal complaints from community updates.
*/

CREATE TABLE IF NOT EXISTS civic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'community',
  type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  location_text text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  severity text NOT NULL DEFAULT 'moderate',
  photo_url text,
  verification_status text NOT NULL DEFAULT 'needs_verification',
  supporting_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE civic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_civic_events" ON civic_events;
CREATE POLICY "anon_select_civic_events" ON civic_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_civic_events" ON civic_events;
CREATE POLICY "anon_insert_civic_events" ON civic_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_civic_events" ON civic_events;
CREATE POLICY "anon_update_civic_events" ON civic_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_civic_events" ON civic_events;
CREATE POLICY "anon_delete_civic_events" ON civic_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_civic_events_created_at ON civic_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_civic_events_type ON civic_events (type);
CREATE INDEX IF NOT EXISTS idx_civic_events_source ON civic_events (source);
