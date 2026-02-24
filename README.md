# Huxl Factory Dossier

Dark factory pipeline dashboard — real-time monitoring for the Huxl denoising factory.

## Overview

The Huxl Factory Dossier is a cyberpunk-themed TanStack SPA that provides real-time visibility into the Huxl dark factory's multi-pass denoising pipeline. It displays:

- **Active jobs** across all pipeline passes
- **Pass status** (intent, architecture, implementation, integration, groom)
- **Backpressure alerts** when passes are blocked
- **Completion metrics** for delivered work

## Architecture

```
┌─────────────────┐
│  TanStack SPA   │  React + TanStack Query + Router
│  (Vite build)   │  Tailwind CSS (cyberpunk theme)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Caddy Server   │  Static file serving
│  (Docker)       │  SPA routing (try_files)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Storj Bucket   │  Pipeline state data (JSON)
│  (datalake)     │  Metrics + job states
└─────────────────┘
```

## Local Development

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output will be in `./dist`.

## Docker Build & Deployment

### Build with Depot (Clean-Room)

We use [Depot](https://depot.dev) for all builds to ensure a clean, reproducible build environment.

```bash
export DEPOT_PROJECT_ID=mpvz0dt7h5
depot build --project $DEPOT_PROJECT_ID --platform linux/amd64 -t huxl-dossier:latest .
```

**Why Depot?**
- Isolated, ephemeral build environments
- Consistent cross-platform builds
- No local Docker daemon pollution
- Faster builds with caching

### Railway Deployment

The app is configured for deployment on [Railway](https://railway.app) via `railway.toml`.

**Service Configuration:**
- **Port:** 8080
- **Health Check:** `/`
- **Restart Policy:** `ON_FAILURE` (max 3 retries)

**Deploy:**
1. Connect this repo to a Railway service
2. Railway will detect `Dockerfile` and build automatically
3. Service will start Caddy and serve the SPA

**Environment Variables:** None required — the app fetches data from public Storj buckets.

## Project Structure

```
huxl-dossier/
├── src/
│   ├── components/       # React components (PassCard, JobCard, etc.)
│   ├── lib/             # Data fetching, types, utilities
│   ├── routes/          # TanStack Router pages
│   └── main.tsx         # App entry point
├── public/
│   └── icons/           # Cyberpunk-themed pipeline icons
├── Dockerfile           # Multi-stage build (Node + Caddy)
├── Caddyfile            # Static file server config
├── railway.toml         # Railway deployment config
└── vite.config.ts       # Vite build configuration
```

## Technology Stack

- **Framework:** React 19
- **Routing:** TanStack Router
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS (cyberpunk theme)
- **Build:** Vite
- **Server:** Caddy (static file server)
- **Storage:** Storj (decentralized object storage)

## Data Sources

The dossier pulls pipeline state from:

- **Storj Bucket:** `metrics-datalake`
- **Endpoint:** `https://gateway.storjshare.io`
- **Format:** JSON (pipeline states, job metadata, metrics)

## License

MIT
