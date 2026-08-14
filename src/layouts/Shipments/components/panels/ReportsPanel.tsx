import React from "react";
import { Box, Grid } from "@mui/material";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import DateRangePickerWrapper from "components/DateRangePickerWrapper/DateRangePickerWrapper";
import { useDateRange } from "hooks/useDateRange";
import {
  useShipmentsPerformanceQuery,
  type PerformanceOverviewCard,
  type ProviderRow,
} from "query/shipmentsPerformance";

const FONT = "'Cairo', sans-serif";

/** بطاقات لم تعد مطلوبة في تقارير الأداء */
const HIDDEN_OVERVIEW_KEYS = ["avgDeliveryDays", "successRate", "deliveryRate"];

const TH: React.CSSProperties = {
  fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx2,
  padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`, background: HX.surface2,
};

const TD: React.CSSProperties = {
  fontFamily: FONT, fontSize: "12px", color: HX.tx,
  padding: "9px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `0.5px solid ${HX.border}`, verticalAlign: "middle",
};

const CARD_KEY_STYLES: Record<string, { iconBg: string; iconColor: string; valueColor?: string }> = {
  totalDelivered:    { iconBg: HX.greenLight,  iconColor: HX.green,  valueColor: HX.green },
  deliveryRate:      { iconBg: HX.tealLight,   iconColor: HX.teal,   valueColor: HX.teal },
  avgDeliveryDays:   { iconBg: HX.blueLight,   iconColor: HX.blue,   valueColor: HX.blue },
  totalReturned:     { iconBg: HX.purpleLight, iconColor: HX.purple, valueColor: HX.purple },
  returnRate:        { iconBg: HX.redLight,    iconColor: HX.red,    valueColor: HX.red },
  totalShipments:    { iconBg: HX.accentLight, iconColor: HX.accent },
};

function OverviewCard({ card, idx }: { card: PerformanceOverviewCard; idx: number }) {
  const fallbacks = [
    { iconBg: HX.accentLight, iconColor: HX.accent },
    { iconBg: HX.greenLight,  iconColor: HX.green,  valueColor: HX.green },
    { iconBg: HX.blueLight,   iconColor: HX.blue,   valueColor: HX.blue },
    { iconBg: HX.amberLight,  iconColor: HX.amber,  valueColor: HX.amber },
    { iconBg: HX.purpleLight, iconColor: HX.purple, valueColor: HX.purple },
    { iconBg: HX.tealLight,   iconColor: HX.teal,   valueColor: HX.teal },
  ];
  const style = CARD_KEY_STYLES[card.key] ?? fallbacks[idx % fallbacks.length];

  return (
    <Box sx={{
      bgcolor: HX.surface, borderRadius: HX.r, p: "14px 16px",
      border: `0.5px solid ${HX.border}`, transition: ".2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
    }}>
      <Box sx={{ mb: "10px" }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: style.iconBg, color: style.iconColor,
        }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </Box>
      </Box>
      <Box sx={{ fontSize: "22px", fontWeight: 800, lineHeight: 1, mb: "3px", color: style.valueColor ?? HX.tx, fontFamily: FONT }}>
        {typeof card.value === "number" ? card.value.toLocaleString("en-US") : card.value}
      </Box>
      <Box sx={{ fontSize: "11px", color: HX.tx2, fontWeight: 500, fontFamily: FONT }}>{card.label}</Box>
      {card.description && (
        <Box sx={{ fontSize: "10.5px", color: HX.tx3, fontFamily: FONT, mt: "3px" }}>{card.description}</Box>
      )}
    </Box>
  );
}

function DeliveryRateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? HX.green : rate >= 60 ? HX.amber : HX.red;
  const bg    = rate >= 80 ? HX.greenLight : rate >= 60 ? HX.amberLight : HX.redLight;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 120 }}>
      <Box sx={{ flex: 1, height: 6, borderRadius: 4, bgcolor: HX.surface3, overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${Math.min(rate, 100)}%`, borderRadius: 4, bgcolor: color, transition: "width .4s" }} />
      </Box>
      <Box component="span" sx={{ fontFamily: FONT, fontSize: "11.5px", fontWeight: 700, color, flexShrink: 0 }}>
        {rate?.toFixed(1)}%
      </Box>
    </Box>
  );
}

function SkeletonCard() {
  return (
    <Box sx={{
      bgcolor: HX.surface, borderRadius: HX.r, p: "14px 16px",
      border: `0.5px solid ${HX.border}`, height: 90,
      "& > div": { borderRadius: "6px", bgcolor: HX.surface3, animation: "hx-pulse 1.4s ease-in-out infinite" },
      "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
    }}>
      <Box sx={{ width: 32, height: 32, borderRadius: "9px !important", mb: "10px" }} />
      <Box sx={{ width: "50%", height: 18, mb: "6px" }} />
      <Box sx={{ width: "70%", height: 11 }} />
    </Box>
  );
}

export default function ReportsPanel() {
  const { startDate, endDate, handleDatesChange, handleReset } = useDateRange({ defaultDays: 30 });
  const { data, isLoading } = useShipmentsPerformanceQuery({ startDate, endDate });

  const overview  = data?.overview  ?? [];
  const chart     = data?.chart     ?? [];
  const providers = data?.providers ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Date filter */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <DateRangePickerWrapper
          startDate={startDate}
          endDate={endDate}
          allowPastDays={true}
          allowFutureDays={false}
          useDefaultPresets={true}
          handleDatesChange={handleDatesChange}
          onReset={handleReset}
        />
      </Box>

      {/* Overview KPI cards */}
      <Grid container spacing="10px">
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <Grid item xs={6} sm={4} md={4} lg={4} key={i}>
                <SkeletonCard />
              </Grid>
            ))
          : overview
              // متوسط وقت التوصيل ونسبة النجاح غير مطلوبين في هذا التقرير
              .filter((card) => !HIDDEN_OVERVIEW_KEYS.includes(card.key))
              .map((card, i) => (
              <Grid item xs={6} sm={4} md={4} lg={4} key={card.key}>
                <OverviewCard card={card} idx={i} />
              </Grid>
            ))
        }
      </Grid>

      {/* Performance chart */}
      {(isLoading || chart.length > 0) && (
        <Box sx={{ ...cardSx, p: "16px 20px" }}>
          <Box sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, mb: "16px" }}>
            أداء الشحنات
          </Box>
          {isLoading ? (
            <Box sx={{ height: 200, bgcolor: HX.surface3, borderRadius: "8px", animation: "hx-pulse 1.4s ease-in-out infinite", "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } } }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={HX.green}  stopOpacity={0.2} />
                    <stop offset="95%" stopColor={HX.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={HX.red}  stopOpacity={0.2} />
                    <stop offset="95%" stopColor={HX.red} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={HX.amber}  stopOpacity={0.2} />
                    <stop offset="95%" stopColor={HX.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={HX.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: FONT, fontSize: 10, fill: HX.tx3 }}
                  tickFormatter={(v) => v ? v.slice(5) : ""}
                  reversed
                />
                <YAxis tick={{ fontFamily: FONT, fontSize: 10, fill: HX.tx3 }} width={30} />
                <Tooltip
                  contentStyle={{ fontFamily: FONT, fontSize: "12px", borderRadius: "8px", border: `0.5px solid ${HX.border}` }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: FONT, fontSize: "12px" }}
                  formatter={(value) => {
                    const map: Record<string, string> = { delivered: "تم التسليم", returned: "مرتجع", pending: "معلق" };
                    return map[value] ?? value;
                  }}
                />
                <Area type="monotone" dataKey="delivered" stroke={HX.green} strokeWidth={2} fill="url(#colorDelivered)" dot={false} />
                <Area type="monotone" dataKey="returned"  stroke={HX.red}   strokeWidth={2} fill="url(#colorReturned)"  dot={false} />
                <Area type="monotone" dataKey="pending"   stroke={HX.amber} strokeWidth={2} fill="url(#colorPending)"   dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      )}

      {/* Providers table */}
      {(isLoading || providers.length > 0) && (
        <Box sx={{ ...cardSx }}>
          <Box sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, p: "14px 16px", borderBottom: `0.5px solid ${HX.border}` }}>
            شركات الشحن
          </Box>
          {isLoading ? (
            <Box sx={{ p: "16px" }}>
              {[...Array(4)].map((_, i) => (
                <Box key={i} sx={{ height: 38, bgcolor: HX.surface3, borderRadius: "6px", mb: "6px", animation: "hx-pulse 1.4s ease-in-out infinite", "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } } }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
                <thead>
                  <tr>
                    <th style={TH}>الشركة</th>
                    <th style={{ ...TH, textAlign: "center" }}>الإجمالي</th>
                    <th style={{ ...TH, textAlign: "center" }}>تم التسليم</th>
                    <th style={{ ...TH, textAlign: "center" }}>المرتجع</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((row: ProviderRow, idx: number) => (
                    <tr
                      key={row.name}
                      style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
                    >
                      <td style={TD}>
                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>{row.name}</Box>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 700 }}>{row.total?.toLocaleString("en-US") ?? 0}</Box>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 700, color: HX.green }}>{row.delivered?.toLocaleString("en-US") ?? 0}</Box>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <Box component="span" sx={{ fontSize: "12px", fontWeight: 700, color: HX.red }}>{row.returned?.toLocaleString("en-US") ?? 0}</Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      )}

      {!isLoading && overview.length === 0 && chart.length === 0 && providers.length === 0 && (
        <Box sx={{ ...cardSx, py: 6, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
          لا توجد بيانات أداء للفترة المحددة
        </Box>
      )}
    </Box>
  );
}
