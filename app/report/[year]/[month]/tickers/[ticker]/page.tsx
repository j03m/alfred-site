import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getTickerCommentary, getMonthDetail, getAllMonths } from '@/lib/api';
import CommentarySection from '@/app/components/CommentarySection';
import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';

interface PageProps {
  params: Promise<{
    year: string;
    month: string;
    ticker: string;
  }>;
}

export async function generateStaticParams() {
    const months = await getAllMonths();
    const params: Array<{ year: string; month: string; ticker: string }> = [];
    
    const DATA_DIR = path.join(process.cwd(), 'public/data');
    const tickersBaseDir = path.join(DATA_DIR, 'commentary/tickers');
    
    if (!fs.existsSync(tickersBaseDir)) return [];

    // 1. Get a list of all tickers that have at least one commentary file anywhere
    const tickerFirstSeen: Record<string, string> = {}; // Ticker -> first YYYY-MM slug
    const allAvailableMonths = fs.readdirSync(tickersBaseDir)
        .filter(d => /^\d{4}-\d{2}$/.test(d))
        .sort();

    const tickerToMonths: Record<string, string[]> = {};
    for (const slug of allAvailableMonths) {
        const files = fs.readdirSync(path.join(tickersBaseDir, slug));
        for (const file of files) {
            if (file.endsWith('.md')) {
                const ticker = file.replace('.md', '');
                if (!tickerToMonths[ticker]) tickerToMonths[ticker] = [];
                tickerToMonths[ticker].push(slug);
            }
        }
    }

    // 2. For every month in the archive, see which tickers are "active" and have commentary
    for (const m of months) {
        const paddedMonth = m.month_num.toString().padStart(2, '0');
        const currentSlug = `${m.year}-${paddedMonth}`;
        
        // Load the monthly report to find all tickers mentioned
        const reportPath = path.join(DATA_DIR, `monthly/${currentSlug}.json`);
        if (!fs.existsSync(reportPath)) continue;

        try {
            const reportContent = fs.readFileSync(reportPath, 'utf-8');
            const report = JSON.parse(reportContent);
            
            // Gather all tickers from this month's data
            const tickers = new Set<string>();
            report.holdings?.forEach((h: any) => tickers.add(h.Symbol));
            report.predictions?.snapshot?.forEach((p: any) => tickers.add(p.symbol));
            report.ledger?.forEach((l: any) => tickers.add(l.symbol));
            report.performance?.forEach((p: any) => tickers.add(p.ticker));

            for (const ticker of tickers) {
                if (!ticker) continue;
                
                // Does this ticker have ANY commentary at or before this month?
                const availableForTicker = tickerToMonths[ticker] || [];
                const hasCommentary = availableForTicker.some(slug => slug <= currentSlug);

                if (hasCommentary) {
                    params.push({
                        year: m.year.toString(),
                        month: m.month_num.toString(),
                        ticker: ticker
                    });
                }
            }
        } catch (e) {
            console.error(`Error processing params for ${currentSlug}:`, e);
        }
    }
    
    return params;
}

export default async function TickerReportPage({ params }: PageProps) {
  const { year, month, ticker } = await params;
  console.log(`[TickerReportPage] Request for ${ticker} in ${year}-${month}`);
  
  // Get ticker commentary with fallback logic
  const commentary = await getTickerCommentary(year, month, ticker);
  
  if (!commentary) {
    console.error(`[TickerReportPage] No commentary found for ${ticker}`);
    notFound();
  }

  console.log(`[TickerReportPage] Found commentary from ${commentary.actualDate}`);

  // Also get some context about the month for the header
  const { report } = await getMonthDetail(year, month);
  const monthLabel = `${report.meta.month} ${report.meta.year}`;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/report/${year}/${month}`}
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
