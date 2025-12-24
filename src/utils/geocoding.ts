interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  formatted_address?: string;
}

// Cache to prevent repeated API calls for same addresses
const geocodeCache = new Map<string, GeocodingResult>();

// Get Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (!address || address.trim() === '') {
    return null;
  }

  // Check cache first
  if (geocodeCache.has(address)) {
    console.log(`[Geocoding] Cache hit for: ${address}`);
    return geocodeCache.get(address)!;
  }

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('[Geocoding] Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
    return null;
  }

  try {
    console.log(`[Geocoding] Fetching coordinates for: ${address}`);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      new URLSearchParams({
        address: address,
        key: GOOGLE_MAPS_API_KEY,
      })
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result: GeocodingResult = {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng,
        display_name: data.results[0].formatted_address,
        formatted_address: data.results[0].formatted_address,
      };

      console.log(`[Geocoding] Success:`, result);
      console.log(`[Geocoding] Location type: ${data.results[0].geometry.location_type}`);

      // Cache the result
      geocodeCache.set(address, result);
      return result;
    } else if (data.status === 'ZERO_RESULTS') {
      console.log(`[Geocoding] No results found for: ${address}`);
      return null;
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('[Geocoding] API quota exceeded. Please check your Google Cloud billing.');
      return null;
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('[Geocoding] API request denied. Please check your API key restrictions.');
      return null;
    } else {
      console.error('[Geocoding] Unexpected status:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return null;
  }
};

// Batch geocode with rate limiting
export const batchGeocodeAddresses = async (
  addresses: string[]
): Promise<Map<string, GeocodingResult>> => {
  const results = new Map<string, GeocodingResult>();
  const uniqueAddresses = [...new Set(addresses.filter(a => a && a.trim() !== ''))];

  console.log(`[Geocoding] Batch geocoding ${uniqueAddresses.length} addresses...`);

  for (const address of uniqueAddresses) {
    const result = await geocodeAddress(address);
    if (result) {
      results.set(address, result);
    }
  }

  console.log(`[Geocoding] Batch complete. Geocoded ${results.size}/${uniqueAddresses.length} addresses`);
  return results;
};

// Helper to build full address string optimized for geocoding
export const buildFullAddress = (
  street?: string,
  city?: string,
  state?: string,
  zip?: string
): string => {
  // Build structured address for better geocoding accuracy
  const parts: string[] = [];

  if (street) parts.push(street.trim());
  if (city) parts.push(city.trim());

  // Combine state and zip for better precision
  if (state && zip) {
    parts.push(`${state.trim()} ${zip.trim()}`);
  } else if (state) {
    parts.push(state.trim());
  } else if (zip) {
    parts.push(zip.trim());
  }

  // Always add USA for international geocoding services
  const address = parts.join(', ');
  return address ? `${address}, USA` : '';
};
