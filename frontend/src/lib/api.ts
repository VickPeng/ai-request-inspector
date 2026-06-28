const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface Summary {
  total_requests: number;
  success_count: number;
  error_count: number;
  timeout_count: number;
  total_cost: number;
  avg_latency: number;
  total_tokens: number;
  success_rate: number;
  daily_requests: { day: string; count: number }[];
  model_ranking: { model: string; count: number }[];
  recent_requests: { id: number; model: string; status: string; cost: number; timestamp: string }[];
}

export interface LogEntry {
  id: number;
  model: string;
  provider: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost: number;
  status: string;
  timestamp: string;
}

export interface LogsResponse {
  data: LogEntry[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ModelStats {
  model: string;
  provider: string;
  total_requests: number;
  avg_latency: number;
  avg_cost: number;
  total_cost: number;
  avg_tokens: number;
  success_rate: number;
}

export interface ModelsResponse {
  models: ModelStats[];
}

export interface LogsParams {
  page?: number;
  per_page?: number;
  status?: string;
  model?: string;
  q?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function getSummary(): Promise<Summary> {
  return fetchJson<Summary>(`${API_BASE}/api/summary`);
}

export function getLogs(params: LogsParams = {}): Promise<LogsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));
  if (params.status) qs.set("status", params.status);
  if (params.model) qs.set("model", params.model);
  if (params.q) qs.set("q", params.q);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  return fetchJson<LogsResponse>(`${API_BASE}/api/logs?${qs.toString()}`);
}

export function getModels(): Promise<ModelsResponse> {
  return fetchJson<ModelsResponse>(`${API_BASE}/api/models`);
}
