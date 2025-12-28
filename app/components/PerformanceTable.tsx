import React from 'react';
import { PerformanceEntry } from '@/lib/api';
import TickerLink from './TickerLink';

interface PerformanceTableProps {
  rows: Array<PerformanceEntry>;
  year?: string;
  month?: string;
}

export default function PerformanceTable({ rows, year, month }: PerformanceTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Performance (Realized & Unrealized)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Ticker</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Entry</th>
              <th className="px-6 py-3 text-right">Exit</th>
              <th className="px-6 py-3 text-right">Basis</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">PnL ($)</th>
              <th className="px-6 py-3 text-right">PnL (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => {
              const pnl = row.status === 'CLOSED' ? row.realized_pnl : row.unrealized_pnl;
              // Avoid division by zero
              const totalCost = row.cost_basis * row.quantity;
              const pnlPercent = totalCost > 0 ? (pnl / totalCost) : 0;
              
              const isPositive = pnl >= 0;
              
              return (
                <tr key={`${row.ticker}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <TickerLink symbol={row.ticker} year={year} month={month} />
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-900">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-900">{row.enter_date}</td>
                  <td className="px-6 py-3 text-right text-slate-900">{row.exit_date || '-'}</td>
                  <td className="px-6 py-3 text-right text-slate-900">${row.cost_basis.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-slate-900">${row.current_price.toFixed(2)}</td>
                  <td className={`px-6 py-3 text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}${pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className={`px-6 py-3 text-right font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : ''}{(pnlPercent * 100).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
             {rows.length === 0 && (
                <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 italic">No performance data available.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
