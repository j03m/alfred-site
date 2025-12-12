'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';

interface ChartDataItem {
  date: string;
  model: number;
  spy: number;
  mag7: number;
}

interface PerformanceChartProps {
  data: ChartDataItem[];
  mode?: 'growth' | 'relative';
}

// Hardcoded dates matching metadata/provenance-config.json
const TRAINING_CUTOFF = "2025-03-31";
const SIMULATION_CUTOFF = "2025-12-11";

export default function PerformanceChart({ data, mode = 'growth' }: PerformanceChartProps) {
  const isRelative = mode === 'relative';

  const chartData = data.map(d => {
    if (isRelative) {
      return {
        date: d.date,
        'PortfolioZero': +((d.model - 1) * 100).toFixed(2),
        'S&P 500': +((d.spy - 1) * 100).toFixed(2),
        'MAG7': +((d.mag7 - 1) * 100).toFixed(2),
      };
    } else {
      return {
        date: d.date,
        'PortfolioZero': +(d.model * 10000).toFixed(0),
        'S&P 500': +(d.spy * 10000).toFixed(0),
        'MAG7': +(d.mag7 * 10000).toFixed(0),
      };
    }
  });

  const title = isRelative ? "Relative Performance (%)" : "Performance (Growth of $10k)";
  const yAxisFormatter = (value: number) => isRelative ? `${value}%` : `$${value/1000}k`;
  const tooltipFormatter = (value: number) => [
    isRelative ? `${value > 0 ? '+' : ''}${value}%` : `$${value.toLocaleString()}`, 
    ''
  ];

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
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
            tickFormatter={yAxisFormatter}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            formatter={tooltipFormatter}
          />
          <Legend wrapperStyle={{paddingTop: '20px'}} />
          
          <ReferenceLine x={TRAINING_CUTOFF} stroke="#94a3b8" strokeDasharray="3 3">
            <Label value="Training Ends" position="insideTopLeft" fill="#64748b" fontSize={12} />
          </ReferenceLine>
          
          <ReferenceLine x={SIMULATION_CUTOFF} stroke="#6366f1" strokeDasharray="3 3">
            <Label value="Live Begins" position="insideTopLeft" fill="#6366f1" fontSize={12} />
          </ReferenceLine>

          <Line 
            type="monotone" 
            dataKey="PortfolioZero" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{r: 6}}
          />
          <Line 
            type="monotone" 
            dataKey="MAG7" 
            stroke="#d946ef" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="S&P 500" 
            stroke="#94a3b8" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
