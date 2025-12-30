import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useCollection } from '../hooks/useCollection';
import { Clock, User, Phone as PhoneIcon, CheckCircle, AlertTriangle, Filter, Archive, ArchiveRestore } from 'lucide-react';
import type { Inquiry } from '../types/schema';
import { supabase } from '../lib/supabase';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { AnimatedDropdownMenu } from '../components/ui/animated-dropdown-menu';

const Calls = () => {
    const { data: inquiries, loading, refetch } = useCollection<Inquiry>('inquiries');
    const [showArchived, setShowArchived] = useState(false);

    const activeInquiries = useMemo(() => {
        return inquiries?.filter(i => i.status !== 'archived') || [];
    }, [inquiries]);

    const archivedInquiries = useMemo(() => {
        return inquiries?.filter(i => i.status === 'archived') || [];
    }, [inquiries]);

    const displayedInquiries = showArchived ? archivedInquiries : activeInquiries;

    const handleToggleStatus = async (inquiry: Inquiry) => {
        const newStatus = inquiry.status === 'processed' ? 'new' : 'processed';

        const { error } = await supabase
            .from('inquiries')
            .update({ status: newStatus })
            .eq('id', inquiry.id);

        if (error) {
            console.error('Error updating inquiry:', error);
        } else {
            await refetch();
        }
    };

    const handleArchive = async (inquiry: Inquiry) => {
        const { error } = await supabase
            .from('inquiries')
            .update({ status: 'archived' })
            .eq('id', inquiry.id);

        if (error) {
            console.error('Error archiving inquiry:', error);
        } else {
            await refetch();
        }
    };

    const handleUnarchive = async (inquiry: Inquiry) => {
        const { error } = await supabase
            .from('inquiries')
            .update({ status: 'new' })
            .eq('id', inquiry.id);

        if (error) {
            console.error('Error unarchiving inquiry:', error);
        } else {
            await refetch();
        }
    };

    const stats = [
        { title: 'Total Inquiries', value: activeInquiries.length, icon: PhoneIcon, color: '#ff8904', trend: 'Active' },
        { title: 'Action Required', value: activeInquiries.filter(i => i.status === 'action_required').length, icon: AlertTriangle, color: '#ea580c', trend: 'Needs attention' },
        { title: 'Processed', value: activeInquiries.filter(i => i.status === 'processed').length, icon: CheckCircle, color: '#30b357', trend: 'Completed' },
        { title: 'Archived', value: archivedInquiries.length, icon: Archive, color: '#64748b', trend: 'All time' },
    ];

    return (
        <PageContainer>
            <PageHeader title="Inquiries Log" description="Manage and track all AI-processed incoming calls.">
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg border text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        showArchived
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-white/5 dark:bg-white/5 bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 border-white/10 dark:border-white/10 border-black/10 text-[var(--text-primary)]'
                    }`}
                >
                    <Archive size={16} />
                    {showArchived ? 'Show Active' : 'Show Archive'}
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 dark:bg-white/10 bg-black/10 text-xs">
                        {showArchived ? activeInquiries.length : archivedInquiries.length}
                    </span>
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10 border border-white/10 dark:border-white/10 border-black/10 text-[var(--text-primary)] text-sm font-medium transition-all duration-300 hover:scale-105">
                    <Filter size={16} /> Filter
                </button>
                <button className="px-6 py-3 rounded-lg shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-[var(--color-primary-foreground)] text-sm font-medium transition-all duration-300 hover:scale-105 border border-primary">
                    Export CSV
                </button>
            </PageHeader>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden min-h-[100px]">
                        <div className="p-4 flex flex-col h-full justify-between gap-3">
                            <div className="flex justify-between items-start gap-3">
                                <span className="text-xs font-medium text-[var(--text-muted)] leading-tight">{stat.title}</span>
                                <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-secondary)] flex-shrink-0">
                                    <stat.icon size={18} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold font-display tracking-tight text-[var(--text-primary)] leading-none">{stat.value}</h3>
                                <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
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
                className="glass-panel rounded-2xl border border-white/10 dark:border-white/10 border-black/10"
            >
                <div className="overflow-x-auto overflow-y-visible p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 dark:border-white/10 border-black/10 bg-black/20 dark:bg-black/20 bg-white/20 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                                <th className="px-4 py-2 font-semibold">Customer</th>
                                <th className="px-4 py-2 font-semibold">Contact Info</th>
                                <th className="px-4 py-2 font-semibold">Received</th>
                                <th className="px-4 py-2 font-semibold">Intent</th>
                                <th className="px-4 py-2 font-semibold">Status</th>
                                <th className="px-4 py-2 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 dark:divide-white/5 divide-black/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)] italic">Accessing database...</td>
                                </tr>
                            ) : displayedInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-[var(--text-muted)]">
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="p-5 rounded-full bg-white/5 dark:bg-white/5 bg-black/5"><PhoneIcon size={24} /></div>
                                            <p>{showArchived ? 'No archived inquiries.' : 'No inquiries found.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedInquiries.map((call) => (
                                    <tr key={call.id} className="group hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors cursor-default">
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 dark:border-white/10 border-black/10 flex items-center justify-center text-primary font-bold text-[10px] ring-2 ring-transparent group-hover:ring-primary/20 transition-all flex-shrink-0">
                                                    {call.customer_name?.charAt(0) || <User size={12} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-[var(--text-primary)] group-hover:text-primary transition-colors leading-tight text-sm">{call.customer_name || 'Unknown Caller'}</div>
                                                    {call.priority === 'high' && <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 ml-2 inline-block">HIGH PRIORITY</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-[10px] leading-tight">
                                                    <PhoneIcon size={10} className="opacity-50 flex-shrink-0" /> {call.customer_phone || '—'}
                                                </div>
                                                <div className="text-[var(--text-muted)] text-[10px] leading-tight">
                                                    {call.customer_email || 'No email provided'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={11} className="opacity-50 flex-shrink-0" />
                                                <span className="tabular-nums leading-tight text-[10px]">{new Date(call.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-[var(--text-primary)] leading-tight text-xs">{call.inquiry_type || 'General Inquiry'}</span>
                                                <span className="text-[10px] text-[var(--text-muted)] line-clamp-1 leading-tight">{call.description || 'No transcripts available..'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
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
                                        <td className="px-4 py-2.5 text-right">
                                            <AnimatedDropdownMenu
                                                options={showArchived ? [
                                                    {
                                                        label: "Unarchive",
                                                        onClick: () => handleUnarchive(call),
                                                        Icon: <ArchiveRestore className="h-4 w-4" />,
                                                    },
                                                ] : [
                                                    {
                                                        label: call.status === 'processed' ? "Mark Unprocessed" : "Mark Processed",
                                                        onClick: () => handleToggleStatus(call),
                                                        Icon: <CheckCircle className="h-4 w-4" />,
                                                    },
                                                    {
                                                        label: "Archive",
                                                        onClick: () => handleArchive(call),
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

export default Calls;
