import React from 'react';
import { GlobalStats } from '@/lib/api';
import { TrendingUp, TrendingDown, Activity, ShieldCheck } from 'lucide-react';

interface StatsGridProps {
  metrics: GlobalStats;
}

export default function StatsGrid({ metrics }: StatsGridProps) {
  const cards = [
    {
      label: 'Total Return',
      value: `${(metrics.total_return * 100).toFixed(1)}%`,
      sub: 'Inception to Date',
      icon: metrics.total_return >= 0 ? TrendingUp : TrendingDown,
      color: metrics.total_return >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: metrics.total_return >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    },
    {
      label: 'Alpha',
      value: `${(metrics.alpha * 100).toFixed(1)}%`,
      sub: 'vs Benchmark',
      icon: Activity,
      color: metrics.alpha >= 0 ? 'text-blue-600' : 'text-amber-600',
      bg: metrics.alpha >= 0 ? 'bg-blue-50' : 'bg-amber-50',
    },
    {
      label: 'Max Drawdown',
      value: `${(metrics.max_drawdown * 100).toFixed(1)}%`,
      sub: 'Peak to Trough',
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Sortino Ratio',
      value: metrics.sortino.toFixed(2),
      sub: 'Risk-Adjusted Return',
      icon: ShieldCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
