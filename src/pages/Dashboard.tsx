import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import type { Inquiry, Appointment, Emergency, CallRecording } from '../types/schema';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { OverviewChart } from '../components/charts/OverviewChart';
import { DistributionChart } from '../components/charts/DistributionChart';
import { Phone, Calendar, AlertCircle, ArrowUpRight, Activity, Users, Clock, Mic } from 'lucide-react';

const Dashboard = () => {
    const { data: inquiries, loading: loadingInquiries } = useCollection<Inquiry>('inquiries');
    const { data: emergencies, loading: loadingEmergencies } = useCollection<Emergency>('emergencies', { orderBy: 'webhook_received_at' });
    const { data: appointments, loading: loadingAppointments } = useCollection<Appointment>('appointments');
    const { data: recordings, loading: loadingRecordings } = useCollection<CallRecording>('call_recordings');

    // Chart Time Range State
    const [timeRange, setTimeRange] = useState<'12m' | '30d'>('12m');
    const [chartDataType, setChartDataType] = useState<'all' | 'inquiries' | 'appointments' | 'emergencies'>('all');
    const [distributionTimeRange, setDistributionTimeRange] = useState<'12m' | '30d'>('12m');

    // Calculate metrics (ensure data arrays exist)
    const totalInteractions = (inquiries?.length || 0) + (emergencies?.length || 0) + (appointments?.length || 0);
    const conversionRate = (inquiries?.length || 0) > 0 ? Math.round(((appointments?.length || 0) / (inquiries?.length || 0)) * 100) : 0;

    // Count calls linked to inquiries and emergencies
    const inquiryCalls = recordings?.filter(r => r.inquiry_id)?.length || 0;
    const emergencyCalls = recordings?.filter(r => {
        // Emergency calls are those not linked to inquiry or appointment
        // OR we can check if they match emergency records by phone/name
        return !r.inquiry_id && !r.appointment_id;
    })?.length || 0;

    console.log('Dashboard Data:', {
        inquiries: inquiries?.length,
        emergencies: emergencies?.length,
        appointments: appointments?.length,
        recordings: recordings?.length,
        inquiryCalls,
        emergencyCalls,
        totalInteractions,
        conversionRate
    });

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
        gradient?: string;
        iconBg?: string;
        iconBorder?: string;
    };

    // Initial widgets list - recalculate on each render with current data
    const widgets: Widget[] = [
        // Row 1: Metrics
        {
            id: 'interactions',
            type: 'metric',
            colSpan: 'col-span-1',
            label: 'Total Interactions',
            value: totalInteractions,
            change: `All time`,
            icon: Activity,
            gradient: 'from-emerald-500 to-green-600',
            iconBg: 'bg-emerald-500/20',
            iconBorder: 'border-emerald-500/30'
        },
        {
            id: 'conversion',
            type: 'metric',
            colSpan: 'col-span-1',
            label: 'Conversion Rate',
            value: `${conversionRate}%`,
            change: `${appointments?.length || 0}/${inquiries?.length || 0} converted`,
            icon: ArrowUpRight,
            gradient: 'from-purple-500 to-pink-600',
            iconBg: 'bg-purple-500/20',
            iconBorder: 'border-purple-500/30'
        },
        {
            id: 'inquiry-calls',
            type: 'metric',
            colSpan: 'col-span-1',
            label: 'Inquiry Calls',
            value: inquiryCalls,
            change: `${inquiries?.length || 0} total inquiries`,
            icon: Phone,
            gradient: 'from-blue-500 to-cyan-600',
            iconBg: 'bg-blue-500/20',
            iconBorder: 'border-blue-500/30'
        },
        {
            id: 'total-emergencies',
            type: 'metric',
            colSpan: 'col-span-1',
            label: 'Total Emergencies',
            value: emergencies?.length || 0,
            change: `All time`,
            icon: AlertCircle,
            gradient: 'from-orange-500 to-red-600',
            iconBg: 'bg-orange-500/20',
            iconBorder: 'border-orange-500/30'
        },

        // Row 2: Charts Area
        { id: 'chart-overview', type: 'chart-overview', colSpan: 'col-span-1 lg:col-span-2' },
        { id: 'chart-distribution', type: 'chart-distribution', colSpan: 'col-span-1' },

        // Row 3: Bottom Lists
        { id: 'list-activity', type: 'list-activity', colSpan: 'col-span-1 lg:col-span-2' },
        { id: 'status-system', type: 'status-system', colSpan: 'col-span-1 lg:col-span-2' },
    ];

    // Render helpers for specific widget types
    const renderWidgetContent = (widget: Widget) => {
        switch (widget.type) {
            case 'metric':
                const Icon = widget.icon;
                return (
                    <div className="p-5 flex flex-col h-full justify-between gap-4 relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r ${widget.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                        <div className="flex justify-between items-start gap-4 relative z-10">
                            <span className="text-xs font-semibold text-[var(--text-muted)] line-clamp-1 flex-1 leading-tight uppercase tracking-wider">{widget.label}</span>
                            <div className={`p-2.5 rounded-lg ${widget.iconBg} border ${widget.iconBorder} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                <Icon size={20} className={`bg-gradient-to-r ${widget.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                            </div>
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className={`text-3xl font-bold font-display tracking-tight bg-gradient-to-r ${widget.gradient} bg-clip-text text-transparent leading-none`}>{widget.value}</div>
                            <span className="inline-flex items-center text-[10px] font-semibold text-[var(--text-muted)] bg-white/5 dark:bg-white/5 bg-black/5 px-3 py-1.5 rounded-full border border-white/5 dark:border-white/5 border-black/10 w-fit">
                                {widget.change}
                            </span>
                        </div>
                    </div>
                );

            case 'chart-overview':
                // Filter data based on selected type
                let chartData = [];
                if (chartDataType === 'all') {
                    chartData = [
                        ...inquiries.map(i => ({ created_at: i.created_at })),
                        ...emergencies.map(e => ({ created_at: e.webhook_received_at || new Date().toISOString() })),
                        ...appointments.map(a => ({ created_at: a.created_at || a.appointment_date || new Date().toISOString() }))
                    ];
                } else if (chartDataType === 'inquiries') {
                    chartData = inquiries.map(i => ({ created_at: i.created_at }));
                } else if (chartDataType === 'appointments') {
                    chartData = appointments.map(a => ({ created_at: a.created_at || a.appointment_date || new Date().toISOString() }));
                } else if (chartDataType === 'emergencies') {
                    chartData = emergencies.map(e => ({ created_at: e.webhook_received_at || new Date().toISOString() }));
                }

                return (
                    <div className="p-5 flex-1 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">Analytics Overview</h3>
                            <div className="flex gap-2">
                                <select
                                    className="bg-white/5 dark:bg-white/5 bg-black/5 border border-white/10 dark:border-white/10 border-black/10 rounded-lg text-xs text-[var(--text-secondary)] px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10"
                                    value={chartDataType}
                                    onChange={(e) => setChartDataType(e.target.value as 'all' | 'inquiries' | 'appointments' | 'emergencies')}
                                >
                                    <option value="all">All Data</option>
                                    <option value="inquiries">Inquiries</option>
                                    <option value="appointments">Appointments</option>
                                    <option value="emergencies">Emergencies</option>
                                </select>
                                <select
                                    className="bg-white/5 dark:bg-white/5 bg-black/5 border border-white/10 dark:border-white/10 border-black/10 rounded-lg text-xs text-[var(--text-secondary)] px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/10"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as '12m' | '30d')}
                                >
                                    <option value="12m">Last 12 Months</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-4 flex-1 min-h-[300px]">
                            <OverviewChart data={chartData} timeRange={timeRange} />
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
                                        <div className="w-8 h-8 rounded-full bg-[#ff8904]/10 flex items-center justify-center text-[#ff8904] group-hover:bg-[#ff8904]/20 transition-colors flex-shrink-0">
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
                // Calculate real system metrics
                const now = new Date();
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                const recentActivity = inquiries?.filter(i => new Date(i.created_at) > oneHourAgo).length || 0;
                const aiEngineStatus = recentActivity > 0 ? 'Processing' : 'Operational';

                // Calculate total unique customers as "active agents"
                const uniqueCustomers = new Set([
                    ...(inquiries || []).map(i => i.customer_email || i.customer_phone),
                    ...(appointments || []).map(a => a.customer_email || a.customer_phone)
                ].filter(Boolean));
                const activeCount = uniqueCustomers.size;

                // Calculate uptime based on oldest inquiry
                const oldestInquiry = inquiries && inquiries.length > 0
                    ? new Date(Math.min(...inquiries.map(i => new Date(i.created_at).getTime())))
                    : new Date();
                const uptimeMs = now.getTime() - oldestInquiry.getTime();
                const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
                const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const uptimeStr = uptimeDays > 0 ? `${uptimeDays}d ${uptimeHours}h` : `${uptimeHours}h`;

                return (
                    <div className="p-5 h-full">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 leading-tight">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Activity className="text-[#ff8904] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">AI Engine</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{aiEngineStatus}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff8904] animate-pulse" />
                                    <span className="text-[10px] text-[#ff8904] font-medium leading-tight">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Users className="text-[#ff8904] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">Total Customers</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{activeCount} unique</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-[var(--text-primary)]">{activeCount}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-white/5 bg-black/5 border border-white/5 dark:border-white/5 border-black/10 gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Clock className="text-[#ff8904] flex-shrink-0" size={16} />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">System Active</div>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">Since first inquiry</div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-[var(--text-secondary)] font-mono flex-shrink-0 leading-tight">{uptimeStr}</span>
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
            <PageHeader title="Dashboard" description="Real-time overview of system performance and activity." />

            {/* Unified Grid - removed reordering since widgets now rebuild each render */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={`${widget.colSpan} relative`}
                    >
                        <div className="glass-panel rounded-xl border border-white/10 dark:border-white/10 border-black/10 overflow-hidden h-full">
                            {renderWidgetContent(widget)}
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
};

export default Dashboard;
