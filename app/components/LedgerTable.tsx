import React from 'react';
import TickerLink from './TickerLink';

interface LedgerTableProps {
  rows: Array<any>;
  year?: string;
  month?: string;
}

export default function LedgerTable({ rows, year, month }: LedgerTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Transaction Ledger</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Symbol</th>
              <th className="px-6 py-3 text-right">Quantity</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Cash</th>
              <th className="px-6 py-3">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-900">{row.date}</td>
                <td className={`px-6 py-3 font-bold ${row.action === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {row.action}
                </td>
                <td className="px-6 py-3">
                  <TickerLink symbol={row.symbol} year={year} month={month} />
                </td>
                <td className="px-6 py-3 text-right text-slate-900">{Number(row.quantity).toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-slate-900">${Number(row.price).toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-slate-900">${Number(row.remaining_cash).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="px-6 py-3 text-slate-900 max-w-xs truncate" title={row.reason || ''}>
                  {row.reason || '-'}
                </td>
              </tr>
            ))}
             {rows.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">No transactions recorded for this period.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
