'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthChartProps {
  data: Array<{ date: string; rel_port: number; rel_spy: number; rel_mag7: number }>;
}

export default function MonthChart({ data }: MonthChartProps) {
  // Normalize to percentage (1.0 = 0%, 1.1 = 10%)
  const formattedData = data.map(d => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString(undefined, { day: 'numeric' }),
    pct_port: (d.rel_port - 1) * 100,
    pct_spy: (d.rel_spy - 1) * 100,
    pct_mag7: (d.rel_mag7 - 1) * 100,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Performance (Relative)</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorMonthPort" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
            />
            <Legend iconType="circle" />
            <Area 
                type="monotone" 
                dataKey="pct_port" 
                name="Portfolio"
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorMonthPort)" 
                strokeWidth={2}
            />
            <Area 
                type="monotone" 
                dataKey="pct_spy" 
                name="S&P 500"
                stroke="#94a3b8" 
                fill="none" 
                strokeWidth={2}
                strokeDasharray="5 5"
            />
             <Area 
                type="monotone" 
                dataKey="pct_mag7" 
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
