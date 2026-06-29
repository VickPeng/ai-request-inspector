import { NextResponse } from "next/server";
import records from "@/lib/seed-data";

export async function GET() {
  const total = records.length;
  const success = records.filter((r) => r.status === "success").length;
  const error_c = records.filter((r) => r.status === "error").length;
  const timeout_c = records.filter((r) => r.status === "timeout").length;

  const total_cost = +records.reduce((s, r) => s + r.cost, 0).toFixed(2);
  const total_tokens = records.reduce((s, r) => s + r.tokens_in + r.tokens_out, 0);
  const avg_latency = Math.round(records.reduce((s, r) => s + r.latency_ms, 0) / total);
  const success_rate = +((success / total) * 100).toFixed(1);

  // Daily aggregation
  const dayMap = new Map<string, number>();
  records.forEach((r) => {
    const day = r.timestamp.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  });
  const daily_requests = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));

  // Model ranking
  const modelMap = new Map<string, number>();
  records.forEach((r) => modelMap.set(r.model, (modelMap.get(r.model) ?? 0) + 1));
  const model_ranking = [...modelMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([model, count]) => ({ model, count }));

  // Recent 5
  const recent_requests = [...records]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5)
    .map(({ id, model, status, cost, timestamp }) => ({ id, model, status, cost, timestamp }));

  return NextResponse.json({
    total_requests: total,
    success_count: success,
    error_count: error_c,
    timeout_count: timeout_c,
    total_cost,
    avg_latency,
    total_tokens,
    success_rate,
    daily_requests,
    model_ranking,
    recent_requests,
  });
}
