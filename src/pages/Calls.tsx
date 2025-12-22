import { motion } from 'framer-motion';
import { useCollection } from '../hooks/useCollection';
import { Clock, User, Phone as PhoneIcon, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import type { Inquiry } from '../types/schema';

import { PageHeader, PageContainer } from '../components/layout/PageComponents';

const Calls = () => {
    const { data: inquiries, loading } = useCollection<Inquiry>('inquiries');

    const stats = [
        { title: 'Total Inquiries', value: inquiries.length, icon: PhoneIcon, color: '#818cf8', trend: 'All time' },
        { title: 'Action Required', value: inquiries.filter(i => i.status === 'action_required').length, icon: AlertTriangle, color: '#ff8904', trend: 'Needs attention' },
        { title: 'Processed', value: inquiries.filter(i => i.status === 'processed').length, icon: CheckCircle, color: '#30b357', trend: 'Completed' },
    ];

    return (
        <PageContainer>
            <PageHeader title="Inquiries Log" description="Manage and track all AI-processed incoming calls.">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 bg-black/5 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-white text-sm font-medium transition-all duration-300 hover:scale-105">
                    <Filter size={16} /> Filter
                </button>
                <button className="px-6 py-3 rounded-lg shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-sm font-medium transition-all duration-300 hover:scale-105 border border-primary">
                    Export CSV
                </button>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-panel rounded-xl border border-white/10 overflow-hidden min-h-[100px]">
                        <div className="p-4 flex flex-col h-full justify-between gap-3">
                            <div className="flex justify-between items-start gap-3">
                                <span className="text-xs font-medium text-gray-400 leading-tight">{stat.title}</span>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/80 flex-shrink-0">
                                    <stat.icon size={18} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold font-display tracking-tight text-white leading-none">{stat.value}</h3>
                                <span className="inline-flex items-center text-[10px] font-semibold text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/5 w-fit">
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10"
            >
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/20 text-[10px] uppercase tracking-wider text-gray-400">
                                <th className="px-4 py-2 font-semibold">Customer</th>
                                <th className="px-4 py-2 font-semibold">Contact Info</th>
                                <th className="px-4 py-2 font-semibold">Received</th>
                                <th className="px-4 py-2 font-semibold">Intent</th>
                                <th className="px-4 py-2 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 italic">Accessing database...</td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="p-5 rounded-full bg-white/5"><PhoneIcon size={24} /></div>
                                            <p>No inquiries found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((call) => (
                                    <tr key={call.id} className="group hover:bg-white/5 transition-colors cursor-default">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-300 font-bold text-[10px] ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all flex-shrink-0">
                                                    {call.customer_name?.charAt(0) || <User size={12} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-white group-hover:text-indigo-300 transition-colors leading-tight text-sm">{call.customer_name || 'Unknown Caller'}</div>
                                                    {call.priority === 'high' && <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 ml-2 inline-block">HIGH PRIORITY</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[10px] leading-tight">
                                                    <PhoneIcon size={10} className="opacity-50 flex-shrink-0" /> {call.customer_phone || '—'}
                                                </div>
                                                <div className="text-gray-500 text-[10px] leading-tight">
                                                    {call.customer_email || 'No email provided'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={11} className="opacity-50 flex-shrink-0" />
                                                <span className="tabular-nums leading-tight text-[10px]">{new Date(call.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-gray-200 leading-tight text-xs">{call.inquiry_type || 'General Inquiry'}</span>
                                                <span className="text-[10px] text-gray-500 line-clamp-1 leading-tight">{call.description || 'No transcripts available..'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium border ${call.status === 'new' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                call.status === 'action_required' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    call.status === 'processed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {call.status === 'processed' && <CheckCircle size={9} />}
                                                {call.status === 'action_required' && <AlertTriangle size={9} />}
                                                <span className="capitalize">{call.status.replace('_', ' ')}</span>
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

export default Calls;
