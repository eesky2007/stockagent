import { useEffect, useState } from 'react';

interface DigestData {
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

function DigestPage() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [history, setHistory] = useState<DigestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDigest();
    loadHistory();
  }, []);

  async function loadDigest() {
    setError(null);
    try {
      const response = await fetch('/api/trpc/getDigest', { credentials: 'include' });
      const payload = await response.json();
      setDigest(payload?.result?.data?.digest ?? null);
    } catch {
      setError('Unable to load digest.');
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch('/api/trpc/getDigestHistory', { credentials: 'include' });
      const payload = await response.json();
      setHistory(payload?.result?.data?.history ?? []);
    } catch {
      // Silent if history is unavailable
    }
  }

  async function generateDigest() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trpc/generateDigest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const payload = await response.json();
      setDigest(payload?.result?.data?.digest ?? null);
      loadHistory();
    } catch {
      setError('Unable to generate digest.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Daily AI Digest</h2>
            <p className="mt-3 text-slate-600">Generate watchlist summaries, top recommendations, and market insights.</p>
          </div>
          <button
            onClick={generateDigest}
            disabled={loading}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Digest'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {digest ? (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Digest Summary</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Stocks Analyzed</p>
                <p className="mt-2 text-2xl font-bold">{digest.stocksAnalyzed}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-green-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Buy</p>
                <p className="mt-2 text-2xl font-bold text-green-600">{digest.buyCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-red-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">Sell</p>
                <p className="mt-2 text-2xl font-bold text-red-600">{digest.sellCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">Hold</p>
                <p className="mt-2 text-2xl font-bold text-gray-600">{digest.holdCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Top Recommendations</h3>
            <div className="mt-4 space-y-4">
              {digest.topRecommendations.map((rec, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rec.symbol}</p>
                      <p className="text-sm text-slate-500">{rec.action} ({rec.confidence} confidence)</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{rec.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">AI Market Summary</h3>
            <p className="mt-4 text-slate-700">{digest.summary}</p>
            <p className="mt-4 text-sm text-slate-500">
              Generated: {new Date(digest.generatedAt).toLocaleString()}
            </p>
          </div>

          {history.length > 1 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Digest History</h3>
              <div className="mt-4 grid gap-4">
                {history.slice(1, 4).map((item, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">{new Date(item.generatedAt).toLocaleString()}</p>
                    <p className="mt-2 text-slate-600">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">No digest available. Add stocks to your watchlist and generate a digest.</p>
        </div>
      )}
    </div>
  );
}

export default DigestPage;
