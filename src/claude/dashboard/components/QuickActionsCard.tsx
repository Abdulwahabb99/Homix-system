import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const adminActions = [
  { emoji: "📦", title: "إضافة منتج", sub: "رفع منتج جديد", path: "/products" },
  { emoji: "👤", title: "سيلر جديد", sub: "إضافة صانع", path: "/vendors" },
  { emoji: "📊", title: "تصدير تقرير", sub: "Excel / PDF", path: "/financialReports" },
  { emoji: "💳", title: "تسوية مالية", sub: "صرف الصُنّاع", path: "/financialReports" },
];

const vendorActions = [
  { emoji: "📦", title: "إضافة منتج", sub: "رفع منتج جديد", path: "/products" },
  { emoji: "🛒", title: "الطلبات", sub: "متابعة الطلبات", path: "/orders" },
  { emoji: "📊", title: "تصدير تقرير", sub: "Excel / PDF", path: "/financialReports" },
  { emoji: "💳", title: "تقارير مالية", sub: "تقاريرك", path: "/financialReports" },
];

type Props = { isVendor: boolean };

export default function QuickActionsCard({ isVendor }: Props) {
  const navigate = useNavigate();
  const list = useMemo(() => (isVendor ? vendorActions : adminActions), [isVendor]);

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div className="h-card-title">إجراءات سريعة</div>
      </div>
      <div className="h-card-body">
        <div className="h-quick-actions">
          {list.map((a) => (
            <button
              type="button"
              key={a.title}
              className="h-qa"
              onClick={() => navigate(a.path)}
            >
              <div className="h-qa-icon">{a.emoji}</div>
              <div>
                <div className="h-qa-text">{a.title}</div>
                <div className="h-qa-sub">{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
