import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'public/data');

export interface GlobalStats {
  total_return: number;
  alpha: number;
  max_drawdown: number;
  sortino: number;
}

export interface PerformancePoint {
  date: string;
  Portfolio_Value: number;
  SPY_Value: number;
  MAG7_Value: number;
}

export interface ArchiveMonth {
  year: number;
  month: string; // "December"
  month_num: number;
  return_pct: number;
  ending_equity: number;
  start_date: string;
  end_date: string;
}

export interface PerformanceEntry {
  ticker: string;
  status: "OPEN" | "CLOSED";
  enter_date: string;
  exit_date: string | null;
  realized_pnl: number;
  unrealized_pnl: number;
  cost_basis: number;
  current_price: number;
  quantity: number;
}

export interface MonthlyReport {
  meta: ArchiveMonth;
  chart: Array<{ date: string; rel_port: number; rel_spy: number; rel_mag7: number }>;
  holdings: Array<{ Symbol: string; Shares: number; CostBasis: number; CurrentPrice: number; UnrealizedPnL: number }>;
  predictions: Array<{ symbol: string; target_weight: number; score: number }>;
  prediction_log: Array<{ date: string; action: "Added" | "Dropped"; symbol: string }>;
  ledger: Array<{ date: string; action: "BUY" | "SELL"; symbol: string; quantity: number; price: number }>;
  performance: Array<PerformanceEntry>;
}

// Helper to safely read JSON
async function readJson<T>(relativePath: string): Promise<T | null> {
    const fullPath = path.join(DATA_DIR, relativePath);
    try {
        if (!fs.existsSync(fullPath)) return null;
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (e) {
        console.error(`Error reading ${relativePath}:`, e);
        return null;
    }
}

export async function getGlobalData(): Promise<{ stats: GlobalStats; history: PerformancePoint[] }> {
    const stats = await readJson<GlobalStats>('stats.json');
    const history = await readJson<PerformancePoint[]>('performance_history.json');

    if (!stats || !history) {
        throw new Error("Failed to load global data (stats.json or performance_history.json missing)");
    }

    return { stats, history };
}

export async function getAllMonths(): Promise<ArchiveMonth[]> {
    const months = await readJson<ArchiveMonth[]>('archive.json');
    if (!months) return [];
    // Sort by date descending (newest first)
    return months.sort((a, b) => b.month_num - a.month_num).sort((a,b) => b.year - a.year);
}

// Raw JSON interface for the monthly report file which differs slightly from the app interface
interface RawMonthlyReport {
    year: number;
    month: number;
    meta: ArchiveMonth;
    chart: Array<{ date: string; rel_port: number; rel_spy: number; rel_mag7: number }>;
    holdings: Array<{ Symbol: string; Shares: number; CostBasis: number; CurrentPrice: number; UnrealizedPnL: number }>;
    predictions: {
        snapshot: Array<{ symbol: string; target_weight: number; score: number }>;
        log: Array<{ date: string; action: "Added" | "Dropped"; symbol: string }>;
    };
    ledger: Array<{ date: string; action: "BUY" | "SELL"; symbol: string; quantity: number; price: number }>;
    performance: Array<PerformanceEntry>;
}

export async function getMonthDetail(year: string, month: string): Promise<{ report: MonthlyReport; commentaryHtml: string }> {
    // Ensure month is 2 digits for the filename
    const paddedMonth = month.padStart(2, '0');
    const slug = `${year}-${paddedMonth}`;
    
    const rawReport = await readJson<RawMonthlyReport>(`monthly/${slug}.json`);
    
    if (!rawReport) {
        throw new Error(`Report not found for ${slug}`);
    }

    // Map Raw -> Interface
    const report: MonthlyReport = {
        meta: rawReport.meta,
        chart: rawReport.chart,
        holdings: rawReport.holdings,
        predictions: rawReport.predictions.snapshot || [],
        prediction_log: rawReport.predictions.log || [],
        ledger: rawReport.ledger,
        performance: rawReport.performance || []
    };

    // Try reading commentary
    let commentaryHtml = "";
    try {
        const commentaryPath = path.join(DATA_DIR, `commentary/${slug}.md`);
        if (fs.existsSync(commentaryPath)) {
            commentaryHtml = await fs.promises.readFile(commentaryPath, 'utf-8');
        }
    } catch (e) {
        console.warn(`Commentary missing for ${slug}`);
    }

    return { report, commentaryHtml };
}

export async function getTickerCommentary(year: string, month: string, ticker: string): Promise<{ content: string; actualDate: string } | null> {
    const paddedMonth = month.padStart(2, '0');
    const requestedSlug = `${year}-${paddedMonth}`;
    
    // 1. Try exact match
    const exactPath = path.join(DATA_DIR, 'commentary/tickers', requestedSlug, `${ticker}.md`);
    if (fs.existsSync(exactPath)) {
        const content = fs.readFileSync(exactPath, 'utf-8');
        return { content, actualDate: requestedSlug };
    }

    // 2. Fallback: Search backwards through available months
    const tickersBaseDir = path.join(DATA_DIR, 'commentary/tickers');
    if (!fs.existsSync(tickersBaseDir)) return null;

    const availableMonths = fs.readdirSync(tickersBaseDir)
        .filter(d => /^\d{4}-\d{2}$/.test(d))
        .sort()
        .reverse();

    for (const slug of availableMonths) {
        // Skip months newer than requested
        if (slug > requestedSlug) continue;

        const fallbackPath = path.join(tickersBaseDir, slug, `${ticker}.md`);
        if (fs.existsSync(fallbackPath)) {
            const content = fs.readFileSync(fallbackPath, 'utf-8');
            return { content, actualDate: slug };
        }
    }

    return null;
}
