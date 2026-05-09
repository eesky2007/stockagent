## Plan: Scaffold StockAgent Implementation from PRD

TL;DR: Build a new implementation that matches the PRD using the stated stack (React 19 + Tailwind CSS 4 frontend, Express 4 + tRPC 11 backend, MySQL/TiDB with Drizzle ORM, OAuth-based authentication, and a configurable LLM provider for AI insights, with Finnhub/Yahoo market data). The current workspace contains only the PRD document, so this plan assumes a fresh project scaffold in the same workspace.

**Steps**
1. Confirm the new implementation scope and project setup. Current workspace has only `StockAgent — AI-Powered Stock Research & Investment Platform.md` and no source files, so proceed with scaffold creation.
2. Define architecture and project structure.
   - Backend: `src/server` with Express, tRPC, OAuth auth, market-data clients, AI service, cache layer.
   - Frontend: `src/client` with React 19, Tailwind CSS 4, pages for search, stock detail, watchlist, simulator, digest.
   - Shared types: `src/shared` for domain models, API types, enums.
3. Create foundational repository files.
   - `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`, `README.md`.
4. Implement backend core features.
   - Authentication: OAuth login/logout/session management with role-based access.
   - Stock search and detail endpoints with US/HK support.
   - AI advice generation via a configurable LLM provider, with structured buy/sell/hold output and 4-hour caching.
   - Market data wrappers for Finnhub and Yahoo Finance with quote caching and fallback handling.
   - Watchlist CRUD, CSV import/export, simulator trades, portfolio position management, advice evaluation.
   - Daily digest generation and history endpoints.
5. Implement frontend flows and UI.
   - Search page with symbol/company results and market badges.
   - Stock detail page with quote card, AI advice card, fundamentals, indicators, analyst consensus, news sentiment, add/remove watchlist.
   - Watchlist summary page with sortable table, sparkline, export/import UI.
   - Simulator page with portfolio stats, trade execution panel, performance chart, trade history, advice accuracy summary.
   - Morning briefing page with generate digest action and digest history.
6. Add non-functional and cross-cutting requirements.
   - Caching: 1-minute quote cache, 4-hour advice cache.
   - Error handling: graceful fallback for API failures, partial data display, user-friendly error states.
   - Security: secure cookies, role-based access enforcement, env secret handling, disclaimers.
   - Performance: optimize API response times, use frontend caching and memoization, limit chart data to render efficiently.
   - Accessibility: keyboard navigation, color contrast, responsive/mobile design, dark mode support.
7. Document and verify.
   - Add `README.md` with setup, env vars, run commands, OAuth auth notes, and LLM provider configuration.
   - Create a short test checklist for manual flows and API validation.

**Verification**
1. Confirm repository scaffolding runs locally: install deps and start backend/frontend.
2. Validate key API workflows: search, stock detail, AI advice, watchlist add/remove, paper trade execution, digest generation.
3. Manually verify UI flows: stock research, watchlist management, simulator, daily digest.
4. Confirm caching behavior and error fallback by simulating API failures.

**Decisions**
- The implementation will be a fresh scaffold because no existing agent source code is present in the workspace.
- The platform will align with PRD functional and non-functional requirements but stop short of live trading integration and subscription/monetization.
- Authentication will be generic OAuth-based and AI insights will use a configurable LLM provider rather than any proprietary Manus function.
