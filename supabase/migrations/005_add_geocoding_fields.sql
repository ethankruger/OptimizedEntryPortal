-- Add geocoding fields to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster geographic queries
CREATE INDEX IF NOT EXISTS idx_appointments_coordinates ON appointments(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN appointments.latitude IS 'Geocoded latitude for mapping service address';
COMMENT ON COLUMN appointments.longitude IS 'Geocoded longitude for mapping service address';
COMMENT ON COLUMN appointments.geocoded_at IS 'Timestamp when address was last geocoded';
