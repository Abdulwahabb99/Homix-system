import React, { useState } from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import {
  useVendorReturnsQuery,
  useCustomerReturnsQuery,
  RETURNS_PAGE_SIZE,
  type ReturnItem,
} from "query/shipmentsReturns";

const FONT = "'Cairo', sans-serif";

const SUB_TABS = [
  { id: "vendor",   label: "مرتجعات البائعين" },
  { id: "customer", label: "مرتجعات العملاء" },
];

const TH: React.CSSProperties = {
  fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx2,
  padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`, background: HX.surface2,
};

const TD: React.CSSProperties = {
  fontFamily: FONT, fontSize: "12px", color: HX.tx,
  padding: "9px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `0.5px solid ${HX.border}`, verticalAlign: "middle",
};

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return moment(d).format("DD/MM/YY");
}

function SkeletonRows() {
  return (
    <Box sx={{ ...cardSx, overflow: "hidden" }}>
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{
          height: 44, bgcolor: i % 2 === 0 ? HX.surface : HX.surface2,
          borderBottom: `0.5px solid ${HX.border}`, opacity: 0.7,
        }} />
      ))}
    </Box>
  );
}

function ReturnsTable({
  items,
  isLoading,
  isFetching,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: {
  items: ReturnItem[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (p: number) => void;
}) {
  if (isLoading) return <SkeletonRows />;

  if (items.length === 0) {
    return (
      <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3, opacity: isFetching ? 0.5 : 1 }}>
        لا توجد مرتجعات
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "center" }}>الأيام</th>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الطلب</th>
              <th style={TH}>السبب</th>
              <th style={TH}>تاريخ الإرجاع</th>
              <th style={TH}>البائع</th>
              <th style={TH}>نوع الإرجاع</th>
              <th style={TH}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
              >
                <td style={{ ...TD, textAlign: "center" }}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    minWidth: 28, height: 22, px: "6px", borderRadius: "100px",
                    fontSize: "11px", fontWeight: 700, fontFamily: FONT,
                    bgcolor: HX.amberLight, color: HX.amber,
                  }}>
                    {item.daysCounter ?? "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
                    {item.operationNumber || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.accent }}>
                    {item.orderNumber || "—"}
                  </Box>
                </td>
                <td style={{ ...TD, maxWidth: 200 }}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.reason || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                    {fmtDate(item.returnDate)}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>
                    {item.sellerName || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>
                    {item.returnTypeLabel || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
                    borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: FONT,
                    bgcolor: HX.purpleLight, color: HX.purple,
                  }}>
                    {item.statusLabel || "—"}
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <HomixPaginationBar
        page={page - 1}
        totalPages={totalPages}
        pageSize={RETURNS_PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={(p) => onPageChange(p + 1)}
        itemLabel="مرتجع"
      />
    </Box>
  );
}

function VendorReturnsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useVendorReturnsQuery({ page });
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / RETURNS_PAGE_SIZE);
  return (
    <ReturnsTable
      items={items} isLoading={isLoading} isFetching={isFetching}
      page={page} totalPages={totalPages} totalCount={totalCount}
      onPageChange={setPage}
    />
  );
}

function CustomerReturnsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useCustomerReturnsQuery({ page });
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / RETURNS_PAGE_SIZE);
  return (
    <ReturnsTable
      items={items} isLoading={isLoading} isFetching={isFetching}
      page={page} totalPages={totalPages} totalCount={totalCount}
      onPageChange={setPage}
    />
  );
}

export default function ReturnsPanel() {
  const [activeSubTab, setActiveSubTab] = useState("vendor");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {SUB_TABS.map((tab) => {
          const active = activeSubTab === tab.id;
          return (
            <Box
              key={tab.id}
              component="button"
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              sx={{
                display: "inline-flex", alignItems: "center",
                px: "14px", height: 34, borderRadius: "100px",
                border: active ? "none" : `0.5px solid ${HX.border2}`,
                cursor: "pointer", fontFamily: FONT, fontSize: "12.5px",
                fontWeight: 600, whiteSpace: "nowrap",
                bgcolor: active ? HX.accentLight : HX.surface,
                color: active ? HX.accent : HX.tx2,
                transition: ".15s",
                "&:hover": !active ? { bgcolor: HX.surface3, color: HX.tx } : {},
              }}
            >
              {tab.label}
            </Box>
          );
        })}
      </Box>

      {activeSubTab === "vendor"   && <VendorReturnsTab />}
      {activeSubTab === "customer" && <CustomerReturnsTab />}
    </Box>
  );
}
