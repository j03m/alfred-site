import { getPerformanceData, getAllDates, getBacktestSummary, getLatestDate, getDailySummary, getActivityLog } from '@/lib/api';
import Link from 'next/link';
import PerformanceChart from './components/PerformanceChart';
import ActivityLog from './components/ActivityLog';
import { ArrowRight, Calendar, Activity, Info } from 'lucide-react';

export default async function LandingPage() {
  const performanceData = await getPerformanceData();
  const dates = await getAllDates();
  const backtestSummary = await getBacktestSummary();
  const latestDate = await getLatestDate();
  const latestSummary = await getDailySummary(latestDate);
  const activityLog = await getActivityLog();
  
  const provenance = latestSummary?.provenance || 'simulation';

  // Fetch metadata for all dates to determine live status
  const datesWithMeta = await Promise.all(dates.map(async (d) => {
      const dateStr = `${d.year}-${d.month}-${d.day}`;
      // Optimize: We only need provenance. getDailySummary reads a small JSON. Should be fast enough for <100 dates.
      const summary = await getDailySummary(dateStr);
      return {
          ...d,
          date: dateStr,
          isLive: summary?.provenance === 'live'
      };
  }));

  // Sort dates descending
  const sortedDates = datesWithMeta.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const latestStats = performanceData?.data[performanceData.data.length - 1];
  const totalReturn = latestStats ? (latestStats.model - 1) * 100 : 0;
  // const spyReturn = latestStats ? (latestStats.spy - 1) * 100 : 0;
  // const alpha = totalReturn - spyReturn;
  const mag7Return = latestStats ? (latestStats.mag7 - 1) * 100 : 0;
  const alphaMag7 = totalReturn - mag7Return;
  const sortino = backtestSummary?.sortino_ratio ?? 0;
  const maxDrawdown = backtestSummary?.max_drawdown ?? 0;

  // Banner Logic
  let Banner = null;
  if (provenance === 'in_sample') {
    Banner = (
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-amber-800 text-sm font-medium">
          <Info className="w-4 h-4 mr-2" />
          Current Data Source: In-Sample Training Data. Performance metrics are for reference only.
        </div>
      </div>
    );
  } else if (provenance === 'simulation') {
    Banner = (
      <div className="bg-indigo-50 border-b border-indigo-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-indigo-800 text-sm font-medium">
          <Info className="w-4 h-4 mr-2" />
          Current Data Source: Historical Simulation (Out-of-Sample).
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {Banner}
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
                  PortfolioZero
                </h1>
                
              </div>
              <p className="text-lg text-slate-600 max-w-2xl">
                Trust & Verification Dashboard
              </p>
            </div>
            <div className="flex gap-8">
               {latestStats && (
                 <>
                  <div className="text-right">
                      <div className="text-sm text-slate-500 font-medium">Total Return</div>
                      <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                      </div>
                  </div>
                  <div className="text-right">
                      <div className="text-sm text-slate-500 font-medium">Alpha (vs MAG7)</div>
                      <div className={`text-2xl font-bold ${alphaMag7 >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {alphaMag7 > 0 ? '+' : ''}{alphaMag7.toFixed(1)}%
                      </div>
                  </div>
                  <div className="text-right hidden sm:block">
                      <div className="text-sm text-slate-500 font-medium">Max Drawdown</div>
                      <div className="text-2xl font-bold text-slate-700">
                          {(maxDrawdown * 100).toFixed(1)}%
                      </div>
                  </div>
                  <div className="text-right hidden sm:block">
                      <div className="text-sm text-slate-500 font-medium">Sortino</div>
                      <div className="text-2xl font-bold text-slate-700">
                          {sortino.toFixed(1)}
                      </div>
                  </div>
                 </>
               )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Performance Chart */}
        <section>
          {performanceData && <PerformanceChart data={performanceData.data} />}
        </section>

        {/* Activity Log */}
        <section>
             <ActivityLog data={activityLog} />
        </section>

        {/* Recent Analysis Grid */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-slate-400" />
            Analysis Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDates.map((dateObj) => (
              <Link 
                key={dateObj.date} 
                href={`/v1/${dateObj.year}/${dateObj.month}/${dateObj.day}`}
                className={`group block bg-white rounded-xl border p-6 hover:shadow-md transition-all ${
                    dateObj.isLive 
                    ? 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/10' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center">
                    {dateObj.date}
                    {dateObj.isLive && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            LIVE
                        </span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        Daily Report
                    </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
