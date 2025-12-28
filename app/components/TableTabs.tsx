'use client';

import React, { useState, useEffect } from 'react';
import HoldingsTable from './HoldingsTable';
import SignalsTable from './SignalsTable';
import LedgerTable from './LedgerTable';
import { Layers, Activity, ScrollText } from 'lucide-react';

interface TableTabsProps {
  holdings: Array<{ Symbol: string; Shares: number; CostBasis: number; CurrentPrice: number; UnrealizedPnL: number }>;
  predictions: Array<{ symbol: string; target_weight: number; score: number }>;
  ledger: Array<any>;
}

export default function TableTabs({ holdings, predictions, ledger }: TableTabsProps) {
  const [activeTab, setActiveTab] = useState<'holdings' | 'predictions' | 'ledger'>('holdings');

  useEffect(() => {
    const savedTab = localStorage.getItem('alfred-table-tab');
    if (savedTab === 'holdings' || savedTab === 'predictions' || savedTab === 'ledger') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: 'holdings' | 'predictions' | 'ledger') => {
    setActiveTab(tab);
    localStorage.setItem('alfred-table-tab', tab);
  };

  return (
    <div className="space-y-4">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange('holdings')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'holdings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Holdings
        </button>
        <button
          onClick={() => handleTabChange('predictions')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'predictions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Predictions
        </button>
        <button
          onClick={() => handleTabChange('ledger')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          Ledger
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'holdings' && <HoldingsTable rows={holdings} />}
        {activeTab === 'predictions' && <SignalsTable rows={predictions} />}
        {activeTab === 'ledger' && <LedgerTable rows={ledger} />}
      </div>
    </div>
  );
}
