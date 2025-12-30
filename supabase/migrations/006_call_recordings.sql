-- Create call_recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link to related entities (all nullable)
  call_id TEXT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,

  -- Call metadata (all nullable)
  customer_name TEXT,
  customer_phone TEXT,
  call_duration_seconds INTEGER,
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,

  -- Recording details
  audio_url TEXT NOT NULL,
  audio_file_size BIGINT,
  audio_format TEXT DEFAULT 'mp3',

  -- Transcription data (all nullable)
  transcript TEXT,
  transcript_summary TEXT,

  -- ElevenLabs specific data (all nullable)
  elevenlabs_conversation_id TEXT,
  elevenlabs_agent_id TEXT,
  call_metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_call_recordings_user_id ON call_recordings(user_id);
CREATE INDEX idx_call_recordings_call_id ON call_recordings(call_id);
CREATE INDEX idx_call_recordings_appointment_id ON call_recordings(appointment_id);
CREATE INDEX idx_call_recordings_inquiry_id ON call_recordings(inquiry_id);
CREATE INDEX idx_call_recordings_created_at ON call_recordings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own call recordings
CREATE POLICY "Users can read own call recordings"
ON call_recordings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own call recordings
CREATE POLICY "Users can insert own call recordings"
ON call_recordings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own call recordings
CREATE POLICY "Users can update own call recordings"
ON call_recordings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own call recordings
CREATE POLICY "Users can delete own call recordings"
ON call_recordings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Service role has full access (for n8n webhook)
CREATE POLICY "Service role has full access to call recordings"
ON call_recordings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create storage bucket for call recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-recordings',
  'call-recordings',
  false,
  104857600, -- 100MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for call-recordings bucket
-- Users can read their own recordings
CREATE POLICY "Users can read own recording files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'call-recordings' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role can insert recordings (for n8n)
CREATE POLICY "Service role can insert recording files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'call-recordings');

-- Service role can update recordings
CREATE POLICY "Service role can update recording files"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'call-recordings')
WITH CHECK (bucket_id = 'call-recordings');

-- Users can delete their own recordings
CREATE POLICY "Users can delete own recording files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'call-recordings' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable realtime for call_recordings
ALTER PUBLICATION supabase_realtime ADD TABLE call_recordings;

-- Add helpful comment
COMMENT ON TABLE call_recordings IS 'Stores call recording metadata and links to audio files in Supabase Storage';
