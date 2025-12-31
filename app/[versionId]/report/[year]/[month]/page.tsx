import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllMonths, getMonthDetail, getRegistry } from '@/lib/api';
import CommentarySection from '@/app/components/CommentarySection';
import MonthChart from '@/app/components/MonthChart';
import TableTabs from '@/app/components/TableTabs';
import { ChevronLeft, Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ versionId: string; year: string; month: string }>;
}

export async function generateStaticParams() {
  const registry = await getRegistry();
  const versions = Object.keys(registry.versions);
  
  let allParams: { versionId: string; year: string; month: string }[] = [];

  for (const versionId of versions) {
    const months = await getAllMonths(versionId);
    const versionParams = months.map((m) => ({
      versionId,
      year: m.year.toString(),
      month: m.month_num.toString(),
    }));
    allParams = allParams.concat(versionParams);
  }
  
  return allParams;
}

export default async function ReportPage({ params }: PageProps) {
  const { versionId, year, month } = await params;
  
  let data;
  try {
    data = await getMonthDetail(versionId, year, month);
  } catch (e) {
    notFound();
  }

  const { report, commentaryHtml } = data;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
       {/* Header */}
       <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href={`/${versionId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {report.meta.month} {report.meta.year}
                    </h1>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {report.meta.start_date} — {report.meta.end_date}
                    </div>
                </div>
             </div>
             
             <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-500">Monthly Return</div>
                <div className={`text-lg font-bold ${report.meta.return_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {report.meta.return_pct > 0 ? '+' : ''}{(report.meta.return_pct * 100).toFixed(2)}%
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Commentary */}
        <section>
             <CommentarySection content={commentaryHtml} />
        </section>

        {/* Performance Chart */}
        <section>
            <MonthChart data={report.chart} />
        </section>

        {/* Performance, Predictions & Ledger Tabs */}
        <section>
            <TableTabs 
                performance={report.performance} 
                predictions={report.predictions} 
                ledger={report.ledger} 
                year={year}
                month={month}
                versionId={versionId}
            />
        </section>

      </main>
    </div>
  );
}
