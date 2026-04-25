import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/locale/ar";

function getDisplayName(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "أحمد";
    const u = JSON.parse(raw) as { firstName?: string; lastName?: string };
    const n = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ");
    return n || "أحمد";
  } catch {
    return "أحمد";
  }
}

function greetingFor(hour: number): string {
  if (hour < 12) return "صباح الخير";
  if (hour < 17) return "مساء الخير";
  return "مساء الخير";
}

export default function HomixTopbar() {
  const navigate = useNavigate();
  const name = useMemo(() => getDisplayName(), []);
  const { dateStr, greet } = useMemo(() => {
    moment.locale("ar");
    return {
      dateStr: moment().format("dddd، D MMMM YYYY"),
      greet: greetingFor(new Date().getHours()),
    };
  }, []);

  return (
    <div className="h-topbar">
      <div className="h-tb-greet">
        <h2>
          {greet}، {name} 👋
        </h2>
        <p>إليك ملخص أداء اليوم</p>
      </div>
      <div className="h-topbar-right">
        <div className="h-tb-date h-nowrap">{dateStr}</div>
        <button type="button" className="h-icon-btn" aria-label="بحث">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button type="button" className="h-icon-btn" aria-label="إشعارات">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="h-notif-dot" />
        </button>
        <button type="button" className="h-tb-btn-primary" onClick={() => navigate("/orders/add")}>
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          طلب جديد
        </button>
      </div>
    </div>
  );
}
