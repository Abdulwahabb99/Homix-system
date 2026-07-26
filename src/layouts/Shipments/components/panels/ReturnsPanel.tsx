import React, { useState, useRef } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import moment from "moment";
import { HX } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import {
  useVendorReturnsQuery,
  useCustomerReturnsQuery,
  RETURNS_PAGE_SIZE,
  type ReturnItem,
  type ReturnsParams,
} from "query/shipmentsReturns";
import EditCustomerReturnModal from "./EditCustomerReturnModal";

const FONT = "'Cairo', sans-serif";

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
  return moment(d).format("YYYY-MM-DD");
}

function SearchInput({
  placeholder, value, onChange,
}: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: "6px",
      border: `1px solid ${HX.border}`, borderRadius: "8px",
      px: "10px", height: 34, flex: "1 1 140px", minWidth: 0,
      "&:focus-within": { borderColor: HX.accent },
    }}>
      <SearchIcon sx={{ fontSize: 14, color: HX.tx3, flexShrink: 0 }} />
      <Box
        component="input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{
          border: "none", outline: "none", flex: 1, minWidth: 0,
          fontSize: "12px", fontFamily: FONT, color: "#000", bgcolor: "transparent",
          "&::placeholder": { color: HX.tx3 },
        }}
      />
    </Box>
  );
}

function FilterSelect({
  label, value, options, onChange,
}: { label: string; value: string; options: { value: string | number; label: string }[]; onChange: (v: string) => void }) {
  return (
    <FormControl size="small" sx={{ flex: "1 1 140px", minWidth: 0 }}>
      <InputLabel sx={{
        fontFamily: FONT, fontSize: "12px", color: "#000",
        "&.Mui-focused": { color: HX.accent },
        "&.MuiInputLabel-shrink": { fontSize: "11px" },
      }}>
        {label}
      </InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label={label}
        sx={{
          fontFamily: FONT, fontSize: "12px", height: 34,
          bgcolor: "transparent", borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: HX.border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: HX.accent },
          "& .MuiSelect-select": { fontSize: "12px", fontFamily: FONT, color: "#000" },
        }}
        MenuProps={{ PaperProps: { sx: { fontFamily: FONT } } }}
      >
        <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>الكل</MenuItem>
        {options.map((o) => (
          <MenuItem key={o.value} value={String(o.value)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function SkeletonRows() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{
          height: 44,
          bgcolor: i % 2 === 0 ? HX.surface : HX.surface2,
          borderBottom: `0.5px solid ${HX.border}`,
          animation: "hx-pulse 1.4s ease-in-out infinite",
          "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
        }} />
      ))}
    </>
  );
}

function ReturnsTable({
  items, isLoading, isFetching, page, totalPages, totalCount, onPageChange, onEdit,
}: {
  items: ReturnItem[]; isLoading: boolean; isFetching: boolean;
  page: number; totalPages: number; totalCount: number; onPageChange: (p: number) => void;
  /** عند تمريرها يظهر عمود التعديل — مرتجعات العملاء فقط */
  onEdit?: (item: ReturnItem) => void;
}) {
  if (isLoading) return <SkeletonRows />;

  if (items.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3, opacity: isFetching ? 0.5 : 1 }}>
        لا توجد مرتجعات
      </Box>
    );
  }

  return (
    <Box sx={{ opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
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
              {onEdit && <th style={{ ...TH, textAlign: "center" }}>تعديل</th>}
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
                  <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.returnDate)}</Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx }}>{item.sellerName || "—"}</Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>{item.returnTypeLabel || "—"}</Box>
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
                {onEdit && (
                  <td style={{ ...TD, textAlign: "center" }}>
                    <Tooltip title="تعديل المرتجع" placement="top">
                      <Box
                        component="button"
                        type="button"
                        onClick={() => onEdit(item)}
                        sx={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 28, height: 28, borderRadius: "7px",
                          border: `1px solid ${HX.border2}`, bgcolor: HX.surface,
                          color: HX.tx2, cursor: "pointer", transition: ".15s",
                          "&:hover": { bgcolor: HX.accentLight, borderColor: HX.accentBorder, color: HX.accent },
                        }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 15 }} />
                      </Box>
                    </Tooltip>
                  </td>
                )}
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

interface FilterState {
  orderNumber: string;
  operationCode: string;
  status: string;
  sellerName: string;
}

const EMPTY_FILTERS: FilterState = { orderNumber: "", operationCode: "", status: "", sellerName: "" };

/** مرجع ثابت — يمنع إعادة حساب النموذج داخل المودال على كل render أثناء تحميل الـ meta. */
const NO_OPTIONS: { value: string | number; label: string }[] = [];

export default function ReturnsPanel() {
  const [activeTab, setActiveTab]     = useState<"vendor" | "customer">("vendor");
  const [filters, setFilters]         = useState<FilterState>(EMPTY_FILTERS);
  const [applied, setApplied]         = useState<FilterState>(EMPTY_FILTERS);
  const [vendorPage, setVendorPage]   = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [editItem, setEditItem]       = useState<ReturnItem | null>(null);

  const { data: meta } = useShipmentsMetaQuery();

  const vendorParams: ReturnsParams   = { page: vendorPage,   ...applied };
  const customerParams: ReturnsParams = { page: customerPage, ...applied };

  const vendorQ   = useVendorReturnsQuery(vendorParams);
  const customerQ = useCustomerReturnsQuery(customerParams);

  const vendorCount   = vendorQ.data?.totalCount   ?? 0;
  const customerCount = customerQ.data?.totalCount ?? 0;

  const active    = activeTab === "vendor" ? vendorQ   : customerQ;
  const items     = active.data?.items      ?? [];
  const totalCount = active.data?.totalCount ?? 0;
  const page      = activeTab === "vendor" ? vendorPage : customerPage;
  const setPage   = activeTab === "vendor" ? setVendorPage : setCustomerPage;
  const totalPages = Math.ceil(totalCount / RETURNS_PAGE_SIZE);

  const statusOptions = activeTab === "vendor"
    ? (meta?.vendorReturnStatuses   ?? [])
    : (meta?.customerReturnStatuses ?? []);

  // الفلاتر تُطبَّق مباشرة عند التغيير: القوائم فوراً، وحقول النص بعد توقّف الكتابة.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commit = (next: FilterState) => {
    setApplied(next);
    setVendorPage(1);
    setCustomerPage(1);
  };
  const applyNow = (next: FilterState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commit(next);
  };
  const applyDebounced = (next: FilterState) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commit(next), 500);
  };
  const setText = (field: keyof FilterState) => (v: string) => {
    const next = { ...filters, [field]: v };
    setFilters(next);
    applyDebounced(next);
  };
  const setSelect = (field: keyof FilterState) => (v: string) => {
    const next = { ...filters, [field]: v };
    setFilters(next);
    applyNow(next);
  };

  const handleTabChange = (id: "vendor" | "customer") => {
    if (id === activeTab) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEditItem(null);
    setActiveTab(id);
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setVendorPage(1);
    setCustomerPage(1);
  };

  const TABS = [
    { id: "vendor"   as const, label: "مرتجعات البائعين", count: vendorCount,   dot: HX.accent },
    { id: "customer" as const, label: "مرتجعات العملاء",  count: customerCount, dot: HX.red    },
  ];

  return (
    <Box sx={{
      bgcolor: HX.surface, borderRadius: HX.r,
      border: `0.5px solid ${HX.border}`,
      overflow: "hidden",
    }}>
      {/* Tab header */}
      <Box sx={{
        display: "flex", alignItems: "stretch",
        borderBottom: `1px solid ${HX.border}`,
        bgcolor: HX.surface,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Box
              key={tab.id}
              component="button"
              type="button"
              onClick={() => handleTabChange(tab.id)}
              sx={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                px: "16px", py: "9px",
                border: "none", bgcolor: HX.surface, cursor: "pointer",
                fontFamily: FONT, fontSize: "13px", fontWeight: isActive ? 700 : 500,
                color: isActive ? HX.accent : HX.tx2,
                borderBottom: isActive ? `2px solid ${HX.accent}` : "2px solid transparent",
                mb: "-1px",
                transition: "color .15s",
                "&:hover": !isActive ? { color: HX.tx } : {},
              }}
            >
              {tab.label}
              <Box component="span" sx={{
                display: "inline-flex", alignItems: "center", gap: "3px",
                fontFamily: FONT, fontSize: "11px", fontWeight: 700,
              }}>
                <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: tab.dot, flexShrink: 0 }} />
                {tab.count}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Filter bar */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
        px: "14px", py: "10px", borderBottom: `0.5px solid ${HX.border}`,
        bgcolor: HX.surface,
      }}>
        <SearchInput
          placeholder="بحث برقم الطلب..."
          value={filters.orderNumber}
          onChange={setText("orderNumber")}
        />
        <SearchInput
          placeholder="بحث برقم العملية..."
          value={filters.operationCode}
          onChange={setText("operationCode")}
        />
        <FilterSelect
          label="حالة المرتجع"
          value={filters.status}
          options={statusOptions}
          onChange={setSelect("status")}
        />
        <SearchInput
          placeholder="اسم البائع..."
          value={filters.sellerName}
          onChange={setText("sellerName")}
        />
      </Box>

      {/* Table */}
      <ReturnsTable
        items={items}
        isLoading={active.isLoading}
        isFetching={active.isFetching}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
        onEdit={activeTab === "customer" ? setEditItem : undefined}
      />

      <EditCustomerReturnModal
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        item={editItem}
        statusOptions={meta?.customerReturnStatuses ?? NO_OPTIONS}
      />
    </Box>
  );
}
