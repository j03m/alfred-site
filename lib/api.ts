import fs from 'fs';
import path from 'path';

const DATA_ROOT = path.join(process.cwd(), 'data');

export interface DailySummary {
  date: string;
  provenance?: "in_sample" | "simulation" | "live";
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
  unrealized_pl?: number;
}

export interface ActivePick {
  ticker: string;
  name: string;
  sector: string;
  weight: number;
  entry_price?: number;
  exit_price?: number;
  return?: number;
  relative_return?: number;
}

export interface NextPick {
  ticker: string;
  name: string;
  sector: string;
  weight: number;
  score: number;
  bin: number;
}

export interface PerformanceRecord {
  date: string;
  provenance?: "in_sample" | "simulation" | "live";
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
  provenance?: "in_sample" | "simulation" | "live";
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
  open_positions?: {
    ticker: string;
    shares: number;
    cost_basis_per_share: number;
    current_price: number;
    unrealized_pnl: number;
  }[];
}

export interface TickerHistoryItem {
  date: string;
  provenance?: "in_sample" | "simulation" | "live";
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TickerMarker {
  date: string;
  provenance?: "in_sample" | "simulation" | "live";
  type: string;
  price: number;
}

export interface TickerDetail {
  ticker: string;
  name: string;
  sector: string;
  description: string;
  history: TickerHistoryItem[];
  markers: TickerMarker[];
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
    return e.date.startsWith(targetPrefix) && ['buy', 'sell', 'rebalance_sell'].includes(e.event_type);
  }).sort((a: LedgerEvent, b: LedgerEvent) => {
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

export async function getMonthlyPerformance(year: string, month: string, day: string): Promise<PerformanceRecord[] | null> {
  // Try loading monthly_performance.json from the specific date folder
  const filePath = path.join(DATA_ROOT, year, month, day, 'monthly_performance.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
  }
  return null;
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

export async function getActivePicks(dateStr: string): Promise<ActivePick[]> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'active_picks.json');
  
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function getNextPicks(dateStr: string): Promise<NextPick[]> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'next_picks.json');
  
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

export async function getTickerDetail(dateStr: string, ticker: string): Promise<TickerDetail | null> {
  const [y, m, d] = dateStr.split('-');
  // Ticker json is in the date root
  const filePath = path.join(DATA_ROOT, y, m, d, `${ticker}.json`);
  
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export interface PortfolioSnapshotItem {
  ticker: string;
  shares: number;
  entry_price: number;
  invested_capital: number;
  unrealized_gain: number | null;
  status: string;
}

export async function getPortfolioSnapshot(dateStr: string): Promise<PortfolioSnapshotItem[]> {
  const [y, m, d] = dateStr.split('-');
  const filePath = path.join(DATA_ROOT, y, m, d, 'portfolio_snapshot.json');
  
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Fallback to backtest_ledger.json
  const backtestPath = path.join(DATA_ROOT, 'backtest_ledger.json');
  if (fs.existsSync(backtestPath)) {
      const content = await fs.promises.readFile(backtestPath, 'utf-8');
      const json = JSON.parse(content);
      const snapshot = json.ledger.find((e: LedgerEvent) => e.event_type === 'portfolio_snapshot' && e.date === dateStr);
      
      if (snapshot && snapshot.open_positions) {
          return snapshot.open_positions.map((p: any) => ({
              ticker: p.ticker,
              shares: p.shares,
              entry_price: p.cost_basis_per_share,
              invested_capital: p.shares * p.cost_basis_per_share,
              unrealized_gain: p.unrealized_pnl,
              status: 'OPEN'
          }));
      }
  }

  return [];
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
