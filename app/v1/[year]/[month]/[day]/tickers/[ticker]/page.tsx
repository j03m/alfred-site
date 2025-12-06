import { getTickerReport } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    day: string;
    ticker: string;
  }>
}

export default async function TickerPage(props: PageProps) {
  const params = await props.params;
  const { year, month, day, ticker } = params;
  const dateStr = `${year}-${month}-${day}`;
  
  const report = await getTickerReport(dateStr, ticker);

  if (!report) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center space-x-4">
          <Link href={`/v1/${year}/${month}/${day}`} className="text-slate-500 hover:text-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{ticker} Analysis</h1>
          <div className="text-sm text-slate-500 font-medium border-l pl-4 border-slate-200">
            {dateStr}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-semibold">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
