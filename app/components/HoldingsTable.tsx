import React from 'react';

interface HoldingsTableProps {
  rows: Array<{ Symbol: string; Shares: number; CostBasis: number; CurrentPrice: number; UnrealizedPnL: number }>;
}

export default function HoldingsTable({ rows }: HoldingsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">End-of-Month Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Symbol</th>
              <th className="px-6 py-3 text-right">Shares</th>
              <th className="px-6 py-3 text-right">Cost Basis</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Unrealized PnL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.Symbol} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-900">{row.Symbol}</td>
                <td className="px-6 py-3 text-right text-slate-900">{row.Shares.toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-slate-900">${row.CostBasis.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-slate-900">${row.CurrentPrice.toFixed(2)}</td>
                <td className={`px-6 py-3 text-right font-medium ${row.UnrealizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {row.UnrealizedPnL > 0 ? '+' : ''}${row.UnrealizedPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No holdings recorded for this period.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
