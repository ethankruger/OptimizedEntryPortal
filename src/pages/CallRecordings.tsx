import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useCollection } from '../hooks/useCollection';
import { Mic, Phone, Calendar, Filter } from 'lucide-react';
import type { CallRecording } from '../types/schema';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { CallRecordingPlayer } from '../components/CallRecordingPlayer';

const CallRecordings = () => {
    const { data: recordings, loading } = useCollection<CallRecording>('call_recordings');
    const [filterType, setFilterType] = useState<'all' | 'appointment' | 'inquiry'>('all');

    const filteredRecordings = useMemo(() => {
        if (!recordings) return [];

        if (filterType === 'appointment') {
            return recordings.filter(r => r.appointment_id);
        } else if (filterType === 'inquiry') {
            return recordings.filter(r => r.inquiry_id);
        }

        return recordings;
    }, [recordings, filterType]);

    const stats = [
        {
            title: 'Total Recordings',
            value: recordings?.length || 0,
            icon: Mic,
            gradient: 'from-indigo-500 to-purple-600',
            iconBg: 'bg-indigo-500/20',
            iconBorder: 'border-indigo-500/30',
            trend: 'All time'
        },
        {
            title: 'Linked to Appointments',
            value: recordings?.filter(r => r.appointment_id).length || 0,
            icon: Calendar,
            gradient: 'from-emerald-500 to-green-600',
            iconBg: 'bg-emerald-500/20',
            iconBorder: 'border-emerald-500/30',
            trend: 'With appointments'
        },
        {
            title: 'Linked to Inquiries',
            value: recordings?.filter(r => r.inquiry_id).length || 0,
            icon: Phone,
            gradient: 'from-orange-500 to-amber-600',
            iconBg: 'bg-orange-500/20',
            iconBorder: 'border-orange-500/30',
            trend: 'With inquiries'
        },
        {
            title: 'Unlinked',
            value: recordings?.filter(r => !r.appointment_id && !r.inquiry_id).length || 0,
            icon: Filter,
            gradient: 'from-slate-500 to-gray-600',
            iconBg: 'bg-slate-500/20',
            iconBorder: 'border-slate-500/30',
            trend: 'No association'
        },
    ];

    return (
        <PageContainer>
            <PageHeader title="Call Recordings" description="Listen to and manage AI call recordings.">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filterType === 'all'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-[var(--text-primary)] shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 dark:bg-white/5 bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-[var(--text-primary)] hover:border-indigo-500/30'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('appointment')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filterType === 'appointment'
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-[var(--text-primary)] shadow-lg shadow-emerald-500/30'
                                : 'bg-white/5 dark:bg-white/5 bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-[var(--text-primary)] hover:border-emerald-500/30'
                        }`}
                    >
                        Appointments
                    </button>
                    <button
                        onClick={() => setFilterType('inquiry')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            filterType === 'inquiry'
                                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-[var(--text-primary)] shadow-lg shadow-orange-500/30'
                                : 'bg-white/5 dark:bg-white/5 bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-[var(--text-primary)] hover:border-orange-500/30'
                        }`}
                    >
                        Inquiries
                    </button>
                </div>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[120px] relative">
                            <div className="p-5 flex flex-col h-full justify-between gap-4">
                                <div className="flex justify-between items-start gap-3">
                                    <span className="text-xs font-semibold text-[var(--text-muted)] leading-tight uppercase tracking-wider">{stat.title}</span>
                                    <div className={`p-2.5 rounded-lg ${stat.iconBg} border ${stat.iconBorder} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className={`text-3xl font-bold font-display tracking-tight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent leading-none`}>
                                        {stat.value}
                                    </h3>
                                    <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1.5 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                {loading ? (
                    <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 p-8 text-center">
                        <p className="text-[var(--text-secondary)]">Loading call recordings...</p>
                    </div>
                ) : filteredRecordings.length === 0 ? (
                    <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 p-8 text-center">
                        <svg className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="text-[var(--text-secondary)] font-medium">No call recordings found</p>
                        <p className="text-sm text-[var(--text-muted)] mt-2">
                            {filterType !== 'all'
                                ? `No recordings linked to ${filterType}s`
                                : 'Recordings will appear here once calls are completed'}
                        </p>
                    </div>
                ) : (
                    filteredRecordings.map((recording) => (
                        <CallRecordingPlayer key={recording.id} recording={recording} />
                    ))
                )}
            </motion.div>
        </PageContainer>
    );
};

export default CallRecordings;
