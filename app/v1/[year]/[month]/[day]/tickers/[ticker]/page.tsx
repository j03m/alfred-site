import { getTickerReport, getAllDates, getAllTickersForDate } from '@/lib/api';
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

export async function generateStaticParams() {
  const dates = getAllDates();
  const params = [];
  for (const d of dates) {
    const tickers = getAllTickersForDate(d.year, d.month, d.day);
    for (const t of tickers) {
      params.push({
        year: d.year,
        month: d.month,
        day: d.day,
        ticker: t,
      });
    }
  }
  return params;
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
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-slate-800">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="hidden" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 mt-8 first:mt-0" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-6" {...props} />,
              p: ({node, ...props}) => <p className="leading-7 mb-4 text-slate-700" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-slate-700" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-slate-700" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-600 hover:underline font-medium" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
