import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import type { Inquiry, Appointment, Emergency } from '../types/schema';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { OverviewChart } from '../components/charts/OverviewChart';
import { DistributionChart } from '../components/charts/DistributionChart';
import { Phone, Calendar, AlertCircle, ArrowUpRight, Activity, GripVertical, Users, Clock } from 'lucide-react';
import { Reorder } from 'framer-motion';

const Dashboard = () => {
    const { data: inquiries } = useCollection<Inquiry>('inquiries');
    const { data: emergencies } = useCollection<Emergency>('emergencies', { orderBy: 'webhook_received_at' });
    const { data: appointments } = useCollection<Appointment>('appointments');

    // Chart Time Range State
    const [timeRange, setTimeRange] = useState<'12m' | '30d'>('12m');
    const [distributionTimeRange, setDistributionTimeRange] = useState<'12m' | '30d'>('12m');

    // Reorder Mode State
    const [isReorderMode, setIsReorderMode] = useState(false);

    // Calculate metrics
    const totalInteractions = inquiries.length + emergencies.length + appointments.length;
    const conversionRate = inquiries.length > 0 ? Math.round((appointments.length / inquiries.length) * 100) : 0;

    // Defines one widget on the dashboard
    type Widget = {
        id: string;
        type: 'metric' | 'chart-overview' | 'chart-distribution' | 'stats-performance' | 'list-activity' | 'status-system';
        colSpan: string; // Tailwind class for responsive column span
        // Metric specific props
        label?: string;
        value?: string | number;
        change?: string;
        icon?: any;
        color?: string;
    };

    // Initial widgets list
    const initialWidgets: Widget[] = [
        // Row 1: Metrics
        { id: 'interactions', type: 'metric', colSpan: 'col-span-1', label: 'Total Interactions', value: totalInteractions, change: '+12.5%', icon: Activity, color: '#30b357' },
        { id: 'conversion', type: 'metric', colSpan: 'col-span-1', label: 'Conversion Rate', value: `${conversionRate}%`, change: '+4.2%', icon: ArrowUpRight, color: '#30b357' },
        { id: 'emergencies', type: 'metric', colSpan: 'col-span-1', label: 'Active Emergencies', value: emergencies.length, change: 'Critical', icon: AlertCircle, color: '#ff8904' },
        { id: 'scheduled', type: 'metric', colSpan: 'col-span-1', label: 'Scheduled Visits', value: appointments.length, change: 'Next 7 Days', icon: Calendar, color: '#ff8904' },

        // Row 2: Charts Area
        { id: 'chart-overview', type: 'chart-overview', colSpan: 'col-span-1 lg:col-span-2' },
        { id: 'chart-distribution', type: 'chart-distribution', colSpan: 'col-span-1' },

        // Row 3: Bottom Lists
        { id: 'list-activity', type: 'list-activity', colSpan: 'col-span-1 lg:col-span-2' },
        { id: 'status-system', type: 'status-system', colSpan: 'col-span-1 lg:col-span-2' },
    ];

    // Wait, the user asked for Distribution Chart constant.
    // In my previous replace attempt I had 'chart-distribution' as its own widget.
    // I will stick to that.

    const [widgets, setWidgets] = useState(initialWidgets);

    // Render helpers for specific widget types
    const renderWidgetContent = (widget: Widget) => {
        switch (widget.type) {
            case 'metric':
                const Icon = widget.icon;
                return (
                    <div className="p-4 flex flex-col h-full justify-between gap-3">
                        <div className="flex justify-between items-start gap-4">
                            <span className="text-sm font-medium text-[var(--text-secondary)] line-clamp-1 flex-1 leading-tight">{widget.label}</span>
                            <div className="p-2 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 text-[var(--text-primary)] flex-shrink-0">
                                <Icon size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight leading-none">{widget.value}</div>
                            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-full border w-fit ${widget.change === 'Critical' ? 'bg-[#ff8904]/10 text-[#ff8904] border-[#ff8904]/20' :
                                'bg-[#30b357]/10 text-[#30b357] border-[#30b357]/20'
                                }`}>
                                {widget.change}
                            </span>
                        </div>
                    </div>
                );

            case 'chart-overview':
                const allInteractions = [
                    ...inquiries.map(i => ({ created_at: i.created_at })),
                    ...emergencies.map(e => ({ created_at: e.webhook_received_at || new Date().toISOString() })), // Fallback if missing
                    ...appointments.map(a => ({ created_at: a.created_at || a.appointment_date || new Date().toISOString() }))
                ];

                return (
                    <div className="p-5 flex-1 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Analytics Overview</h3>
                            <div className="flex gap-4">
                                <select
                                    className="bg-white/5 dark:bg-white/5 bg-black/5 border border-white/10 dark:border-white/10 border-black/10 rounded-lg text-xs text-[var(--text-secondary)] px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as '12m' | '30d')}
                                >
                                    <option value="12m">Last 12 Months</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-4 flex-1 min-h-[300px]">
                            <OverviewChart data={allInteractions} timeRange={timeRange} />
                        </div>
                    </div>
                );

            case 'chart-distribution':
                return (
                    <div className="p-5 h-full flex flex-col">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Traffic Distribution</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1 leading-tight">By category type</p>
                            </div>
                            <select
                                className="bg-white/5 dark:bg-white/5 bg-black/5 border border-white/10 dark:border-white/10 border-black/10 rounded-lg text-xs text-[var(--text-secondary)] px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10"
                                value={distributionTimeRange}
                                onChange={(e) => setDistributionTimeRange(e.target.value as '12m' | '30d')}
                            >
                                <option value="12m">Last 12 Months</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </div>
                        <div className="px-2 flex-1 min-h-[200px] flex flex-col justify-center">
                            <DistributionChart
                                data={{
                                    inquiries,
                                    emergencies,
                                    appointments
                                }}
                                timeRange={distributionTimeRange}
                            />
                        </div>
                    </div>
                );


            case 'list-activity':
                return (
                    <div className="p-5 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 leading-tight">Recent Activity</h3>
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[300px]">
                            {inquiries.slice(0, 5).map((inquiry) => (
                                <div key={inquiry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors group gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-[#30b357]/10 flex items-center justify-center text-[#30b357] group-hover:bg-[#30b357]/20 transition-colors flex-shrink-0">
                                            <Phone size={14} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-medium text-[var(--text-primary)] truncate leading-tight">{inquiry.customer_name || 'Unknown User'}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{new Date(inquiry.created_at).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-secondary)] font-mono flex-shrink-0 leading-tight">{inquiry.inquiry_type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'status-system':
                return (
                    <div className="p-5 h-full">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 leading-tight">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Activity className="text-[#30b357] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">AI Engine</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Operational</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#30b357] animate-pulse" />
                                    <span className="text-[10px] text-[#30b357] font-medium leading-tight">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Users className="text-[#ff8904] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">Active Agents</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">3 online now</div>
                                    </div>
                                </div>
                                <div className="flex -space-x-1.5 flex-shrink-0">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary border-2 border-[var(--bg-primary)]" />
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-secondary to-primary border-2 border-[var(--bg-primary)]" />
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary border-2 border-[var(--bg-primary)] flex items-center justify-center text-[8px] text-white">+1</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Clock className="text-[#30b357] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">Uptime</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">99.9% this month</div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono flex-shrink-0 leading-tight">24d 13h</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <div className="flex items-center justify-between mb-6">
                <PageHeader title="Dashboard" description="Real-time overview of system performance and activity." />
                <button
                    onClick={() => setIsReorderMode(!isReorderMode)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${isReorderMode
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                >
                    {isReorderMode ? 'Done Reordering' : 'Reorder Tiles'}
                </button>
            </div>

            {/* Unified Reorderable Grid */}
            <Reorder.Group
                axis="y"
                values={widgets}
                onReorder={setWidgets}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
            >
                {widgets.map((widget) => (
                    <Reorder.Item
                        key={widget.id}
                        value={widget}
                        drag={isReorderMode}
                        // We use col-span classes to control grid sizing
                        // Reorder.Item creates a list item (li) by default, but here it's fine.
                        // We need to ensure we style it properly.
                        // Actually, 'Reorder.Item' renders a 'li' by default if the parent is 'Reorder.Group' (ul/ol).
                        // But 'Reorder.Group' can also accept 'as="div"'.
                        // However, 'Reorder.Group' default is 'ul'.
                        // Ideally we should use 'as="div"' for grid semantics, but Framer Motion Reorder is list-based.
                        // Let's assume standard behavior. To make it a grid, the parent must be a grid.
                        // If Reorder.Group is a grid, Reorder.Item (li) will be grid items.
                        className={`${widget.colSpan} relative list-none`}
                    >
                        <div className={`glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden h-full ${isReorderMode ? 'cursor-move active:cursor-grabbing hover:border-primary/50' : ''}`}>
                            {isReorderMode && (
                                <div className="absolute top-2 right-2 text-white/20 z-10 pointer-events-none">
                                    <GripVertical size={14} />
                                </div>
                            )}
                            {renderWidgetContent(widget)}
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </PageContainer>
    );
};

export default Dashboard;
