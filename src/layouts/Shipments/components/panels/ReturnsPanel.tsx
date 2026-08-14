import React, { useCallback, useEffect, useState, useRef } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { HX } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import { shipmentKeys } from "query/keys";
import {
  useVendorReturnsQuery,
  useCustomerReturnsQuery,
  RETURNS_PAGE_SIZE,
  type ReturnItem,
  type ReturnsParams,
  exportReturns,
} from "query/shipmentsReturns";
import VendorSelect from "components/VendorSelect/VendorSelect";
import EditCustomerReturnModal from "./EditCustomerReturnModal";

const FONT = "'Cairo', sans-serif";

/** يُصغّر ارتفاع VendorSelect إلى 34px ليطابق بقية حقول شريط الفلاتر. */
const filterVendorSx = {
  "& .MuiOutlinedInput-root": { minHeight: 34, height: 34, py: 0, borderRadius: "8px" },
  "& .MuiOutlinedInput-root .MuiAutocomplete-input": { py: 0 },
} as const;

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

/** خلايا الأعمدة — التسمية تأتي من تعريف كل تبويب، فنفس الخلية تُستخدم بعنوان مختلف. */
const CELL = {
  operationNumber: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
        {item.operationNumber || "—"}
      </Box>
    ),
  },
  orderNumber: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.accent }}>
        {item.orderNumber || "—"}
      </Box>
    ),
  },
  sellerName: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.tx }}>
        {item.sellerName || "—"}
      </Box>
    ),
  },
  reason: {
    tdStyle: { maxWidth: 200 } as React.CSSProperties,
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontSize: "12px", color: HX.tx2, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.reason || "—"}
      </Box>
    ),
  },
  returnDate: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.returnDate)}</Box>
    ),
  },
  daysCounter: {
    center: true,
    render: (item: ReturnItem) => (
      <Box component="span" sx={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 28, height: 22, px: "6px", borderRadius: "100px",
        fontSize: "11px", fontWeight: 700, fontFamily: FONT,
        bgcolor: HX.amberLight, color: HX.amber,
      }}>
        {item.daysCounter ?? "—"}
      </Box>
    ),
  },
  returnTypeLabel: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>
        {item.returnTypeLabel || "—"}
      </Box>
    ),
  },
  status: {
    render: (item: ReturnItem) => (
      <Box component="span" sx={{
        display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
        borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: FONT,
        bgcolor: HX.purpleLight, color: HX.purple,
      }}>
        {item.statusLabel || "—"}
      </Box>
    ),
  },
};

type CellKey = keyof typeof CELL;

interface ReturnColumn {
  key: CellKey;
  label: string;
  center?: boolean;
  tdStyle?: React.CSSProperties;
  render: (item: ReturnItem) => React.ReactNode;
}

function buildColumns(defs: { key: CellKey; label: string }[]): ReturnColumn[] {
  return defs.map((d) => ({ ...CELL[d.key], key: d.key, label: d.label }));
}

const VENDOR_COLUMNS = buildColumns([
  { key: "daysCounter",     label: "الأيام" },
  { key: "operationNumber", label: "رقم العملية" },
  { key: "orderNumber",     label: "رقم الطلب" },
  { key: "reason",          label: "السبب" },
  { key: "returnDate",      label: "تاريخ الإرجاع" },
  { key: "sellerName",      label: "البائع" },
  { key: "returnTypeLabel", label: "نوع الإرجاع" },
  { key: "status",          label: "الحالة" },
]);

/** ترتيب أعمدة مرتجعات العملاء — بلا عمود «نوع الإرجاع». */
const CUSTOMER_COLUMNS = buildColumns([
  { key: "operationNumber", label: "رقم العملية" },
  { key: "orderNumber",     label: "رقم الطلب" },
  { key: "sellerName",      label: "اسم البائع" },
  { key: "reason",          label: "سبب السحب" },
  { key: "returnDate",      label: "تاريخ السحب" },
  { key: "daysCounter",     label: "عدد الأيام" },
  { key: "status",          label: "حالة السحب" },
]);

function ReturnsTable({
  items, isLoading, isFetching, page, totalPages, totalCount, onPageChange, columns, onEdit,
}: {
  items: ReturnItem[]; isLoading: boolean; isFetching: boolean;
  page: number; totalPages: number; totalCount: number; onPageChange: (p: number) => void;
  columns: ReturnColumn[];
  /** عند تمريرها يظهر عمود التعديل — مرتجعات العملاء والموردين */
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
              {columns.map((c) => (
                <th key={c.key} style={c.center ? { ...TH, textAlign: "center" } : TH}>{c.label}</th>
              ))}
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
                {columns.map((c) => (
                  <td
                    key={c.key}
                    style={{ ...TD, ...(c.center ? { textAlign: "center" as const } : null), ...c.tdStyle }}
                  >
                    {c.render(item)}
                  </td>
                ))}
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

interface ReturnsPanelProps {
  onExporterChange?: (exporter: { run: () => Promise<void>; successMessage: string } | null) => void;
}

export default function ReturnsPanel({ onExporterChange }: ReturnsPanelProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab]     = useState<"vendor" | "customer">("vendor");
  const [filters, setFilters]         = useState<FilterState>(EMPTY_FILTERS);
  const [applied, setApplied]         = useState<FilterState>(EMPTY_FILTERS);
  const [vendorPage, setVendorPage]   = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [editItem, setEditItem]       = useState<ReturnItem | null>(null);

  const { data: meta } = useShipmentsMetaQuery();

  const vendorParams: ReturnsParams   = { page: vendorPage,   ...applied };
  const customerParams: ReturnsParams = { page: customerPage, ...applied };

  const exportCurrentView = useCallback(
    () => exportReturns(activeTab, activeTab === "vendor" ? vendorParams : customerParams),
    [activeTab, applied, customerPage, vendorPage],
  );

  useEffect(() => {
    onExporterChange?.({
      run: exportCurrentView,
      successMessage: activeTab === "vendor" ? "تم تصدير مرتجعات الموردين" : "تم تصدير مرتجعات العملاء",
    });
    return () => onExporterChange?.(null);
  }, [activeTab, exportCurrentView, onExporterChange]);

  // Only the visible return list is requested. Previously opening this panel
  // always fired both endpoints and made the first tab switch contend for work.
  const vendorQ   = useVendorReturnsQuery(vendorParams, activeTab === "vendor");
  const customerQ = useCustomerReturnsQuery(customerParams, activeTab === "customer");

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
    queryClient.removeQueries({ queryKey: shipmentKeys.returnsRoot() });
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

      {/* Filter bar — نصف العرض على الشاشات الكبيرة فقط، كامل العرض على الأصغر */}
      <Box sx={{ px: "14px", py: "10px", borderBottom: `0.5px solid ${HX.border}`, bgcolor: HX.surface }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
          width: "100%",
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
            label={activeTab === "customer" ? "حالة السحب" : "حالة المرتجع"}
            value={filters.status}
            options={statusOptions}
            onChange={setSelect("status")}
          />
          <Box sx={{ flex: "1 1 140px", minWidth: 0 }}>
            {/* الـ API يفلتر بالاسم لا بالمعرّف، فنُخزّن تسمية الخيار في sellerName */}
            <VendorSelect
              value={filters.sellerName}
              onChange={(_id, opt) => setSelect("sellerName")(opt ? opt.label : "")}
              sx={filterVendorSx}
            />
          </Box>
        </Box>
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
        columns={activeTab === "vendor" ? VENDOR_COLUMNS : CUSTOMER_COLUMNS}
        onEdit={setEditItem}
      />

      <EditCustomerReturnModal
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        item={editItem}
        returnKind={activeTab === "vendor" ? "vendor" : "customer"}
        statusOptions={
          (activeTab === "vendor" ? meta?.vendorReturnStatuses : meta?.customerReturnStatuses) ??
          NO_OPTIONS
        }
      />
    </Box>
  );
}
