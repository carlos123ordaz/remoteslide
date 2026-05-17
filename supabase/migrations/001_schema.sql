-- RemoteSlides schema
-- Run this in your Supabase SQL editor

-- Sessions: one per presentation (guest or authenticated)
CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room_code     TEXT UNIQUE NOT NULL,
  file_name     TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  file_type     TEXT NOT NULL DEFAULT 'pdf',
  slide_count   INTEGER DEFAULT 0,
  current_slide INTEGER DEFAULT 0,
  is_blackout   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_all" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert_all" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update_all" ON public.sessions FOR UPDATE USING (true);

-- Presentations: persisted history for authenticated users
CREATE TABLE IF NOT EXISTS public.presentations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT,
  file_name   TEXT,
  file_path   TEXT,
  file_type   TEXT DEFAULT 'pdf',
  slide_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presentations_own" ON public.presentations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime on sessions for live state sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;

-- Storage bucket (run separately in Storage settings or via CLI):
-- Create a public bucket called "presentations"
-- Or run: INSERT INTO storage.buckets (id, name, public) VALUES ('presentations', 'presentations', true);
