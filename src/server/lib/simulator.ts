import { getStockQuote } from './marketData.js';

interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

interface Trade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
  pnl: number;
}

interface Portfolio {
  cash: number;
  positions: Position[];
  trades: Trade[];
}

const portfolios = new Map<string, Portfolio>();

function createPortfolio(): Portfolio {
  return { cash: 100000, positions: [], trades: [] };
}

export async function getPortfolio(userId: string): Promise<Portfolio> {
  if (!portfolios.has(userId)) {
    portfolios.set(userId, createPortfolio());
  }

  const portfolio = portfolios.get(userId)!;
  await Promise.all(portfolio.positions.map(async (position) => {
    try {
      const quote = await getStockQuote(position.symbol);
      position.currentValue = position.shares * quote.currentPrice;
      position.pnl = position.currentValue - position.shares * position.avgCost;
      position.pnlPercent = position.avgCost > 0 ? (position.pnl / (position.shares * position.avgCost)) * 100 : 0;
    } catch {
      position.currentValue = position.shares * position.avgCost;
      position.pnl = 0;
      position.pnlPercent = 0;
    }
  }));

  return portfolio;
}

export async function executeTrade(userId: string, symbol: string, shares: number, action: 'BUY' | 'SELL') {
  const portfolio = await getPortfolio(userId);
  const quote = await getStockQuote(symbol);
  const cost = shares * quote.currentPrice;

  if (action === 'BUY') {
    if (portfolio.cash < cost) throw new Error('Insufficient cash');
    portfolio.cash -= cost;
    const existing = portfolio.positions.find(p => p.symbol === symbol.toUpperCase());
    if (existing) {
      const totalShares = existing.shares + shares;
      const totalCost = (existing.shares * existing.avgCost) + cost;
      existing.avgCost = totalCost / totalShares;
      existing.shares = totalShares;
    } else {
      portfolio.positions.push({
        symbol,
        shares,
        avgCost: quote.currentPrice,
        currentValue: cost,
        pnl: 0,
        pnlPercent: 0
      });
    }
  } else if (action === 'SELL') {
    const normalizedSymbol = symbol.toUpperCase();
    const position = portfolio.positions.find(p => p.symbol === normalizedSymbol);
    if (!position || position.shares < shares) throw new Error('Insufficient shares');
    portfolio.cash += cost;
    position.shares -= shares;
    if (position.shares === 0) {
      portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
    }
  }

  const trade: Trade = {
    id: Date.now().toString(),
    symbol: symbol.toUpperCase(),
    action,
    shares,
    price: quote.currentPrice,
    timestamp: new Date().toISOString(),
    pnl: action === 'SELL' ? (quote.currentPrice - (portfolio.positions.find((p) => p.symbol === symbol.toUpperCase())?.avgCost ?? 0)) * shares : 0
  };
  portfolio.trades.push(trade);

  // Update P&L
  portfolio.positions.forEach(pos => {
    const currentQuote = quote; // Assume same for simplicity
    pos.currentValue = pos.shares * currentQuote.currentPrice;
    pos.pnl = pos.currentValue - (pos.shares * pos.avgCost);
    pos.pnlPercent = (pos.pnl / (pos.shares * pos.avgCost)) * 100;
  });

  return portfolio;
}