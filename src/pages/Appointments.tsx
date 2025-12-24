import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useCollection } from '../hooks/useCollection';
import { Calendar, User, MapPin, Clock, Filter, Plus, CheckCircle, Archive, ArchiveRestore, Map } from 'lucide-react';
import type { Appointment } from '../types/schema';
import { supabase } from '../lib/supabase';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { AnimatedDropdownMenu } from '../components/ui/animated-dropdown-menu';
import { AppointmentMap } from '../components/AppointmentMap';
import { geocodeAddress, buildFullAddress } from '../utils/geocoding';
import '../utils/clearCoordinates'; // Makes window.clearAppointmentCoordinates available in dev mode

const Appointments = () => {
    const { data: appointments, loading, refetch } = useCollection<Appointment>('appointments');
    const [showArchived, setShowArchived] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    const activeAppointments = useMemo(() => {
        return appointments?.filter(apt => !apt.archived) || [];
    }, [appointments]);

    const archivedAppointments = useMemo(() => {
        return appointments?.filter(apt => apt.archived) || [];
    }, [appointments]);

    const displayedAppointments = showArchived ? archivedAppointments : activeAppointments;

    // Auto-geocode appointments when map is shown
    useEffect(() => {
        const geocodeAppointments = async () => {
            console.log('[Appointments] Map toggle effect triggered', { showMap, isGeocoding, appointmentsCount: activeAppointments.length });

            if (!showMap || isGeocoding) {
                console.log('[Appointments] Skipping geocoding:', { showMap, isGeocoding });
                return;
            }

            const needsGeocoding = activeAppointments.filter(apt =>
                apt.service_address &&
                (apt.latitude === null || apt.latitude === undefined) &&
                (apt.longitude === null || apt.longitude === undefined)
            );

            console.log('[Appointments] Appointments needing geocoding:', needsGeocoding.length);
            console.log('[Appointments] All appointments:', activeAppointments.map(apt => ({
                id: apt.id,
                customer: apt.customer_name,
                address: apt.service_address,
                city: apt.service_city,
                state: apt.service_state,
                zip: apt.service_zip,
                latitude: apt.latitude,
                longitude: apt.longitude,
                hasCoords: apt.latitude !== null && apt.latitude !== undefined
            })));

            if (needsGeocoding.length === 0) {
                console.log('[Appointments] No appointments need geocoding');
                return;
            }

            setIsGeocoding(true);
            console.log('[Appointments] Starting geocoding for', needsGeocoding.length, 'appointments');

            for (const apt of needsGeocoding) {
                const fullAddress = buildFullAddress(
                    apt.service_address,
                    apt.service_city,
                    apt.service_state,
                    apt.service_zip
                );

                console.log('[Appointments] Geocoding appointment:', { id: apt.id, address: fullAddress });
                const result = await geocodeAddress(fullAddress);

                if (result) {
                    console.log('[Appointments] Geocoding successful, updating database:', result);
                    const { error } = await supabase
                        .from('appointments')
                        .update({
                            latitude: result.lat,
                            longitude: result.lng,
                            geocoded_at: new Date().toISOString()
                        })
                        .eq('id', apt.id);

                    if (error) {
                        console.error('[Appointments] Database update error:', error);
                    } else {
                        console.log('[Appointments] Database updated successfully');
                    }
                } else {
                    console.warn('[Appointments] Geocoding failed for:', fullAddress);
                }
            }

            setIsGeocoding(false);
            // Refetch to get updated coordinates
            await refetch();
        };

        geocodeAppointments();
    }, [showMap, activeAppointments.length]);

    const handleToggleComplete = async (appointment: Appointment) => {
        console.log('handleToggleComplete called', appointment);
        const newStatus = appointment.status === 'completed' ? 'scheduled' : 'completed';

        const { error } = await supabase
            .from('appointments')
            .update({ status: newStatus })
            .eq('id', appointment.id);

        console.log('Update result:', { error });

        if (error) {
            console.error('Error updating appointment:', error);
        } else {
            // Manually refetch data to update UI
            console.log('Refetching appointments...');
            await refetch();
        }
    };

    const handleArchive = async (appointment: Appointment) => {
        console.log('handleArchive called', appointment);
        const { error } = await supabase
            .from('appointments')
            .update({ archived: true })
            .eq('id', appointment.id);

        console.log('Archive result:', { error });

        if (error) {
            console.error('Error archiving appointment:', error);
        } else {
            // Manually refetch data to update UI
            console.log('Refetching appointments...');
            await refetch();
        }
    };

    const handleUnarchive = async (appointment: Appointment) => {
        console.log('handleUnarchive called', appointment);
        const { error } = await supabase
            .from('appointments')
            .update({ archived: false })
            .eq('id', appointment.id);

        console.log('Unarchive result:', { error });

        if (error) {
            console.error('Error unarchiving appointment:', error);
        } else {
            // Manually refetch data to update UI
            console.log('Refetching appointments...');
            await refetch();
        }
    };

    return (
        <PageContainer>
            <PageHeader title="Appointments" description="Schedule and manage service appointments.">
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-300 hover:scale-105 ${showArchived
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                >
                    <Archive size={16} />
                    {showArchived ? 'Show Active' : 'Show Archive'}
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
                        {showArchived ? activeAppointments.length : archivedAppointments.length}
                    </span>
                </button>
                <button
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-300 hover:scale-105 ${showMap
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        }`}
                >
                    <Map size={16} />
                    {showMap ? 'Hide Map' : 'Show Map'}
                    {isGeocoding && <span className="text-xs">(Geocoding...)</span>}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all duration-300 hover:scale-105">
                    <Filter size={16} /> Filter
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all duration-300 hover:scale-105 border border-emerald-700">
                    <Plus size={16} /> New Appointment
                </button>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white mb-8">
                {[
                    { title: 'Upcoming', value: activeAppointments.filter(a => a.status === 'scheduled').length, icon: Calendar, color: '#30b357', trend: 'Next 7 days' },
                    { title: 'Pending', value: activeAppointments.filter(a => !a.status).length, icon: Clock, color: '#ff8904', trend: 'Action needed' },
                    { title: 'Completed', value: activeAppointments.filter(a => a.status === 'completed').length, icon: CheckCircle, color: '#818cf8', trend: 'This month' },
                    { title: 'Archived', value: archivedAppointments.length, icon: Archive, color: '#64748b', trend: 'All time' },
                ].map((stat, idx) => (

                    <div key={idx} className="glass-panel rounded-xl border border-white/10 overflow-hidden min-h-[100px]">
                        <div className="p-4 flex flex-col h-full justify-between gap-3">
                            <div className="flex justify-between items-start gap-3">
                                <span className="text-xs font-medium text-gray-400 leading-tight">{stat.title}</span>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/80 flex-shrink-0">
                                    <stat.icon size={16} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-2xl font-bold font-display tracking-tight text-white leading-none">{stat.value}</h3>
                                <span className="inline-flex items-center text-[10px] font-semibold text-white/50 bg-white/5 px-2 py-1 rounded-full border border-white/5 w-fit">
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Map View */}
            {showMap && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <AppointmentMap appointments={activeAppointments} />
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl border border-white/10"
            >
                <div className="overflow-x-auto overflow-y-visible p-2">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 font-semibold text-xs">Customer</th>
                                <th className="px-4 py-2 font-semibold text-xs">Service</th>
                                <th className="px-4 py-2 font-semibold text-xs">Date & Time</th>
                                <th className="px-4 py-2 font-semibold text-xs">Location</th>
                                <th className="px-4 py-2 font-semibold text-xs">Status</th>
                                <th className="px-4 py-2 font-semibold text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">Loading appointments...</td>
                                </tr>
                            ) : displayedAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        {showArchived ? 'No archived appointments.' : 'No appointments found.'}
                                    </td>
                                </tr>
                            ) : (
                                displayedAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                                                    <User size={12} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-200 text-sm leading-tight">{apt.customer_name || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{apt.customer_phone || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="text-gray-200 text-xs leading-tight">{apt.service_type || 'General Service'}</div>
                                            {apt.urgency_level && (
                                                <span className="text-[10px] text-amber-500/80 uppercase tracking-wider font-medium mt-0.5 inline-block">
                                                    {apt.urgency_level}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5 text-gray-300 text-xs leading-tight mb-0.5">
                                                <Calendar size={10} className="flex-shrink-0" />
                                                {apt.appointment_date || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px] leading-tight">
                                                <Clock size={10} className="flex-shrink-0" />
                                                {apt.appointment_time || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={10} className="flex-shrink-0" />
                                                <span className="truncate max-w-[150px] leading-tight">{apt.service_address || 'No address provided'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${apt.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <AnimatedDropdownMenu
                                                options={showArchived ? [
                                                    {
                                                        label: "Unarchive",
                                                        onClick: () => handleUnarchive(apt),
                                                        Icon: <ArchiveRestore className="h-4 w-4" />,
                                                    },
                                                ] : [
                                                    {
                                                        label: apt.status === 'completed' ? "Mark Incomplete" : "Mark Complete",
                                                        onClick: () => handleToggleComplete(apt),
                                                        Icon: <CheckCircle className="h-4 w-4" />,
                                                    },
                                                    {
                                                        label: "Archive",
                                                        onClick: () => handleArchive(apt),
                                                        Icon: <Archive className="h-4 w-4" />,
                                                    },
                                                ]}
                                            >
                                                Actions
                                            </AnimatedDropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </PageContainer>
    );
};

export default Appointments;
