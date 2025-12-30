-- Make call_id nullable and remove UNIQUE constraint
ALTER TABLE call_recordings
  ALTER COLUMN call_id DROP NOT NULL;

-- Drop the UNIQUE constraint on call_id if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'call_recordings_call_id_key'
  ) THEN
    ALTER TABLE call_recordings DROP CONSTRAINT call_recordings_call_id_key;
  END IF;
END $$;

-- Ensure all other columns are nullable (they should already be, but let's make sure)
-- These are just safety checks in case they were created as NOT NULL
ALTER TABLE call_recordings
  ALTER COLUMN customer_name DROP NOT NULL,
  ALTER COLUMN customer_phone DROP NOT NULL,
  ALTER COLUMN call_duration_seconds DROP NOT NULL,
  ALTER COLUMN call_started_at DROP NOT NULL,
  ALTER COLUMN call_ended_at DROP NOT NULL,
  ALTER COLUMN audio_file_size DROP NOT NULL,
  ALTER COLUMN transcript DROP NOT NULL,
  ALTER COLUMN transcript_summary DROP NOT NULL,
  ALTER COLUMN elevenlabs_conversation_id DROP NOT NULL,
  ALTER COLUMN elevenlabs_agent_id DROP NOT NULL,
  ALTER COLUMN call_metadata DROP NOT NULL;

-- Add comment
COMMENT ON TABLE call_recordings IS 'Stores call recording metadata and links to audio files in Supabase Storage. Most fields are nullable to support partial data from webhooks.';
