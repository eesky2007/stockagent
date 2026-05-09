export type Market = 'NYSE' | 'HKEX';

export type RecommendationAction = 'BUY' | 'SELL' | 'HOLD';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface StockQuote {
  symbol: string;
  companyName: string;
  exchange: Market;
  currentPrice: number;
  change: number;
  percentChange: number;
  marketStatus: 'open' | 'closed' | 'holiday';
  updatedAt: string;
}

export interface StockFundamentals {
  peRatio?: number;
  eps?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface StockRecommendation {
  action: RecommendationAction;
  confidence: ConfidenceLevel;
  targetPrice?: number;
  stopLoss?: number;
  rationale: string;
  bullCase: string;
  bearCase: string;
  riskSummary: string;
  upsidePercent?: number;
}

export interface WatchlistItem {
  symbol: string;
  companyName: string;
  exchange: Market;
  currentPrice: number;
  targetPrice?: number;
  upsidePercent?: number;
  recommendation: StockRecommendation;
}
