"""AI Request Inspector — FastAPI backend.

Three endpoints:
  GET /api/summary   — dashboard overview + chart data
  GET /api/logs      — paginated request logs with filters
  GET /api/models    — per-model aggregated metrics
"""

import sqlite3
from datetime import datetime, timezone
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db(seed=True)
    yield
    # Shutdown (nothing to clean up)

app = FastAPI(title="AI Request Inspector", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


# ──────────────────────────────────────────────
#  GET /api/summary
# ──────────────────────────────────────────────
@app.get("/api/summary")
def get_summary():
    conn = get_connection()

    # Total counts
    total, = conn.execute("SELECT COUNT(*) FROM requests").fetchone()
    success, = conn.execute("SELECT COUNT(*) FROM requests WHERE status='success'").fetchone()
    error_c, = conn.execute("SELECT COUNT(*) FROM requests WHERE status='error'").fetchone()
    timeout_c, = conn.execute("SELECT COUNT(*) FROM requests WHERE status='timeout'").fetchone()

    # Aggregates
    row = conn.execute("""
        SELECT
            COALESCE(SUM(cost), 0) AS total_cost,
            COALESCE(AVG(latency_ms), 0) AS avg_latency,
            COALESCE(SUM(tokens_in + tokens_out), 0) AS total_tokens
        FROM requests
    """).fetchone()
    total_cost = round(row["total_cost"], 2)
    avg_latency = round(row["avg_latency"], 0)
    total_tokens = row["total_tokens"]
    success_rate = round(success / total * 100, 1) if total else 0

    # Daily request count (last 30 days)
    daily = conn.execute("""
        SELECT DATE(timestamp) AS day, COUNT(*) AS cnt
        FROM requests
        GROUP BY day
        ORDER BY day
    """).fetchall()
    daily_reqs = [{"day": r["day"], "count": r["cnt"]} for r in daily]

    # Model rank
    model_rank = conn.execute("""
        SELECT model, COUNT(*) AS cnt
        FROM requests
        GROUP BY model
        ORDER BY cnt DESC
    """).fetchall()
    model_ranks = [{"model": r["model"], "count": r["cnt"]} for r in model_rank]

    # Recent 5
    recent = conn.execute("""
        SELECT id, model, status, cost, timestamp
        FROM requests
        ORDER BY timestamp DESC
        LIMIT 5
    """).fetchall()
    recent_reqs = [dict(r) for r in recent]

    conn.close()
    return {
        "total_requests": total,
        "success_count": success,
        "error_count": error_c,
        "timeout_count": timeout_c,
        "total_cost": total_cost,
        "avg_latency": avg_latency,
        "total_tokens": total_tokens,
        "success_rate": success_rate,
        "daily_requests": daily_reqs,
        "model_ranking": model_ranks,
        "recent_requests": recent_reqs,
    }


# ──────────────────────────────────────────────
#  GET /api/logs
# ──────────────────────────────────────────────
@app.get("/api/logs")
def get_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    model: str = Query(None),
    q: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
):
    conn = get_connection()
    conditions = []
    params = []

    if status:
        conditions.append("status = ?")
        params.append(status)
    if model:
        conditions.append("model = ?")
        params.append(model)
    if q:
        conditions.append("(model LIKE ? OR provider LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])
    if date_from:
        conditions.append("timestamp >= ?")
        params.append(date_from)
    if date_to:
        conditions.append("timestamp <= ?")
        params.append(date_to)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # Total count
    count_row = conn.execute(f"SELECT COUNT(*) FROM requests {where}", params).fetchone()
    total = count_row[0]

    # Page data
    offset = (page - 1) * per_page
    rows = conn.execute(
        f"SELECT * FROM requests {where} ORDER BY timestamp DESC LIMIT ? OFFSET ?",
        params + [per_page, offset],
    ).fetchall()

    conn.close()
    return {
        "data": [dict(r) for r in rows],
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


# ──────────────────────────────────────────────
#  GET /api/models
# ──────────────────────────────────────────────
@app.get("/api/models")
def get_models():
    conn = get_connection()
    rows = conn.execute("""
        SELECT
            model,
            provider,
            COUNT(*) AS total_requests,
            ROUND(AVG(latency_ms), 0) AS avg_latency,
            ROUND(AVG(cost), 6) AS avg_cost,
            ROUND(SUM(cost), 4) AS total_cost,
            ROUND(AVG(tokens_in + tokens_out), 0) AS avg_tokens,
            ROUND(SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS success_rate
        FROM requests
        GROUP BY model, provider
        ORDER BY total_requests DESC
    """).fetchall()

    conn.close()
    return {"models": [dict(r) for r in rows]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
