import React from "react";
import { useNavigate } from "react-router-dom";
import {
  useDashboardLatestOrders,
  type LatestOrderItem,
} from "claude/dashboard/api/dashboardLatestOrders.api";

/* ── status → badge class ── */
const STATUS_CLASS: Record<number, string> = {
  1: "h-b-pending",
  2: "h-b-mfg",
  3: "h-b-done",
  4: "h-b-cancel",
};

/* ── avatar initials + gradient ── */
const AV_GRADS = [
  "linear-gradient(135deg,#6366f1,#a78bfa)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#8b5cf6,#6366f1)",
];
function avGrad(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AV_GRADS.length;
  return AV_GRADS[h];
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/* ── relative date ── */
function relDate(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "الآن";
  if (mins  < 60) return `منذ ${mins} د`;
  if (hours < 24) return `منذ ${hours} س`;
  if (days  === 1) return "أمس";
  return `منذ ${days} أيام`;
}

/* ── skeleton row ── */
function SkeletonRow() {
  const skW = ["40%", "55%", "60%", "30%", "45%", "25%"];
  return (
    <tr>
      {skW.map((w, i) => (
        <td key={i}>
          <div style={{ height: 12, borderRadius: 4, background: "var(--surface2)", width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ── empty / error ── */
function TableMsg({ icon, title }: { icon: string; title: string }) {
  return (
    <tr>
      <td colSpan={6}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 6, padding: "32px 0", color: "var(--text3)",
        }}>
          <span style={{ fontSize: 28 }}>{icon}</span>
          <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
            {title}
          </span>
        </div>
      </td>
    </tr>
  );
}

/* ── component ── */
interface RecentOrdersTableProps {
  startDate: string;
  endDate:   string;
}

export default function RecentOrdersTable({ startDate, endDate }: RecentOrdersTableProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardLatestOrders(startDate, endDate);
  const items: LatestOrderItem[] = data?.data?.items ?? [];

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أحدث الطلبات</div>
          <div className="h-card-sub">
            {isLoading ? "جارٍ التحميل…" : `${items.length} طلب في هذه الفترة`}
          </div>
        </div>
        <div className="h-card-head-actions">
          <button
            type="button"
            className="h-card-link h-nowrap"
            onClick={() => navigate("/orders")}
          >
            عرض الكل ←
          </button>
        </div>
      </div>

      <div className="h-orders-table-wrap">
      <table className="h-orders-table">
        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr>
            <th>رقم الطلب</th>
            <th>العميل</th>
            <th>المنتج</th>
            <th>المبلغ</th>
            <th>الحالة</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {isError && !isLoading && <TableMsg icon="⚠️" title="تعذّر تحميل الطلبات" />}

          {!isLoading && !isError && items.length === 0 && (
            <TableMsg icon="📋" title="لا توجد طلبات في هذه الفترة" />
          )}

          {!isLoading && !isError && items.map((row) => (
            <tr
              key={row.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/orders/${row.id}`)}
            >
              <td>
                <span className="h-order-id">#{row.orderNumber}</span>
              </td>
              <td>
                <div className="h-client-mini">
                  <span>{row.customerName}</span>
                  <div className="h-av-mini" style={{ background: avGrad(row.customerName) }}>
                    {initials(row.customerName)}
                  </div>
                </div>
              </td>
              <td style={{ color: "var(--text2)", fontSize: 12 }}>{row.productName}</td>
              <td style={{ fontWeight: 700 }}>
                {Number(row.amount).toLocaleString("ar-EG-u-nu-latn")}
                <span style={{ fontSize: 10, fontWeight: 400, marginRight: 2 }}> ج.م</span>
              </td>
              <td>
                <span className={`h-badge ${STATUS_CLASS[row.status] ?? "h-b-pending"}`}>
                  {row.statusLabel}
                </span>
              </td>
              <td style={{ color: "var(--text3)", fontSize: 11.5 }}>
                {relDate(row.orderDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
