import React from 'react';
import TickerLink from './TickerLink';

interface SignalsTableProps {
  rows: Array<{ symbol: string; target_weight: number; score: number }>;
  year?: string;
  month?: string;
}

export default function SignalsTable({ rows, year, month }: SignalsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Model Predictions (Snapshot)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-auto text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Symbol</th>
              <th className="px-6 py-3 text-right">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.symbol} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3">
                  <TickerLink symbol={row.symbol} year={year} month={month} />
                </td>
                <td className="px-6 py-3 text-right text-slate-900">{(row.target_weight * 100).toFixed(2)}%</td>
              </tr>
            ))}
             {rows.length === 0 && (
                <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-400 italic">No predictions recorded for this period.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
