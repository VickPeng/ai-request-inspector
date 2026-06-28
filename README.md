# AI Request Inspector

A full-stack demo dashboard for monitoring and analyzing AI API request metrics. Built to showcase frontend + backend development skills.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Charts | Recharts (area, bar, radar) |
| Backend | FastAPI (Python) |
| Database | SQLite |
| Data | 500 simulated records across 6 AI models |

## Features

- **Dashboard** — KPI cards (total requests, cost, latency, success rate), daily trend area chart, model usage bar chart, recent requests
- **Request Logs** — Paginated table with search, status/model filter, per-page selector (10/20/50)
- **Model Comparison** — Per-model cards with success rate bar, latency color coding, radar chart, latency bar chart
- **Multi-language** — English / Chinese toggle
- **Theme** — Dark / Light mode toggle
- **Back-to-top** — Floating scroll-to-top button

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The server starts at `http://localhost:8000` and auto-seeds 500 records.  
API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` — the app auto-redirects to `/dashboard`.

If the backend runs on a different port, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8001
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary` | Overview stats + chart data + recent requests |
| GET | `/api/logs` | Paginated logs with filters (`?page=&status=&model=&q=`) |
| GET | `/api/models` | Per-model aggregated metrics |

## Project Structure

```
ai-request-inspector/
├── backend/
│   ├── main.py              # FastAPI app + 3 API endpoints
│   ├── database.py          # SQLite schema + seed data (500 records)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           # Root layout + providers
│       │   ├── dashboard/page.tsx   # KPI cards + area/bar charts
│       │   ├── logs/page.tsx        # Paginated table + filters
│       │   └── models/page.tsx      # Model cards + radar/bar charts
│       ├── components/
│       │   ├── sidebar.tsx          # Navigation + theme/lang toggles
│       │   ├── theme-provider.tsx   # Dark/light theme context
│       │   ├── provider-logo.tsx    # Brand logo component
│       │   ├── back-to-top.tsx      # Scroll-to-top button
│       │   └── ui/                  # shadcn/ui components
│       ├── lib/
│       │   ├── api.ts               # API client
│       │   ├── i18n.ts              # EN/ZH dictionary
│       │   └── i18n-context.tsx     # Multi-language provider
│       └── ...
├── README.md                        # English
├── README.zh-CN.md                  # 中文
└── public/logos/                    # Brand SVG logos
```

## Portfolio

### Screenshots

| Dashboard | Request Logs | Model Comparison |
|:---:|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Logs](screenshots/logs.png) | ![Models](screenshots/models.png) |

Take these screenshots to showcase full-stack development skills on your portfolio — or deploy the demo live and link the URL directly.
