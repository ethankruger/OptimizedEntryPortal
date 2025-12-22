import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DistributionChartProps {
    data: {
        inquiries: Array<{ created_at: string }>;
        emergencies: Array<{ webhook_received_at?: string; created_at?: string }>;
        appointments: Array<{ created_at?: string; appointment_date?: string }>;
    };
    timeRange: '12m' | '30d';
}

export function DistributionChart({ data, timeRange }: DistributionChartProps) {
    const chartData = useMemo(() => {
        const filterDate = (dateString?: string) => {
            if (!dateString) return false;
            if (timeRange === '12m') return true;

            const date = new Date(dateString);
            const today = new Date();
            const diffTime = today.getTime() - date.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 30;
        };

        const inquiriesCount = data.inquiries.filter(i => filterDate(i.created_at)).length;
        const emergenciesCount = data.emergencies.filter(e => filterDate(e.webhook_received_at || e.created_at)).length;
        const appointmentsCount = data.appointments.filter(a => filterDate(a.created_at || a.appointment_date)).length;

        return [
            { name: 'Inquiries', value: inquiriesCount, color: '#30b357' },
            { name: 'Emergencies', value: emergenciesCount, color: '#ff8904' },
            { name: 'Appointments', value: appointmentsCount, color: '#2d9cdb' },
        ].filter(item => item.value > 0);
    }, [data, timeRange]);

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    if (total === 0) {
        return (
            <div style={{ width: '100%', height: 200 }} className="h-[200px] w-full flex items-center justify-center text-gray-500">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[{ name: 'No Data', value: 1 }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#333"
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0,0,0,0.8)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#fff"
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-xs text-[var(--text-muted)] font-medium">No Data</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 200 }} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px",
                            color: "#fff"
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
