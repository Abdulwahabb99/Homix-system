import React from "react";
import { orderRows } from "claude/dashboard/data/dashboardData";

const badgeClass: Record<string, string> = {
  pending: "h-b-pending",
  done: "h-b-done",
  cancel: "h-b-cancel",
  mfg: "h-b-mfg",
};

const badgeText: Record<string, string> = {
  pending: "معلق",
  done: "مكتمل",
  cancel: "ملغي",
  mfg: "تصنيع",
};

export default function RecentOrdersTable() {
  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أحدث الطلبات</div>
          <div className="h-card-sub">72 طلب هذا الشهر</div>
        </div>
        <div className="h-card-head-actions">
          <button type="button" className="h-filter-pill">
            فلتر
          </button>
          <button type="button" className="h-card-link h-nowrap">
            عرض الكل ←
          </button>
        </div>
      </div>
      <table className="h-orders-table">
        <thead>
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
          {orderRows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className="h-order-id">{row.id}</span>
              </td>
              <td>
                <div className="h-client-mini">
                  <span>{row.name}</span>
                  <div className="h-av-mini" style={{ background: row.grad }}>
                    {row.initials}
                  </div>
                </div>
              </td>
              <td style={{ color: "var(--text2)", fontSize: 12 }}>{row.product}</td>
              <td style={{ fontWeight: 700 }}>{row.amount}</td>
              <td>
                <span className={`h-badge ${badgeClass[row.status]}`}>{badgeText[row.status]}</span>
              </td>
              <td style={{ color: "var(--text3)", fontSize: 11.5 }}>{row.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
