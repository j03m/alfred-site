import React from 'react';
import { getGlobalData, getAllMonths } from '@/lib/api';
import StatsGrid from '@/app/components/StatsGrid';
import GrowthChart from '@/app/components/GrowthChart';
import MonthGrid from '@/app/components/MonthGrid';

export const revalidate = 3600; // Revalidate every hour

export default async function DashboardPage() {
  const { stats, history } = await getGlobalData();
  const months = await getAllMonths();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
               <span className="text-white font-bold text-xl">A</span>
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Alfred v1
                </h1>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Key Metrics */}
        <section>
          <StatsGrid metrics={stats} />
        </section>

        {/* Growth Chart */}
        <section>
          <GrowthChart data={history} />
        </section>

        {/* Archive Grid */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            Monthly Reports
          </h2>
          <MonthGrid months={months} />
        </section>

      </main>
    </div>
  );
}