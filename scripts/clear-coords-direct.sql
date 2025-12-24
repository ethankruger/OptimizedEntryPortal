-- Clear existing geocoded coordinates to test Google Maps API
UPDATE appointments 
SET 
  latitude = NULL,
  longitude = NULL,
  geocoded_at = NULL
WHERE latitude IS NOT NULL;
