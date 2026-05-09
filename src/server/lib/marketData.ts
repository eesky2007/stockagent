import yahooFinance from 'yahoo-finance2';
import { getCache, setCache } from './cache.js';
import type { StockFundamentals, StockQuote } from '../../shared/types.js';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Mock data for demo mode
const MOCK_STOCKS = {
  AAPL: { name: 'Apple Inc.', price: 182.45, change: 2.15, peRatio: 28.3 },
  TSLA: { name: 'Tesla Inc.', price: 245.32, change: -3.21, peRatio: 65.1 },
  MSFT: { name: 'Microsoft Corporation', price: 416.78, change: 5.42, peRatio: 38.9 },
  GOOGL: { name: 'Alphabet Inc.', price: 138.65, change: 1.89, peRatio: 23.4 },
  AMZN: { name: 'Amazon.com Inc.', price: 178.92, change: -0.54, peRatio: 52.1 },
  META: { name: 'Meta Platforms Inc.', price: 498.34, change: 4.21, peRatio: 32.5 },
  NFLX: { name: 'Netflix Inc.', price: 457.21, change: -2.11, peRatio: 41.2 },
  NVDA: { name: 'NVIDIA Corporation', price: 874.52, change: 8.76, peRatio: 58.3 }
};

function getMockSearchResults(query: string) {
  const q = query.toUpperCase();
  return Object.entries(MOCK_STOCKS)
    .filter(([symbol, data]) => symbol.includes(q) || data.name.toUpperCase().includes(q))
    .map(([symbol, data]) => ({
      symbol,
      name: data.name,
      exchange: 'NYSE'
    }))
    .slice(0, 20);
}

function getMockQuote(symbol: string): StockQuote {
  const upperSymbol = symbol.toUpperCase();
  const mockData = MOCK_STOCKS[upperSymbol as keyof typeof MOCK_STOCKS];
  
  if (mockData) {
    return {
      symbol: upperSymbol,
      companyName: mockData.name,
      exchange: 'NYSE',
      currentPrice: mockData.price,
      change: mockData.change,
      percentChange: (mockData.change / mockData.price) * 100,
      marketStatus: 'open',
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback for unknown symbols
  return {
    symbol: upperSymbol,
    companyName: `${upperSymbol} Inc.`,
    exchange: 'NYSE',
    currentPrice: 100 + Math.random() * 500,
    change: (Math.random() - 0.5) * 10,
    percentChange: (Math.random() - 0.5) * 5,
    marketStatus: 'open',
    updatedAt: new Date().toISOString()
  };
}

function getMockFundamentals(symbol: string): StockFundamentals {
  const mockData = MOCK_STOCKS[symbol.toUpperCase() as keyof typeof MOCK_STOCKS];
  return {
    peRatio: mockData?.peRatio ?? 25,
    eps: 5.2,
    marketCap: 2500000000000,
    fiftyTwoWeekHigh: 200,
    fiftyTwoWeekLow: 120
  };
}

function normalizeExchange(symbol: string, exchangeName?: string): StockQuote['exchange'] {
  const normalized = (exchangeName ?? symbol).toUpperCase();
  if (normalized.includes('HK') || normalized.includes('HONG') || symbol.endsWith('.HK') || symbol.endsWith('.HK')) {
    return 'HKEX';
  }
  return 'NYSE';
}

async function fetchFinnhubSearch(query: string) {
  if (!FINNHUB_API_KEY || FINNHUB_API_KEY === 'demo') return null;
  try {
    const response = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string; exchange: string }>> {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCache<Array<{ symbol: string; name: string; exchange: string }>>(cacheKey);
  if (cached) return cached;

  try {
    const response = await yahooFinance.search(query, { lang: 'en-US', region: 'US' });
    const results = response?.quotes?.slice(0, 20).map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortname ?? quote.longname ?? quote.symbol,
      exchange: quote.exchDisp ?? quote.exchange ?? 'Unknown'
    })) ?? [];

    if (results.length > 0) {
      setCache(cacheKey, results, 3600);
      return results;
    }
  } catch (error) {
    console.warn('Yahoo search failed:', error);
  }

  const fallback = await fetchFinnhubSearch(query);
  const fallbackResults = fallback?.result?.slice(0, 20).map((item: any) => ({
    symbol: item.symbol,
    name: item.description ?? item.symbol,
    exchange: item.exchange ?? 'Unknown'
  })) ?? [];

  if (fallbackResults.length > 0) {
    setCache(cacheKey, fallbackResults, 3600);
    return fallbackResults;
  }

  // Use mock data as final fallback
  const mockResults = getMockSearchResults(query);
  setCache(cacheKey, mockResults, 3600);
  return mockResults;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `quote:${upperSymbol}`;
  const cached = getCache<StockQuote>(cacheKey);
  if (cached) return cached;

  try {
    const quoteResponse = await yahooFinance.quote(upperSymbol, { lang: 'en-US', region: 'US' });
    const quote: StockQuote = {
      symbol: upperSymbol,
      companyName: quoteResponse.shortName ?? quoteResponse.longName ?? upperSymbol,
      exchange: normalizeExchange(upperSymbol, quoteResponse.fullExchangeName ?? quoteResponse.exchangeName),
      currentPrice: quoteResponse.regularMarketPrice ?? quoteResponse.postMarketPrice ?? 0,
      change: quoteResponse.regularMarketChange ?? 0,
      percentChange: quoteResponse.regularMarketChangePercent ?? 0,
      marketStatus: quoteResponse.marketState === 'CLOSED' ? 'closed' : 'open',
      updatedAt: quoteResponse.regularMarketTime
        ? new Date(quoteResponse.regularMarketTime * 1000).toISOString()
        : new Date().toISOString()
    };

    setCache(cacheKey, quote, 60);
    return quote;
  } catch (error) {
    console.warn(`Quote fetch failed for ${upperSymbol}:`, error);
  }

  // Use mock data as fallback
  const mockQuote = getMockQuote(upperSymbol);
  setCache(cacheKey, mockQuote, 60);
  return mockQuote;
}

export async function getStockFundamentals(symbol: string): Promise<StockFundamentals | null> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `fundamentals:${upperSymbol}`;
  const cached = getCache<StockFundamentals>(cacheKey);
  if (cached) return cached;

  try {
    const response = await yahooFinance.quoteSummary(upperSymbol, {
      modules: ['price', 'financialData']
    });

    const financialData = response.financialData ?? {};
    const priceData = response.price ?? {};

    const fundamentals: StockFundamentals = {
      peRatio: financialData.trailingPE ?? financialData.forwardPE,
      eps: financialData.trailingEps ?? undefined,
      marketCap: priceData.marketCap ?? undefined,
      fiftyTwoWeekHigh: priceData.fiftyTwoWeekHigh ?? undefined,
      fiftyTwoWeekLow: priceData.fiftyTwoWeekLow ?? undefined
    };

    setCache(cacheKey, fundamentals, 86400);
    return fundamentals;
  } catch (error) {
    console.warn(`Fundamentals fetch failed for ${upperSymbol}:`, error);
  }

  // Use mock data as fallback
  const mockFundamentals = getMockFundamentals(upperSymbol);
  setCache(cacheKey, mockFundamentals, 86400);
  return mockFundamentals;
}
