"""Database setup and seed data generation for AI Request Inspector."""

import sqlite3
import random
import json
from datetime import datetime, timedelta, timezone

DB_PATH = "requests.db"

MODELS = [
    {"model": "gpt-4o", "provider": "OpenAI"},
    {"model": "claude-sonnet-4.6", "provider": "Anthropic"},
    {"model": "deepseek-v4-pro", "provider": "DeepSeek"},
    {"model": "gemini-2.0-pro", "provider": "Google"},
    {"model": "qwen3.7-max", "provider": "Alibaba"},
    {"model": "MiniMax-M3", "provider": "MiniMax"},
]

STATUSES = ["success", "success", "success", "success", "success",
            "success", "success", "error", "timeout", "success"]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(seed: bool = True):
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            model TEXT NOT NULL,
            provider TEXT NOT NULL,
            tokens_in INTEGER NOT NULL,
            tokens_out INTEGER NOT NULL,
            latency_ms INTEGER NOT NULL,
            cost REAL NOT NULL,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()

    # Check if data exists
    count = conn.execute("SELECT COUNT(*) FROM requests").fetchone()[0]
    if count == 0 and seed:
        _seed_data(conn)
    conn.close()


def _seed_data(conn: sqlite3.Connection):
    """Generate 500 realistic request records over 30 days."""
    now = datetime.now(timezone.utc)
    records = []

    # Weighted selection — Claude is the strongest, most used
    model_pool = []
    weights = [15, 50, 12, 8, 10, 5]  # gpt-4o, claude(最强), deepseek, gemini, qwen, minimax
    for m, w in zip(MODELS, weights):
        model_pool.extend([m] * w)

    for _ in range(500):
        model_entry = random.choice(model_pool)
        model = model_entry["model"]
        tokens_in = random.randint(200, 8000)
        tokens_out = random.randint(50, 3000)
        cost = round(tokens_in * 0.0000025 + tokens_out * 0.00001, 6)

        # Per-model behavioral profile
        if model == "claude-sonnet-4.6":
            # Strongest model: high usage, fast, reliable
            latency_ms = random.randint(200, 800)
            status = "success"
        elif model == "deepseek-v4-pro":
            # Flash model: very fast, always succeeds
            status = "success"
            latency_ms = random.randint(100, 600)
        elif model == "gpt-4o":
            # Popular but can have failures
            status = random.choices(["success", "success", "success", "error", "timeout"],
                                    weights=[8, 8, 8, 1, 1])[0]
            latency_ms = random.randint(800, 2500)
        elif model == "MiniMax-M3":
            # Slow and unreliable
            status = random.choice(["success", "error", "error", "timeout", "success"])
            latency_ms = random.randint(2000, 5000)
        else:
            # Default
            status = random.choice(STATUSES)
            latency_ms = random.randint(500, 3000)
            if status in ("error", "timeout"):
                latency_ms = random.randint(50, 1500)

        minutes_ago = random.randint(0, 30 * 24 * 60)
        ts = now - timedelta(minutes=minutes_ago)

        records.append((
            model_entry["model"],
            model_entry["provider"],
            tokens_in,
            tokens_out,
            latency_ms,
            cost,
            status,
            ts.isoformat(),
        ))

    conn.executemany(
        "INSERT INTO requests (model, provider, tokens_in, tokens_out, "
        "latency_ms, cost, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        records,
    )
    conn.commit()
    print(f"Seeded {len(records)} records")
