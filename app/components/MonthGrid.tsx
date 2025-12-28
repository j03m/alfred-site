import React from 'react';
import Link from 'next/link';
import { ArchiveMonth } from '@/lib/api';
import { Calendar, ArrowRight, DollarSign } from 'lucide-react';

interface MonthGridProps {
  months: ArchiveMonth[];
}

export default function MonthGrid({ months }: MonthGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {months.map((m) => (
        <Link 
          key={`${m.year}-${m.month}`} 
          href={`/report/${m.year}/${m.month_num}`}
          className="group block bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-slate-500 font-medium">{m.year}</div>
              <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {m.month}
              </div>
            </div>
            <div className={`text-sm font-bold px-2 py-1 rounded ${
                m.return_pct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {m.return_pct > 0 ? '+' : ''}{(m.return_pct * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
              Equity: ${m.ending_equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
