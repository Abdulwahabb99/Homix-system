import React, { useEffect, useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import moment from "moment-timezone";
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
  useReceiveItems,
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

function ItemTable({
  items,
  selected,
  onSelect,
  mode,
  onDocument,
}: {
  items: ReceiptItem[];
  selected: ReceiptItem[];
  onSelect: (items: ReceiptItem[]) => void;
  mode: "received" | "candidates";
  onDocument?: (number: string) => void;
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
                <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{dateLabel(item.manufactureDate)}</Box></td>
                {mode === "received" && (
                  <>
                    <td style={TD}><Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>{dateLabel(item.receivedDate)}</Box></td>
                    <td style={TD}>
                      <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx2 }}>
                        {item.manufactureDays == null ? "—" : `${item.manufactureDays} يوم`}
                      </Box>
                    </td>
                    <td style={TD}><Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.receiverName || "—"}</Box></td>
                    <td style={{ ...TD, maxWidth: 200, whiteSpace: "normal" }}>
                      <Box component="span" sx={{ fontSize: "11.5px", color: HX.tx3 }}>{item.notes || "—"}</Box>
                    </td>
                    <td style={TD}>
                      <DocumentBadge number={item.documentNumber} onClick={() => item.documentNumber && onDocument?.(item.documentNumber)} />
                    </td>
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

export default function ReceiptsPanel() {
  const { can } = usePermissions();
  const canEdit = can("ship_edit");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const history = useReceiptDocuments(historyPage, "", historyOpen);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<ReceiptItem[]>([]);
  const [open, setOpen] = useState(false);
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateDebounced, setCandidateDebounced] = useState("");
  const [chosen, setChosen] = useState<ReceiptItem[]>([]);
  const [receivedDate, setReceivedDate] = useState(today);
  const [senderName, setSenderName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => { setCandidateDebounced(candidateSearch); setCandidatePage(1); }, 300);
    return () => clearTimeout(timer);
  }, [candidateSearch]);

  const list = useReceiptList("received", page, debounced, date);
  const candidates = useReceiptList("candidates", candidatePage, candidateDebounced, "", open);
  const receive = useReceiveItems();
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
      setDocument(await fetchReceiptDocument(number));
    } catch (failure) {
      setError(receiptError(failure));
    } finally {
      setLoadingDocument(false);
    }
  };

  const start = () => {
    setChosen([]);
    setCandidatePage(1);
    setCandidateSearch("");
    setCandidateDebounced("");
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
          placeholder="بحث بالعملية، الطلب، SKU أو المصنع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ ...filterFieldSx, flex: "1 1 240px" }}
        />
        <TextField
          type="date"
          size="small"
          label="تاريخ الاستلام"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          InputLabelProps={{ shrink: true }}
          sx={filterFieldSx}
        />
        <Button onClick={() => { setSearch(""); setDate(""); setPage(1); }} sx={{ height: 38, fontFamily: FONT, fontSize: "12px" }}>
          إعادة ضبط
        </Button>
        <Button
          variant="outlined"
          startIcon={<HistoryOutlinedIcon sx={{ fontSize: 17 }} />}
          onClick={() => { setHistoryPage(1); setHistoryOpen(true); void history.refetch(); }}
          sx={{ height: 38, fontFamily: FONT, fontSize: "12px", mr: "auto" }}
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
                  { onSuccess: setDocument, onError: (failure) => setError(receiptError(failure)) }
                );
              }}
              sx={{ color: "#fff", height: 30, fontFamily: FONT, fontSize: "11.5px" }}
            >
              {combined.isPending ? "جارٍ إصدار السند…" : "سند واحد للأصناف المحددة"}
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
            <ItemTable items={items} selected={selected} onSelect={(next) => select(next)} mode="received" onDocument={showDocument} />
          </Box>
          {totalPages > 1 && (
            <Box sx={{ ...cardSx, overflow: "hidden" }}>
              <HomixPaginationBar page={page - 1} totalPages={totalPages} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={(p) => setPage(p + 1)} itemLabel="صنف" />
            </Box>
          )}
        </>
      )}

      {/* نافذة تسجيل استلام جديد */}
      <Dialog open={open} onClose={receive.isPending ? undefined : () => setOpen(false)} maxWidth="lg" fullWidth dir="rtl">
        <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>تسجيل استلام من المصنع</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, fontFamily: FONT, fontSize: "12.5px" }}>
            اختر البنود التي وصلت فعليًا. لا يصدر سند الاستلام تلقائيًا — بعد التسجيل اختر الأصناف
            واطبع سندها من القائمة الرئيسية أو زر "سند واحد للأصناف المحددة".
          </Alert>
          {formError && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT, fontSize: "12.5px" }}>{formError}</Alert>}
          <TextField
            fullWidth
            size="small"
            placeholder="ابحث برقم العملية، الطلب، SKU أو المصنع"
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            sx={{ ...filterFieldSx, mb: 2, width: "100%" }}
          />
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

      <ReceiptDocumentDialog document={document} onClose={() => setDocument(null)} />
    </Box>
  );
}
