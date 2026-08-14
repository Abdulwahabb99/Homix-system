import React, { useState } from "react";
import { Box, Button, IconButton, MenuItem, TextField } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import EditDeliveryAccountModal from "./EditDeliveryAccountModal";
import AddExpenseForm from "./AddExpenseForm";
import moment from "moment";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import {
  exportDeliveryAccounts,
  exportExpenseAccounts,
  useDeliveryAccountsQuery,
  useUpdateDeliveryAccountMutation,
  useDeleteExpenseMutation,
  useExpenseAccountsQuery,
  ACCOUNTS_PAGE_SIZE,
  type DeliveryAccountItem,
  type ExpenseItem,
} from "query/shipmentsAccounts";

const FONT = "'Cairo', sans-serif";

const SUB_TABS = [
  { id: "deliveries", label: "حسابات التسليم" },
  { id: "expenses",   label: "المصروفات" },
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

function MoneyCell({ amount }: { amount: number | null }) {
  if (amount == null) return <span style={{ color: HX.tx3 }}>—</span>;
  return (
    <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700 }}>
      {Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}
      <Box component="span" sx={{ fontSize: "10px", color: HX.tx3, mr: "3px" }}>ج.م</Box>
    </Box>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
      borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: FONT,
      bgcolor: HX.blueLight, color: HX.blue,
    }}>
      {label || "—"}
    </Box>
  );
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

/** فشل الطلب كان يمرّ صامتاً فيظهر الجدول فارغاً وكأن الوحدة «لا تعمل». */
/** يطابق ACCOUNTING_STATUS بالباك إند */
interface DeliveryFilterState {
  accountingStatus: string;
  orderNumber: string;
  paymentMethod: string;
  settledDate: string;
}

const filterFieldSx = {
  minWidth: 150,
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT, height: 38 },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

const EMPTY_DELIVERY_FILTERS: DeliveryFilterState = {
  accountingStatus: "",
  orderNumber: "",
  paymentMethod: "",
  settledDate: "",
};

function ErrorBox({ message }: { message: string }) {
  return (
    <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.red ?? "#dc2626" }}>
      {message}
    </Box>
  );
}

function DeliveriesTab() {
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<DeliveryAccountItem | null>(null);
  const [filters, setFilters] = useState<DeliveryFilterState>(EMPTY_DELIVERY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DeliveryFilterState>(EMPTY_DELIVERY_FILTERS);
  const [isExporting, setIsExporting] = useState(false);
  const { data: meta } = useShipmentsMetaQuery();
  const { data, isLoading, isFetching, isError } = useDeliveryAccountsQuery({ page, ...appliedFilters });
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / ACCOUNTS_PAGE_SIZE);

  const setFilter = (field: keyof DeliveryFilterState) => (value: string) =>
    setFilters((current) => ({ ...current, [field]: value }));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportDeliveryAccounts(appliedFilters);
      NotificationMeassage("success", "تم تصدير حسابات التسليم");
    } catch {
      NotificationMeassage("error", "تعذّر تصدير حسابات التسليم");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* شريط الفلاتر — يُطبَّق عند الضغط حتى لا يُعاد الجلب مع كل حرف */}
      <Box sx={{ ...cardSx, p: "12px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="بحث برقم الطلب..."
          value={filters.orderNumber}
          onChange={(e) => setFilter("orderNumber")(e.target.value)}
          sx={filterFieldSx}
        />
        <TextField
          select
          size="small"
          label="حالة المحاسبة"
          value={filters.accountingStatus}
          onChange={(e) => setFilter("accountingStatus")(e.target.value)}
          sx={filterFieldSx}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="" sx={{ fontSize: "12px" }}>الكل</MenuItem>
          {(meta?.accountingStatuses ?? []).map((option) => (
            <MenuItem key={option.value} value={String(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="طريقة الدفع"
          value={filters.paymentMethod}
          onChange={(e) => setFilter("paymentMethod")(e.target.value)}
          sx={filterFieldSx}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="" sx={{ fontSize: "12px" }}>الكل</MenuItem>
          {(meta?.paymentStatuses ?? []).map((option) => (
            <MenuItem key={option.value} value={String(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          size="small"
          label="تاريخ المحاسبة"
          value={filters.settledDate}
          onChange={(e) => setFilter("settledDate")(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <Button
          variant="contained"
          onClick={() => { setPage(1); setAppliedFilters(filters); }}
          sx={{ color: "#fff", height: 38, fontFamily: FONT, fontSize: "12px" }}
        >
          تطبيق
        </Button>
        <Button
          onClick={() => { setPage(1); setFilters(EMPTY_DELIVERY_FILTERS); setAppliedFilters(EMPTY_DELIVERY_FILTERS); }}
          sx={{ height: 38, fontFamily: FONT, fontSize: "12px" }}
        >
          إعادة ضبط
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          sx={{ height: 38, fontFamily: FONT, fontSize: "12px", mr: "auto" }}
        >
          {isExporting ? "جارٍ التصدير..." : "تصدير Excel"}
        </Button>
      </Box>

      <EditDeliveryAccountModal
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        item={editItem}
        statusOptions={meta?.accountingStatuses ?? []}
      />

      {isLoading ? (
        <SkeletonRows />
      ) : isError ? (
        <ErrorBox message="تعذّر تحميل حسابات التسليم" />
      ) : items.length === 0 ? (
        <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3, opacity: isFetching ? 0.5 : 1 }}>
          لا توجد حسابات تسليم
        </Box>
      ) : (
    <Box sx={{ ...cardSx, opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الطلب</th>
              <th style={TH}>البائع</th>
              <th style={TH}>كود المنتج</th>
              <th style={TH}>التوصيل بواسطة</th>
              <th style={TH}>تاريخ التسليم</th>
              <th style={TH}>طريقة الدفع</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ</th>
              <th style={{ ...TH, textAlign: "center" }}>تكلفة الشحن</th>
              <th style={TH}>حالة المحاسبة</th>
              <th style={TH}>تاريخ المحاسبة</th>
              <th style={TH}>المرجع</th>
              <th style={{ ...TH, width: 48 }}>تعديل</th>
            </tr>
          </thead>
          <tbody>
            {(items as DeliveryAccountItem[]).map((item, idx) => (
              <tr
                key={item.id}
                style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
              >
                <td style={TD}>
                  <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
                    {item.operationNumber || "—"}
                  </Box>
                </td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.accent }}>{item.orderNumber || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.sellerName || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>{item.productCode || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.deliveryBy || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.deliveryDate)}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>{item.paymentMethodLabel || "—"}</Box></td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.amountToCollect} /></td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.shippingCost} /></td>
                <td style={TD}><StatusBadge label={item.accountingStatusLabel} /></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.accountingDate)}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3 }}>{item.reference || "—"}</Box></td>
                <td style={TD}>
                  <IconButton
                    size="small"
                    aria-label="تعديل حالة المحاسبة"
                    onClick={() => setEditItem(item)}
                    sx={{ color: HX.tx3, "&:hover": { color: HX.accent } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <HomixPaginationBar
        page={page - 1} totalPages={totalPages} pageSize={ACCOUNTS_PAGE_SIZE}
        totalCount={totalCount} onPageChange={(p) => setPage(p + 1)} itemLabel="سجل"
      />
    </Box>
      )}
    </Box>
  );
}

function ExpensesTab() {
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const { data, isLoading, isFetching, isError } = useExpenseAccountsQuery({ page });
  const deleteMutation = useDeleteExpenseMutation();
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / ACCOUNTS_PAGE_SIZE);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExpenseAccounts();
      NotificationMeassage("success", "تم تصدير المصروفات");
    } catch {
      NotificationMeassage("error", "تعذّر تصدير المصروفات");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            sx={{ height: 34, fontFamily: FONT, fontSize: "12px" }}
          >
            {isExporting ? "جارٍ التصدير..." : "تصدير Excel"}
          </Button>
        </Box>
        <AddExpenseForm />
      </Box>
      {isLoading ? (
        <SkeletonRows />
      ) : isError ? (
        <ErrorBox message="تعذّر تحميل المصروفات" />
      ) : items.length === 0 ? (
        <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3, opacity: isFetching ? 0.5 : 1 }}>
          لا توجد مصروفات
        </Box>
      ) : (
    <Box sx={{ ...cardSx, opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={TH}>التاريخ</th>
              <th style={TH}>حالة المحاسبة</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ</th>
              <th style={TH}>السبب</th>
              <th style={TH}>النوع</th>
              <th style={{ ...TH, width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {(items as ExpenseItem[]).map((item, idx) => (
              <tr
                key={item.id}
                style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
              >
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.accountingDate)}</Box></td>
                <td style={TD}><StatusBadge label={item.accountingStatusLabel} /></td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.amount} /></td>
                <td style={{ ...TD, maxWidth: 200 }}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.reason || "—"}
                  </Box>
                </td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>{item.typeLabel || "—"}</Box></td>
                <td style={TD}>
                  <IconButton
                    size="small"
                    aria-label="حذف المصروف"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(item.id)}
                    sx={{ color: HX.tx3, "&:hover": { color: HX.red } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <HomixPaginationBar
        page={page - 1} totalPages={totalPages} pageSize={ACCOUNTS_PAGE_SIZE}
        totalCount={totalCount} onPageChange={(p) => setPage(p + 1)} itemLabel="مصروف"
      />
    </Box>
      )}
    </Box>
  );
}

export default function AccountsPanel() {
  const [activeSubTab, setActiveSubTab] = useState("deliveries");

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

      {activeSubTab === "deliveries" && <DeliveriesTab />}
      {activeSubTab === "expenses"   && <ExpensesTab />}
    </Box>
  );
}
