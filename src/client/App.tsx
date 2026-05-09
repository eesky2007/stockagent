import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import StockDetailPage from './pages/StockDetailPage';
import WatchlistPage from './pages/WatchlistPage';
import SimulatorPage from './pages/SimulatorPage';
import DigestPage from './pages/DigestPage';

type UserProfile = {
  name: string;
  email?: string;
};

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const payload = await response.json();
        setUser(payload?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-semibold">StockAgent</h1>
            <p className="text-sm text-slate-500">AI-powered stock research and simulator platform.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex gap-3 text-sm text-slate-600">
              <NavLink to="/" className="hover:text-slate-900" end>Search</NavLink>
              <NavLink to="/watchlist" className="hover:text-slate-900">Watchlist</NavLink>
              <NavLink to="/simulator" className="hover:text-slate-900">Simulator</NavLink>
              <NavLink to="/digest" className="hover:text-slate-900">Digest</NavLink>
            </nav>
            <div className="flex items-center gap-2 text-sm">
              {!loadingUser && user ? (
                <>
                  <span className="text-slate-600">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/login"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/stock/:symbol" element={<StockDetailPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/digest" element={<DigestPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
