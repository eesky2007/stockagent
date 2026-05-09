import { callLLM } from './ai.js';

export interface DigestData {
  stocksAnalyzed: number;
  buyCount: number;
  sellCount: number;
  holdCount: number;
  topRecommendations: Array<{
    symbol: string;
    action: string;
    confidence: string;
    rationale: string;
  }>;
  summary: string;
  generatedAt: string;
}

const digestHistory = new Map<string, DigestData[]>();

export async function generateDigest(userId: string, watchlist: any[]): Promise<DigestData> {
  const stocksAnalyzed = watchlist.length;
  const buyCount = watchlist.filter((item: any) => item.recommendation.action === 'BUY').length;
  const sellCount = watchlist.filter((item: any) => item.recommendation.action === 'SELL').length;
  const holdCount = watchlist.filter((item: any) => item.recommendation.action === 'HOLD').length;

  const topRecommendations = watchlist
    .sort((a: any, b: any) => {
      const score = (item: any) => (item.recommendation.confidence === 'high' ? 2 : item.recommendation.confidence === 'medium' ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3)
    .map((item: any) => ({
      symbol: item.symbol,
      action: item.recommendation.action,
      confidence: item.recommendation.confidence,
      rationale: item.recommendation.rationale
    }));

  const summaryPrompt = `Write a professional 3-4 sentence market digest for a retail investor using these watchlist signals:\n- ${stocksAnalyzed} stocks analyzed\n- ${buyCount} BUY recommendations\n- ${sellCount} SELL recommendations\n- ${holdCount} HOLD recommendations\n\nProvide a concise outlook and mention the strongest watchlist ideas.`;
  const summary = await callLLM(summaryPrompt);

  const digest: DigestData = {
    stocksAnalyzed,
    buyCount,
    sellCount,
    holdCount,
    topRecommendations,
    summary,
    generatedAt: new Date().toISOString()
  };

  const history = digestHistory.get(userId) ?? [];
  history.unshift(digest);
  digestHistory.set(userId, history.slice(0, 10));

  return digest;
}

export function getDigest(userId: string): DigestData | undefined {
  return digestHistory.get(userId)?.[0];
}

export function getDigestHistory(userId: string): DigestData[] {
  return digestHistory.get(userId) ?? [];
}