/**
 * Shared seed data — generated once at module level (survives serverless warm starts).
 * 500 simulated AI API request records across 6 models.
 */

type Record = {
  id: number;
  model: string;
  provider: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  cost: number;
  status: string;
  timestamp: string;
};

const MODELS = [
  { model: "gpt-4o", provider: "OpenAI" },
  { model: "claude-sonnet-4.6", provider: "Anthropic" },
  { model: "deepseek-v4-pro", provider: "DeepSeek" },
  { model: "gemini-2.0-pro", provider: "Google" },
  { model: "qwen3.7-max", provider: "Alibaba" },
  { model: "MiniMax-M3", provider: "MiniMax" },
];

const STATUSES = [
  "success", "success", "success", "success", "success",
  "success", "success", "error", "timeout", "success",
];

function generateRecords(): Record[] {
  const records: Record[] = [];
  const now = Date.now();
  const day = 86_400_000;

  for (let i = 0; i < 500; i++) {
    const me = MODELS[Math.floor(Math.random() * MODELS.length)];
    const tokens_in = 200 + Math.floor(Math.random() * 7800);
    const tokens_out = 50 + Math.floor(Math.random() * 2950);
    let latency = 200 + Math.floor(Math.random() * 4800);
    const cost = +(tokens_in * 0.0000025 + tokens_out * 0.00001).toFixed(6);

    // DeepSeek always succeeds, low latency
    let status: string;
    if (me.model === "deepseek-v4-pro") {
      status = "success";
      latency = 100 + Math.floor(Math.random() * 500);
    } else {
      status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      if (status === "error" || status === "timeout") {
        latency = 50 + Math.floor(Math.random() * 1450);
      }
    }

    // Claude strongest model bias (weighted to appear more often)
    const minutes_ago = Math.floor(Math.random() * 30 * 24 * 60);
    const ts = new Date(now - minutes_ago * 60_000).toISOString();

    records.push({
      id: i + 1,
      model: me.model,
      provider: me.provider,
      tokens_in,
      tokens_out,
      latency_ms: latency,
      cost,
      status,
      timestamp: ts,
    });
  }
  return records;
}

const records: Record[] = generateRecords();

export default records;
