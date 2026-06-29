"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { getModels, type ModelStats } from "@/lib/api";
import { useTranslation } from "@/lib/i18n-context";
import { useTheme } from "@/components/theme-provider";
import { ProviderLogo } from "@/components/provider-logo";

export default function ModelsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColor = isDark ? "hsl(217 91% 60%)" : "oklch(0.205 0 0)";
  const latencyLeft = isDark ? "hsl(217 91% 60% / 0.75)" : "oklch(0.205 0 0 / 0.75)";
  const latencyRight = isDark ? "hsl(217 91% 60% / 0.35)" : "oklch(0.205 0 0 / 0.35)";
  const [models, setModels] = useState<ModelStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModels()
      .then((res) => setModels(res.models))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  const maxLatency = Math.max(...models.map((m) => m.avg_latency));
  const maxAvgCost = Math.max(...models.map((m) => m.avg_cost));

  const radarData = models.map((m) => ({
    model: m.model,
    [t("status.success")]: Math.round(m.success_rate),
    Speed: Math.round((1 - m.avg_latency / maxLatency) * 100),
    [t("dashboard.total_cost")]: Math.round(
      (1 - m.avg_cost / maxAvgCost) * 100
    ),
    Requests: Math.round(
      (m.total_requests / Math.max(...models.map((x) => x.total_requests))) * 100
    ),
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("models.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("models.subtitle")}
        </p>
      </div>

      {/* Model cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => {
          const latencyColor =
            m.avg_latency < 2000
              ? "text-green-500"
              : m.avg_latency < 2800
              ? "text-yellow-500"
              : "text-red-500";
          return (
            <Card key={m.model} className="overflow-hidden shadow-card card-hover">
              <CardContent className="pt-4 space-y-3">
                {/* Header with logo */}
                <div className="flex items-center gap-3">
                  <ProviderLogo provider={m.provider} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.provider}
                    </p>
                  </div>
                  <span className="text-2xl font-bold tabular-nums shrink-0">
                    {m.total_requests}
                  </span>
                </div>

                {/* Success rate progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Success</span>
                    <span className="font-medium">{m.success_rate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        m.success_rate >= 90
                          ? "bg-green-500"
                          : m.success_rate >= 80
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${m.success_rate}%` }}
                    />
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("models.avg_latency")}
                    </p>
                    <p className={`font-semibold tabular-nums ${latencyColor}`}>
                      {Math.round(m.avg_latency)}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("models.avg_cost")}
                    </p>
                    <p className="font-semibold tabular-nums">
                      ${m.avg_cost.toFixed(5)}
                    </p>
                  </div>
                </div>

                {/* Total cost footer */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-muted-foreground">
                    {t("models.total_cost")}
                  </span>
                  <span className="font-semibold tabular-nums">
                    ${m.total_cost.toFixed(3)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Radar chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            {t("models.radar_chart")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="model"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                name={t("status.success")}
                dataKey={t("status.success")}
                stroke={chartColor}
                fill={chartColor}
                fillOpacity={0.1}
                />
                <Radar
                name="Speed"
                dataKey="Speed"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.1}
                />
                <Radar
                name={t("dashboard.total_cost")}
                dataKey={t("dashboard.total_cost")}
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Latency comparison bar */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            {t("models.latency_chart")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...models].sort((a, b) => a.avg_latency - b.avg_latency)}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
              >
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={latencyLeft} />
                      <stop offset="100%" stopColor={latencyRight} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="model" tick={{ fontSize: 11 }} />
                  <YAxis className="text-muted-foreground" />
                  <Bar
                    dataKey="avg_latency"
                    fill="url(#latencyGradient)"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="avg_latency"
                      position="top"
                      style={{ fontSize: 11, fontWeight: 500 }}
                      className="fill-foreground"
                    />
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
