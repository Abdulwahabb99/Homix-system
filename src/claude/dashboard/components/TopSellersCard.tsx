import React from "react";
import { topSellers } from "claude/dashboard/data/dashboardData";

const rankClass = (r: string) => {
  if (r === "1") return "h-gold";
  if (r === "2") return "h-silver";
  if (r === "3") return "h-bronze";
  return "";
};

export default function TopSellersCard() {
  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">أفضل الصُنّاع</div>
          <div className="h-card-sub">حسب المبيعات</div>
        </div>
        <button type="button" className="h-card-link">
          الكل
        </button>
      </div>
      <div className="h-card-body" style={{ padding: "8px 18px" }}>
        {topSellers.map((s) => (
          <div className="h-seller-row" key={s.name}>
            <div className={`h-seller-rank ${rankClass(s.rank)}`}>{s.rank}</div>
            <div className="h-seller-av-sm" style={{ background: s.grad }}>
              {s.initial}
            </div>
            <div className="h-seller-info">
              <div className="h-seller-nm">{s.name}</div>
              <div className="h-seller-ct">{s.sub}</div>
            </div>
            <div className="h-seller-rev">
              <div className="h-seller-rev-val">{s.rev}</div>
              <div className="h-seller-rev-lbl">ج.م</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
