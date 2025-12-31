'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart
} from 'recharts';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface EventData {
  date: string;
  type: string; // "BUY" | "SELL"
  price: number;
  quantity: number;
}

interface ChartData {
  ticker: string;
  period: string;
  candles: CandleData[];
  events: EventData[];
}

interface TickerChartProps {
  data: ChartData;
}

// Custom Shape for Events (Up/Down Triangles)
const EventMarker = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.type) return null;
  
  const isBuy = payload.type === 'BUY';
  const color = isBuy ? '#16a34a' : '#dc2626'; // green-600 : red-600
  const size = 6;

  if (isBuy) {
      // Up Triangle
      return <path d={`M${cx},${cy - size} L${cx - size},${cy + size} L${cx + size},${cy + size} Z`} fill={color} />;
  } else {
      // Down Triangle
      return <path d={`M${cx},${cy + size} L${cx - size},${cy - size} L${cx + size},${cy - size} Z`} fill={color} />;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pricePoint = payload.find((p: any) => p.dataKey === 'close');
    const eventPoint = payload.find((p: any) => p.dataKey === 'y'); // Event Scatter uses 'y'

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm text-slate-800 ring-1 ring-black/5">
        <p className="font-semibold text-slate-500 mb-1">{label}</p>
        
        {pricePoint && (
            <div className="flex justify-between gap-4">
                <span>Price:</span>
                <span className="font-mono font-medium">${pricePoint.value.toFixed(2)}</span>
            </div>
        )}

        {eventPoint && (
             <div className={`mt-2 pt-2 border-t border-slate-100 font-bold flex items-center gap-1 ${eventPoint.payload.type === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                <span>{eventPoint.payload.type === 'BUY' ? '▲ BUY' : '▼ SELL'}</span>
                <span>@ ${eventPoint.payload.price}</span>
            </div>
        )}
      </div>
    );
  }
  return null;
};

export default function TickerChart({ data }: TickerChartProps) {
  if (!data || !data.candles || data.candles.length === 0) {
    return null;
  }

  // Calculate domain padding
  const prices = data.candles.map(c => c.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1; // 10% padding
  const domain = [minPrice - padding, maxPrice + padding];

  // Prepare Data: Merge events into the main timeline for the Scatter?
  // Actually, standard ComposedChart allows separate data sources or matched data.
  // Easiest is to map events to the same structure.
  
  const chartData = data.candles.map(c => {
      // Find event for this day
      const evt = data.events.find(e => e.date === c.date);
      return {
          ...c,
          y: evt ? evt.price : undefined,
          type: evt ? evt.type : undefined,
          quantity: evt ? evt.quantity : undefined
      };
  });

  // VALIDATION: Ensure all events were mapped. 
  // If we have an event date that isn't in candles, it wasn't added to chartData (or rather, the candle map missed it).
  // We check if any event date is missing from the candle dates.
  const candleDates = new Set(data.candles.map(c => c.date));
  const missingEvents = data.events.filter(e => !candleDates.has(e.date));

  if (missingEvents.length > 0) {
      const missingDetails = missingEvents.map(e => `${e.type} @ ${e.date}`).join(', ');
      throw new Error(`Data Mismatch in TickerChart for ${data.ticker}: Events found on non-trading dates (not in candles): ${missingDetails}`);
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Price Action</h3>
          <div className="flex gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span> Close Price</span>
              {data.events.some(e => e.type === 'BUY') && <span className="flex items-center gap-1"><span className="text-green-600">▲</span> Buy</span>}
              {data.events.some(e => e.type === 'SELL') && <span className="flex items-center gap-1"><span className="text-red-600">▼</span> Sell</span>}
          </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(dateStr) => {
                const date = new Date(dateStr);
                const day = date.getDate();
                if (day === 1) {
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }
                return day.toString();
              }} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'sans-serif' }}
              minTickGap={30}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'sans-serif' }}
              tickFormatter={(val) => val.toFixed(2)}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#64748b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorClose)" 
                activeDot={{ r: 4, fill: '#475569', strokeWidth: 0 }}
            />

            {/* Event Markers */}
            <Scatter name="Events" dataKey="y" shape={<EventMarker />} />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}