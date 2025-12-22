import { motion } from 'framer-motion';
import { useCollection } from '../hooks/useCollection';
import { User, Phone, MapPin } from 'lucide-react';
import type { Emergency } from '../types/schema';

import { PageHeader, PageContainer } from '../components/layout/PageComponents';

const Emergencies = () => {
    const { data: emergencies, loading } = useCollection<Emergency>('emergencies', { orderBy: 'webhook_received_at' });

    return (
        <PageContainer>
            <PageHeader title="Emergencies" description="Critical incidents requiring immediate attention">
                <div className="bg-red-500/10 text-red-400 px-6 py-3 rounded-lg text-sm font-medium border border-red-500/20">
                    High Priority: {emergencies.filter(e => e.severity === 'high' || e.severity === 'critical').length}
                </div>
                <button className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium shadow-lg shadow-red-900/20 transition-all duration-300 hover:scale-105 border border-red-700">
                    Action Plan
                </button>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white mb-8">
                {[
                    { title: 'Active Emergencies', value: emergencies.length, icon: Phone, color: '#ef4444', trend: 'Real-time' },
                    { title: 'Critical', value: emergencies.filter(e => e.severity === 'critical').length, icon: User, color: '#ff8904', trend: 'High Priority' },
                    { title: 'Resolved', value: emergencies.filter(e => e.severity === 'resolved').length, icon: MapPin, color: '#30b357', trend: 'Today' },
                ].map((stat, idx) => (


                    <div key={idx} className="glass-panel rounded-xl border border-white/10 overflow-hidden min-h-[100px]">
                        <div className="p-4 flex flex-col h-full justify-between gap-3">
                            <div className="flex justify-between items-start gap-4">
                                <span className="text-xs font-medium text-gray-400 leading-tight">{stat.title}</span>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/80 flex-shrink-0">
                                    <stat.icon size={18} />
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
                                <th className="px-4 py-2 font-semibold text-xs">Reported By</th>
                                <th className="px-4 py-2 font-semibold text-xs">Severity</th>
                                <th className="px-4 py-2 font-semibold text-xs">Description</th>
                                <th className="px-4 py-2 font-semibold text-xs">Location</th>
                                <th className="px-4 py-2 font-semibold text-xs">Time</th>
                                <th className="px-4 py-2 font-semibold text-xs">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">Loading emergencies...</td>
                                </tr>
                            ) : emergencies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">No active emergencies.</td>
                                </tr>
                            ) : (
                                emergencies.map((emergency) => (
                                    <tr key={emergency.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-gray-200 font-medium leading-tight text-sm">
                                                    <User size={12} className="text-gray-500 flex-shrink-0" />
                                                    {emergency.customer_name || 'Anonymous'}
                                                </div>
                                                {emergency.customer_phone && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 leading-tight">
                                                        <Phone size={10} className="flex-shrink-0" />
                                                        {emergency.customer_phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${emergency.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' :
                                                emergency.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {emergency.severity || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-300 text-xs max-w-xs">
                                            <div className="line-clamp-2 leading-tight">{emergency.description || emergency.inquiry_type || 'No details provided'}</div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                                            <div className="flex items-center gap-1.5 leading-tight">
                                                <MapPin size={10} className="flex-shrink-0" />
                                                {emergency.location || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-500 text-[10px] whitespace-nowrap leading-tight">
                                            {new Date(emergency.webhook_received_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <button className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] rounded transition-colors border border-white/10">
                                                Details
                                            </button>
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

export default Emergencies;
