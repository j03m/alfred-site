'use client';

import React, { useState, useEffect } from 'react';
import PerformanceTable from './PerformanceTable';
import SignalsTable from './SignalsTable';
import LedgerTable from './LedgerTable';
import { Activity, ScrollText, TrendingUp } from 'lucide-react';
import { PerformanceEntry } from '@/lib/api';

interface TableTabsProps {
  performance: Array<PerformanceEntry>;
  predictions: Array<{ symbol: string; target_weight: number; score: number }>;
  ledger: Array<any>;
}

export default function TableTabs({ performance, predictions, ledger }: TableTabsProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'predictions' | 'ledger'>('performance');

  useEffect(() => {
    const savedTab = localStorage.getItem('alfred-table-tab');
    if (savedTab === 'performance' || savedTab === 'predictions' || savedTab === 'ledger') {
      setActiveTab(savedTab as 'performance' | 'predictions' | 'ledger');
    }
  }, []);

  const handleTabChange = (tab: 'performance' | 'predictions' | 'ledger') => {
    setActiveTab(tab);
    localStorage.setItem('alfred-table-tab', tab);
  };

  return (
    <div className="space-y-4">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleTabChange('performance')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Performance
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
        {activeTab === 'performance' && <PerformanceTable rows={performance || []} />}
        {activeTab === 'predictions' && <SignalsTable rows={predictions || []} />}
        {activeTab === 'ledger' && <LedgerTable rows={ledger || []} />}
      </div>
    </div>
  );
}
