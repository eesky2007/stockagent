---
name: market-data
description: "Market data API integration best practices for src/server/lib/marketData.ts—fetching quotes, fundamentals, technicals, and caching strategies"
applyTo: "src/server/lib/marketData.ts"
---

# Market Data Integration (src/server/lib/marketData.ts)

This file is the single source of truth for all external market data. It abstracts API integration details, handles caching, and provides type-safe data to the rest of the backend.

## Principles

- **Single Responsibility**: All market data fetching goes through this module
- **Aggressive Caching**: Market data is expensive and relatively stable—cache heavily
- **API Abstraction**: Hide provider details from routers; easy to swap providers
- **Fallback Strategy**: Return cached data if API is unavailable
- **Rate Limiting**: Respect API rate limits; batch requests intelligently
- **Error Recovery**: Distinguish between permanent (invalid ticker) and temporary (network) failures

## Patterns

### 1. Fetching Quotes (Real-Time Prices)

```typescript
export const getQuote = async (ticker: string): Promise<Quote | null> => {
  // Check cache first (shorter TTL: 1-5 min for real-time data)
  const cached = await cache.get(`quote:${ticker}`);
  if (cached) return cached;
  
  try {
    // Call external API (e.g., Alpha Vantage, Finnhub, etc.)
    const quote = await externalAPI.fetchQuote(ticker);
    
    // Validate response
    if (!quote || !quote.price) return null;
    
    // Cache for 1 minute (quotes change frequently)
    await cache.set(`quote:${ticker}`, quote, 60);
    
    return quote;
  } catch (error) {
    // Return stale cache if available
    const stale = await cache.get(`quote:${ticker}:stale`);
    if (stale) return stale;
    
    logger.warn(`Failed to fetch quote for ${ticker}`, error);
    return null;
  }
};
```

### 2. Fetching Fundamentals (Company Data)

```typescript
export const getFundamentals = async (ticker: string): Promise<Fundamentals | null> => {
  // Longer TTL: fundamentals don't change daily
  const cached = await cache.get(`fundamentals:${ticker}`);
  if (cached) return cached;
  
  try {
    const fundamentals = await externalAPI.fetchFundamentals(ticker);
    
    // Validate required fields
    if (!fundamentals.pe || !fundamentals.eps) {
      throw new Error("Incomplete fundamentals data");
    }
    
    // Cache for 24 hours
    await cache.set(`fundamentals:${ticker}`, fundamentals, 86400);
    
    return fundamentals;
  } catch (error) {
    logger.error(`Failed to fetch fundamentals for ${ticker}`, error);
    return null;
  }
};
```

### 3. Batch Fetching (Multiple Tickers)

```typescript
export const getMultipleQuotes = async (tickers: string[]): Promise<Map<string, Quote>> => {
  const results = new Map<string, Quote>();
  
  // Split into cached and uncached
  const uncached: string[] = [];
  
  for (const ticker of tickers) {
    const cached = await cache.get(`quote:${ticker}`);
    if (cached) {
      results.set(ticker, cached);
    } else {
      uncached.push(ticker);
    }
  }
  
  // Batch fetch uncached tickers (reduce API calls)
  if (uncached.length > 0) {
    const fetched = await externalAPI.batchFetchQuotes(uncached);
    
    for (const [ticker, quote] of Object.entries(fetched)) {
      if (quote) {
        await cache.set(`quote:${ticker}`, quote, 60);
        results.set(ticker, quote);
      }
    }
  }
  
  return results;
};
```

### 4. Technical Indicators

```typescript
export const getTechnicals = async (ticker: string): Promise<Technicals | null> => {
  const cached = await cache.get(`technicals:${ticker}`);
  if (cached) return cached;
  
  try {
    const data = await externalAPI.fetchOHLC(ticker, "1d"); // Daily bars
    
    // Calculate indicators (RSI, MACD, MA, etc.)
    const technicals = {
      rsi: calculateRSI(data),
      macd: calculateMACD(data),
      sma50: calculateSMA(data, 50),
      sma200: calculateSMA(data, 200),
      support: calculateSupport(data),
      resistance: calculateResistance(data),
    };
    
    // Cache for 1 hour
    await cache.set(`technicals:${ticker}`, technicals, 3600);
    
    return technicals;
  } catch (error) {
    logger.error(`Failed to calculate technicals for ${ticker}`, error);
    return null;
  }
};
```

## Caching Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Quotes (prices) | 1 min | Real-time data; frequent changes |
| Technicals | 1 hour | Calculated from daily data; stable |
| Fundamentals | 24 hours | Updated quarterly; stable |
| Search results | 1 hour | Company list; rarely changes |
| Historical data | 7 days | OHLC data; doesn't change retroactively |

## Error Handling

```typescript
// Distinguish between error types
export const fetchWithFallback = async (ticker: string) => {
  try {
    return await externalAPI.fetch(ticker);
  } catch (error) {
    if (error.code === "INVALID_TICKER") {
      // Permanent error: don't retry, return null
      return null;
    }
    
    if (error.code === "RATE_LIMIT") {
      // Temporary error: return stale cache
      logger.warn(`Rate limited for ${ticker}`);
      return await cache.get(`quote:${ticker}:stale`);
    }
    
    if (error.code === "NETWORK_ERROR") {
      // Temporary error: return cached data
      logger.warn(`Network error for ${ticker}`);
      return await cache.get(`quote:${ticker}`);
    }
    
    throw error; // Unexpected error
  }
};
```

## Types & Contracts

Define all market data types in `src/shared/types.ts`:

```typescript
interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
}

interface Fundamentals {
  pe: number;
  eps: number;
  revenue: number;
  profit: number;
  marketCap: number;
  dividend: number;
  // ...
}

interface Technicals {
  rsi: number;
  macd: number;
  sma50: number;
  sma200: number;
  support: number;
  resistance: number;
}
```

## Performance & Monitoring

- **Track Cache Hit Rate**: Monitor how often cached data is used vs. fetched
- **Monitor API Costs**: Track API calls per ticker; identify heavy users
- **Alert on Failures**: Log failed fetches; alert if a provider goes down
- **Batch Intelligently**: Group requests to external API to reduce call count
- **Rate Limiting**: Implement request queuing to stay within API limits

## Testing Checklist

- [ ] Test with valid ticker (data fetched and cached)
- [ ] Test with invalid ticker (null returned gracefully)
- [ ] Test cache hit (fast response, no API call)
- [ ] Test cache miss (API called, data fetched)
- [ ] Test API failure (stale cache returned)
- [ ] Test batch fetch (multiple tickers, some cached, some fetched)
- [ ] Monitor token/API costs in logs

## Common Pitfalls

- **No Cache**: Every router call hits the API → slow + expensive
- **Wrong TTL**: Quoting 1-day-old fundamentals as current
- **No Fallback**: API down → entire app breaks
- **Silent Failures**: Invalid ticker treated same as network error
- **N+1 Queries**: Fetching one ticker per request instead of batching
- **Stale Fallback Misuse**: Returning very old cached data as recent

---

*Related Files:*
- `src/server/lib/cache.ts` — Caching layer
- `src/shared/types.ts` — Market data types
- `.env.example` — API key configuration
- `src/server/trpc.ts` — Router definitions that use this module
