import React from "react";
import moment from "moment";
import "moment/locale/ar";

export default function TargetsProgressCard() {
  moment.locale("ar");
  const endOfMonth = moment().endOf("month");
  const daysLeft = Math.max(0, endOfMonth.diff(moment(), "days"));

  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">تقدم الأهداف</div>
          <div className="h-card-sub">أهداف {moment().format("MMMM YYYY")}</div>
        </div>
        <div className="h-goals-pill h-nowrap">{daysLeft} يوم متبقية</div>
      </div>
      <div className="h-card-body">
        <div className="h-mini-stats">
          <div className="h-mini-stat">
            <div className="h-ms-val" style={{ color: "var(--accent)" }}>
              84%
            </div>
            <div className="h-ms-label">المبيعات</div>
          </div>
          <div className="h-mini-stat">
            <div className="h-ms-val" style={{ color: "var(--green)" }}>
              72%
            </div>
            <div className="h-ms-label">الطلبات</div>
          </div>
          <div className="h-mini-stat">
            <div className="h-ms-val" style={{ color: "var(--amber)" }}>
              91%
            </div>
            <div className="h-ms-label">الرضا</div>
          </div>
        </div>
        <div className="h-progress-item">
          <div className="h-prog-head">
            <span className="h-prog-name">هدف المبيعات — 1M ج.م</span>
            <span className="h-prog-val">847K / 1M</span>
          </div>
          <div className="h-prog-bar">
            <div
              className="h-prog-fill"
              style={{ width: "84%", background: "linear-gradient(90deg, var(--accent), #8b5cf6)" }}
            />
          </div>
        </div>
        <div className="h-progress-item">
          <div className="h-prog-head">
            <span className="h-prog-name">عدد الطلبات — 1000 طلب</span>
            <span className="h-prog-val">720 / 1000</span>
          </div>
          <div className="h-prog-bar">
            <div
              className="h-prog-fill"
              style={{ width: "72%", background: "linear-gradient(90deg, var(--green), #34d399)" }}
            />
          </div>
        </div>
        <div className="h-progress-item">
          <div className="h-prog-head">
            <span className="h-prog-name">صُنّاع جدد — 10 صانع</span>
            <span className="h-prog-val">3 / 10</span>
          </div>
          <div className="h-prog-bar">
            <div
              className="h-prog-fill"
              style={{ width: "30%", background: "linear-gradient(90deg, var(--amber), #fbbf24)" }}
            />
          </div>
        </div>
        <div className="h-progress-item">
          <div className="h-prog-head">
            <span className="h-prog-name">رضا العملاء — 4.8</span>
            <span className="h-prog-val">4.4 / 4.8</span>
          </div>
          <div className="h-prog-bar">
            <div
              className="h-prog-fill"
              style={{ width: "91%", background: "linear-gradient(90deg, var(--gold), #fbbf24)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
