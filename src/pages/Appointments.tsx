import { motion } from 'framer-motion';
import { useCollection } from '../hooks/useCollection';
import { Calendar, User, MapPin, Clock, Filter, Plus } from 'lucide-react';
import type { Appointment } from '../types/schema';

import { PageHeader, PageContainer } from '../components/layout/PageComponents';

const Appointments = () => {
    const { data: appointments, loading } = useCollection<Appointment>('appointments');

    return (
        <PageContainer>
            <PageHeader title="Appointments" description="Schedule and manage service appointments.">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 bg-black/5 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-white text-sm font-medium transition-all duration-300 hover:scale-105">
                    <Filter size={16} /> Filter
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all duration-300 hover:scale-105 border border-emerald-700">
                    <Plus size={16} /> New Appointment
                </button>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white mb-8">
                {[
                    { title: 'Upcoming', value: appointments.filter(a => a.status === 'scheduled').length, icon: Calendar, color: '#30b357', trend: 'Next 7 days' },
                    { title: 'Pending', value: appointments.filter(a => !a.status).length, icon: Clock, color: '#ff8904', trend: 'Action needed' },
                    { title: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: MapPin, color: '#818cf8', trend: 'This month' },
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

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10"
            >
                <div className="overflow-x-auto p-2">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 font-semibold text-xs">Customer</th>
                                <th className="px-4 py-2 font-semibold text-xs">Service</th>
                                <th className="px-4 py-2 font-semibold text-xs">Date & Time</th>
                                <th className="px-4 py-2 font-semibold text-xs">Location</th>
                                <th className="px-4 py-2 font-semibold text-xs">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-500">Loading appointments...</td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-500">No appointments found.</td>
                                </tr>
                            ) : (
                                appointments.map((apt) => (
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
