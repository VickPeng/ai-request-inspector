import { NextResponse } from "next/server";
import records from "@/lib/seed-data";

export async function GET() {
  const modelMap = new Map<
    string,
    { total_requests: number; total_latency: number; total_cost: number; total_tokens: number; success_count: number }
  >();

  records.forEach((r) => {
    const key = r.model;
    const entry = modelMap.get(key) ?? {
      total_requests: 0,
      total_latency: 0,
      total_cost: 0,
      total_tokens: 0,
      success_count: 0,
    };
    entry.total_requests++;
    entry.total_latency += r.latency_ms;
    entry.total_cost += r.cost;
    entry.total_tokens += r.tokens_in + r.tokens_out;
    if (r.status === "success") entry.success_count++;
    modelMap.set(key, entry);
  });

  const models = [...modelMap.entries()]
    .map(([model, e]) => ({
      model,
      provider: records.find((r) => r.model === model)!.provider,
      total_requests: e.total_requests,
      avg_latency: Math.round(e.total_latency / e.total_requests),
      avg_cost: +(e.total_cost / e.total_requests).toFixed(6),
      total_cost: +e.total_cost.toFixed(4),
      avg_tokens: Math.round(e.total_tokens / e.total_requests),
      success_rate: +((e.success_count / e.total_requests) * 100).toFixed(1),
    }))
    .sort((a, b) => b.total_requests - a.total_requests);

  return NextResponse.json({ models });
}
