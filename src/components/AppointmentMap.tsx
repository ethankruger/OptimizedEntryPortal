import React, { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import type { Appointment } from '../types/schema';

interface AppointmentMapProps {
  appointments: Appointment[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Get marker color based on appointment status
const getMarkerColor = (appointment: Appointment): string => {
  if (appointment.status === 'completed') {
    return '#10b981'; // Green
  } else if (appointment.urgency_level === 'emergency' || appointment.urgency_level === 'urgent') {
    return '#ef4444'; // Red
  } else if (appointment.status === 'scheduled') {
    return '#3b82f6'; // Blue
  } else {
    return '#f59e0b'; // Amber
  }
};

export const AppointmentMap: React.FC<AppointmentMapProps> = ({ appointments }) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [visibleFilters, setVisibleFilters] = React.useState({
    scheduled: true,
    completed: true,
    emergency: true,
    pending: true
  });

  // Toggle filter visibility
  const toggleFilter = (filterType: keyof typeof visibleFilters) => {
    setVisibleFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Handle ESC key to close InfoWindow
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedAppointment) {
        setSelectedAppointment(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedAppointment]);

  // Filter appointments that have coordinates
  const mappableAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // First check if it has coordinates
      if (apt.latitude === null || apt.latitude === undefined ||
        apt.longitude === null || apt.longitude === undefined) {
        return false;
      }

      // Then check if it matches the active filters
      if (apt.status === 'completed' && !visibleFilters.completed) return false;
      if (apt.status === 'scheduled' && !visibleFilters.scheduled) return false;
      if ((apt.urgency_level === 'emergency' || apt.urgency_level === 'urgent') && !visibleFilters.emergency) return false;
      if (apt.status !== 'completed' && apt.status !== 'scheduled' &&
        apt.urgency_level !== 'emergency' && apt.urgency_level !== 'urgent' && !visibleFilters.pending) return false;

      return true;
    });
  }, [appointments, visibleFilters]);

  // Calculate map center and zoom based on appointments
  const { center, zoom } = useMemo(() => {
    if (mappableAppointments.length === 0) {
      // Default to Wisconsin if no appointments
      return { center: { lat: 44.5, lng: -89.5 }, zoom: 7 };
    }

    if (mappableAppointments.length === 1) {
      return {
        center: {
          lat: mappableAppointments[0].latitude!,
          lng: mappableAppointments[0].longitude!
        },
        zoom: 14
      };
    }

    // Calculate bounds for multiple appointments
    const lats = mappableAppointments.map(apt => apt.latitude!);
    const lngs = mappableAppointments.map(apt => apt.longitude!);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom based on the span of coordinates
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Determine zoom level based on coordinate span
    // Smaller span = higher zoom (more zoomed in)
    let calculatedZoom = 12;
    if (maxSpan < 0.01) calculatedZoom = 15;      // Very close together
    else if (maxSpan < 0.05) calculatedZoom = 13; // Close together
    else if (maxSpan < 0.1) calculatedZoom = 12;  // Moderate spread
    else if (maxSpan < 0.5) calculatedZoom = 10;  // Wide spread
    else if (maxSpan < 1) calculatedZoom = 9;     // Very wide spread
    else calculatedZoom = 8;                       // Extremely wide spread

    return {
      center: { lat: centerLat, lng: centerLng },
      zoom: calculatedZoom
    };
  }, [mappableAppointments]);

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-white">
        <p className="text-red-400 font-medium">Google Maps API key not configured</p>
        <p className="text-sm text-gray-400 mt-2">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    );
  }

  if (mappableAppointments.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-white">
        <p className="text-gray-400 font-medium">No appointments with locations to display</p>
        <p className="text-sm text-gray-500 mt-2">Appointments will appear on the map once they have addresses</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden relative" style={{ height: '500px' }}>
      {/* Interactive Filter Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-lg border border-white/10 p-4 shadow-lg">
        <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Filter Pins</h4>
        <div className="space-y-2.5">
          <button
            onClick={() => toggleFilter('scheduled')}
            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${visibleFilters.scheduled
                ? 'bg-blue-500/20 hover:bg-blue-500/30'
                : 'bg-gray-500/10 hover:bg-gray-500/20 opacity-50'
              }`}
          >
            <div className={`w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm transition-opacity ${visibleFilters.scheduled ? 'opacity-100' : 'opacity-40'
              }`}></div>
            <span className="text-sm text-gray-300 flex-1 text-left">Scheduled</span>
            <span className="text-xs text-gray-400">{visibleFilters.scheduled ? '✓' : '✕'}</span>
          </button>
          <button
            onClick={() => toggleFilter('completed')}
            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${visibleFilters.completed
                ? 'bg-green-500/20 hover:bg-green-500/30'
                : 'bg-gray-500/10 hover:bg-gray-500/20 opacity-50'
              }`}
          >
            <div className={`w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm transition-opacity ${visibleFilters.completed ? 'opacity-100' : 'opacity-40'
              }`}></div>
            <span className="text-sm text-gray-300 flex-1 text-left">Completed</span>
            <span className="text-xs text-gray-400">{visibleFilters.completed ? '✓' : '✕'}</span>
          </button>
          <button
            onClick={() => toggleFilter('emergency')}
            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${visibleFilters.emergency
                ? 'bg-red-500/20 hover:bg-red-500/30'
                : 'bg-gray-500/10 hover:bg-gray-500/20 opacity-50'
              }`}
          >
            <div className={`w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm transition-opacity ${visibleFilters.emergency ? 'opacity-100' : 'opacity-40'
              }`}></div>
            <span className="text-sm text-gray-300 flex-1 text-left">Emergency</span>
            <span className="text-xs text-gray-400">{visibleFilters.emergency ? '✓' : '✕'}</span>
          </button>
          <button
            onClick={() => toggleFilter('pending')}
            className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all ${visibleFilters.pending
                ? 'bg-amber-500/20 hover:bg-amber-500/30'
                : 'bg-gray-500/10 hover:bg-gray-500/20 opacity-50'
              }`}
          >
            <div className={`w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm transition-opacity ${visibleFilters.pending ? 'opacity-100' : 'opacity-40'
              }`}></div>
            <span className="text-sm text-gray-300 flex-1 text-left">Pending</span>
            <span className="text-xs text-gray-400">{visibleFilters.pending ? '✓' : '✕'}</span>
          </button>
        </div>
      </div>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId="bf51a910020fa25a"
          defaultCenter={center}
          defaultZoom={zoom}
          defaultMapTypeId="terrain"
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
          zoomControl={true}
          streetViewControl={true}
          fullscreenControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          {mappableAppointments.map((apt) => (
            <AdvancedMarker
              key={apt.id}
              position={{ lat: apt.latitude!, lng: apt.longitude! }}
              onClick={() => setSelectedAppointment(apt)}
            >
              <Pin
                background={getMarkerColor(apt)}
                borderColor="#ffffff"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          ))}

          {selectedAppointment && (
            <InfoWindow
              position={{
                lat: selectedAppointment.latitude!,
                lng: selectedAppointment.longitude!
              }}
              onCloseClick={() => setSelectedAppointment(null)}
            >
              <div className="p-4 min-w-[280px] bg-gradient-to-br from-white to-gray-50">
                {/* Header with close button */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {selectedAppointment.customer_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedAppointment.service_type || 'General Service'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    title="Close (ESC)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Details section */}
                <div className="space-y-2.5 mb-3">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-blue-50">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-gray-900 mt-0.5">{selectedAppointment.service_address}</p>
                      {selectedAppointment.service_city && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedAppointment.service_city}, {selectedAppointment.service_state} {selectedAppointment.service_zip}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  {selectedAppointment.appointment_date && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-purple-50">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scheduled</p>
                        <p className="text-sm text-gray-900 mt-0.5">
                          {selectedAppointment.appointment_date}
                          {selectedAppointment.appointment_time && ` at ${selectedAppointment.appointment_time}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {selectedAppointment.customer_phone && (
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-green-50">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
                        <p className="text-sm text-gray-900 mt-0.5">{selectedAppointment.customer_phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with status and hint */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                    selectedAppointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                    {selectedAppointment.status === 'completed' ? '✓ Completed' :
                      selectedAppointment.status === 'scheduled' ? '📅 Scheduled' :
                        '⏳ Pending'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">Press ESC</span>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};
