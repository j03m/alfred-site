'use client';

import { useState } from 'react';
import { Holding, NextPick, LedgerEvent, ActivityLogItem } from '@/lib/api';
import { DollarSign, TrendingUp, List, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LiveDashboardProps {
  holdings: Holding[];
  nextPicks: NextPick[];
  ledgerEvents: LedgerEvent[];
  activityLog: ActivityLogItem[];
  dateStr: string;
}

export default function LiveDashboard({ holdings, nextPicks, ledgerEvents, activityLog, dateStr }: LiveDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'holdings' | 'predictions' | 'ledger' | 'activity'>('holdings');

  // Filter activity log for relevant dates (e.g., this month or last 7 days from dateStr)
  // For now, let's show items from the specific date
  const dailyActivity = activityLog.filter(item => item.date === dateStr);
  
  // Ledger is passed as "Monthly Ledger", so we use it directly to show full month history
  const monthlyLedger = ledgerEvents;

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex flex-wrap gap-2">
        <button
            onClick={() => setActiveTab('holdings')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'holdings' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            <DollarSign className="w-4 h-4 mr-2" />
            Current Holdings
        </button>
        <button
            onClick={() => setActiveTab('predictions')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'predictions' 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            <TrendingUp className="w-4 h-4 mr-2" />
            Predictions
        </button>
        <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'ledger' 
                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            <List className="w-4 h-4 mr-2" />
            Monthly Ledger
        </button>
        <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activity' 
                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
            <Activity className="w-4 h-4 mr-2" />
            Activity Log
        </button>
      </div>

      {/* 1. Live Holdings (The Present) */}
      {activeTab === 'holdings' && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                Current Portfolio State
            </h2>
            <span className="text-xs font-mono text-slate-500">LIVE</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-3 font-medium">Ticker</th>
                    <th className="px-6 py-3 font-medium text-right">Shares</th>
                    <th className="px-6 py-3 font-medium text-right">Cost Basis</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                    <th className="px-6 py-3 font-medium text-right">Value</th>
                    <th className="px-6 py-3 font-medium text-right">Unrealized PnL</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {holdings.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                            No positions currently held.
                        </td>
                    </tr>
                ) : (
                    holdings.map((h) => {
                    const currentPrice = h.current_price || 0;
                    const shares = h.shares || 0;
                    const costBasis = h.cost_basis || 0;
                    const marketValue = shares * currentPrice;
                    const pnl = h.unrealized_pnl || 0;
                    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
                    
                    return (
                        <tr key={h.ticker} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">{h.ticker}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{shares.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right text-slate-600">${costBasis.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right text-slate-600">${currentPrice.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-medium text-slate-900">${marketValue.toFixed(2)}</td>
                        <td className={`px-6 py-3 text-right font-medium ${pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ${pnl.toFixed(2)} ({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </td>
                        </tr>
                    );
                    })
                )}
                </tbody>
            </table>
            </div>
        </section>
      )}

      {/* 2. Predictions (The Future) */}
      {activeTab === 'predictions' && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                Model Predictions (Next Session)
                </h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-6 py-3 font-medium">Ticker</th>
                    <th className="px-6 py-3 font-medium text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {nextPicks.map((p, i) => (
                    <tr key={p.ticker} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-500 font-mono">#{i + 1}</td>
                        <td className="px-6 py-3 font-medium text-slate-900">{p.ticker}</td>
                        <td className="px-6 py-3 text-right text-slate-600">{p.score.toFixed(4)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </section>
      )}

      {/* 3. Monthly Ledger (The Action) */}
      {activeTab === 'ledger' && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                Monthly Transactions
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Ticker</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium text-right">Shares</th>
                    <th className="px-6 py-3 font-medium text-right">Price</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {monthlyLedger.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                                No trades executed this month.
                            </td>
                        </tr>
                    ) : (
                        monthlyLedger.map((e, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{e.date}</td>
                                <td className="px-6 py-3 font-medium text-slate-900">{e.ticker}</td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                        e.event_type.toLowerCase().includes('buy') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {e.event_type.toLowerCase().includes('buy') ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                                        {e.event_type.toUpperCase().replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right text-slate-600">{e.shares?.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right text-slate-600">${e.price?.toFixed(2)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </section>
      )}

      {/* 4. Activity Log (The Context) */}
      {activeTab === 'activity' && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                System Activity Log
            </h2>
            <div className="space-y-4">
                {dailyActivity.length === 0 ? (
                    <div className="text-slate-500 italic text-center py-4">No system events logged for today.</div>
                ) : (
                    dailyActivity.map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex-none w-24 text-xs text-slate-400 pt-1 text-right">
                                {item.date}
                            </div>
                            <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-700 text-sm">{item.type}</span>
                                </div>
                                <p className="text-sm text-slate-600">{item.description}</p>
                                {item.details && (
                                    <pre className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-500 overflow-x-auto">
                                        {JSON.stringify(item.details, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
      )}

    </div>
  );
}
