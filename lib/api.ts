import path from 'path';
import fs from 'fs';

// --- Registry & Path Helpers ---

export interface RegistryVersion {
  id: string;
  name: string;
  description: string;
  dataset: string;
  model_type: string;
  paths: Record<string, any>;
}

export interface Registry {
  active_version: string;
  versions: Record<string, RegistryVersion>;
}

export async function getRegistry(): Promise<Registry> {
    const registryPath = path.join(process.cwd(), 'registry.json');
    if (!fs.existsSync(registryPath)) {
        throw new Error("Registry file not found at registry.json");
    }
    const content = await fs.promises.readFile(registryPath, 'utf-8');
    return JSON.parse(content) as Registry;
}

export async function getActiveVersionId(): Promise<string> {
    const reg = await getRegistry();
    return reg.active_version;
}

function getDataDir(versionId: string): string {
    // Data is now located at data/versions/{versionId} (Private)
    return path.join(process.cwd(), 'data/versions', versionId);
}

// Helper to safely read JSON relative to a version's data dir
async function readJson<T>(versionId: string, relativePath: string): Promise<T | null> {
    const baseDir = getDataDir(versionId);
    const fullPath = path.join(baseDir, relativePath);
    try {
        if (!fs.existsSync(fullPath)) return null;
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (e) {
        console.error(`Error reading ${relativePath} for version ${versionId}:`, e);
        return null;
    }
}

// --- Domain Interfaces ---

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

// --- Data Access Functions ---

export async function getGlobalData(versionId: string): Promise<{ stats: GlobalStats; history: PerformancePoint[] }> {
    const stats = await readJson<GlobalStats>(versionId, 'stats.json');
    const history = await readJson<PerformancePoint[]>(versionId, 'performance_history.json');

    if (!stats || !history) {
        // Fail softly or throw? Let's throw to indicate bad data for this version.
        // Or return nulls?
        throw new Error(`Failed to load global data for version ${versionId} (stats/history missing)`);
    }

    return { stats, history };
}

export async function getAllMonths(versionId: string): Promise<ArchiveMonth[]> {
    const months = await readJson<ArchiveMonth[]>(versionId, 'archive.json');
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

export async function getMonthDetail(versionId: string, year: string, month: string): Promise<{ report: MonthlyReport; commentaryHtml: string }> {
    // Ensure month is 2 digits for the filename
    const paddedMonth = month.padStart(2, '0');
    const slug = `${year}-${paddedMonth}`;
    
    const rawReport = await readJson<RawMonthlyReport>(versionId, `monthly/${slug}.json`);
    
    if (!rawReport) {
        throw new Error(`Report not found for ${slug} in version ${versionId}`);
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
        const dataDir = getDataDir(versionId);
        const commentaryPath = path.join(dataDir, `commentary/${slug}.md`);
        if (fs.existsSync(commentaryPath)) {
            commentaryHtml = await fs.promises.readFile(commentaryPath, 'utf-8');
        }
    } catch (e) {
        console.warn(`Commentary missing for ${slug} in version ${versionId}`);
    }

    return { report, commentaryHtml };
}

export async function getTickerCommentary(versionId: string, year: string, month: string, ticker: string): Promise<{ content: string; actualDate: string } | null> {
    const paddedMonth = month.padStart(2, '0');
    const requestedSlug = `${year}-${paddedMonth}`;
    const dataDir = getDataDir(versionId);
    
    // 1. Try exact match
    const exactPath = path.join(dataDir, 'commentary/tickers', requestedSlug, `${ticker}.md`);
    if (fs.existsSync(exactPath)) {
        const content = fs.readFileSync(exactPath, 'utf-8');
        return { content, actualDate: requestedSlug };
    }

    // 2. Fallback: Search backwards through available months
    const tickersBaseDir = path.join(dataDir, 'commentary/tickers');
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

export interface ChartData {
  ticker: string;
  period: string;
  candles: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  events: Array<{
    date: string;
    type: string;
    price: number;
    quantity: number;
  }>;
}

export async function getTickerChartData(versionId: string, year: string, month: string, ticker: string): Promise<ChartData | null> {
    const slug = `${year}-${month.padStart(2, '0')}`;
    return await readJson<ChartData>(versionId, `chart_data/${slug}/${ticker}.json`);
}
