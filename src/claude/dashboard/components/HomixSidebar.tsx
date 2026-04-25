import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function brandIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  ),
  product: (
    <svg viewBox="0 0 24 24">
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  makers: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
    </svg>
  ),
  suppliers: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  shipments: (
    <svg viewBox="0 0 24 24">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
};

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: "warn" | "danger" | "default";
  end?: boolean;
};

const adminMain: NavItem[] = [
  { to: "/home", label: "لوحة التحكم", icon: icons.dashboard, end: true },
  { to: "/orders", label: "الطلبات", icon: icons.orders, badge: "72", badgeType: "warn" },
  { to: "/products", label: "المنتجات", icon: icons.product, badge: "1.2K", badgeType: "default" },
  { to: "/shipments", label: "الشحنات", icon: icons.shipments },
  { to: "/financialReports", label: "الإيرادات", icon: icons.revenue },
];

const adminManage: NavItem[] = [
  { to: "/vendors", label: "الصُنّاع", icon: icons.makers, badge: "3", badgeType: "danger" },
  { to: "/factories", label: "الموردين", icon: icons.suppliers },
  { to: "/users", label: "المستخدمين", icon: icons.users },
  { to: "/financialReports", label: "التقارير", icon: icons.reports },
];

const vendorMain: NavItem[] = [
  { to: "/home", label: "لوحة التحكم", icon: icons.dashboard, end: true },
  { to: "/orders", label: "الطلبات", icon: icons.orders },
  { to: "/products", label: "المنتجات", icon: icons.product },
  { to: "/financialReports", label: "تقارير مالية", icon: icons.reports },
];

const operationsMain: NavItem[] = [
  { to: "/products", label: "المنتجات", icon: icons.product },
  { to: "/orders", label: "الطلبات", icon: icons.orders },
  { to: "/factories", label: "المصانع", icon: icons.suppliers },
  { to: "/shipments", label: "الشحنات", icon: icons.shipments },
];

const logisticsMain: NavItem[] = [
  { to: "/products", label: "المنتجات", icon: icons.product },
  { to: "/orders", label: "الطلبات", icon: icons.orders },
  { to: "/shipments", label: "الشحنات", icon: icons.shipments },
];

function getInitials(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "؟";
    const u = JSON.parse(raw) as { firstName?: string; lastName?: string; email?: string };
    const name = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ");
    if (name) {
      const p = name.split(/\s+/);
      if (p.length >= 2) return (p[0].charAt(0) + p[1].charAt(0)).toUpperCase();
      return p[0].slice(0, 2).toUpperCase();
    }
    const e = (u.email || "").split("@")[0] || "";
    return (e.slice(0, 2) || "؟").toUpperCase();
  } catch {
    return "؟";
  }
}

function getUserLabel(): { name: string; role: string } {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { name: "مستخدم", role: "" };
    const u = JSON.parse(raw) as { firstName?: string; lastName?: string; userType?: string };
    const name = [u.firstName, u.lastName]
      .map((p) => (p || "").trim())
      .filter(Boolean)
      .join(" ");
    const t = u.userType;
    const role =
      t === "1" ? "Super Admin" : t === "2" ? "تاجر" : t === "3" ? "عمليات" : "لوجستيات";
    return { name: name || "مستخدم", role };
  } catch {
    return { name: "مستخدم", role: "" };
  }
}

function NavButton({
  to,
  label,
  icon,
  badge,
  badgeType,
  end,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: "warn" | "danger" | "default";
  end?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `h-ni ${isActive ? "h-active" : ""}`}
      onClick={() => onNavigate?.()}
    >
      {({ isActive }) => (
        <>
          {isActive ? <div className="h-active-bar" /> : null}
          {icon}
          {label}
          {badge ? (
            <span
              className={`h-ni-badge ${
                badgeType === "warn" ? "h-warn" : badgeType === "danger" ? "h-danger" : ""
              }`}
            >
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export type HomixNavRole = "admin" | "vendor" | "operations" | "logistics";

type PanelProps = {
  role: HomixNavRole;
  onNavigate?: () => void;
};

export function HomixSidenavPanel({ role, onNavigate }: PanelProps) {
  const { name, role: userRole } = useMemo(() => getUserLabel(), []);
  const initials = useMemo(() => getInitials(), []);
  const navigate = useNavigate();
  const nav = onNavigate;

  return (
    <>
      <div className="h-brand">
        <div className="h-brand-mark">{brandIcon()}</div>
        <div>
          <div className="h-brand-name">
            HOMI<span>X</span>
          </div>
          <div className="h-brand-badge">Marketplace Admin</div>
        </div>
      </div>

      {role === "vendor" && (
        <>
          <div className="h-nav-section">
            <div className="h-nav-label">القائمة الرئيسية</div>
            {vendorMain.map((it) => (
              <NavButton key={it.to + it.label} {...it} onNavigate={nav} />
            ))}
          </div>
          <div className="h-nav-section">
            <div className="h-nav-label">النظام</div>
            <button
              type="button"
              className="h-ni"
              onClick={() => {
                navigate("/financialReports");
                nav?.();
              }}
            >
              {icons.settings}
              الإعدادات
            </button>
          </div>
        </>
      )}

      {role === "admin" && (
        <>
          <div className="h-nav-section">
            <div className="h-nav-label">القائمة الرئيسية</div>
            {adminMain.map((it) => (
              <NavButton key={it.to + it.label} {...it} onNavigate={nav} />
            ))}
          </div>
          <div className="h-nav-section">
            <div className="h-nav-label">الإدارة</div>
            {adminManage.map((it) => (
              <NavButton key={it.to + it.label} {...it} onNavigate={nav} />
            ))}
          </div>
          <div className="h-nav-section">
            <div className="h-nav-label">النظام</div>
            <button
              type="button"
              className="h-ni"
              onClick={() => {
                navigate("/users");
                nav?.();
              }}
            >
              {icons.settings}
              الإعدادات
            </button>
          </div>
        </>
      )}

      {role === "operations" && (
        <div className="h-nav-section">
          <div className="h-nav-label">القائمة الرئيسية</div>
          {operationsMain.map((it) => (
            <NavButton key={it.to + it.label} {...it} onNavigate={nav} />
          ))}
        </div>
      )}

      {role === "logistics" && (
        <div className="h-nav-section">
          <div className="h-nav-label">القائمة الرئيسية</div>
          {logisticsMain.map((it) => (
            <NavButton key={it.to + it.label} {...it} onNavigate={nav} />
          ))}
        </div>
      )}

      <div className="h-sidebar-footer">
        <div
          className="h-user-row"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (role === "admin") navigate("/users");
            else if (role === "vendor") navigate("/financialReports");
            else nav?.();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (role === "admin") navigate("/users");
            else if (role === "vendor") navigate("/financialReports");
            else nav?.();
          }}
        >
          <div className="h-avatar">{initials}</div>
          <div className="h-user-info">
            <div className="h-user-name">{name}</div>
            <div className="h-user-role">{userRole}</div>
          </div>
          <button type="button" className="h-user-settings" aria-label="خيارات" tabIndex={-1}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default function HomixSidebar({ isVendor }: { isVendor: boolean }) {
  return <HomixSidenavPanel role={isVendor ? "vendor" : "admin"} />;
}
