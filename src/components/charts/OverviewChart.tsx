import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface OverviewChartProps {
    data: Array<{ created_at: string }>;
    timeRange: '12m' | '30d';
}

export function OverviewChart({ data, timeRange }: OverviewChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (timeRange === '30d') {
            const dayCounts: Record<string, number> = {};
            const today = new Date();
            // Create last 30 days keys
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dayCounts[key] = 0;
            }

            data.forEach(item => {
                const date = new Date(item.created_at);
                const diffTime = today.getTime() - date.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays >= 0 && diffDays <= 30) {
                    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    if (dayCounts.hasOwnProperty(key)) {
                        dayCounts[key]++;
                    }
                }
            });

            return Object.keys(dayCounts).map(date => ({
                name: date,
                value: dayCounts[date]
            }));
        } else {
            // Default 12m logic
            const monthCounts: Record<string, number> = {};
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // Initialize all months to 0
            months.forEach(m => monthCounts[m] = 0);

            data.forEach(item => {
                const date = new Date(item.created_at);
                if (!isNaN(date.getTime())) {
                    const monthIndex = date.getMonth();
                    const monthName = months[monthIndex];
                    monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
                }
            });

            return months.map(name => ({
                name,
                value: monthCounts[name]
            }));
        }
    }, [data, timeRange]);

    console.log('OverviewChart Render:', { timeRange, dataLength: data?.length });

    return (
        <div style={{ width: '100%', height: 300 }} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#30b357" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#30b357" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--text-muted)"
                        strokeOpacity={0.2}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "#fff",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#30b357"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
