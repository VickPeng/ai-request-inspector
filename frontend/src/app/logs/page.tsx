"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLogs, type LogEntry, type LogsParams } from "@/lib/api";
import { useTranslation } from "@/lib/i18n-context";
import { ChevronLeft, ChevronRight, Search, RotateCcw } from "lucide-react";
import { ProviderLogo } from "@/components/provider-logo";

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

export default function LogsPage() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [perPage, setPerPage] = useState(10);

  function buildParams(): LogsParams {
    return {
      page,
      per_page: perPage,
      status: statusFilter || undefined,
      model: modelFilter || undefined,
      q: search || undefined,
    };
  }

  const fetchData = useCallback(() => {
    setLoading(true);
    getLogs(buildParams())
      .then((res) => {
        setLogs(res.data);
        setPage(res.page);
        setTotalPages(res.total_pages);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, modelFilter, perPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSearch() {
    setPage(1);
    fetchData();
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("logs.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("logs.subtitle", { n: total })}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("logs.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t("logs.all_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("logs.all_status")}</SelectItem>
            <SelectItem value="success">{t("logs.success")}</SelectItem>
            <SelectItem value="error">{t("logs.error")}</SelectItem>
            <SelectItem value="timeout">{t("logs.timeout")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.timestamp")}</TableHead>
                <TableHead>{t("table.model")}</TableHead>
                <TableHead>{t("table.provider")}</TableHead>
                <TableHead className="text-right">{t("table.tokens")}</TableHead>
                <TableHead className="text-right">{t("table.latency")}</TableHead>
                <TableHead className="text-right">{t("table.cost")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("logs.loading")}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("logs.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ProviderLogo provider={log.provider} size={16} />
                        {log.model}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.provider}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {log.tokens_in + log.tokens_out}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {log.latency_ms}ms
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ${log.cost.toFixed(5)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusColor(log.status)}
                        variant="secondary"
                      >
                        {t(`status.${log.status}` as any)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {total > 0
            ? `${total.toLocaleString()} ${t("logs.requests")} · ${totalPages} ${t("logs.pages")}`
            : t("logs.no_results")}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-muted-foreground">{t("logs.per_page")}</span>
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              setPerPage(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("logs.prev")}
            </Button>
            <span className="flex items-center px-2 text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("logs.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
