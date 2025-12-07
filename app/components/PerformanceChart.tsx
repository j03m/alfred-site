'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface PerformanceChartProps {
  data: any[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  // Format data for chart (convert NAV to % return if desired, or keep as growth of $1)
  // Let's show Growth of $10,000
  const chartData = data.map(d => ({
    date: d.date,
    'Alfred': +(d.model * 10000).toFixed(0),
    'SPY': +(d.spy * 10000).toFixed(0),
    'Mag 7': +(d.mag7 * 10000).toFixed(0),
  }));

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Performance (Growth of $10k)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 12, fill: '#64748b'}} 
            tickLine={false}
            axisLine={{stroke: '#e2e8f0'}}
            minTickGap={30}
          />
          <YAxis 
            tick={{fontSize: 12, fill: '#64748b'}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <Tooltip 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}} />
          <Line 
            type="monotone" 
            dataKey="Alfred" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{r: 6}}
          />
          <Line 
            type="monotone" 
            dataKey="SPY" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="Mag 7" 
            stroke="#d946ef" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
