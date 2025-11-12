import React from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, ThumbsUp } from 'lucide-react';

interface AnalyticsData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ElementType;
  chartData: Array<{ name: string; uv: number }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card/80 p-2 text-sm shadow-md backdrop-blur-sm">
        <p className="text-foreground">{`Valor: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

function StatCard({ title, value, change, changeType, icon: Icon, chartData }: AnalyticsData) {
  const chartColor = changeType === 'positive' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';

  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="flex flex-col">
          <p className="text-3xl font-bold tracking-tighter text-foreground">{value}</p>
          <p className={`mt-1 text-xs flex items-center gap-1 ${
            changeType === 'positive' ? 'text-primary' : 'text-destructive'
          }`}>
            {changeType === 'positive' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </p>
        </div>
        <div className="h-12 w-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`colorUv-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Line
                type="monotone"
                dataKey="uv"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                fillOpacity={1}
                fill={`url(#colorUv-${title})`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          change={item.change}
          changeType={item.changeType}
          icon={item.icon}
          chartData={item.chartData}
        />
      ))}
    </div>
  );
}
