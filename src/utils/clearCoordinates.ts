import { supabase } from '../lib/supabase';

/**
 * Utility to clear geocoded coordinates from appointments
 * This allows re-geocoding with Google Maps API
 */
export const clearAppointmentCoordinates = async () => {
    console.log('[Clear Coordinates] Clearing all appointment coordinates...');

    const { data, error } = await supabase
        .from('appointments')
        .update({
            latitude: null,
            longitude: null,
            geocoded_at: null
        })
        .not('latitude', 'is', null);

    if (error) {
        console.error('[Clear Coordinates] Error:', error);
        return { success: false, error };
    }

    const count = Array.isArray(data) ? data.length : 0;
    console.log('[Clear Coordinates] Successfully cleared coordinates for', count, 'appointments');
    return { success: true, count };
};

// Make it available globally in dev mode for easy testing
if (import.meta.env.DEV) {
    (window as any).clearAppointmentCoordinates = clearAppointmentCoordinates;
}
