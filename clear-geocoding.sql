-- Clear existing geocoded coordinates to force re-geocoding with Google Maps
UPDATE appointments
SET
    latitude = NULL,
    longitude = NULL,
    geocoded_at = NULL
WHERE geocoded_at IS NOT NULL;
