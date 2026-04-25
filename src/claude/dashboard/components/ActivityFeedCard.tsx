import React from "react";
import { activityItems } from "claude/dashboard/data/dashboardData";

export default function ActivityFeedCard() {
  return (
    <div className="h-card">
      <div className="h-card-head">
        <div>
          <div className="h-card-title">آخر الأنشطة</div>
          <div className="h-card-sub">تحديثات فورية</div>
        </div>
        <button type="button" className="h-card-link">
          الكل
        </button>
      </div>
      <div className="h-card-body h-activity-body">
        {activityItems.map((a) => (
          <div className="h-activity-item" key={a.time + a.strong}>
            <div className="h-act-icon" style={{ background: a.bg }}>
              {a.emoji}
            </div>
            <div>
              <p className="h-act-text">
                {a.before}
                <strong>{a.strong}</strong>
                {a.after}
              </p>
              <div className="h-act-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
