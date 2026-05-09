# Stock Agent Platform — Copilot Instructions

This is the AI-Powered Stock Research & Investment Platform. These instructions apply workspace-wide to all development work in this project.

## Project Overview

**What is Stock Agent?**
A full-stack TypeScript/React application that combines AI-powered stock research with portfolio simulation and market digests. Users can:
- Search and research stocks
- Build and track watchlists
- Simulate trades and calculate returns
- Receive AI-generated market digests

**Tech Stack:**
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, tRPC, Express
- **APIs**: Real-time market data (prices, fundamentals, technicals)
- **AI**: OpenAI integration for research and digest generation

**Project Structure:**
```
src/client/     → React UI (App.tsx, pages/, styles/)
src/server/     → tRPC API routers, market data, AI logic
src/shared/     → Shared TypeScript types
```

## Development Guidelines

### Code Quality
- **TypeScript**: Strict mode always; no `any` types without justification
- **Naming**: Descriptive variable/function names; avoid abbreviations unless standard (e.g., `P&L`)
- **Comments**: Explain *why*, not *what*; code should be self-documenting
- **Error Handling**: Graceful fallbacks for API failures, invalid data, network issues

### Architecture Principles
- **Separation of Concerns**: Frontend handles UI; backend handles data/business logic
- **Type Safety**: Share types via `src/shared/types.ts`; update when adding new data structures
- **Caching**: Market data is expensive—cache aggressively (Redis preferred, in-memory fallback)
- **tRPC Over REST**: All server calls go through tRPC procedures for type safety

### API Integration
- **Market Data**: Fetch via dedicated `src/server/lib/marketData.ts` module
- **AI/Research**: Use `src/server/lib/ai.ts` for OpenAI calls (research, digests)
- **Simulator**: `src/server/lib/simulator.ts` handles trade execution and P&L calculation
- **Caching**: Check `src/server/lib/cache.ts` before external API calls

### File Naming & Organization
- React components: PascalCase (`StockDetail.tsx`, `SearchPage.tsx`)
- Server functions/utilities: camelCase (`fetchStockData.ts`, `calculateMetrics.ts`)
- Pages: PascalCase in `src/client/pages/`
- Shared types: In `src/shared/types.ts`

## Workflow Recommendations

### For UI/Frontend Work
→ Use the **Frontend Developer** agent:
- Building/updating pages and components
- Styling with Tailwind
- Fixing client-side bugs
- Responsive design tasks

### For Server/API Work
→ Use the **Backend Developer** agent:
- Creating tRPC endpoints
- Integrating market data APIs
- Building simulation logic
- Implementing caching strategies

### For Financial Research & Analysis
→ Use the **Stock Research Specialist** agent:
- Researching stocks or sectors
- Gathering market intelligence
- Evaluating investment theses
- Understanding requirements for new features

### For Coordination
→ Use the **default agent**:
- Planning features that span frontend + backend
- Architecture decisions
- Debugging cross-layer issues
- Integrating multiple components

## Common Tasks

| Task | Use Agent | Notes |
|------|-----------|-------|
| Build stock detail page | Frontend Developer | Fetch data via tRPC, display with charts |
| Create watchlist API | Backend Developer | tRPC procedure + persistence + caching |
| Research market trends | Stock Research Specialist | Inform feature requirements |
| Add simulator feature | Backend Developer | Complex logic; coordinate with Frontend for UI |
| Fix responsive layout | Frontend Developer | Tailwind breakpoints; test on mobile |
| Debug data loading | Default/Backend | Could be tRPC issue or frontend query |

## Important Files

| File | Purpose |
|------|---------|
| `src/client/App.tsx` | Main React app routing |
| `src/server/index.ts` | Express server setup + tRPC mount |
| `src/server/trpc.ts` | tRPC instance and middleware |
| `src/shared/types.ts` | All shared TypeScript types |
| `package.json` | Dependencies, scripts |
| `.env.example` | Template for environment variables |

## Environment Setup

Before starting:
1. Copy `.env.example` to `.env` and fill in API keys (market data, OpenAI)
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start dev server (Vite frontend + Express backend)
4. Frontend: `http://localhost:5173`
5. Server: `http://localhost:3000`

## Standards & Best Practices

- **DRY**: Reuse components and utilities; don't duplicate logic
- **Performance**: Profile and optimize data fetching; use caching
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Error Boundaries**: Catch and display errors gracefully
- **Testing**: Verify edge cases before committing (null data, API failures, etc.)

---

*Need help?* Choose the right agent for your task from the workflow recommendations above, or ask the default agent for architecture guidance.
