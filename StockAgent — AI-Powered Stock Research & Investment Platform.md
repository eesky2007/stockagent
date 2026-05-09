# StockAgent — AI-Powered Stock Research & Investment Platform

## Product Requirements Document (PRD)

---

## EXECUTIVE SUMMARY

### WHAT: Objectives/Goals

Build an AI-powered stock research and investment platform that combines real-time market data, technical analysis, and institutional-grade AI insights to empower retail investors with professional-level investment decision-making tools. The platform enables users to:

- Research stocks with comprehensive fundamental, technical, and sentiment analysis  
- Receive AI-generated buy/sell/hold recommendations with confidence levels and price targets  
- Simulate trading strategies with historical backtesting and performance tracking  
- Maintain watchlists with daily AI-powered briefings and market insights  
- Evaluate the accuracy of AI advice through historical performance metrics

### WHAT: Users/Target Audiences

- **Retail Investors**: Individual investors seeking professional-grade research tools without institutional access  
- **Active Traders**: Day/swing traders requiring real-time data, technical indicators, and quick decision support  
- **Portfolio Managers**: Small fund managers or wealth advisors managing multiple portfolios  
- **Investment Enthusiasts**: Learners and hobbyists wanting to understand investment analysis and backtesting  
- **Financial Advisors**: Advisors seeking AI-assisted research to support client recommendations

### WHY: ROI/Value

**Time Savings**: Eliminate hours of manual research by aggregating data, technical analysis, and AI insights in one platform **Accuracy**: Leverage institutional-grade LLM analysis combined with quantitative technical indicators to reduce emotional bias **Engagement**: Provide interactive simulator, performance tracking, and daily briefings to keep users informed and engaged **New Value**: Track AI advice accuracy over time, learn from historical recommendations, and refine investment strategy **Accessibility**: Democratize institutional-grade investment research for retail investors at a fraction of traditional costs

### HOW: Strategy

**Phase 1 (Current)**: MVP with real-time stock research, AI advice generation, investment simulator, and watchlist management **Phase 2**: Email digest delivery, performance benchmarking vs. market indices, and price alert notifications **Phase 3**: Portfolio optimization, sector analysis, social sentiment integration, and institutional data feeds

### HOW: Technologies

| Component | Technology | Purpose |
| :---- | :---- | :---- |
| **Frontend** | React 19 \+ Tailwind CSS 4 | Responsive, modern UI with real-time updates |
| **Backend** | Express 4 \+ tRPC 11 | Type-safe API layer with automatic client generation |
| **Database** | MySQL/TiDB \+ Drizzle ORM | Relational data for users, watchlists, positions, advice cache |
| **LLM Integration** | Manus Built-in LLM API | AI-powered investment analysis and recommendations |
| **Market Data** | Finnhub API (US), Yahoo Finance (HK) | Real-time quotes, technical data, analyst ratings, news |
| **Authentication** | Manus OAuth | Secure user authentication and session management |
| **Storage** | S3-compatible storage | File uploads, export data, historical records |
| **Hosting** | Manus Cloud (CloudRun) | Serverless deployment with auto-scaling |

### Risks and Challenges

| Risk | Impact | Mitigation |
| :---- | :---- | :---- |
| **API Rate Limits** | Free-tier Finnhub/Yahoo limits may cause service degradation | Implement caching (4-hour TTL), batch requests, graceful fallbacks |
| **LLM Hallucination** | AI recommendations may be inaccurate or misleading | Validate advice against historical performance, show confidence levels, disclaimer on all advice |
| **Market Data Accuracy** | Stale or incorrect data from external APIs | Implement data validation, cross-reference multiple sources, timestamp all data |
| **User Losses from Bad Advice** | Legal liability if users lose money following AI recommendations | Clear disclaimers, educational content, simulator-first approach, no real trading integration |
| **Scalability** | High concurrent users during market hours | Implement caching, CDN for static assets, database indexing, async processing |
| **Multi-Market Complexity** | Supporting US (NYSE) and HK (HKEX) markets with different trading hours | Timezone-aware market status badges, separate technical indicators per market |

### Alternatives Considered

1. **Simplified Approach**: Focus only on US stocks to reduce complexity (rejected: HK market is important for Asia-focused users)  
2. **No AI Analysis**: Provide only data aggregation without LLM recommendations (rejected: AI insights are core value proposition)  
3. **Real Trading Integration**: Allow direct trading from the platform (rejected: regulatory complexity, liability concerns)  
4. **Subscription Model**: Charge users for premium features (rejected: freemium model better for user acquisition)

---

## REQUIREMENTS

### Functional Requirements

#### FR001: User Authentication & Authorization

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR001 | OAuth Login | Users authenticate via Manus OAuth (Google/email) | All Users | User clicks "Sign In" → authorizes OAuth consent → redirected to dashboard | User session created, authenticated state persists across page reloads |
| FR002 | Role-Based Access Control | System enforces role-based permissions (user, admin) | All Users | User attempts to access admin panel → system checks role → grants/denies access | Admin-only features hidden from regular users; API endpoints reject unauthorized requests |
| FR003 | Session Management | Users can logout and session expires after inactivity | All Users | User clicks "Logout" → session cleared → redirected to home page | Session cookie removed, user must re-authenticate to access protected pages |

#### FR004: Stock Research & Discovery

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR004 | Stock Search | Users search stocks by symbol or company name (US & HK) | All Users | User types "AAPL" or "Apple" → system returns matching results with symbol, name, exchange | Search results show symbol, company name, exchange badge (NYSE/HKEX), current price |
| FR005 | Stock Detail Page | Display comprehensive stock information with AI analysis | All Users | User clicks on AAPL → page loads with quote, fundamentals, technical indicators, analyst ratings, news, AI advice | Page shows: current price, 52-week range, P/E ratio, RSI, MACD, analyst consensus, recent news, BUY/SELL/HOLD recommendation |
| FR006 | AI Investment Advice | LLM generates structured buy/sell/hold recommendations | All Users | User views stock detail → AI analyzes fundamentals, technicals, sentiment → generates recommendation | Advice shows: action (BUY/SELL/HOLD), confidence (high/medium/low), target price, stop loss, rationale, bull/bear cases, key risks, upside % |
| FR007 | Technical Indicators | Display real-time technical analysis (RSI, MACD, SMA, EMA) | All Users | User scrolls to technical section → sees interactive chart with overlaid indicators | Chart shows price with SMA50/SMA200, RSI (0-100), MACD with signal line, interpretation (overbought/oversold/bullish/bearish) |
| FR008 | Analyst Consensus | Show aggregated analyst ratings and price targets | All Users | User views analyst section → sees buy/hold/sell counts and mean/high/low price targets | Displays: Strong Buy/Buy/Hold/Sell/Strong Sell counts, mean/median/high/low price targets, last updated date |
| FR009 | News & Sentiment | Display recent news with sentiment analysis (positive/negative/neutral) | All Users | User scrolls to news section → sees 8 most recent headlines with sentiment badges | News list shows: headline, publication date, sentiment badge, link to full article |

#### FR010: Watchlist Management

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR010 | Add to Watchlist | Users can add stocks to personal watchlist | All Users | User clicks "Add to Watchlist" on stock detail → stock added to watchlist | Watchlist updated in real-time, star icon changes to filled, confirmation toast shown |
| FR011 | Remove from Watchlist | Users can remove stocks from watchlist | All Users | User clicks remove icon on watchlist item → stock removed | Watchlist updated, item disappears, confirmation toast shown |
| FR012 | Watchlist Summary Page | Display all watchlisted stocks with latest advice and metrics | All Users | User navigates to "Watchlist Summary" → page loads with table of all watchlisted stocks | Table shows: symbol, company name, current price, target price, upside %, AI advice (BUY/SELL/HOLD), confidence, 7-day sparkline chart |
| FR013 | Sortable Watchlist Table | Users can sort watchlist by any column (price, upside, confidence) | All Users | User clicks "Upside %" column header → table re-sorts by upside descending | Table re-renders with new sort order, sort indicator shows active column |
| FR014 | CSV Export | Users can export watchlist data to CSV file | All Users | User clicks "Export CSV" → file downloads with all watchlist data | CSV file contains: symbol, name, price, target, upside %, advice, confidence, 7-day trend, rationale |
| FR015 | CSV Import | Users can import stocks from CSV file to bulk-add to watchlist | All Users | User clicks "Import CSV" → selects file → system parses symbols → adds all to watchlist | Modal shows import preview, success message displays count of added stocks, watchlist updates |

#### FR016: Investment Simulator

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR016 | Paper Trading | Users can simulate buy/sell trades without real money | All Users | User enters simulator → starts with $100,000 virtual cash → can buy/sell stocks | Portfolio shows: cash balance, positions (symbol, shares, avg cost, current value, P\&L), total portfolio value |
| FR017 | Trade Execution | Users can execute simulated trades with order validation | All Users | User enters quantity → clicks "Buy" → system validates cash available → executes trade | Trade added to positions, cash balance decreases, confirmation toast shown, position appears in portfolio |
| FR018 | Position Management | Users can view, edit, or close positions | All Users | User clicks on position → can edit quantity or close → system updates portfolio | Position updated or removed, P\&L recalculated, portfolio value updated |
| FR019 | Performance Tracking | Display cumulative P\&L, win rate, and performance chart | All Users | User views performance tab → sees portfolio value curve, per-trade P\&L bars, rolling win rate | Chart shows: portfolio value line (blue), per-trade P\&L bars (green/red), rolling win rate (purple), summary stats |
| FR020 | Trade History | Display all closed trades with entry/exit prices and P\&L | All Users | User views trade history → sees list of closed positions with details | Table shows: symbol, entry date/price, exit date/price, shares, P\&L $, P\&L %, win/loss badge |
| FR021 | Advice Evaluation | Track accuracy of AI recommendations vs. actual trade outcomes | All Users | User closes a trade → system compares AI advice (BUY/SELL/HOLD) to actual outcome → calculates score | Advice score stored with trade, performance chart shows rolling advice accuracy trend |

#### FR022: Daily AI Digest

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR022 | Morning Briefing | Generate daily AI summary of watchlist advice and market insights | All Users | User navigates to "Morning Briefing" → sees AI-generated digest of watchlist | Digest shows: top BUY/SELL/HOLD recommendations, bull/bear signal counts, market insights, generated timestamp |
| FR023 | Digest Generation | On-demand or scheduled digest creation with LLM analysis | All Users | User clicks "Generate Today's Digest" → system fetches all watchlist stocks → generates AI summary | Digest displays: stocks analyzed count, BUY/SELL/HOLD breakdown, top recommendations with confidence, AI-generated summary text |
| FR024 | Digest History | Users can view past digests to track advice evolution | All Users | User clicks on past digest → sees historical advice and market context | Digest history shows: date, stocks count, signal breakdown, summary text, allows comparison with current advice |
| FR025 | Digest Notifications | Optional email/in-app notifications for daily digest | All Users | User enables digest notifications → receives notification at 7 AM HKT daily | Email/in-app notification sent with digest link, user can click to view full digest |

#### FR026: Market Status & Trading Hours

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR026 | Market Status Badge | Display whether NYSE/HKEX is currently open or closed | All Users | User views quote card → sees market status badge (green "Open" or gray "Closed") | Badge shows: market name, status, current time in market timezone, next open/close time in tooltip |
| FR027 | Holiday Detection | System recognizes market holidays (US & HK) and shows "Closed (Holiday)" | All Users | User views stock on US Thanksgiving → sees badge "Closed (Holiday)" | Badge displays holiday name in tooltip, users understand why market is closed |
| FR028 | Timezone-Aware Display | All times displayed in user's local timezone (HKT/ET) | All Users | User in Hong Kong views US stock → times shown in HKT with timezone indicator | All timestamps show user's local timezone, market hours shown in both local and market timezone |

#### FR029: Data Caching & Performance

| ID | Name | Description | Role | User Story | Expected Outcome |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FR029 | Advice Caching | Cache AI recommendations for 4 hours to reduce API calls | All Users | User views same stock twice within 4 hours → gets cached advice | Second request returns instantly from cache, timestamp shows when advice was generated |
| FR030 | Quote Caching | Cache real-time quotes for 1 minute to reduce API load | All Users | Multiple users view same stock within 1 minute → all get same cached quote | Quotes update every minute, reducing API calls by 60x during peak hours |
| FR031 | Error Handling | Graceful fallbacks when external APIs fail (Finnhub 403, Yahoo timeout) | All Users | Finnhub API returns 403 (rate limit) → system shows cached data or "Data unavailable" message | User sees partial data or friendly error message instead of crash, app remains responsive |

---

## NON-FUNCTIONAL REQUIREMENTS

### Performance

- **Page Load Time**: Stock detail page loads in \< 2 seconds (including AI advice)  
- **Search Response**: Stock search returns results in \< 500ms  
- **Chart Rendering**: Performance chart with 100+ trades renders in \< 1 second  
- **API Response Time**: tRPC procedures respond in \< 1 second (p95)

### Scalability

- **Concurrent Users**: Support 1,000+ concurrent users during market hours  
- **Database**: Handle 10M+ cached advice records with \< 100ms query time  
- **Storage**: Support 1GB+ of user-uploaded files (CSV imports, exports)

### Security

- **Authentication**: OAuth 2.0 with secure session cookies (HttpOnly, Secure flags)  
- **Authorization**: Role-based access control enforced on all API endpoints  
- **Data Privacy**: User data encrypted at rest, PII never logged  
- **API Keys**: Finnhub/Yahoo API keys stored as environment secrets, never exposed to frontend

### Reliability

- **Uptime**: 99.5% availability during market hours  
- **Data Backup**: Daily backups of user data, watchlists, trades  
- **Graceful Degradation**: If external APIs fail, show cached data or "Data unavailable" instead of crashing

### Accessibility

- **WCAG 2.1 AA**: All pages meet accessibility standards (keyboard navigation, screen reader support)  
- **Mobile Responsive**: Fully functional on mobile devices (iOS Safari, Android Chrome)  
- **Dark Mode**: Support dark theme for reduced eye strain

### Compliance

- **Disclaimers**: Clear disclaimers that AI advice is not financial advice, for educational purposes only  
- **Data Retention**: User data retained for 1 year after account deletion, then purged  
- **Terms of Service**: Users must accept terms before using simulator or AI advice features

---

## USER INTERFACE FLOWS

### Flow 1: Stock Research & AI Advice

Home Page (Search)

  ↓

Stock Search Results

  ↓

Stock Detail Page

  ├─ Quote Card (price, change, market status)

  ├─ AI Advice Card (BUY/SELL/HOLD, confidence, target price)

  ├─ Fundamentals Section (P/E, EPS, market cap)

  ├─ Technical Indicators Chart (RSI, MACD, SMA)

  ├─ Analyst Consensus (ratings, price targets)

  ├─ Recent News (with sentiment)

  └─ Add to Watchlist Button

### Flow 2: Watchlist Management

Watchlist Summary Page

  ├─ Stats Grid (total stocks, BUY count, SELL count, HOLD count, avg upside)

  ├─ Sortable Table

  │   ├─ Symbol, Company Name, Current Price

  │   ├─ Target Price, Upside %, AI Advice, Confidence

  │   ├─ 7-Day Sparkline Chart

  │   └─ Actions (view detail, remove from watchlist)

  ├─ Export CSV Button

  └─ Import CSV Button (modal with file upload)

### Flow 3: Investment Simulator

Simulator Page

  ├─ Portfolio Stats (cash, total value, total P\&L, win rate)

  ├─ Positions Table (symbol, shares, avg cost, current value, P\&L)

  ├─ Performance Chart (portfolio value, per-trade P\&L, rolling win rate)

  ├─ Trade Execution Panel (symbol, quantity, buy/sell buttons)

  ├─ Trade History (closed positions with P\&L)

  └─ Advice Evaluation (accuracy of AI recommendations)

### Flow 4: Daily Digest

Morning Briefing Page

  ├─ Generate Digest Button

  ├─ Latest Digest Display

  │   ├─ Stats (stocks analyzed, BUY/SELL/HOLD counts)

  │   ├─ Top Recommendations (top 3 BUY, top 3 SELL, top 3 HOLD)

  │   ├─ AI-Generated Summary

  │   └─ Market Insights

  ├─ Digest History (past 30 days)

  └─ Notification Settings

---

## SUCCESS METRICS

### User Engagement

- **Daily Active Users (DAU)**: Target 500+ DAU within 3 months  
- **Watchlist Size**: Average 10+ stocks per user watchlist  
- **Simulator Usage**: 30%+ of users create at least one simulated trade  
- **Return Rate**: 40%+ of users return within 7 days

### Product Quality

- **Advice Accuracy**: Track win rate of AI recommendations (target: 55%+ accuracy)  
- **API Uptime**: 99.5%+ during market hours  
- **Page Load Time**: 95%+ of pages load in \< 2 seconds  
- **Error Rate**: \< 0.1% of API requests result in errors

### Business Metrics

- **User Retention**: 60%+ of users active after 30 days  
- **Feature Adoption**: 70%+ of users use watchlist, 40%+ use simulator  
- **User Feedback**: 4.5+/5 average rating on app stores  
- **Referral Rate**: 20%+ of new users referred by existing users

---

## ROADMAP

### Phase 1 (MVP \- Current)

✅ Stock research with real-time data (US & HK) ✅ AI investment advice generation ✅ Watchlist management with CSV import/export ✅ Investment simulator with performance tracking ✅ Daily AI digest with morning briefing ✅ Market status badges with holiday detection ✅ Advice accuracy evaluation

### Phase 2 (Q2 2026\)

- Email digest delivery at user-preferred times  
- Watchlist performance vs. market benchmarks (SPY, HSI)  
- Price alert notifications (email/in-app)  
- Sector analysis and rotation detection  
- Portfolio optimization suggestions  
- Social sentiment integration (Reddit, Twitter)

### Phase 3 (Q3 2026\)

- Multi-portfolio support (track multiple accounts)  
- Institutional data feeds (earnings calendars, insider trading)  
- Options analysis and recommendations  
- Risk assessment and portfolio rebalancing  
- Tax-loss harvesting suggestions  
- Backtesting engine for custom strategies

### Phase 4 (Q4 2026\)

- Mobile app (iOS/Android)  
- Real trading integration (with broker APIs)  
- Community features (share strategies, compare portfolios)  
- Advanced charting (TradingView integration)  
- API access for third-party integrations  
- Premium subscription tier with advanced features

---

## APPENDIX

### A. Glossary

- **AI Advice**: LLM-generated investment recommendation (BUY/SELL/HOLD) with confidence level  
- **Watchlist**: User's personal list of stocks to track  
- **Simulator**: Paper trading environment to practice without real money  
- **Advice Accuracy**: Percentage of AI recommendations that resulted in profitable trades  
- **Market Status**: Whether NYSE or HKEX is currently open for trading  
- **Technical Indicators**: RSI, MACD, SMA used to analyze price trends  
- **Analyst Consensus**: Aggregated buy/sell/hold ratings from Wall Street analysts

### B. External API Dependencies

| API | Purpose | Rate Limit | Cost |
| :---- | :---- | :---- | :---- |
| Finnhub | US stock data, quotes, technicals, news | 60 req/min (free) | Free tier |
| Yahoo Finance | HK stock data, quotes, fundamentals | Unlimited | Free |
| Manus LLM | AI advice generation | 100 req/min | Included |
| Manus OAuth | User authentication | Unlimited | Included |

### C. Database Schema Overview

- **users**: User accounts, roles, preferences  
- **watchlists**: User watchlist items (symbol, user\_id)  
- **advice\_cache**: Cached AI recommendations (symbol, user\_id, advice, expires\_at)  
- **simulator\_positions**: Active trades in simulator (user\_id, symbol, shares, entry\_price)  
- **simulator\_trades**: Closed trades with P\&L (user\_id, symbol, entry\_price, exit\_price, advice\_score)  
- **digest\_notifications**: Daily digest history (user\_id, content, generated\_at)

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Owner**: Product Team  
**Status**: Active  
