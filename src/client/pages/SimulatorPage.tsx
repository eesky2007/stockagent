import { FormEvent, useEffect, useState } from 'react';

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
  pnl?: number;
}

interface Portfolio {
  cash: number;
  positions: Position[];
  trades: Trade[];
}

function SimulatorPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeShares, setTradeShares] = useState('');
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [trading, setTrading] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    setLoading(true);
    const response = await fetch('/api/trpc/getPortfolio', { credentials: 'include' });
    const payload = await response.json();
    setPortfolio(payload?.result?.data?.portfolio ?? null);
    setLoading(false);
  }

  async function executeTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tradeSymbol.trim() || !tradeShares.trim()) return;

    setTrading(true);
    try {
      const response = await fetch('/api/trpc/executeTrade', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: tradeSymbol.trim().toUpperCase(),
          shares: parseInt(tradeShares),
          action: tradeAction
        })
      });
      const payload = await response.json();
      setPortfolio(payload?.result?.data?.portfolio ?? portfolio);
      setTradeSymbol('');
      setTradeShares('');
    } catch {
      // Keep the current portfolio and show an error in the UI if needed
    } finally {
      setTrading(false);
    }
  }

  const totalValue = portfolio ? portfolio.cash + portfolio.positions.reduce((sum, pos) => sum + pos.currentValue, 0) : 0;
  const totalPnl = portfolio ? totalValue - 100000 : 0;
  const winRate = portfolio && portfolio.trades.length > 0
    ? portfolio.trades.filter(t => (t.pnl ?? 0) > 0).length / portfolio.trades.length
    : 0;

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Investment Simulator</h2>
        <p className="mt-3 text-slate-600">Build simulated portfolios, execute paper trades, and track performance over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Cash Balance</h3>
          <p className="mt-4 text-2xl font-bold">${portfolio?.cash?.toLocaleString() ?? '0'}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Total Value</h3>
          <p className="mt-4 text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Total P&L</h3>
          <p className={`mt-4 text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()} ({((totalPnl / 100000) * 100).toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Trade Execution</h3>
        <form className="mt-4 flex gap-4" onSubmit={executeTrade}>
          <input
            value={tradeSymbol}
            onChange={(e) => setTradeSymbol(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Symbol (e.g., AAPL)"
          />
          <input
            type="number"
            value={tradeShares}
            onChange={(e) => setTradeShares(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Shares"
            min="1"
          />
          <select
            value={tradeAction}
            onChange={(e) => setTradeAction(e.target.value as 'BUY' | 'SELL')}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
          >
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
          <button
            type="submit"
            disabled={trading}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {trading ? 'Executing...' : 'Execute Trade'}
          </button>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Positions</h3>
        {portfolio?.positions?.length === 0 ? (
          <p className="mt-4 text-slate-600">No positions yet. Execute a trade to get started.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Symbol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Shares</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Avg Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Current Value</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.positions?.map((pos) => (
                  <tr key={pos.symbol} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium">{pos.symbol}</td>
                    <td className="py-3 px-4">{pos.shares}</td>
                    <td className="py-3 px-4">${pos.avgCost.toFixed(2)}</td>
                    <td className="py-3 px-4">${pos.currentValue.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Trade History</h3>
        {portfolio?.trades?.length === 0 ? (
          <p className="mt-4 text-slate-600">No trades yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Symbol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Shares</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.trades?.slice().reverse().map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={trade.action === 'BUY' ? 'text-green-600' : 'text-red-600'}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.shares}</td>
                    <td className="py-3 px-4">${trade.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{new Date(trade.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulatorPage;
