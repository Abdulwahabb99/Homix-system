import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { usePermissions } from "shared/permissions";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import {
  fetchReceiptDocument,
  receiptError,
  ReceiptItem,
  useReceiptDocument,
  useReceiptDocuments,
  useReceiptList,
  useReceiptVendors,
  exportReceipts,
  useReceiveItems,
  useCancelReceipt,
  useUpdateReceipt,
  ReceiptDocument as DocumentData,
} from "query/shipmentReceipts";
import ReceiptDocumentDialog from "./ReceiptDocument";

const FONT = "'Cairo', sans-serif";
const PAGE_SIZE = 20;

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

const filterFieldSx = {
  minWidth: 150,
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT, height: 38 },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

const today = () => moment().tz("Africa/Cairo").format("YYYY-MM-DD");
const dateLabel = (value: string | null) =>
  value ? moment(value).tz("Africa/Cairo").format("DD/MM/YY") : "—";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
      {children}
    </Box>
  );
}

function DocumentBadge({ number, onClick }: { number: string | null; onClick?: () => void }) {
  if (!number) {
    return (
      <Box component="span" sx={{
        display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
        borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: FONT,
        bgcolor: HX.amberLight, color: HX.amber,
      }}>
        لسه ما اتطبعش
      </Box>
    );
  }
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
        borderRadius: "100px", fontSize: "11px", fontWeight: 700, fontFamily: FONT,
        bgcolor: HX.greenLight, color: "#065f46", border: "none", cursor: "pointer",
        "&:hover": { bgcolor: HX.accentLight, color: HX.accent },
      }}
    >
      {number}
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

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.red }}>
      {message}
      {onRetry && (
        <Button onClick={onRetry} sx={{ display: "block", mx: "auto", mt: 1, fontFamily: FONT, fontSize: "12px" }}>
          إعادة المحاولة
        </Button>
      )}
    </Box>
  );
}

const INLINE_CTRL: React.CSSProperties = {
  fontFamily: FONT, fontSize: "11.5px", color: HX.tx, background: HX.surface2,
  border: `0.5px solid ${HX.border}`, borderRadius: 7, padding: "5px 7px",
};

/** حقل ملاحظة يُحفظ عند مغادرته فقط إن تغيّرت القيمة. */
function NoteInput({ value, onCommit, disabled }: { value: string; onCommit: (next: string) => void; disabled?: boolean }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <input
      aria-label="ملاحظات الاستلام"
      style={{ ...INLINE_CTRL, width: 180 }}
      value={text}
      maxLength={4000}
      placeholder="اكتب ملاحظة..."
      disabled={disabled}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => { if (text.trim() !== value.trim()) onCommit(text.trim()); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
    />
  );
}

/** حقل تاريخ يُحفظ عند مغادرته فقط (تجنباً لمسح التاريخ أثناء التحرير الجزئي). */
function DateCommitInput({ value, max, onCommit }: { value: string; max?: string; onCommit: (next: string | null) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <input
      type="date"
      aria-label="تاريخ التصنيع"
      style={{ ...INLINE_CTRL, width: 125 }}
      value={text}
      max={max}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => { if (text !== value) onCommit(text || null); }}
    />
  );
}

/** مدة التصنيع حتى الاستلام: أخضر ≤7 أيام، كهرماني ≤14، أحمر بعدها، وتحذير إن سبق التصنيعُ الاستلامَ. */
function DaysBadge({ days }: { days: number | null }) {
  if (days == null) {
    return <Box component="span" sx={{ fontSize: "11px", color: HX.tx3, fontFamily: FONT }}>حدد تاريخ التصنيع</Box>;
  }
  const tone = days < 0
    ? { bg: HX.redLight, color: "#991b1b", text: "التصنيع بعد الاستلام" }
    : days <= 7 ? { bg: HX.greenLight, color: "#065f46", text: `${days} يوم` }
    : days <= 14 ? { bg: HX.amberLight, color: "#92400e", text: `${days} يوم` }
    : { bg: HX.redLight, color: "#991b1b", text: `${days} يوم` };
  return (
    <Box component="span" sx={{ px: "8px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, fontFamily: FONT, bgcolor: tone.bg, color: tone.color }}>
      {tone.text}
    </Box>
  );
}

function ItemTable({
  items,
  selected,
  onSelect,
  mode,
  onDocument,
  onCancel,
  onUpdate,
  onPrint,
}: {
  items: ReceiptItem[];
  selected: ReceiptItem[];
  onSelect: (items: ReceiptItem[]) => void;
  mode: "received" | "candidates";
  onDocument?: (number: string) => void;
  onCancel?: (item: ReceiptItem) => void;
  /** تعديل مباشر لتاريخ التصنيع / الملاحظات (يتطلب ship_edit) */
  onUpdate?: (item: ReceiptItem, patch: { notes?: string; manufactureDate?: string | null }) => void;
  onPrint?: (item: ReceiptItem) => void;
}) {
  const has = (item: ReceiptItem) => selected.some((entry) => entry.orderId === item.orderId);
  const all = items.length > 0 && items.every(has);
  const indeterminate = !all && items.some(has);
  const toggle = (item: ReceiptItem) =>
    onSelect(has(item) ? selected.filter((entry) => entry.orderId !== item.orderId) : [...selected, item]);
  const toggleAll = () =>
    onSelect(
      all
        ? selected.filter((entry) => !items.some((item) => item.orderId === entry.orderId))
        : [...selected, ...items.filter((item) => !has(item))]
    );

  if (items.length === 0) {
    return (
      <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
        لا توجد أصناف مطابقة
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "center", width: 36 }}>
                <Checkbox size="small" checked={all} indeterminate={indeterminate} onChange={toggleAll} />
              </th>
              <th style={TH}>رقم العملية</th>
              <th style={TH}>رقم الطلب</th>
              <th style={TH}>الصنف / SKU</th>
              <th style={TH}>المصنع</th>
              <th style={{ ...TH, textAlign: "center" }}>الكمية</th>
              <th style={TH}>تاريخ التصنيع</th>
              {mode === "received" && (
                <>
                  <th style={TH}>تاريخ الاستلام</th>
                  <th style={TH}>مدة التصنيع</th>
                  <th style={TH}>استلم بواسطة</th>
                  <th style={TH}>الملاحظات</th>
                  <th style={TH}>سند الاستلام</th>
                  {onCancel && <th style={TH}>إجراءات</th>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.orderId}
                style={{ background: has(item) ? HX.accentLight : idx % 2 === 0 ? HX.surface : HX.surface2 }}
              >
                <td style={{ ...TD, textAlign: "center" }}>
                  <Checkbox size="small" checked={has(item)} onChange={() => toggle(item)} />
                </td>
                <td style={TD}><Code>{item.operationNumber}</Code></td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", fontWeight: 600, color: HX.accent }}>#{item.orderNumber}</Box></td>
                <td style={TD}>
                  <Box sx={{ fontSize: "12px", fontWeight: 700, color: HX.tx }}>{item.productName}</Box>
                  <Box sx={{ fontSize: "11px", color: HX.tx3, fontFamily: "monospace" }}>{item.productSku || "—"}</Box>
                </td>
                <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.vendorName || "—"}</Box></td>
                <td style={{ ...TD, textAlign: "center" }}>{item.quantity}</td>
                <td style={TD}>
                  {mode === "received" && onUpdate ? (
                    <DateCommitInput
                      value={item.manufactureDate ? moment(item.manufactureDate).tz("Africa/Cairo").format("YYYY-MM-DD") : ""}
                      max={item.receivedDate ? moment(item.receivedDate).tz("Africa/Cairo").format("YYYY-MM-DD") : undefined}
                      onCommit={(next) => onUpdate(item, { manufactureDate: next })}
                    />
                  ) : (
                    <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{dateLabel(item.manufactureDate)}</Box>
                  )}
                </td>
                {mode === "received" && (
                  <>
                    <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{dateLabel(item.receivedDate)}</Box></td>
                    <td style={TD}><DaysBadge days={item.manufactureDays} /></td>
                    <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.receiverName || "—"}</Box></td>
                    <td style={{ ...TD, maxWidth: 200, whiteSpace: "normal" }}>
                      {onUpdate ? (
                        <NoteInput value={item.notes ?? ""} onCommit={(next) => onUpdate(item, { notes: next })} />
                      ) : (
                        <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3 }}>{item.notes || "—"}</Box>
                      )}
                    </td>
                    <td style={TD}>
                      <DocumentBadge number={item.documentNumber} onClick={() => item.documentNumber && onDocument?.(item.documentNumber)} />
                    </td>
                    {onCancel && (
                      <td style={TD}>
                        {onPrint && (
                          <Button size="small" startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => onPrint(item)} sx={{ fontFamily: FONT, fontSize: "11.5px" }}>
                            {item.documentNumber ? "إعادة طباعة السند" : "طباعة سند"}
                          </Button>
                        )}
                        <Button size="small" color="error" onClick={() => onCancel(item)}>إلغاء الاستلام</Button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

type ReceiptsPanelProps = {
  onExporterChange?: (exporter: { run: () => Promise<void>; successMessage: string } | null) => void;
};

export default function ReceiptsPanel({ onExporterChange }: ReceiptsPanelProps) {
  const { can } = usePermissions();
  const canEdit = can("ship_edit");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const history = useReceiptDocuments(historyPage, "", historyOpen);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentState, setDocumentState] = useState<"" | "issued" | "none">("");
  const [debounced, setDebounced] = useState("");
  const [sku, setSku] = useState("");
  const [operationNumber, setOperationNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [textFilters, setTextFilters] = useState({ sku: "", operationNumber: "", orderNumber: "", documentNumber: "" });
  const { data: vendorOptions = [] } = useReceiptVendors();
  const [selected, setSelected] = useState<ReceiptItem[]>([]);
  const [open, setOpen] = useState(false);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candSku, setCandSku] = useState("");
  const [candOperation, setCandOperation] = useState("");
  const [candOrder, setCandOrder] = useState("");
  const [candVendorId, setCandVendorId] = useState("");
  const [candText, setCandText] = useState({ sku: "", operationNumber: "", orderNumber: "" });
  const [chosen, setChosen] = useState<ReceiptItem[]>([]);
  const [receivedDate, setReceivedDate] = useState(today);
  const [senderName, setSenderName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCandText({ sku: candSku.trim(), operationNumber: candOperation.trim(), orderNumber: candOrder.trim() });
      setCandidatePage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [candSku, candOperation, candOrder]);
  const candidateFilters = React.useMemo(() => ({ ...candText, vendorId: candVendorId }), [candText, candVendorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextFilters({ sku: sku.trim(), operationNumber: operationNumber.trim(), orderNumber: orderNumber.trim(), documentNumber: documentNumber.trim() });
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [sku, operationNumber, orderNumber, documentNumber]);

  const filters = React.useMemo(
    () => ({ ...textFilters, vendorId, documentState, dateFrom, dateTo }),
    [textFilters, vendorId, documentState, dateFrom, dateTo]
  );
  const list = useReceiptList("received", page, debounced, "", true, filters);
  const exportCurrentView = useCallback(
    () => exportReceipts(debounced, "", filters),
    [debounced, filters]
  );
  useEffect(() => {
    onExporterChange?.({ run: exportCurrentView, successMessage: "تم تصدير الاستلامات" });
    return () => onExporterChange?.(null);
  }, [exportCurrentView, onExporterChange]);
  const candidates = useReceiptList("candidates", candidatePage, "", "", open, candidateFilters);
  const receive = useReceiveItems();
  const cancel = useCancelReceipt();
  const updateReceipt = useUpdateReceipt();
  const [cancelItem, setCancelItem] = useState<ReceiptItem | null>(null);
  const [cancelError, setCancelError] = useState("");
  const openCancel = (item: ReceiptItem) => { setCancelError(""); setCancelItem(item); };
  const closeCancel = () => { setCancelItem(null); setCancelError(""); };
  /** Errors (e.g. a server-side refusal) keep the dialog open with the Arabic message. */
  const confirmCancel = () => {
    if (!cancelItem) return;
    setCancelError("");
    cancel.mutate(cancelItem.orderId, {
      onSuccess: () => {
        closeCancel();
        setSelected((current) => current.filter((entry) => entry.orderId !== cancelItem.orderId));
        toast.success("تم إلغاء الاستلام وإرجاع الحالة السابقة والكمية للمخزن");
      },
      onError: (failure) => setCancelError(receiptError(failure)),
    });
  };
  const combined = useReceiptDocument();

  const items = list.data?.items ?? [];
  const totalCount = list.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const select = (next: ReceiptItem[], candidate = false) => {
    if (next.length > 100) {
      (candidate ? setFormError : setError)("يمكن اختيار ١٠٠ صنف بحد أقصى في السند الواحد");
      return;
    }
    (candidate ? setChosen : setSelected)(next);
  };

  const showDocument = async (number: string) => {
    setLoadingDocument(true);
    setError("");
    try {
      setDocuments([await fetchReceiptDocument(number)]);
    } catch (failure) {
      setError(receiptError(failure));
    } finally {
      setLoadingDocument(false);
    }
  };

  /** طباعة سند لصنف واحد: يعيد عرض سنده إن وُجد، وإلا يُصدر له سنداً جديداً. */
  const printItem = (item: ReceiptItem) => {
    if (item.documentNumber) { void showDocument(item.documentNumber); return; }
    setError("");
    combined.mutate([item.orderId], { onSuccess: setDocuments, onError: (failure) => setError(receiptError(failure)) });
  };

  const editItem = (item: ReceiptItem, patch: { notes?: string; manufactureDate?: string | null }) => {
    setError("");
    updateReceipt.mutate({ orderId: item.orderId, ...patch }, { onError: (failure) => setError(receiptError(failure)) });
  };

  const start = () => {
    setChosen([]);
    setCandidatePage(1);
    setCandSku(""); setCandOperation(""); setCandOrder(""); setCandVendorId("");
    setCandText({ sku: "", operationNumber: "", orderNumber: "" });
    setReceivedDate(today());
    setSenderName("");
    setNotes("");
    setFormError("");
    setOpen(true);
  };

  const submit = () => {
    setFormError("");
    if (!chosen.length) {
      setFormError("اختر الأصناف المستلمة أولًا");
      return;
    }
    if (!moment(receivedDate, "YYYY-MM-DD", true).isValid() || receivedDate > today()) {
      setFormError("أدخل تاريخ استلام صالحًا لا يتجاوز اليوم");
      return;
    }
    receive.mutate(
      { orderIds: chosen.map((item) => item.orderId), receivedDate, senderName, notes },
      {
        onSuccess: () => { setOpen(false); setSelected([]); setPage(1); },
        onError: (failure) => { setFormError(receiptError(failure)); void candidates.refetch(); },
      }
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }} dir="rtl">
      {/* شريط البحث والإجراءات */}
      <Box sx={{ ...cardSx, p: "12px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="اسم المنتج / بحث عام"
          placeholder="اسم المنتج أو أي نص..."
          InputLabelProps={{ shrink: true }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ ...filterFieldSx, flex: "1 1 240px" }}
        />
        <TextField
          size="small"
          label="SKU"
          placeholder="كود المنتج"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <TextField
          size="small"
          label="رقم العملية"
          value={operationNumber}
          onChange={(e) => setOperationNumber(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <TextField
          size="small"
          label="رقم الطلب"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <TextField
          select
          size="small"
          label="المصنع"
          value={vendorId}
          onChange={(e) => { setVendorId(e.target.value); setPage(1); }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          sx={filterFieldSx}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>كل المصانع</MenuItem>
          {vendorOptions.map((option) => (
            <MenuItem key={option.id} value={String(option.id)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="رقم السند"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <TextField
          select
          size="small"
          label="السند"
          value={documentState}
          onChange={(e) => { setDocumentState(e.target.value as "" | "issued" | "none"); setPage(1); }}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
          sx={filterFieldSx}
        >
          <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>الكل</MenuItem>
          <MenuItem value="issued" sx={{ fontFamily: FONT, fontSize: "12px" }}>اتطلعله سند</MenuItem>
          <MenuItem value="none" sx={{ fontFamily: FONT, fontSize: "12px" }}>لسه ما اتطلعش</MenuItem>
        </TextField>
        <TextField
          type="date"
          size="small"
          label="استلام من"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          inputProps={{ max: dateTo || undefined }}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <TextField
          type="date"
          size="small"
          label="استلام إلى"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          inputProps={{ min: dateFrom || undefined }}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <Button onClick={() => {
          setSearch(""); setDateFrom(""); setDateTo(""); setSku(""); setOperationNumber(""); setOrderNumber("");
          setVendorId(""); setDocumentNumber(""); setDocumentState(""); setPage(1);
        }} sx={{ height: 38, fontFamily: FONT, fontSize: "12px", color: HX.tx2 }}>
          إعادة ضبط
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryOutlinedIcon sx={{ fontSize: 17 }} />}
          onClick={() => { setHistoryPage(1); setHistoryOpen(true); void history.refetch(); }}
          sx={{
            height: 38, fontFamily: FONT, fontSize: "12px", mr: "auto",
            color: HX.accent, borderColor: HX.accentBorder,
            "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight },
          }}
        >
          سجل السندات
        </Button>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={start}
            sx={{ color: "#fff", height: 38, fontFamily: FONT, fontSize: "12px" }}
          >
            تسجيل استلام
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ fontFamily: FONT, fontSize: "12.5px" }}>
          {error}
        </Alert>
      )}

      {/* شريط التحديد والطباعة الجماعية */}
      {canEdit && items.length > 0 && (
        <Box sx={{
          bgcolor: selected.length > 0 ? HX.accentLight : HX.surface,
          borderRadius: HX.r,
          border: `0.5px solid ${selected.length > 0 ? HX.accentBorder : HX.border}`,
          p: "6px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap",
        }}>
          <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: HX.tx2 }}>
            {selected.length ? `${selected.length} صنف محدد (يشمل الصفحات الأخرى)` : `${totalCount} صنف مستلم`}
          </Typography>
          <Box sx={{ display: "flex", gap: "8px", ml: "auto", flexWrap: "wrap", alignItems: "center" }}>
            {loadingDocument && <CircularProgress size={16} />}
            <Button
              size="small"
              variant="contained"
              startIcon={<PrintOutlinedIcon sx={{ fontSize: 15 }} />}
              disabled={!selected.length || combined.isPending || loadingDocument}
              onClick={() => {
                setError("");
                combined.mutate(
                  selected.map((item) => item.orderId),
                  { onSuccess: setDocuments, onError: (failure) => setError(receiptError(failure)) }
                );
              }}
              sx={{ color: "#fff", height: 30, fontFamily: FONT, fontSize: "11.5px" }}
            >
              {combined.isPending ? "جارٍ إصدار السند…" : "سند لكل مصنع للأصناف المحددة"}
            </Button>
            {selected.length > 0 && (
              <Button size="small" variant="text" onClick={() => setSelected([])} sx={{ height: 30, fontFamily: FONT, fontSize: "11.5px", color: HX.tx2 }}>
                إلغاء التحديد
              </Button>
            )}
          </Box>
        </Box>
      )}

      {list.isError ? (
        <ErrorBox message={receiptError(list.error)} onRetry={() => void list.refetch()} />
      ) : list.isLoading ? (
        <SkeletonRows />
      ) : (
        <>
          <Box sx={{ opacity: list.isFetching ? 0.7 : 1, transition: "opacity .2s" }}>
            <ItemTable items={items} selected={selected} onSelect={(next) => select(next)} mode="received" onDocument={showDocument} onCancel={canEdit ? openCancel : undefined} onUpdate={canEdit ? editItem : undefined} onPrint={canEdit ? printItem : undefined} />
          </Box>
          {totalPages > 1 && (
            <Box sx={{ ...cardSx, overflow: "hidden" }}>
              <HomixPaginationBar page={page - 1} totalPages={totalPages} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={(p) => setPage(p + 1)} itemLabel="صنف" />
            </Box>
          )}
        </>
      )}

      {/* نافذة تسجيل استلام جديد */}
      <Dialog open={Boolean(cancelItem)} onClose={cancel.isPending ? undefined : closeCancel} dir="rtl" fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: FONT }}>إلغاء استلام الصنف</DialogTitle>
        <DialogContent sx={{ fontFamily: FONT, fontSize: 13 }}>
          {cancelItem && (
            <Box sx={{ mb: 1, fontWeight: 700 }}>
              {cancelItem.productName} — عملية {cancelItem.operationNumber} (طلب #{cancelItem.orderNumber})
            </Box>
          )}
          سيتم إلغاء الاستلام وإرجاع الحالة السابقة وإرجاع الكمية للمخزن.
          {cancelItem?.documentNumber && (
            <Alert severity="warning" sx={{ mt: 1.5, fontFamily: FONT, fontSize: "12.5px" }}>
              هذا الصنف مدرج في سند الاستلام {cancelItem.documentNumber}؛ سيتم فك ارتباطه بالسند عند الإلغاء.
            </Alert>
          )}
          {cancelError && <Alert severity="error" sx={{ mt: 1.5, fontFamily: FONT, fontSize: "12.5px" }}>{cancelError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancel} disabled={cancel.isPending}>رجوع</Button>
          <Button color="error" disabled={cancel.isPending} onClick={confirmCancel}>
            {cancel.isPending ? "جارٍ الإلغاء…" : "تأكيد الإلغاء"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={receive.isPending ? undefined : () => setOpen(false)} maxWidth="lg" fullWidth dir="rtl">
        <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>تسجيل استلام من المصنع</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, fontFamily: FONT, fontSize: "12.5px" }}>
            اختر البنود التي وصلت فعليًا. لا يصدر سند الاستلام تلقائيًا — بعد التسجيل اختر الأصناف
            واطبع سندها من القائمة الرئيسية أو زر "سند لكل مصنع للأصناف المحددة" (يصدر سند منفصل لكل مصنع).
          </Alert>
          {formError && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT, fontSize: "12.5px" }}>{formError}</Alert>}
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", mb: 2 }}>
            <TextField size="small" label="SKU" placeholder="كود المنتج" value={candSku}
              onChange={(e) => setCandSku(e.target.value)} InputLabelProps={{ shrink: true }} sx={filterFieldSx} />
            <TextField size="small" label="رقم العملية" value={candOperation}
              onChange={(e) => setCandOperation(e.target.value)} InputLabelProps={{ shrink: true }} sx={filterFieldSx} />
            <TextField size="small" label="رقم الطلب" value={candOrder}
              onChange={(e) => setCandOrder(e.target.value)} InputLabelProps={{ shrink: true }} sx={filterFieldSx} />
            <TextField select size="small" label="المصنع" value={candVendorId}
              onChange={(e) => { setCandVendorId(e.target.value); setCandidatePage(1); }}
              InputLabelProps={{ shrink: true }} SelectProps={{ displayEmpty: true }} sx={filterFieldSx}>
              <MenuItem value="" sx={{ fontFamily: FONT, fontSize: "12px" }}>كل المصانع</MenuItem>
              {vendorOptions.map((option) => (
                <MenuItem key={option.id} value={String(option.id)} sx={{ fontFamily: FONT, fontSize: "12px" }}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={() => { setCandSku(""); setCandOperation(""); setCandOrder(""); setCandVendorId(""); setCandidatePage(1); }}
              sx={{ height: 38, fontFamily: FONT, fontSize: "12px", color: HX.tx2 }}>
              إعادة ضبط
            </Button>
          </Box>
          <Box sx={{ pointerEvents: receive.isPending ? "none" : "auto", opacity: receive.isPending ? 0.6 : 1 }}>
            {candidates.isError ? (
              <ErrorBox message={receiptError(candidates.error)} />
            ) : candidates.isLoading ? (
              <SkeletonRows />
            ) : (
              <ItemTable items={candidates.data?.items ?? []} selected={chosen} onSelect={(next) => select(next, true)} mode="candidates" />
            )}
            {Math.ceil((candidates.data?.totalCount ?? 0) / PAGE_SIZE) > 1 && (
              <Box sx={{ ...cardSx, overflow: "hidden", mt: 1 }}>
                <HomixPaginationBar
                  page={candidatePage - 1}
                  totalPages={Math.ceil((candidates.data?.totalCount ?? 0) / PAGE_SIZE)}
                  pageSize={PAGE_SIZE}
                  totalCount={candidates.data?.totalCount ?? 0}
                  onPageChange={(p) => setCandidatePage(p + 1)}
                  itemLabel="صنف"
                />
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
            <TextField
              type="date"
              size="small"
              label="تاريخ الاستلام"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              inputProps={{ max: today() }}
              InputLabelProps={{ shrink: true }}
              required
              disabled={receive.isPending}
              sx={filterFieldSx}
            />
            <TextField
              size="small"
              label="اسم مندوب المصنع (اختياري)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              inputProps={{ maxLength: 200 }}
              disabled={receive.isPending}
              sx={{ ...filterFieldSx, flex: 1 }}
            />
          </Box>
          <TextField
            multiline
            minRows={2}
            fullWidth
            size="small"
            label="ملاحظات الاستلام / حالة البضاعة"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            inputProps={{ maxLength: 4000 }}
            disabled={receive.isPending}
            sx={{ ...filterFieldSx, mt: 2, width: "100%" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Typography sx={{ mr: 2, flex: 1, fontFamily: FONT, fontSize: "12px", color: HX.tx2 }}>
            {chosen.length} صنف محدد
          </Typography>
          <Button onClick={() => setChosen([])} disabled={receive.isPending || !chosen.length} sx={{ fontFamily: FONT, fontSize: "12px" }}>
            إلغاء التحديد
          </Button>
          <Button onClick={() => setOpen(false)} disabled={receive.isPending} sx={{ fontFamily: FONT, fontSize: "12px" }}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={submit} disabled={!chosen.length || receive.isPending} sx={{ color: "#fff", fontFamily: FONT, fontSize: "12px" }}>
            {receive.isPending ? "جارٍ التسجيل…" : "تأكيد الاستلام"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة سجل السندات */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth dir="rtl">
        <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>سجل سندات الاستلام</DialogTitle>
        <DialogContent dividers>
          {history.isError ? (
            <ErrorBox message={receiptError(history.error)} />
          ) : history.isLoading ? (
            <SkeletonRows />
          ) : (history.data?.items ?? []).length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
              لا توجد سندات بعد
            </Box>
          ) : (
            <Box sx={{ ...cardSx }}>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
                  <thead>
                    <tr>
                      <th style={TH}>رقم السند</th>
                      <th style={TH}>تاريخ الإصدار</th>
                      <th style={{ ...TH, textAlign: "center" }}>الأصناف</th>
                      <th style={{ ...TH, textAlign: "center" }}>الكمية</th>
                      <th style={{ ...TH, width: 90 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {(history.data?.items ?? []).map((item, idx) => (
                      <tr key={item.number} style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}>
                        <td style={TD}><Code>{item.number}</Code></td>
                        <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{dateLabel(item.issuedAt)}</Box></td>
                        <td style={{ ...TD, textAlign: "center" }}>{item.itemCount}</td>
                        <td style={{ ...TD, textAlign: "center" }}>{item.quantity}</td>
                        <td style={TD}>
                          <Button size="small" onClick={() => showDocument(item.number)} disabled={loadingDocument} sx={{ fontFamily: FONT, fontSize: "11px" }}>
                            عرض وطباعة
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
          {Math.ceil((history.data?.totalCount ?? 0) / PAGE_SIZE) > 1 && (
            <Box sx={{ ...cardSx, overflow: "hidden", mt: 1 }}>
              <HomixPaginationBar
                page={historyPage - 1}
                totalPages={Math.ceil((history.data?.totalCount ?? 0) / PAGE_SIZE)}
                pageSize={PAGE_SIZE}
                totalCount={history.data?.totalCount ?? 0}
                onPageChange={(p) => setHistoryPage(p + 1)}
                itemLabel="سند"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)} sx={{ fontFamily: FONT, fontSize: "12px" }}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      <ReceiptDocumentDialog documents={documents} onClose={() => setDocuments([])} />
    </Box>
  );
}
