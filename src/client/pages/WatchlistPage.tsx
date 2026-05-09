import { ChangeEvent, useEffect, useState } from 'react';

interface WatchlistItem {
  symbol: string;
  addedAt: string;
  quote: {
    symbol: string;
    companyName: string;
    exchange: string;
    currentPrice: number;
    change: number;
    percentChange: number;
    marketStatus: string;
    updatedAt: string;
  };
  recommendation: {
    action: string;
    confidence: string;
    targetPrice?: number;
    stopLoss?: number;
    rationale: string;
    bullCase: string;
    bearCase: string;
    riskSummary: string;
    upsidePercent?: number;
  };
}

function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trpc/getWatchlist', { credentials: 'include' });
      const payload = await response.json();
      setWatchlist(payload?.result?.data?.watchlist ?? []);
    } catch {
      setError('Unable to load watchlist.');
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWatchlist(symbol: string) {
    await fetch('/api/trpc/removeFromWatchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ symbol })
    });
    loadWatchlist();
  }

  async function exportWatchlist() {
    const response = await fetch('/api/trpc/exportWatchlist', { credentials: 'include' });
    const payload = await response.json();
    const csv = payload?.result?.data?.csv ?? '';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'watchlist.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importWatchlist() {
    setError(null);
    const symbols = importText
      .split(/\r?\n|,|;/)
      .map((value) => value.trim().toUpperCase())
      .filter((value) => value.length > 0);

    if (symbols.length === 0) {
      setError('Enter one or more symbols to import.');
      return;
    }

    await fetch('/api/trpc/importWatchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ symbols })
    });
    setImportText('');
    loadWatchlist();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportText(reader.result);
      }
    };
    reader.readAsText(file);
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-slate-600">Loading watchlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Watchlist</h2>
            <p className="mt-2 text-sm text-slate-600">Your personal stock watchlist with AI recommendations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportWatchlist}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="h-28 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none focus:border-slate-400"
            placeholder="Paste symbols or CSV text to import (AAPL, TSLA, 0700.HK)"
          />
          <div className="flex flex-col gap-3">
            <label className="block rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <span className="block text-sm font-medium text-slate-700">Upload CSV</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="mt-2 w-full" />
            </label>
            <button
              onClick={importWatchlist}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
            >
              Import Watchlist
            </button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {watchlist.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">No stocks in watchlist. Add stocks from the search page.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Symbol</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Change</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">AI Advice</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Target</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <tr key={item.symbol} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{item.symbol}</p>
                        <p className="text-sm text-slate-500">{item.quote.companyName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">${item.quote.currentPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.quote.change >= 0 ? '+' : ''}{item.quote.change.toFixed(2)} ({item.quote.percentChange.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.recommendation.action === 'BUY' ? 'bg-green-100 text-green-800' :
                        item.recommendation.action === 'SELL' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.recommendation.action} ({item.recommendation.confidence})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.recommendation.targetPrice ? `$${item.recommendation.targetPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removeFromWatchlist(item.symbol)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchlistPage;
