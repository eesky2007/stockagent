# StockAgent

**AI-Powered Stock Research & Investment Platform**

A full-stack web application that combines real-time stock market data with AI-powered investment research and portfolio simulation. Build watchlists, research companies with AI insights, simulate trades risk-free, and receive AI-generated market digests.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js Version](https://img.shields.io/badge/Node.js-v20+-green)

## Features

- 📊 **Real-Time Stock Search**: Find US and international stocks by symbol or company name
- 🤖 **AI-Powered Research**: Get buy/sell/hold recommendations with confidence levels and detailed analysis
- 📈 **Watchlist Management**: Track favorite stocks with live AI metrics and performance tracking
- 💹 **Paper Trading Simulator**: Execute risk-free trades, calculate returns, and test investment strategies
- 📰 **Daily AI Digests**: Receive AI-generated market summaries and top recommendations
- 🔐 **OAuth Authentication**: Secure login via Google
- 🎨 **Responsive UI**: Built with React and Tailwind CSS for mobile and desktop

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side navigation
- **tRPC Client** - End-to-end type safety

### Backend
- **Node.js** - JavaScript runtime
- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **TypeScript** - Type safety
- **Drizzle ORM** - Database abstraction (prepared for MySQL/TiDB)
- **OpenID Connect** - OAuth authentication

### External APIs & Services
- **Finnhub** - Real-time market data and fundamentals
- **Yahoo Finance** - Alternative market data source
- **Google Generative AI (Gemini)** - LLM for research and digests
- **Google OAuth** - Authentication provider

## Quick Start

### Prerequisites
- Node.js v20 or higher
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/eesky2007/stockagent.git
   cd stockagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # Server
   PORT=5175
   SESSION_SECRET=your-secure-random-value
   
   # Market data providers
   FINNHUB_API_KEY=your-finnhub-api-key
   
   # LLM provider
   LLM_PROVIDER=gemini
   GOOGLE_API_KEY=your-google-gemini-api-key
   
   # OAuth (Google)
   OAUTH_CLIENT_ID=your-google-oauth-client-id
   OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
   OAUTH_REDIRECT_URI=http://localhost:5175/api/auth/callback
   OAUTH_AFTER_LOGIN_REDIRECT=http://localhost:5173
   
   # Database (optional - defaults to in-memory)
   # DATABASE_URL=mysql://user:password@localhost:3306/stockagent
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will start at:
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5175

### Docker Setup

For a complete environment with database, use Docker Compose:

```bash
docker-compose up --build
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions and troubleshooting.

## Project Structure

```
stockagent/
├── src/
│   ├── client/                 # React frontend
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   ├── pages/             # Page components
│   │   │   ├── SearchPage.tsx
│   │   │   ├── StockDetailPage.tsx
│   │   │   ├── WatchlistPage.tsx
│   │   │   ├── SimulatorPage.tsx
│   │   │   └── DigestPage.tsx
│   │   └── styles.css         # Global styles
│   ├── server/                # Express backend
│   │   ├── index.ts           # Server entry point
│   │   ├── trpc.ts            # tRPC setup
│   │   ├── auth.ts            # Authentication logic
│   │   └── lib/
│   │       ├── marketData.ts  # Market data API integration
│   │       ├── ai.ts          # AI/LLM integration
│   │       ├── simulator.ts   # Trading simulator
│   │       ├── digest.ts      # Market digest generation
│   │       └── cache.ts       # Caching layer
│   └── shared/
│       └── types.ts           # Shared TypeScript types
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vite.config.ts
```

## Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend dev servers
npm run dev:client      # Start frontend dev server only
npm run dev:server      # Start backend dev server only

# Production
npm run build           # Build frontend for production
npm run build:client    # Build React app with Vite
npm run preview         # Preview production build locally
```

## API Documentation

### tRPC Endpoints

The backend exposes tRPC procedures for type-safe communication:

- **Stock Search**: Find stocks by symbol or name
- **Stock Details**: Get detailed metrics, analysis, and recommendations
- **Watchlist**: CRUD operations for watchlists
- **Simulator**: Execute trades, track positions, calculate P&L
- **Digests**: Generate and retrieve market digests
- **Auth**: Login, logout, user profile

All API calls are fully type-checked between frontend and backend via tRPC.

## API Key Setup

### 1. Finnhub (Market Data)
- Visit [finnhub.io](https://finnhub.io)
- Create a free account
- Copy your API key to `.env` as `FINNHUB_API_KEY`

### 2. Google Gemini (AI Research)
- Visit [Google AI Studio](https://aistudio.google.com)
- Generate an API key
- Add to `.env` as `GOOGLE_API_KEY`

### 3. Google OAuth (Authentication)
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project
- Enable Google+ API
- Create OAuth 2.0 credentials (Web application)
- Add authorized redirect URI: `http://localhost:5175/api/auth/callback`
- Copy Client ID and Secret to `.env`

## Development Workflow

### Frontend Development
- React components in `src/client/pages/` and `src/client/App.tsx`
- Styling with Tailwind CSS
- tRPC client for API calls with full type safety
- Hot reload on file changes (Vite)

### Backend Development
- Express server in `src/server/index.ts`
- tRPC procedures for API routes
- Market data integration in `src/server/lib/marketData.ts`
- AI logic in `src/server/lib/ai.ts`
- Auto-restart on file changes

### Testing

Run the test scripts to verify API functionality:
```bash
node test-api.mjs           # Quick API test
node test-api-detailed.mjs  # Detailed API test with mock data
```

## Database Setup (Production)

By default, StockAgent uses in-memory storage (MVP mode). To use a production database:

1. **Create a MySQL database**:
   ```sql
   CREATE DATABASE stockagent;
   ```

2. **Update `.env`**:
   ```env
   DATABASE_URL=mysql://user:password@localhost:3306/stockagent
   ```

3. **Run migrations** (when Drizzle migrations are added):
   ```bash
   npm run migrate
   ```

## Deployment

### Deploy to Azure App Service

```bash
# (Requires Azure CLI and deployment setup)
npm run build
# Push to your App Service
```

### Deploy to Vercel (Frontend) + Azure Functions (Backend)

See deployment guides for specific platforms.

## Architecture & Design

### Type Safety
All types are centralized in `src/shared/types.ts` and shared between frontend and backend via tRPC. This ensures compile-time type safety across the full stack.

### Caching Strategy
Market data is aggressively cached to reduce API calls. The caching layer in `src/server/lib/cache.ts` uses in-memory storage (production: Redis-ready).

### Separation of Concerns
- **Frontend** (`src/client/`): UI, routing, user interactions
- **Backend** (`src/server/`): Business logic, API integrations, data processing
- **Shared** (`src/shared/`): Common types and domain models

## Performance Considerations

- **Vite**: Fast build and hot module replacement for development
- **tRPC**: Minimal data transfer with type safety
- **Caching**: Reduces external API calls significantly
- **Lazy loading**: React components loaded on demand

## Security

- **OAuth 2.0**: Secure authentication via Google
- **TypeScript**: Compile-time type safety prevents many security issues
- **CORS**: Configured to allow frontend-backend communication
- **Session secrets**: Configurable via `.env`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] User authentication and profiles
- [ ] Advanced stock screening filters
- [ ] Real-time price alerts
- [ ] Social features (share watchlists, tips)
- [ ] Multi-account support
- [ ] Tax reporting integration
- [ ] Mobile app (React Native)

## Troubleshooting

### "Port already in use"
```bash
# Find and kill the process using the port
netstat -ano | findstr :5173  # Windows
kill -9 $(lsof -ti:5173)       # macOS/Linux
```

### API keys not working
- Verify keys are correct in `.env`
- Check that APIs are enabled in respective dashboards
- Ensure IP is whitelisted (if applicable)

### Database connection errors
- Verify MySQL is running
- Check DATABASE_URL format
- Ensure database exists and user has access

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for additional troubleshooting.

## License

MIT License - see LICENSE file for details

## Support

- 📧 **Email**: support@stockagent.dev
- 🐛 **Issues**: [GitHub Issues](https://github.com/eesky2007/stockagent/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/eesky2007/stockagent/discussions)

## Acknowledgments

- Finnhub API for real-time market data
- Google Generative AI for AI-powered insights
- React and TypeScript communities
- Tailwind CSS for modern styling

---

**Happy investing! 🚀📈**