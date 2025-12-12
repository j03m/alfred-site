'use client';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter
} from 'recharts';

interface TickerHistoryItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TickerMarker {
  date: string;
  type: string; // 'buy' | 'sell'
  price: number;
}

interface TickerPriceChartProps {
  history: TickerHistoryItem[];
  markers: TickerMarker[];
}

const CustomShape = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  
  const type = payload.markerType;
  if (!type) return null;

  const isBuy = type === 'buy';
  const color = isBuy ? '#10b981' : '#f43f5e'; // emerald-500 : rose-500
  
  if (isBuy) {
    // Up Triangle
    return (
      <path
        d={`M${cx},${cy + 8} L${cx - 6},${cy - 4} L${cx + 6},${cy - 4} Z`}
        fill={color}
        stroke="none"
      />
    );
  } else {
    // Down Triangle
    return (
        <path
        d={`M${cx},${cy - 8} L${cx - 6},${cy + 4} L${cx + 6},${cy + 4} Z`}
        fill={color}
        stroke="none"
      />
    );
  }
};

export default function TickerPriceChart({ history, markers }: TickerPriceChartProps) {
  // Combine history with marker data for the chart
  // This ensures Scatter points align perfectly with the XAxis defined by history
  
  const chartData = history.map(h => {
    const marker = markers.find(m => m.date === h.date);
    return {
      ...h,
      markerPrice: marker ? marker.price : undefined,
      markerType: marker ? marker.type : undefined
    };
  });

  // Calculate domain for Y axis to look good
  const prices = history.map(h => h.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const buffer = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Price History & Activity</h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <ComposedChart
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
            minTickGap={40}
          />
          <YAxis 
            dataKey="close"
            tick={{fontSize: 12, fill: '#64748b'}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
            domain={[minPrice - buffer, maxPrice + buffer]}
          />
          <Tooltip 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            formatter={(value: any, name: string, props: any) => {
                if (name === 'Activity' && props.payload.markerType) {
                    return [`${props.payload.markerType.toUpperCase()} @ $${value}`, ''];
                }
                if (name === 'close') return [`$${Number(value).toFixed(2)}`, 'Price'];
                return null;
            }}
            filterNull={true}
            labelStyle={{color: '#64748b', marginBottom: '0.5rem'}}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#2563eb" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{r: 4}}
          />
          <Scatter 
            dataKey="markerPrice" 
            name="Activity"
            shape={<CustomShape />}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
