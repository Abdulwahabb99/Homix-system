import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Checkbox, IconButton, MenuItem, TextField } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import { usePermissions } from "shared/permissions";
import { useSelector } from "react-redux";
import EditDeliveryAccountModal from "./EditDeliveryAccountModal";
import BulkEditDeliveryAccountModal from "./BulkEditDeliveryAccountModal";
import EditExpenseModal from "./EditExpenseModal";
import BulkEditExpenseModal from "./BulkEditExpenseModal";
import AddExpenseForm from "./AddExpenseForm";
import moment from "moment";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import {
  deliveryAccountReferenceHref,
  isDeliveryAccountAttachment,
} from "./deliveryAccountReference";
import {
  exportDeliveryAccounts,
  exportExpenseAccounts,
  useDeliveryAccountsQuery,
  useUpdateDeliveryAccountMutation,
  useHideDeliveryAccountMutation,
  useBulkHideDeliveryAccountsMutation,
  useDeleteExpenseMutation,
  useExpenseAccountsQuery,
  ACCOUNTS_PAGE_SIZE,
  type DeliveryAccountItem,
  type ExpenseItem,
} from "query/shipmentsAccounts";

const FONT = "'Cairo', sans-serif";

export interface AccountsPanelExporter {
  run: () => Promise<void>;
  successMessage: string;
}

interface AccountsPanelProps {
  onExporterChange?: (exporter: AccountsPanelExporter | null) => void;
}

const SUB_TABS = [
  { id: "deliveries", label: "حسابات التسليم", permission: "ship_delivery_accounts_view" },
  { id: "expenses",   label: "المصروفات",      permission: "ship_expenses_view" },
] as const;

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

function ReferenceCell({ reference }: { reference: string | null }) {
  if (!reference) return <Box component="span" sx={{ color: HX.tx3 }}>—</Box>;

  if (!isDeliveryAccountAttachment(reference)) {
    return <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3 }}>{reference}</Box>;
  }

  return (
    <Box
      component="a"
      href={deliveryAccountReferenceHref(reference)}
      download
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تحميل مرفق المرجع"
      title="تحميل مرفق المرجع"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: FONT,
        fontSize: "11.5px",
        fontWeight: 800,
        color: HX.accent,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        "&:hover": { color: HX.blue },
      }}
    >
      REF
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

function DeliveriesTab({ onExporterChange }: AccountsPanelProps) {
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin = user?.userType === "1";
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<DeliveryAccountItem | null>(null);
  const [filters, setFilters] = useState<DeliveryFilterState>(EMPTY_DELIVERY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DeliveryFilterState>(EMPTY_DELIVERY_FILTERS);
  const [selectionModel, setSelectionModel] = useState<number[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const { data: meta } = useShipmentsMetaQuery();
  const { data, isLoading, isFetching, isError } = useDeliveryAccountsQuery({ page, ...appliedFilters });
  const hideMutation = useHideDeliveryAccountMutation();
  const bulkHideMutation = useBulkHideDeliveryAccountsMutation();
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / ACCOUNTS_PAGE_SIZE);
  const isAllSelected = items.length > 0 && items.every((item) => selectionModel.includes(item.id));
  const isIndeterminate = !isAllSelected && items.some((item) => selectionModel.includes(item.id));

  const toggleSelect = (id: number) => {
    setSelectionModel((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectionModel((current) => {
      if (isAllSelected) {
        return current.filter((id) => !items.some((item) => item.id === id));
      }
      const toAdd = items.map((item) => item.id).filter((id) => !current.includes(id));
      return [...current, ...toAdd];
    });
  };

  const setFilter = (field: keyof DeliveryFilterState) => (value: string) =>
    setFilters((current) => ({ ...current, [field]: value }));

  const exportCurrentView = useCallback(
    () => exportDeliveryAccounts(appliedFilters),
    [appliedFilters],
  );

  useEffect(() => {
    onExporterChange?.({ run: exportCurrentView, successMessage: "تم تصدير حسابات التسليم" });
    return () => onExporterChange?.(null);
  }, [exportCurrentView, onExporterChange]);

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
        {isAdmin && selectionModel.length > 0 && (
          <Button
            variant="contained"
            onClick={() => setIsBulkEditOpen(true)}
            sx={{ color: "#fff", height: 38, fontFamily: FONT, fontSize: "12px", mr: "auto" }}
          >
            تعديل المحدد ({selectionModel.length})
          </Button>
        )}
        {isAdmin && selectionModel.length > 0 && (
          <Button
            variant="outlined"
            disabled={bulkHideMutation.isPending}
            onClick={() => {
              if (window.confirm(`إخفاء ${selectionModel.length} سجل من تبويب الحسابات فقط؟ الطلبات والشحنات تظل كما هي في كل مكان آخر.`)) {
                bulkHideMutation.mutate(selectionModel, { onSuccess: () => setSelectionModel([]) });
              }
            }}
            sx={{
              height: 38, fontFamily: FONT, fontSize: "12px",
              color: HX.red, borderColor: HX.red,
              "&:hover": { borderColor: HX.red, bgcolor: HX.redLight },
            }}
          >
            إخفاء المحدد ({selectionModel.length})
          </Button>
        )}
      </Box>

      <BulkEditDeliveryAccountModal
        open={isBulkEditOpen}
        onClose={() => { setIsBulkEditOpen(false); setSelectionModel([]); }}
        orderIds={selectionModel}
        statusOptions={meta?.accountingStatuses ?? []}
      />

      <EditDeliveryAccountModal
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        item={editItem}
        statusOptions={meta?.accountingStatuses ?? []}
        isAdmin={isAdmin}
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
              <th style={{ ...TH, textAlign: "center", width: 36 }}>
                <Checkbox size="small" checked={isAllSelected} indeterminate={isIndeterminate} onChange={toggleSelectAll} />
              </th>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الطلب</th>
              <th style={TH}>البائع</th>
              <th style={TH}>كود المنتج</th>
              <th style={TH}>شركة الشحن</th>
              <th style={TH}>تاريخ التسليم الفعلي</th>
              <th style={TH}>طريقة الدفع</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ المطلوب تحصيله</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ المستلم</th>
              <th style={TH}>حالة المحاسبة</th>
              <th style={TH}>تاريخ المحاسبة</th>
              <th style={TH}>المرجع</th>
              <th style={{ ...TH, width: 48 }}>تعديل</th>
              {isAdmin && <th style={{ ...TH, width: 48 }}>إخفاء</th>}
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
                <td style={{ ...TD, textAlign: "center" }}>
                  <Checkbox size="small" checked={selectionModel.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
                    {item.operationNumber || "—"}
                  </Box>
                </td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.accent }}>{item.orderNumber || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.sellerName || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>{item.productCode || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.shippingCompanyName || "—"}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.deliveryDate)}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>{item.paymentMethodLabel || "—"}</Box></td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.amountToCollect} /></td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.receivedAmount} /></td>
                <td style={TD}><StatusBadge label={item.accountingStatusLabel} /></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.accountingDate)}</Box></td>
                <td style={TD}><ReferenceCell reference={item.reference} /></td>
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
                {isAdmin && (
                  <td style={TD}>
                    <IconButton
                      size="small"
                      aria-label="إخفاء من تبويب الحسابات"
                      title="إخفاء من تبويب الحسابات فقط — لا يمسح الطلب أو الشحنة"
                      disabled={hideMutation.isPending}
                      onClick={() => {
                        if (window.confirm("إخفاء هذا السجل من تبويب الحسابات فقط؟ الطلب والشحنة يظلان كما هما في كل مكان آخر.")) {
                          hideMutation.mutate(item.id);
                        }
                      }}
                      sx={{ color: HX.tx3, "&:hover": { color: HX.red } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </td>
                )}
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

function ExpensesTab({ onExporterChange }: AccountsPanelProps) {
  const [page, setPage] = useState(1);
  const [editItem, setEditItem] = useState<ExpenseItem | null>(null);
  const [selectionModel, setSelectionModel] = useState<number[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const { data: meta } = useShipmentsMetaQuery();
  const { data, isLoading, isFetching, isError } = useExpenseAccountsQuery({ page });
  const deleteMutation = useDeleteExpenseMutation();
  const items      = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / ACCOUNTS_PAGE_SIZE);
  const isAllSelected = items.length > 0 && items.every((item) => selectionModel.includes(item.id));
  const isIndeterminate = !isAllSelected && items.some((item) => selectionModel.includes(item.id));

  const toggleSelect = (id: number) => {
    setSelectionModel((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectionModel((current) => {
      if (isAllSelected) {
        return current.filter((id) => !items.some((item) => item.id === id));
      }
      const toAdd = items.map((item) => item.id).filter((id) => !current.includes(id));
      return [...current, ...toAdd];
    });
  };

  const exportCurrentView = useCallback(() => exportExpenseAccounts(), []);

  useEffect(() => {
    onExporterChange?.({ run: exportCurrentView, successMessage: "تم تصدير المصروفات" });
    return () => onExporterChange?.(null);
  }, [exportCurrentView, onExporterChange]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <AddExpenseForm />
      </Box>

      {selectionModel.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            variant="contained"
            onClick={() => setIsBulkEditOpen(true)}
            sx={{ color: "#fff", height: 36, fontFamily: FONT, fontSize: "12px" }}
          >
            تعديل حالة المحدد ({selectionModel.length})
          </Button>
        </Box>
      )}

      <BulkEditExpenseModal
        open={isBulkEditOpen}
        onClose={() => { setIsBulkEditOpen(false); setSelectionModel([]); }}
        expenseIds={selectionModel}
        statusOptions={meta?.accountingStatuses ?? []}
      />

      <EditExpenseModal
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        item={editItem}
        typeOptions={meta?.expenseTypes ?? []}
        statusOptions={meta?.accountingStatuses ?? []}
      />

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
              <th style={{ ...TH, textAlign: "center", width: 36 }}>
                <Checkbox size="small" checked={isAllSelected} indeterminate={isIndeterminate} onChange={toggleSelectAll} />
              </th>
              <th style={TH}>التاريخ</th>
              <th style={TH}>النوع</th>
              <th style={TH}>السبب</th>
              <th style={{ ...TH, textAlign: "center" }}>المبلغ</th>
              <th style={TH}>حالة المحاسبة</th>
              <th style={{ ...TH, width: 80 }} />
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
                <td style={{ ...TD, textAlign: "center" }}>
                  <Checkbox size="small" checked={selectionModel.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                </td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{fmtDate(item.accountingDate)}</Box></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "11px", fontWeight: 600, color: HX.tx2 }}>{item.typeLabel || "—"}</Box></td>
                <td style={{ ...TD, maxWidth: 200 }}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.reason || "—"}
                  </Box>
                </td>
                <td style={{ ...TD, textAlign: "center" }}><MoneyCell amount={item.amount} /></td>
                <td style={TD}><StatusBadge label={item.accountingStatusLabel} /></td>
                <td style={TD}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <IconButton
                      size="small"
                      aria-label="تعديل المصروف"
                      onClick={() => setEditItem(item)}
                      sx={{ color: HX.tx3, "&:hover": { color: HX.accent } }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="حذف المصروف"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item.id)}
                      sx={{ color: HX.tx3, "&:hover": { color: HX.red } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
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

export default function AccountsPanel({ onExporterChange }: AccountsPanelProps) {
  const { can } = usePermissions();
  const visibleSubTabs = SUB_TABS.filter((tab) => can(tab.permission));
  const [activeSubTab, setActiveSubTab] = useState(visibleSubTabs[0]?.id ?? "deliveries");
  const { data: meta } = useShipmentsMetaQuery();
  const subTabCounts: Record<string, number> = {
    deliveries: meta?.subTabCounts.accountDeliveries ?? 0,
    expenses: meta?.subTabCounts.accountExpenses ?? 0,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {visibleSubTabs.map((tab) => {
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
              <Box component="span" sx={{
                minWidth: 18,
                height: 18,
                px: "5px",
                borderRadius: "100px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: active ? "rgba(99, 102, 241, 0.16)" : HX.surface3,
                color: active ? HX.accent : HX.tx3,
                fontSize: "10px",
                fontWeight: 700,
              }}>
                {subTabCounts[tab.id] ?? 0}
              </Box>
            </Box>
          );
        })}
      </Box>

      {activeSubTab === "deliveries" && <DeliveriesTab onExporterChange={onExporterChange} />}
      {activeSubTab === "expenses"   && <ExpensesTab onExporterChange={onExporterChange} />}
    </Box>
  );
}
