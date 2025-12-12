'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ArrowUpRight, ArrowDownRight, Layers, ArrowRight, History, Zap } from 'lucide-react';
import { LedgerEvent, ActivePick, NextPick } from '@/lib/api';

interface LedgerPicksSectionProps {
  ledgerEvents: LedgerEvent[];
  activePicks: ActivePick[];
  nextPicks: NextPick[];
  year: string;
  month: string;
  day: string;
}

export default function LedgerPicksSection({ ledgerEvents, activePicks, nextPicks, year, month, day }: LedgerPicksSectionProps) {
  const [view, setView] = useState<'ledger' | 'active' | 'next'>('ledger');

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center">
            {view === 'ledger' && (
                <>
                    <DollarSign className="w-5 h-5 mr-2 text-slate-400" />
                    Monthly Ledger
                </>
            )}
            {view === 'active' && (
                <>
                    <History className="w-5 h-5 mr-2 text-slate-400" />
                    Current Period Picks (Retrospective)
                </>
            )}
            {view === 'next' && (
                <>
                    <Zap className="w-5 h-5 mr-2 text-slate-400" />
                    Next Period Picks (Prospective)
                </>
            )}
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
                onClick={() => setView('ledger')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    view === 'ledger' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Ledger
            </button>
            <button
                onClick={() => setView('active')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    view === 'active' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Current Period
            </button>
            <button
                onClick={() => setView('next')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    view === 'next' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Next Period
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {view === 'ledger' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Ticker</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                  <th className="px-6 py-3 font-medium text-right">Net Amount</th>
                  <th className="px-6 py-3 font-medium text-right">P/L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerEvents.map((event, idx) => {
                    const isBuy = event.event_type === 'buy';
                    const isSell = event.event_type === 'sell' || event.event_type === 'rebalance_sell';
                    const price = isBuy ? event.entry_price : event.exit_price;
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{event.date}</td>
                        <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                                {isBuy ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                                {event.event_type.toUpperCase().replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-blue-600 underline">
                          {event.ticker && (
                              <Link href={`/v1/${year}/${month}/${day}/tickers/${event.ticker}`}>
                                {event.ticker}
                              </Link>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-mono text-xs">
                            {event.shares?.toFixed(2)} sh @ ${price?.toFixed(2)}
                        </td>
                        <td className={`px-6 py-3 text-right font-mono ${
                            (event.cash_change || 0) > 0 ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                            {(event.cash_change || 0) > 0 ? '+' : ''}${(event.cash_change || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className={`px-6 py-3 text-right font-mono font-medium ${
                            (event.realized_pnl || 0) > 0 ? 'text-emerald-600' : (event.realized_pnl || 0) < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                            {isSell ? (
                                <>
                                    {(event.realized_pnl || 0) > 0 ? '+' : ''}${(event.realized_pnl || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </>
                            ) : (
                                <span className="text-slate-300">--</span>
                            )}
                        </td>
                      </tr>
                    );
                })}
                {ledgerEvents.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                            No transactions recorded for this period.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        )}

        {view === 'active' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Ticker</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Sector</th>
                  <th className="px-6 py-3 font-medium text-right">Weight</th>
                  <th className="px-6 py-3 font-medium text-right">Return</th>
                  <th className="px-6 py-3 font-medium text-right">Rel. SPY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activePicks.map((h) => (
                  <tr key={h.ticker} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-blue-600 underline">
                      <Link href={`/v1/${year}/${month}/${day}/tickers/${h.ticker}`}>
                        {h.ticker}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{h.name}</td>
                    <td className="px-6 py-3 text-slate-500">{h.sector}</td>
                    <td className="px-6 py-3 text-right font-mono">{(h.weight * 100).toFixed(1)}%</td>
                    <td className={`px-6 py-3 text-right font-mono font-medium ${
                        (h.return || 0) > 0 ? 'text-emerald-600' : (h.return || 0) < 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                        {(h.return || 0) > 0 ? '+' : ''}{((h.return || 0) * 100).toFixed(2)}%
                    </td>
                    <td className={`px-6 py-3 text-right font-mono text-xs ${
                        (h.relative_return || 0) > 0 ? 'text-emerald-600' : (h.relative_return || 0) < 0 ? 'text-rose-600' : 'text-slate-400'
                    }`}>
                        {(h.relative_return || 0) > 0 ? '+' : ''}{((h.relative_return || 0) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {activePicks.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                            No active picks data available for this period.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        )}

        {view === 'next' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Ticker</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Sector</th>
                  <th className="px-6 py-3 font-medium text-right">Target Weight</th>
                  <th className="px-6 py-3 font-medium text-right">Conviction Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nextPicks.map((h) => (
                  <tr key={h.ticker} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-blue-600 underline">
                      <Link href={`/v1/${year}/${month}/${day}/tickers/${h.ticker}`}>
                        {h.ticker}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{h.name}</td>
                    <td className="px-6 py-3 text-slate-500">{h.sector}</td>
                    <td className="px-6 py-3 text-right font-mono">{(h.weight * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-right font-mono">
                        {(h.score).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {nextPicks.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                            No next period picks available.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        )}
      </div>
    </section>
  );
}
