import fs from 'fs';
import path from 'path';

const DATA_ROOT = path.join(process.cwd(), 'data');

export interface DailySummary {
  date: string;
  alfred_score: number;
  market_mood: string;
  top_sectors: string[];
  alpha_vs_spy_ytd: number;
  portfolio_nav: number;
  benchmark_nav: number;
  sortino_ratio: number;
}

export interface Holding {
  ticker: string;
  name: string;
  weight: number;
  score: number;
  bin: number;
  sector: string;
}

export async function getLatestDate(): Promise<string> {
  const pointerPath = path.join(DATA_ROOT, 'latest.json');
  if (!fs.existsSync(pointerPath)) return '2025-12-06';
  const data = JSON.parse(fs.readFileSync(pointerPath, 'utf-8'));
  return data.latest_date;
}

export async function getDailySummary(dateStr: string): Promise<DailySummary | null> {
  // Date format YYYY-MM-DD -> YYYY/MM/DD
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
