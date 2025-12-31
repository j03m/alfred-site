import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getTickerCommentary, getMonthDetail, getTickerChartData, getRegistry, getTickerPageParams } from '@/lib/api';
import CommentarySection from '@/app/components/CommentarySection';
import TickerChart from '@/app/components/TickerChart';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    versionId: string;
    year: string;
    month: string;
    ticker: string;
  }>;
}

export async function generateStaticParams() {
    const registry = await getRegistry();
    const versions = Object.keys(registry.versions);
    
    let allParams: Array<{ versionId: string; year: string; month: string; ticker: string }> = [];

    for (const versionId of versions) {
        const versionParams = await getTickerPageParams(versionId);
        allParams = allParams.concat(versionParams);
    }
    
    return allParams;
}

export default async function TickerReportPage({ params }: PageProps) {
  const { versionId, year, month, ticker } = await params;
  
  // Get ticker commentary with fallback logic
  const commentary = await getTickerCommentary(versionId, year, month, ticker);
  
  // Get chart data (if available) - safe optional fetch
  const chartData = await getTickerChartData(versionId, year, month, ticker);
  
  if (!commentary) {
    notFound();
  }

  // Also get some context about the month for the header
  const { report } = await getMonthDetail(versionId, year, month);
  const monthLabel = `${report.meta.month} ${report.meta.year}`;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/${versionId}/report/${year}/${month}`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ticker}</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{monthLabel}</p>
            </div>
          </div>
          
          {commentary.actualDate !== `${year}-${month.padStart(2, '0')}` && (
            <div className="hidden sm:block">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
                Note: Displaying last available report ({commentary.actualDate})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {chartData && <TickerChart data={chartData} />}
        
        <CommentarySection content={commentary.content} />
        
        {commentary.actualDate !== `${year}-${month.padStart(2, '0')}` && (
           <div className="mt-6 sm:hidden">
              <p className="text-center text-sm text-amber-700 italic">
                Note: Showing last available report from {commentary.actualDate}
              </p>
           </div>
        )}
      </div>
    </main>
  );
}
