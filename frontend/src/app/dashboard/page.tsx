"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { getSummary, type Summary } from "@/lib/api";
import { useTranslation } from "@/lib/i18n-context";
import { useTheme } from "@/components/theme-provider";
import {
  Activity,
  DollarSign,
  Zap,
  CheckCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function statusColor(s: string) {
  switch (s) {
    case "success":
      return "bg-green-500/10 text-green-500";
    case "error":
      return "bg-red-500/10 text-red-500";
    case "timeout":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartBlue = "hsl(217 91% 60%)";
  const chartDark = "oklch(0.205 0 0)";
  const areaColor = isDark ? chartBlue : chartDark;
  const barLeft = isDark ? "hsl(217 91% 60% / 0.4)" : "oklch(0.205 0 0 / 0.45)";
  const barRight = isDark ? "hsl(217 91% 60% / 0.75)" : "oklch(0.205 0 0 / 0.85)";
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSummary()
      .then(setData)
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

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">{t("failed_load")}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.total_requests")}
          value={data.total_requests.toLocaleString()}
          icon={Activity}
          subtitle={t("dashboard.failed_count", {
            n: data.error_count + data.timeout_count,
          })}
        />
        <StatCard
          title={t("dashboard.total_cost")}
          value={`$${data.total_cost.toFixed(2)}`}
          icon={DollarSign}
          subtitle={t("dashboard.tokens_count", {
            n: data.total_tokens,
          })}
        />
        <StatCard
          title={t("dashboard.avg_latency")}
          value={`${Math.round(data.avg_latency)}ms`}
          icon={Zap}
        />
        <StatCard
          title={t("dashboard.success_rate")}
          value={`${data.success_rate}%`}
          icon={CheckCircle}
          subtitle={t("dashboard.successful_count", {
            n: data.success_count,
          })}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">
                {t("dashboard.daily_chart")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.daily_requests.length > 1
                  ? `${data.daily_requests[0].day} → ${data.daily_requests[data.daily_requests.length - 1].day}`
                  : `${data.daily_requests.length} days`}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.daily_requests}
                  margin={{ top: 10, right: 10, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={areaColor} stopOpacity={isDark ? 0.3 : 0.12} />
                      <stop offset="100%" stopColor={areaColor} stopOpacity={isDark ? 0.03 : 0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) => d.slice(5)}
                    axisLine={false}
                    tickLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    width={36}
                  />
                  <Tooltip
                    wrapperStyle={{ zIndex: 9999, position: "relative" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "13px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(d) => d}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={areaColor}
                    strokeWidth={2.5}
                    fill="url(#trendFill)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      stroke: areaColor,
                      strokeWidth: 2,
                      fill: "hsl(var(--background))",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("dashboard.model_chart")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.model_ranking} layout="vertical">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={barLeft} />
                      <stop offset="100%" stopColor={barRight} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-muted-foreground" />
                  <YAxis
                    type="category"
                    dataKey="model"
                    tick={{ fontSize: 11 }}
                    width={110}
                    className="text-muted-foreground"
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      style={{ fontSize: 12, fontWeight: 500 }}
                      className="fill-foreground"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("dashboard.recent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recent_requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge className={statusColor(r.status)} variant="secondary">
                    {t(`status.${r.status}` as any)}
                  </Badge>
                  <span className="text-sm font-medium">{r.model}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${r.cost.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
