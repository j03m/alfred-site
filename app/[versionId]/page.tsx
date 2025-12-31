import React from 'react';
import { getGlobalData, getAllMonths } from '@/lib/api';
import StatsGrid from '@/app/components/StatsGrid';
import GrowthChart from '@/app/components/GrowthChart';
import MonthGrid from '@/app/components/MonthGrid';

export const revalidate = 3600; // Revalidate every hour

interface PageParams {
  params: Promise<{ versionId: string }>;
}

export default async function DashboardPage({ params }: PageParams) {
  const { versionId } = await params;
  const { stats, history } = await getGlobalData(versionId);
  const months = await getAllMonths(versionId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
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
          <MonthGrid months={months} baseLink={`/${versionId}/report`} />
        </section>

      </main>
    </div>
  );
}