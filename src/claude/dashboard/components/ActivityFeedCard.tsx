import React from "react";
import { useDashboardActivities } from "claude/dashboard/api/dashboardActivities.api";
import type { ActivityItem } from "claude/dashboard/api/dashboardActivities.api";

/* ── helpers ── */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "الآن";
  if (mins  < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days  < 7)  return `منذ ${days} يوم`;
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "short" }).format(
    new Date(iso)
  );
}

/* icon + colour by entityType */
const TYPE_META: Record<string, { emoji: string; bg: string }> = {
  order:    { emoji: "🛒", bg: "var(--green-light)"  },
  shipment: { emoji: "🚚", bg: "var(--accent-light)" },
  vendor:   { emoji: "🏭", bg: "var(--accent-light)" },
  payment:  { emoji: "💰", bg: "var(--green-light)"  },
  cancel:   { emoji: "❌", bg: "var(--red-light)"    },
  warning:  { emoji: "⚠️", bg: "var(--amber-light)"  },
};

function metaFor(item: ActivityItem) {
  return TYPE_META[item.entityType] ?? { emoji: "📋", bg: "var(--surface2)" };
}

/* ── skeleton row ── */
function SkeletonRow() {
  return (
    <div className="h-activity-item">
      <div className="h-act-icon" style={{ background: "var(--surface2)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, borderRadius: 4, background: "var(--surface2)", marginBottom: 6, width: "80%" }} />
        <div style={{ height: 10, borderRadius: 4, background: "var(--surface2)", width: "35%" }} />
      </div>
    </div>
  );
}

/* ── component ── */
interface ActivityFeedCardProps {
  startDate: string;
  endDate:   string;
}

export default function ActivityFeedCard({ startDate, endDate }: ActivityFeedCardProps) {
  const { data, isLoading, isError } = useDashboardActivities(startDate, endDate);
  const items = data?.data?.items ?? [];

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">آخر الأنشطة</div>
          <div className="h-card-sub">تحديثات فورية</div>
        </div>
      </div>

      <div className="h-card-body h-activity-body">

        {/* loading */}
        {isLoading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

        {/* error */}
        {isError && !isLoading && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 6, color: "var(--text3)", padding: "24px 0",
          }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
              تعذّر تحميل الأنشطة
            </span>
          </div>
        )}

        {/* empty */}
        {!isLoading && !isError && items.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 6, color: "var(--text3)", padding: "24px 0",
          }}>
            <span style={{ fontSize: 28 }}>📋</span>
            <span style={{ fontSize: 12, fontFamily: "Cairo, sans-serif", fontWeight: 700, color: "var(--text2)" }}>
              لا توجد أنشطة اليوم
            </span>
          </div>
        )}

        {/* data */}
        {!isLoading && !isError && items.map((item) => {
          const { emoji, bg } = metaFor(item);
          return (
            <div className="h-activity-item" key={item.id}>
              <div className="h-act-icon" style={{ background: bg }}>{emoji}</div>
              <div>
                <p className="h-act-text">{item.text}</p>
                <div className="h-act-time">{relativeTime(item.createdAt)}</div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
