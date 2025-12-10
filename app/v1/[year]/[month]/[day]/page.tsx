import { getDailySummary, getManagerCommentary, getAllDates, getPerformanceData, getMonthlyPerformance, getMonthlyLedger, getHoldings, getPortfolioSnapshot, Holding } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Activity, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import DateSelector from '@/app/components/DateSelector';
import PerformanceChart from '@/app/components/PerformanceChart';
import LedgerPicksSection from '@/app/components/LedgerPicksSection';

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>
}

export async function generateStaticParams() {
  return getAllDates();
}

export default async function DashboardPage(props: PageProps) {
  const params = await props.params;
  const { year, month, day } = params;
  const dateStr = `${year}-${month}-${day}`;
  
  const summary = await getDailySummary(dateStr);
  const commentary = await getManagerCommentary(dateStr);
  const performanceData = await getPerformanceData();
  const monthlyPerformance = await getMonthlyPerformance(year, month, day);
  const ledgerEvents = await getMonthlyLedger(year, month);
  const holdings = await getHoldings(dateStr);
  const portfolioSnapshot = await getPortfolioSnapshot(dateStr);
  
  const rawDates = await getAllDates();
  // Sort rawDates by date string descending
  const allDates = rawDates.map(d => ({
    ...d,
    date: `${d.year}-${d.month}-${d.day}`
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find previous date for weight change calc
  const currentIndex = allDates.findIndex(d => d.date === dateStr);
  let prevHoldings: Holding[] = [];
  
  if (currentIndex !== -1 && currentIndex < allDates.length - 1) {
      const prevDate = allDates[currentIndex + 1]; // Next item in desc list is previous date
      prevHoldings = await getHoldings(prevDate.date);
  }

  // Calculate changes
  const picksWithChange = holdings.map(h => {
      const prev = prevHoldings.find(p => p.ticker === h.ticker);
      const snapshotItem = portfolioSnapshot.find(p => p.ticker === h.ticker);
      return {
          ...h,
          weight_change: prev ? h.weight - prev.weight : undefined, // undefined means NEW
          unrealized_pl: h.unrealized_pl ?? snapshotItem?.unrealized_gain
      };
  });

  if (!summary) {
    return notFound();
  }

  // Use new Monthly Performance artifact if available, otherwise fallback to global slice
  const monthlyData = monthlyPerformance || (performanceData?.data.filter(d => d.date.startsWith(`${year}-${month}`)) || []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-slate-800 tracking-tight hover:text-blue-600 transition-colors">
              PortfolioZero
            </Link>
            <div className="relative group">
                <button className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-mono font-medium hover:bg-slate-200 transition-colors flex items-center">
                    v1
                </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                Back to Archive
             </Link>
             <DateSelector currentDate={dateStr} allDates={allDates} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Sortino Ratio" 
            value={summary.sortino_ratio === 0.0 ? "N/A" : summary.sortino_ratio.toFixed(2)} 
            icon={<Shield className="text-emerald-500" />} 
            subValue="Risk Adj. Return"
          />
          <StatCard 
            label="Alpha vs SPY" 
            value={summary.alpha_vs_spy_ytd === 0.0 ? "N/A" : `${(summary.alpha_vs_spy_ytd * 100).toFixed(1)}%`} 
            icon={<TrendingUp className="text-purple-500" />} 
            subValue="YTD Outperformance"
            positive={summary.alpha_vs_spy_ytd > 0}
          />
           <StatCard 
            label="Alpha vs MAG7" 
            value={summary.alpha_vs_mag7_ytd === 0.0 ? "N/A" : `${(summary.alpha_vs_mag7_ytd * 100).toFixed(1)}%`} 
            icon={<Activity className="text-blue-500" />} 
            subValue="YTD Outperformance"
            positive={summary.alpha_vs_mag7_ytd > 0}
          />
           <StatCard 
            label="Max Drawdown" 
            value={summary.max_drawdown === 0.0 ? "N/A" : `${(summary.max_drawdown * 100).toFixed(1)}%`} 
            icon={<Shield className="text-rose-500" />} 
            subValue="Peak to Trough"
            positive={summary.max_drawdown > -0.1} 
          />
        </div>

        {/* Monthly Chart */}
        {monthlyData.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-slate-400" />
              Monthly Performance
            </h2>
             <PerformanceChart data={monthlyData} />
          </section>
        )}

        {/* Manager Commentary */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
            Morning Brief
          </h2>
          <div className="text-slate-800">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="hidden" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-6 first:mt-0" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-5" {...props} />,
                p: ({node, ...props}) => <p className="leading-7 mb-4 text-slate-700" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-slate-700" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
              }}
            >
              {commentary}
            </ReactMarkdown>
          </div>
        </section>

        {/* Ledger & Picks Toggle Section */}
        <LedgerPicksSection 
            ledgerEvents={ledgerEvents} 
            picks={picksWithChange} 
            year={year} 
            month={month} 
            day={day} 
        />

      </main>
    </div>
  );
}

function StatCard({ label, value, icon, subValue, positive }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subValue && (
        <div className={`text-xs mt-1 ${positive === true ? 'text-emerald-600' : positive === false ? 'text-rose-600' : 'text-slate-400'}`}>
          {subValue}
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  subValue?: string;
  positive?: boolean;
}