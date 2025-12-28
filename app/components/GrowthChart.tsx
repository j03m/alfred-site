'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PerformancePoint } from '@/lib/api';

interface GrowthChartProps {
  data: PerformancePoint[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  // Normalize data to percentage growth if desired, but here we just plot raw values 
  // or maybe normalized to start at 0? 
  // The plan implies "GrowthChart", usually implies % return. 
  // But the interface has raw values. Let's plot raw values for now, or rebase to 100?
  // User didn't specify, but "Growth" implies relative performance.
  // However, simple raw value plotting is safer to start.
  // Actually, let's normalize to % return for better comparison if they start at different values.
  // But typically in this project they start at 10000. 
  // Let's stick to raw values but formatted nicely.

  const formattedData = data.map(d => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Portfolio Growth</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="dateStr" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
            />
            <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['auto', 'auto']}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, '']}
            />
            <Legend iconType="circle" />
            <Area 
                type="monotone" 
                dataKey="Portfolio_Value" 
                name="Portfolio"
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorPort)" 
                strokeWidth={2}
            />
            <Area 
                type="monotone" 
                dataKey="SPY_Value" 
                name="S&P 500"
                stroke="#94a3b8" 
                fill="none" 
                strokeWidth={2}
                strokeDasharray="5 5"
            />
             <Area 
                type="monotone" 
                dataKey="MAG7_Value" 
                name="Mag 7"
                stroke="#d946ef" 
                fill="none" 
                strokeWidth={2}
                strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
