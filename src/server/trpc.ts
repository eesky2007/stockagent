import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getStockQuote, searchStocks, getStockFundamentals } from './lib/marketData.js';
import { generateStockRecommendation } from './lib/ai.js';
import { getPortfolio, executeTrade } from './lib/simulator.js';
import { generateDigest, getDigest, getDigestHistory } from './lib/digest.js';

type AuthContext = {
  user?: {
    id: string;
    name: string;
    email?: string;
    role: 'user' | 'admin';
  };
};

const t = initTRPC.context<AuthContext>().create();
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({ ctx });
});

type WatchlistItem = {
  symbol: string;
  addedAt: string;
};

const watchlists = new Map<string, WatchlistItem[]>();

function getUserId(ctx: AuthContext) {
  return ctx.user?.id ?? 'guest';
}

async function enrichWatchlistItem(item: WatchlistItem) {
  const quote = await getStockQuote(item.symbol);
  const recommendation = await generateStockRecommendation(item.symbol, quote);
  return { ...item, quote, recommendation };
}

export const appRouter = t.router({
  health: publicProcedure.query(() => ({ ok: true })),

  getCurrentUser: publicProcedure.query(({ ctx }) => ({ user: ctx.user ?? null })),

  searchStocks: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const results = await searchStocks(input.query);
      return { results };
    }),

  getStockQuote: publicProcedure
    .input(z.object({ symbol: z.string().min(1) }))
    .query(async ({ input }) => {
      const quote = await getStockQuote(input.symbol);
      return { quote };
    }),

  getStockFundamentals: publicProcedure
    .input(z.object({ symbol: z.string().min(1) }))
    .query(async ({ input }) => {
      const fundamentals = await getStockFundamentals(input.symbol);
      return { fundamentals };
    }),

  getStockRecommendation: publicProcedure
    .input(z.object({ symbol: z.string().min(1) }))
    .query(async ({ input }) => {
      const quote = await getStockQuote(input.symbol);
      const recommendation = await generateStockRecommendation(input.symbol, quote);
      return { recommendation };
    }),

  addToWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = getUserId(ctx);
      if (!watchlists.has(userId)) watchlists.set(userId, []);
      const list = watchlists.get(userId)!;
      const symbol = input.symbol.toUpperCase();
      if (!list.find(item => item.symbol === symbol)) {
        list.push({ symbol, addedAt: new Date().toISOString() });
      }
      return { success: true };
    }),

  removeFromWatchlist: protectedProcedure
    .input(z.object({ symbol: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = getUserId(ctx);
      const existing = watchlists.get(userId) || [];
      watchlists.set(userId, existing.filter(item => item.symbol !== input.symbol.toUpperCase()));
      return { success: true };
    }),

  importWatchlist: protectedProcedure
    .input(z.object({ symbols: z.array(z.string().min(1)) }))
    .mutation(async ({ input, ctx }) => {
      const userId = getUserId(ctx);
      const list = watchlists.get(userId) ?? [];
      const normalized = new Set(list.map(item => item.symbol));
      const nextItems = input.symbols.map(symbol => symbol.toUpperCase()).filter(symbol => !normalized.has(symbol));
      if (nextItems.length > 0) {
        watchlists.set(userId, [
          ...list,
          ...nextItems.map(symbol => ({ symbol, addedAt: new Date().toISOString() }))
        ]);
      }
      return { success: true };
    }),

  exportWatchlist: protectedProcedure.query(async ({ ctx }) => {
      const userId = getUserId(ctx);
      const list = watchlists.get(userId) || [];
      const rows = await Promise.all(list.map(async (item) => {
        const quote = await getStockQuote(item.symbol);
        return `${item.symbol},"${quote.companyName}",${quote.exchange},${quote.currentPrice.toFixed(2)}`;
      }));
      return { csv: ['symbol,company,exchange,price', ...rows].join('\n') };
  }),

  getWatchlist: protectedProcedure.query(async ({ ctx }) => {
      const userId = getUserId(ctx);
      const list = watchlists.get(userId) || [];
      const enriched = await Promise.all(list.map(enrichWatchlistItem));
      return { watchlist: enriched };
  }),

  getPortfolio: protectedProcedure.query(async ({ ctx }) => {
      const userId = getUserId(ctx);
      const portfolio = await getPortfolio(userId);
      return { portfolio };
  }),

  executeTrade: protectedProcedure
    .input(z.object({
      symbol: z.string().min(1),
      shares: z.number().positive(),
      action: z.enum(['BUY', 'SELL'])
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = getUserId(ctx);
      const portfolio = await executeTrade(userId, input.symbol, input.shares, input.action);
      return { portfolio };
    }),

  generateDigest: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = getUserId(ctx);
      const list = watchlists.get(userId) || [];
      const enriched = await Promise.all(list.map(enrichWatchlistItem));
      const digest = await generateDigest(userId, enriched);
      return { digest };
  }),

  getDigest: protectedProcedure.query(({ ctx }) => {
      const userId = getUserId(ctx);
      const digest = getDigest(userId);
      return { digest };
  }),

  getDigestHistory: protectedProcedure.query(({ ctx }) => {
      const userId = getUserId(ctx);
      const history = getDigestHistory(userId);
      return { history };
  })
});

export type AppRouter = typeof appRouter;
