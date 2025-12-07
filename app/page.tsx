import { getPerformanceData, getAllDates } from '@/lib/api';
import Link from 'next/link';
import PerformanceChart from './components/PerformanceChart';
import { ArrowRight, Calendar, TrendingUp, Shield, Activity } from 'lucide-react';

export default async function LandingPage() {
  const performanceData = await getPerformanceData();
  const dates = await getAllDates();
  
  const datesWithStr = dates.map(d => ({
    ...d,
    date: `${d.year}-${d.month}-${d.day}`
  }));

  // Sort dates descending
  const sortedDates = datesWithStr.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const latestStats = performanceData?.data[performanceData.data.length - 1];
  const totalReturn = latestStats ? (latestStats.model - 1) * 100 : 0;
  const spyReturn = latestStats ? (latestStats.spy - 1) * 100 : 0;
  const alpha = totalReturn - spyReturn;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
                Alfred
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                AI-driven portfolio management and market analysis.
              </p>
            </div>
            <div className="flex gap-4">
               {latestStats && (
                  <div className="text-right">
                      <div className="text-sm text-slate-500 font-medium">Total Return</div>
                      <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                      </div>
                  </div>
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
                className="group block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all hover:border-blue-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {dateObj.date}
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