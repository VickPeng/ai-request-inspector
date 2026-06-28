export type Lang = "en" | "zh";

const en = {
  /* Sidebar */
  "nav.dashboard": "Dashboard",
  "nav.logs": "Logs",
  "nav.models": "Models",
  "lang.en": "EN",
  "lang.zh": "中",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "app.title": "AI Request Inspector",

  /* Dashboard */
  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Overview of AI API request metrics",
  "dashboard.total_requests": "Total Requests",
  "dashboard.total_cost": "Total Cost",
  "dashboard.avg_latency": "Avg Latency",
  "dashboard.success_rate": "Success Rate",
  "dashboard.failed_count": "{n} failed",
  "dashboard.tokens_count": "{n} tokens",
  "dashboard.successful_count": "{n} successful",
  "dashboard.daily_chart": "Daily Requests (30 days)",
  "dashboard.model_chart": "Model Usage",
  "dashboard.recent": "Recent Requests",

  /* Logs */
  "logs.title": "Request Logs",
  "logs.subtitle": "Browse all {n} API requests",
  "logs.search": "Search model or provider...",
  "logs.all_status": "All status",
  "logs.success": "Success",
  "logs.error": "Error",
  "logs.timeout": "Timeout",
  "logs.loading": "Loading...",
  "logs.empty": "No results found",
  "logs.page_info": "Page {page} of {total} ({count} total)",
  "logs.prev": "Previous",
  "logs.next": "Next",
  "logs.requests": "requests",
  "logs.pages": "pages",
  "logs.per_page": "Per page",
  "logs.no_results": "No results",

  /* Table headers */
  "table.timestamp": "Timestamp",
  "table.model": "Model",
  "table.provider": "Provider",
  "table.tokens": "Tokens",
  "table.latency": "Latency",
  "table.cost": "Cost",
  "table.status": "Status",

  /* Models */
  "models.title": "Model Comparison",
  "models.subtitle": "Performance and cost metrics across all models",
  "models.requests": "Requests",
  "models.avg_latency": "Avg Latency",
  "models.avg_cost": "Avg Cost",
  "models.total_cost": "Total Cost",
  "models.radar_chart": "Dimensional Comparison (radar)",
  "models.latency_chart": "Average Latency (ms)",

  /* Status colors */
  "status.success": "success",
  "status.error": "error",
  "status.timeout": "timeout",

  /* Common */
  "loading": "Loading...",
  "failed_load": "Failed to load data",
};

const zh: Record<keyof typeof en, string> = {
  "nav.dashboard": "仪表盘",
  "nav.logs": "请求日志",
  "nav.models": "模型对比",
  "lang.en": "EN",
  "lang.zh": "中",
  "theme.light": "浅色",
  "theme.dark": "深色",
  "app.title": "AI 请求监控面板",

  "dashboard.title": "仪表盘",
  "dashboard.subtitle": "AI API 请求指标总览",
  "dashboard.total_requests": "总请求数",
  "dashboard.total_cost": "总花费",
  "dashboard.avg_latency": "平均延迟",
  "dashboard.success_rate": "成功率",
  "dashboard.failed_count": "失败 {n} 条",
  "dashboard.tokens_count": "{n} tokens",
  "dashboard.successful_count": "成功 {n} 条",
  "dashboard.daily_chart": "每日请求量（近30天）",
  "dashboard.model_chart": "模型使用排行",
  "dashboard.recent": "最近请求",

  "logs.title": "请求日志",
  "logs.subtitle": "浏览全部 {n} 条 API 请求",
  "logs.search": "搜索模型或提供商...",
  "logs.all_status": "全部状态",
  "logs.success": "成功",
  "logs.error": "失败",
  "logs.timeout": "超时",
  "logs.loading": "加载中...",
  "logs.empty": "没有找到结果",
  "logs.page_info": "第 {page}/{total} 页（共 {count} 条）",
  "logs.prev": "上一页",
  "logs.next": "下一页",
  "logs.requests": "条请求",
  "logs.pages": "页",
  "logs.per_page": "每页",
  "logs.no_results": "无结果",

  "table.timestamp": "时间",
  "table.model": "模型",
  "table.provider": "提供商",
  "table.tokens": "Token 数",
  "table.latency": "延迟",
  "table.cost": "费用",
  "table.status": "状态",

  "models.title": "模型对比",
  "models.subtitle": "各模型性能与成本指标",
  "models.requests": "请求数",
  "models.avg_latency": "平均延迟",
  "models.avg_cost": "平均费用",
  "models.total_cost": "总费用",
  "models.radar_chart": "多维度对比（雷达图）",
  "models.latency_chart": "平均延迟对比（ms）",

  "status.success": "成功",
  "status.error": "失败",
  "status.timeout": "超时",

  "loading": "加载中...",
  "failed_load": "数据加载失败",
};

export const dictionaries = { en, zh };
export type TranslationKey = keyof typeof en;
