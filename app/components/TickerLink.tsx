import React from 'react';
import Link from 'next/link';

interface TickerLinkProps {
  symbol: string;
  year?: string;
  month?: string;
  versionId?: string;
}

export default function TickerLink({ symbol, year, month, versionId }: TickerLinkProps) {
  if (!year || !month || !versionId) {
    return <span className="font-medium text-slate-900">{symbol}</span>;
  }

  return (
    <Link 
      href={`/${versionId}/report/${year}/${month}/tickers/${symbol}`}
      className="font-bold text-blue-600 hover:text-blue-800 hover:underline decoration-blue-300 underline-offset-2 transition-colors"
    >
      {symbol}
    </Link>
  );
}
