import React from "react";
import { Box, Grid } from "@mui/material";
import moment from "moment";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import {
  useShipmentsPerformanceQuery,
  exportShipmentsPerformance,
  type PerformanceChartPoint,
  type PerformancePeriod,
  type ProviderRow,
} from "query/shipmentsPerformance";

const FONT = "'Cairo', sans-serif";

const PERIODS: Array<{ id: PerformancePeriod; label: string }> = [
  { id: "daily", label: "يومي" },
  { id: "weekly", label: "أسبوعي" },
  { id: "monthly", label: "شهري" },
  { id: "custom", label: "حسب التاريخ" },
];

const TH: React.CSSProperties = {
  background: HX.surface2,
  borderBottom: `1px solid ${HX.border}`,
  color: HX.tx2,
  fontFamily: FONT,
  fontSize: "11px",
  fontWeight: 700,
  padding: "11px 14px",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  borderBottom: `0.5px solid ${HX.border}`,
  color: HX.tx,
  fontFamily: FONT,
  fontSize: "12px",
  padding: "11px 14px",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const formatNumber = (value: number): string => value.toLocaleString("en-US", {
  maximumFractionDigits: 2,
});

const formatChartLabel = (point: PerformanceChartPoint, period: PerformancePeriod, itemCount: number): string => {
  const parsed = moment.utc(point.label, ["YYYY-MM-DD", "YYYY-MM"], true);
  if (!parsed.isValid()) return point.label;

  if (period === "monthly") {
    return new Intl.DateTimeFormat("ar-EG", { month: "short", year: "numeric", timeZone: "UTC" })
      .format(parsed.toDate());
  }
  if (period === "weekly") {
    return `أسبوع ${new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", timeZone: "UTC" })
      .format(parsed.toDate())}`;
  }
  if (itemCount <= 7) {
    return new Intl.DateTimeFormat("ar-EG", { weekday: "long", timeZone: "UTC" }).format(parsed.toDate());
  }
  return new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", timeZone: "UTC" })
    .format(parsed.toDate());
};

function SummarySkeleton() {
  return (
    <Box sx={{ ...cardSx, height: 98, p: "18px", textAlign: "center" }}>
      <Box sx={{ bgcolor: HX.surface3, borderRadius: "6px", height: 24, mx: "auto", mb: "10px", width: "35%" }} />
      <Box sx={{ bgcolor: HX.surface3, borderRadius: "6px", height: 12, mx: "auto", width: "55%" }} />
    </Box>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Box sx={{ color: HX.tx3, fontFamily: FONT, fontSize: "12px", py: "34px", textAlign: "center" }}>
      {message}
    </Box>
  );
}

interface ReportsPanelProps {
  onExporterChange?: (exporter: { run: () => Promise<void>; successMessage: string } | null) => void;
}

export default function ReportsPanel({ onExporterChange }: ReportsPanelProps) {
  const initialStartDate = React.useMemo(() => moment().startOf("month").format("YYYY-MM-DD"), []);
  const initialEndDate = React.useMemo(() => moment().format("YYYY-MM-DD"), []);
  const [period, setPeriod] = React.useState<PerformancePeriod>("daily");
  const [customRangeReady, setCustomRangeReady] = React.useState(false);
  const [draftStartDate, setDraftStartDate] = React.useState(initialStartDate);
  const [draftEndDate, setDraftEndDate] = React.useState(initialEndDate);
  const [appliedRange, setAppliedRange] = React.useState({
    endDate: initialEndDate,
    startDate: initialStartDate,
  });

  const queryParams = React.useMemo(() => ({
    endDate: appliedRange.endDate,
    period,
    startDate: appliedRange.startDate,
  }), [appliedRange, period]);
  const awaitingCustomRange = period === "custom" && !customRangeReady;

  const exportCurrentView = React.useCallback(
    () => exportShipmentsPerformance(queryParams),
    [queryParams],
  );
  React.useEffect(() => {
    if (awaitingCustomRange) {
      onExporterChange?.(null);
      return undefined;
    }
    onExporterChange?.({ run: exportCurrentView, successMessage: "تم تصدير تقرير الأداء" });
    return () => onExporterChange?.(null);
  }, [awaitingCustomRange, exportCurrentView, onExporterChange]);
  const { data, isError, isLoading, isFetching, refetch } = useShipmentsPerformanceQuery(
    queryParams,
    !awaitingCustomRange,
  );

  const overview = data?.overview ?? { deliveredOrdersCount: 0, totalGmv: 0 };
  const chart = data?.chart ?? [];
  const providers = data?.providers ?? [];
  const maximumChartValue = Math.max(...chart.map((point) => point.deliveredOrdersCount), 1);
  const hasInvalidRange = Boolean(draftStartDate && draftEndDate && draftStartDate > draftEndDate);
  const cannotApplyRange = !draftStartDate || !draftEndDate || hasInvalidRange || isFetching;
  const rangeTitle = React.useMemo(() => {
    const start = moment.utc(appliedRange.startDate, "YYYY-MM-DD", true);
    const end = moment.utc(appliedRange.endDate, "YYYY-MM-DD", true);
    if (!start.isValid() || !end.isValid()) return "الفترة المحددة";
    if (start.format("YYYY-MM") === end.format("YYYY-MM")) {
      return new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric", timeZone: "UTC" })
        .format(start.toDate());
    }
    return `${start.format("YYYY/MM/DD")} — ${end.format("YYYY/MM/DD")}`;
  }, [appliedRange]);

  const applyDateRange = () => {
    if (!draftStartDate || !draftEndDate || hasInvalidRange) return;
    setAppliedRange({ endDate: draftEndDate, startDate: draftStartDate });
    setCustomRangeReady(true);
  };

  const selectPeriod = (nextPeriod: PerformancePeriod) => {
    setPeriod(nextPeriod);
    if (nextPeriod === "custom") {
      setDraftStartDate("");
      setDraftEndDate("");
      setCustomRangeReady(false);
      return;
    }
    setAppliedRange({ endDate: initialEndDate, startDate: initialStartDate });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box sx={{ alignItems: { sm: "center" }, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", justifyContent: "space-between" }}>
        <Box sx={{ color: HX.tx, fontFamily: FONT, fontSize: "14px", fontWeight: 700 }}>
          تقارير أداء التوصيل
        </Box>
        <Box
          role="tablist"
          aria-label="فترة تقرير الأداء"
          sx={{
            bgcolor: HX.surface2,
            border: `0.5px solid ${HX.border}`,
            borderRadius: "9px",
            display: "flex",
            gap: "4px",
            overflowX: "auto",
            p: "4px",
          }}
        >
          {PERIODS.map((option) => {
            const active = period === option.id;
            return (
              <Box
                aria-selected={active}
                component="button"
                key={option.id}
                onClick={() => selectPeriod(option.id)}
                role="tab"
                sx={{
                  bgcolor: active ? HX.surface : "transparent",
                  border: 0,
                  borderRadius: "7px",
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                  color: active ? HX.tx : HX.tx2,
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: FONT,
                  fontSize: "12px",
                  fontWeight: 600,
                  px: "16px",
                  py: "6px",
                }}
              >
                {option.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Grid container spacing="10px">
        {isLoading ? (
          [...Array(2)].map((_, index) => (
            <Grid item xs={12} sm={6} key={index}><SummarySkeleton /></Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <Box sx={{ ...cardSx, p: "18px", textAlign: "center" }}>
                <Box sx={{ color: HX.green, fontFamily: FONT, fontSize: "22px", fontWeight: 800, mb: "4px" }}>
                  {awaitingCustomRange ? "—" : formatNumber(overview.deliveredOrdersCount)}
                </Box>
                <Box sx={{ color: HX.tx2, fontFamily: FONT, fontSize: "11px" }}>طلبات مسلّمة خلال الفترة</Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ ...cardSx, p: "18px", textAlign: "center" }}>
                <Box sx={{ color: HX.tx, fontFamily: FONT, fontSize: "22px", fontWeight: 800, mb: "4px" }}>
                  {awaitingCustomRange ? "—" : `${formatNumber(overview.totalGmv)} ج.م`}
                </Box>
                <Box sx={{ color: HX.tx2, fontFamily: FONT, fontSize: "11px" }}>إجمالي GMV</Box>
              </Box>
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ ...cardSx, p: "18px 20px" }}>
        <Box sx={{ color: HX.tx, fontFamily: FONT, fontSize: "12.5px", fontWeight: 700, mb: "14px" }}>
          التسليمات {period === "monthly" ? "الشهرية" : period === "weekly" ? "الأسبوعية" : "اليومية"} — {awaitingCustomRange ? "اختر الفترة" : rangeTitle}
        </Box>
        {awaitingCustomRange ? (
          <EmptyState message="اختر تاريخ البداية والنهاية ثم اضغط تطبيق" />
        ) : isLoading ? (
          <Box sx={{ bgcolor: HX.surface3, borderRadius: "8px", height: 180 }} />
        ) : isError ? (
          <Box sx={{ py: "26px", textAlign: "center" }}>
            <Box sx={{ color: HX.red, fontFamily: FONT, fontSize: "12px", mb: "8px" }}>تعذر تحميل تقرير الأداء</Box>
            <Box component="button" onClick={() => void refetch()} sx={{ bgcolor: HX.accent, border: 0, borderRadius: "7px", color: "#fff", cursor: "pointer", fontFamily: FONT, px: "14px", py: "6px" }}>إعادة المحاولة</Box>
          </Box>
        ) : chart.length === 0 ? (
          <EmptyState message="لا توجد تسليمات خلال الفترة المحددة" />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: 340, overflowY: "auto", pl: "4px" }}>
            {chart.map((point, index) => (
              <Box key={`${point.label}-${index}`} sx={{ alignItems: "center", display: "flex", gap: "10px", minHeight: 28 }}>
                <Box sx={{ color: HX.tx2, flexShrink: 0, fontFamily: FONT, fontSize: "11px", textAlign: "left", width: { xs: 72, sm: 92 } }}>
                  {formatChartLabel(point, period, chart.length)}
                </Box>
                <Box sx={{ bgcolor: HX.surface2, borderRadius: "6px", flex: 1, height: 28, overflow: "hidden" }}>
                  <Box sx={{
                    alignItems: "center",
                    bgcolor: point.deliveredOrdersCount === maximumChartValue ? HX.accent : HX.blue,
                    borderRadius: "6px",
                    color: "#fff",
                    display: "flex",
                    fontFamily: FONT,
                    fontSize: "11px",
                    fontWeight: 700,
                    height: "100%",
                    justifyContent: "flex-start",
                    minWidth: point.deliveredOrdersCount > 0 ? 34 : 0,
                    px: point.deliveredOrdersCount > 0 ? "10px" : 0,
                    transition: "width .4s ease",
                    width: `${(point.deliveredOrdersCount / maximumChartValue) * 100}%`,
                  }}>
                    {formatNumber(point.deliveredOrdersCount)}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ ...cardSx, overflow: "hidden" }}>
        <Box sx={{ alignItems: { sm: "center" }, borderBottom: `0.5px solid ${HX.border}`, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "10px", justifyContent: "space-between", p: "12px 16px" }}>
          <Box sx={{ color: HX.tx, fontFamily: FONT, fontSize: "12.5px", fontWeight: 700 }}>
            تفاصيل التوصيل حسب شركة الشحن
          </Box>
          {period === "custom" && (
            <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "7px" }}>
              <Box component="label" sx={{ color: HX.tx3, fontFamily: FONT, fontSize: "10.5px" }}>من</Box>
              <Box component="input" type="date" max={initialEndDate} value={draftStartDate} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDraftStartDate(event.target.value); setCustomRangeReady(false); }} sx={{ bgcolor: HX.surface, border: `0.5px solid ${hasInvalidRange ? HX.red : HX.border}`, borderRadius: "7px", color: HX.tx2, fontFamily: FONT, fontSize: "11px", height: 34, px: "9px" }} />
              <Box component="label" sx={{ color: HX.tx3, fontFamily: FONT, fontSize: "10.5px" }}>إلى</Box>
              <Box component="input" type="date" max={initialEndDate} min={draftStartDate || undefined} value={draftEndDate} onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDraftEndDate(event.target.value); setCustomRangeReady(false); }} sx={{ bgcolor: HX.surface, border: `0.5px solid ${hasInvalidRange ? HX.red : HX.border}`, borderRadius: "7px", color: HX.tx2, fontFamily: FONT, fontSize: "11px", height: 34, px: "9px" }} />
              <Box component="button" disabled={cannotApplyRange} onClick={applyDateRange} sx={{ bgcolor: HX.accent, border: 0, borderRadius: "7px", color: "#fff", cursor: cannotApplyRange ? "default" : "pointer", fontFamily: FONT, fontSize: "12px", fontWeight: 700, height: 34, opacity: cannotApplyRange ? .6 : 1, px: "16px" }}>
                تطبيق
              </Box>
            </Box>
          )}
        </Box>

        {awaitingCustomRange ? (
          <EmptyState message="اختر فترة مخصصة لعرض تفاصيل شركات الشحن" />
        ) : isLoading ? (
          <Box sx={{ p: "16px" }}>
            {[...Array(4)].map((_, index) => <Box key={index} sx={{ bgcolor: HX.surface3, borderRadius: "6px", height: 38, mb: "6px" }} />)}
          </Box>
        ) : providers.length === 0 ? (
          <EmptyState message="لا توجد بيانات لشركات الشحن خلال الفترة المحددة" />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", direction: "rtl", width: "100%" }}>
              <thead>
                <tr>
                  <th style={TH}>التوصيل بواسطة</th>
                  <th style={TH}>عدد الطلبات المسلّمة</th>
                  <th style={TH}>إجمالي GMV</th>
                  <th style={TH}>المرتجعات</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((row: ProviderRow, index: number) => {
                  const providerName = row.shippingCompanyName || row.deliveryByLabel || "غير محدد";
                  return (
                    <tr key={`${providerName}-${index}`} style={{ background: index % 2 === 0 ? HX.surface : HX.surface2 }}>
                      <td style={{ ...TD, fontWeight: 700 }}>{providerName}</td>
                      <td style={{ ...TD, fontWeight: 700 }}>{formatNumber(row.deliveredOrdersCount)}</td>
                      <td style={{ ...TD, color: HX.accent, fontWeight: 700 }}>{formatNumber(row.totalGmv)} ج.م</td>
                      <td style={TD}>
                        <Box component="span" sx={{ bgcolor: row.returnsCount === 0 ? HX.greenLight : HX.redLight, borderRadius: "999px", color: row.returnsCount === 0 ? HX.green : HX.red, display: "inline-flex", fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, px: "8px", py: "3px" }}>
                          {formatNumber(row.returnsCount)} مرتجع
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>
    </Box>
  );
}
