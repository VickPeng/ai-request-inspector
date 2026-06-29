import { NextRequest, NextResponse } from "next/server";
import records from "@/lib/seed-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const per_page = Math.min(100, Math.max(1, Number(searchParams.get("per_page")) || 20));
  const status = searchParams.get("status");
  const model = searchParams.get("model");
  const q = searchParams.get("q");
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");

  let filtered = [...records];

  if (status) filtered = filtered.filter((r) => r.status === status);
  if (model) filtered = filtered.filter((r) => r.model === model);
  if (q) {
    const lq = q.toLowerCase();
    filtered = filtered.filter(
      (r) => r.model.toLowerCase().includes(lq) || r.provider.toLowerCase().includes(lq)
    );
  }
  if (date_from) filtered = filtered.filter((r) => r.timestamp >= date_from);
  if (date_to) filtered = filtered.filter((r) => r.timestamp <= date_to);

  filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const total = filtered.length;
  const total_pages = Math.max(1, Math.ceil(total / per_page));
  const offset = (page - 1) * per_page;
  const data = filtered.slice(offset, offset + per_page).map(({ id, model, provider, tokens_in, tokens_out, latency_ms, cost, status, timestamp }) => ({
    id, model, provider, tokens_in, tokens_out, latency_ms, cost, status, timestamp,
  }));

  return NextResponse.json({ data, page, per_page, total, total_pages });
}
