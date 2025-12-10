import fs from 'fs';
import path from 'path';

const DATA_ROOT = path.join(process.cwd(), 'data');

export interface DailySummary {
  date: string;
  alfred_score: number;
  market_mood: string;
  top_sectors: string[];
  alpha_vs_spy_ytd: number;
  alpha_vs_mag7_ytd: number;
  portfolio_nav: number;
  benchmark_nav: number;
  sortino_ratio: number;
  max_drawdown: number;
}

export interface Holding {
  ticker: string;
  name: string;
  weight: number;
  score: number;
  bin: number;
  sector: string;
}

export interface PerformanceRecord {
  date: string;
  model: number;
  spy: number;
  mag7: number;
}

export interface PerformanceData {
  generated_at: string;
  data: PerformanceRecord[];
}

export interface BacktestSummary {
  total_return: number;
  max_drawdown: number;
  sortino_ratio: number;
}

export interface LedgerEvent {
  date: string;
  event_type: 'buy' | 'sell' | 'rebalance_sell' | 'portfolio_snapshot';
  ticker?: string;
  shares?: number;
  entry_price?: number;
  exit_price?: number;
  cost_basis?: number;
  cost_basis_sold?: number;
  realized_pnl?: number;
  cash_change?: number;
  total_portfolio_value?: number;
  cash_balance?: number;
  total_unrealized_pnl?: number;
}

export async function getBacktestSummary(): Promise<BacktestSummary | null> {
  const filePath = path.join(DATA_ROOT, 'backtest_ledger.json');
  if (!fs.existsSync(filePath)) return null;
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const json = JSON.parse(content);
  return json.summary || null;
}

export async function getMonthlyLedger(year: string, month: string): Promise<LedgerEvent[]> {
  const filePath = path.join(DATA_ROOT, 'backtest_ledger.json');
  if (!fs.existsSync(filePath)) return [];
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const json = JSON.parse(content);
  
  const targetPrefix = `${year}-${month}`;
  
  return json.ledger.filter((e: LedgerEvent) => {
    // Filter for events in this month
    // Exclude snapshots for the table usually, or keep them if we want to show EOD summary
    // Let's keep buy/sell/rebalance_sell for the transaction table
    return e.date.startsWith(targetPrefix) && ['buy', 'sell', 'rebalance_sell'].includes(e.event_type);
  }).sort((a: LedgerEvent, b: LedgerEvent) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPerformanceData(): Promise<PerformanceData | null> {
  const filePath = path.join(process.cwd(), 'data', 'performance.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

export async function getLatestDate(): Promise<string> {
  const pointerPath = path.join(DATA_ROOT, 'latest.json');
  if (!fs.existsSync(pointerPath)) return '2025-12-06';
  const data = JSON.parse(fs.readFileSync(pointerPath, 'utf-8'));
  return data.latest_date;
}

export async function getDailySummary(dateStr: string): Promise<DailySummary | null> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'daily_summary.json');
  
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function getHoldings(dateStr: string): Promise<Holding[]> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'holdings.json');
  
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function getManagerCommentary(dateStr: string): Promise<string> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'reports', 'manager_commentary.md');
  
  if (!fs.existsSync(filePath)) return "No commentary available.";
  return fs.readFileSync(filePath, 'utf-8');
}

export async function getTickerReport(dateStr: string, ticker: string): Promise<string | null> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'reports', 'tickers', `${ticker}.md`);
  
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// --- Static Generation Helpers ---

export function getAllDates(): { year: string; month: string; day: string }[] {
  if (!fs.existsSync(DATA_ROOT)) return [];
  
  const dates: { year: string; month: string; day: string }[] = [];
  
  const years = fs.readdirSync(DATA_ROOT).filter(y => /^\d{4}$/.test(y));
  for (const year of years) {
    const yearPath = path.join(DATA_ROOT, year);
    const months = fs.readdirSync(yearPath).filter(m => /^\d{2}$/.test(m));
    for (const month of months) {
      const monthPath = path.join(yearPath, month);
      const days = fs.readdirSync(monthPath).filter(d => /^\d{2}$/.test(d));
      for (const day of days) {
        dates.push({ year, month, day });
      }
    }
  }
  return dates;
}

export function getAllTickersForDate(year: string, month: string, day: string): string[] {
  const tickersDir = path.join(DATA_ROOT, year, month, day, 'reports', 'tickers');
  if (!fs.existsSync(tickersDir)) return [];
  
  return fs.readdirSync(tickersDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}
