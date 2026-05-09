import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ symbol: string; name: string; exchange: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/trpc/searchStocks?input=${encodeURIComponent(JSON.stringify({ query }))}`, {
        credentials: 'include'
      });
      const payload = await response.json();
      setResults(payload?.result?.data?.results ?? []);
    } catch (err) {
      setError('Unable to search stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Stock Search</h2>
        <p className="mt-2 text-sm text-slate-600">Search by symbol or company name for US and HK stocks.</p>
        <form className="mt-4 flex gap-2" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Search AAPL, Apple, 005930.HK"
          />
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-4">
        {results.length > 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="mt-4 divide-y divide-slate-200">
              {results.map((item) => (
                <Link
                  key={item.symbol}
                  to={`/stock/${encodeURIComponent(item.symbol)}`}
                  className="block py-4 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-medium">{item.symbol}</p>
                      <p className="text-sm text-slate-500">{item.name}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                      {item.exchange}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-slate-600">No search results yet. Enter a symbol or company name above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
