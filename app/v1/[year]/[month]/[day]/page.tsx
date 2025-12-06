import { getDailySummary, getHoldings, getManagerCommentary } from '@/lib/api';
import { notFound } from 'next/navigation';
import { Activity, TrendingUp, Shield, BarChart3, PieChart } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
  }>
}

export default async function DashboardPage(props: PageProps) {
  const params = await props.params;
  const { year, month, day } = params;
  const dateStr = `${year}-${month}-${day}`;
  
  const summary = await getDailySummary(dateStr);
  const holdings = await getHoldings(dateStr);
  const commentary = await getManagerCommentary(dateStr);

  if (!summary) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Alfred Analysis</h1>
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">v1.0</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {dateStr}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Alfred Score" 
            value={summary.alfred_score.toFixed(2)} 
            icon={<Activity className="text-blue-500" />} 
            subValue={summary.market_mood}
          />
          <StatCard 
            label="Sortino Ratio" 
            value={summary.sortino_ratio.toFixed(2)} 
            icon={<Shield className="text-emerald-500" />} 
            subValue="Risk Adj. Return"
          />
          <StatCard 
            label="Alpha vs SPY" 
            value={`${(summary.alpha_vs_spy_ytd * 100).toFixed(1)}%`} 
            icon={<TrendingUp className="text-purple-500" />} 
            subValue="YTD Outperformance"
            positive={summary.alpha_vs_spy_ytd > 0}
          />
          <StatCard 
            label="Top Sector" 
            value={summary.top_sectors[0]} 
            icon={<PieChart className="text-amber-500" />} 
            subValue="Exposure"
          />
        </div>

        {/* Manager Commentary */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
            Morning Brief
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600 prose-headings:text-slate-800 prose-headings:font-semibold prose-a:text-blue-600">
            <ReactMarkdown>{commentary}</ReactMarkdown>
          </div>
        </section>

        {/* Holdings Table */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold">Current Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Ticker</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Sector</th>
                  <th className="px-6 py-3 font-medium text-right">Weight</th>
                  <th className="px-6 py-3 font-medium text-right">Score</th>
                  <th className="px-6 py-3 font-medium text-center">Bin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holdings.map((h) => (
                  <tr key={h.ticker} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-blue-600 underline">
                      <Link href={`/v1/${year}/${month}/${day}/tickers/${h.ticker}`}>
                        {h.ticker}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{h.name}</td>
                    <td className="px-6 py-3 text-slate-500">{h.sector}</td>
                    <td className="px-6 py-3 text-right font-mono">{(h.weight * 100).toFixed(1)}%</td>
                    <td className="px-6 py-3 text-right font-mono">
                      <span className={h.score > 0.9 ? "text-emerald-600 font-bold" : "text-slate-600"}>
                        {h.score.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        h.bin === 3 ? 'bg-emerald-100 text-emerald-700' : 
                        h.bin === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Bin {h.bin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

function StatCard({ label, value, icon, subValue, positive }: any) {
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
