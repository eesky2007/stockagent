import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function StockDetailPage() {
  const { symbol } = useParams();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<any>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [watchlistStatus, setWatchlistStatus] = useState<'idle' | 'adding' | 'added'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!symbol) return;
      setLoading(true);
      setError(null);

      try {
        const quoteResponse = await fetch(`/api/trpc/getStockQuote?input=${encodeURIComponent(JSON.stringify({ symbol }))}`, {
          credentials: 'include'
        });
        const quotePayload = await quoteResponse.json();
        setQuote(quotePayload?.result?.data?.quote ?? null);

        const [fundResponse, recResponse] = await Promise.all([
          fetch(`/api/trpc/getStockFundamentals?input=${encodeURIComponent(JSON.stringify({ symbol }))}`, { credentials: 'include' }),
          fetch(`/api/trpc/getStockRecommendation?input=${encodeURIComponent(JSON.stringify({ symbol }))}`, { credentials: 'include' })
        ]);

        const fundPayload = await fundResponse.json();
        const recPayload = await recResponse.json();

        setFundamentals(fundPayload?.result?.data?.fundamentals ?? null);
        setRecommendation(recPayload?.result?.data?.recommendation ?? null);
      } catch (err) {
        setError('Unable to load stock details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [symbol]);

  async function addToWatchlist() {
    if (!symbol) return;
    setWatchlistStatus('adding');
    try {
      await fetch('/api/trpc/addToWatchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ symbol: symbol.toUpperCase() })
      });
      setWatchlistStatus('added');
    } catch {
      setWatchlistStatus('idle');
      setError('Unable to add to watchlist.');
    }
  }

  if (!symbol) {
    return <div className="rounded-3xl bg-white p-6 shadow-sm">Invalid stock symbol.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{symbol.toUpperCase()}</h2>
            <p className="mt-1 text-sm text-slate-600">AI-powered recommendation, quote details, and fundamentals.</p>
          </div>
          <button
            onClick={addToWatchlist}
            disabled={watchlistStatus === 'adding' || watchlistStatus === 'added'}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {watchlistStatus === 'adding' ? 'Adding...' : watchlistStatus === 'added' ? 'Added' : 'Add to Watchlist'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading stock information...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-wide text-slate-600">Price</p>
                <p className="mt-3 text-3xl font-semibold">${quote?.currentPrice.toFixed(2)}</p>
                <p className={quote?.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {quote?.change >= 0 ? '+' : ''}{quote?.change.toFixed(2)} ({quote?.percentChange.toFixed(2)}%)
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-wide text-slate-600">Market</p>
                <p className="mt-3 text-xl font-semibold">{quote?.exchange}</p>
                <p className="mt-2 text-sm text-slate-500">Status: {quote?.marketStatus}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-wide text-slate-600">Updated</p>
                <p className="mt-3 text-sm text-slate-500">{new Date(quote?.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">AI Recommendation</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Action</p>
                <p className="mt-2 text-2xl font-semibold">{recommendation?.action ?? 'HOLD'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Confidence</p>
                <p className="mt-2 text-2xl font-semibold capitalize">{recommendation?.confidence ?? 'medium'}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Target Price</p>
                <p className="mt-2 text-lg font-semibold">{recommendation?.targetPrice ? `$${recommendation.targetPrice.toFixed(2)}` : '-'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Stop Loss</p>
                <p className="mt-2 text-lg font-semibold">{recommendation?.stopLoss ? `$${recommendation.stopLoss.toFixed(2)}` : '-'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Upside</p>
                <p className="mt-2 text-lg font-semibold">{recommendation?.upsidePercent ? `${recommendation.upsidePercent.toFixed(1)}%` : '-'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-700">Rationale</p>
              <p className="text-slate-600">{recommendation?.rationale ?? 'No recommendation available.'}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Bull Case</p>
                  <p className="mt-2 text-slate-600">{recommendation?.bullCase ?? '-'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Bear Case</p>
                  <p className="mt-2 text-slate-600">{recommendation?.bearCase ?? '-'}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Risk Summary</p>
                <p className="mt-2 text-slate-600">{recommendation?.riskSummary ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Fundamentals</h3>
            {fundamentals ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-600">P/E Ratio</p>
                  <p className="mt-2 text-xl font-semibold">{fundamentals.peRatio ?? '—'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-600">EPS</p>
                  <p className="mt-2 text-xl font-semibold">{fundamentals.eps ?? '—'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-600">Market Cap</p>
                  <p className="mt-2 text-xl font-semibold">{fundamentals.marketCap ? `$${Number(fundamentals.marketCap).toLocaleString()}` : '—'}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-slate-500">Fundamental data unavailable for this ticker.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockDetailPage;
