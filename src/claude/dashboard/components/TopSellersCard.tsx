import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useDashboardLeaderboard,
  type LeaderboardItem,
} from "claude/dashboard/api/dashboardLeaderboard.api";

/* ── helpers ── */
const AV_GRADS = [
  "linear-gradient(135deg,#8c7355,#5a4530)",
  "linear-gradient(135deg,#4a7855,#2d5038)",
  "linear-gradient(135deg,#a07840,#6b5030)",
  "linear-gradient(135deg,#5a4070,#3a2850)",
  "linear-gradient(135deg,#6366f1,#a78bfa)",
];
function avGrad(id: number) { return AV_GRADS[id % AV_GRADS.length]; }
function initial(name: string) { return name.trim()[0]?.toUpperCase() ?? "?"; }

function fmt(val: number) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (val >= 1_000)     return (val / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(Math.round(val));
}

const rankClass = (r: number) => {
  if (r === 1) return "h-gold";
  if (r === 2) return "h-silver";
  if (r === 3) return "h-bronze";
  return "";
};

/* ── skeleton row ── */
function SkeletonRow() {
  return (
    <div className="h-seller-row">
      <div className="h-seller-rank" style={{ background: "var(--surface2)", borderRadius: 4, width: 20, height: 20 }} />
      <div className="h-seller-av-sm" style={{ background: "var(--surface2)" }} />
      <div className="h-seller-info" style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 4, background: "var(--surface2)", width: "60%", marginBottom: 5 }} />
        <div style={{ height: 10, borderRadius: 4, background: "var(--surface2)", width: "35%" }} />
      </div>
      <div style={{ height: 16, borderRadius: 4, background: "var(--surface2)", width: 40 }} />
    </div>
  );
}

/* ── component ── */
interface TopSellersCardProps {
  startDate: string;
  endDate:   string;
}

export default function TopSellersCard({ startDate, endDate }: TopSellersCardProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardLeaderboard(startDate, endDate);
  const items: LeaderboardItem[] = data?.data?.items ?? [];

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أفضل الصُنّاع</div>
          <div className="h-card-sub">حسب المبيعات</div>
        </div>
        <button type="button" className="h-card-link" onClick={() => navigate("/vendors")}>الكل</button>
      </div>

      <div className="h-card-body" style={{ padding: "8px 18px", maxHeight: 260 }}>

        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

        {isError && !isLoading && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6, padding: "24px 0", color: "var(--text3)",
          }}>
            <span style={{ fontSize: 26 }}>⚠️</span>
            <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
              تعذّر تحميل البيانات
            </span>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 6, padding: "24px 0", color: "var(--text3)",
          }}>
            <span style={{ fontSize: 26 }}>🏭</span>
            <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
              لا توجد بيانات في هذه الفترة
            </span>
          </div>
        )}

        {!isLoading && !isError && items.map((s) => (
          <div className="h-seller-row" key={s.id}>
            <div className={`h-seller-rank ${rankClass(s.rank)}`}>{s.rank}</div>
            <div className="h-seller-av-sm" style={{ background: avGrad(s.id) }}>
              {initial(s.name)}
            </div>
            <div className="h-seller-info">
              <div className="h-seller-nm">{s.name}</div>
              <div className="h-seller-ct">{s.secondaryLabel}</div>
            </div>
            <div className="h-seller-rev">
              <div className="h-seller-rev-val">{fmt(s.totalSales)}</div>
              <div className="h-seller-rev-lbl">ج.م</div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
