# StockAgent Docker Setup

## Prerequisites

Install Docker and Docker Compose:
- **Docker Desktop** (Windows/Mac): https://www.docker.com/products/docker-desktop
- **Docker Engine** (Linux): https://docs.docker.com/engine/install/

Verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Build and run containers

From the project root (`c:\Users\Ken.S\AI project`):

```bash
docker-compose up --build
```

This will:
- Build the Node.js application container
- Start the MySQL database
- Expose the frontend on `http://localhost:5173`
- Expose the backend on `http://localhost:5175`

### 2. Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5175/api/health
- **Database**: localhost:3306 (user: `user`, password: `password`)

### 3. View logs

```bash
docker-compose logs -f stockagent
```

### 4. Stop containers

```bash
docker-compose down
```

### 5. Stop and remove volumes (clean slate)

```bash
docker-compose down -v
```

## Environment Variables

The `docker-compose.yml` includes demo values for:
- `FINNHUB_API_KEY`
- `GOOGLE_API_KEY`
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`

To use real API keys, create a `.env` file in the project root:

```
FINNHUB_API_KEY=your-key
GOOGLE_API_KEY=your-key
OAUTH_CLIENT_ID=your-google-client-id
OAUTH_CLIENT_SECRET=your-google-client-secret
```

Then run:
```bash
docker-compose up
```

## Development Workflow

### Hot reload

The Docker setup uses volume mounts, so changes to your code will trigger hot reload:
- Frontend changes reload automatically via Vite
- Backend changes reload via ts-node-dev

Just edit files and save—no rebuild needed.

### Access the database

Connect with a MySQL client:
```
Host: localhost
Port: 3306
User: user
Password: password
Database: stockagent
```

### Run commands inside the container

```bash
docker-compose exec stockagent npm run build
docker-compose exec stockagent npm run dev
```

## Troubleshooting

**Port already in use:**
If `5173` or `5175` are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "5174:5173"  # Map to 5174 instead
  - "5176:5175"  # Map to 5176 instead
```

**Database connection failed:**
Ensure MySQL has started:
```bash
docker-compose logs mysql
```

**Rebuild containers:**
```bash
docker-compose build --no-cache
docker-compose up
```

**Clear everything and start fresh:**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Next Steps

Once running:
1. Search for a stock (e.g., "AAPL")
2. View stock detail and add to watchlist
3. Execute paper trades in the simulator
4. Generate daily digest
