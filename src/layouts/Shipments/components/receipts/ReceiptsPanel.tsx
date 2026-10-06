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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import moment from "moment-timezone";
import { usePermissions } from "shared/permissions";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
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

const today = () => moment().tz("Africa/Cairo").format("YYYY-MM-DD");
const dateLabel = (value: string | null) =>
  value ? moment(value).tz("Africa/Cairo").format("DD/MM/YYYY") : "—";

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
  const toggle = (item: ReceiptItem) =>
    onSelect(
      has(item) ? selected.filter((entry) => entry.orderId !== item.orderId) : [...selected, item]
    );
  return (
    <TableContainer sx={{ border: `1px solid ${HX.border}`, borderRadius: 2 }}>
      <Table
        size="small"
        aria-label={mode === "received" ? "الأصناف المستلمة" : "الأصناف المتاحة للاستلام"}
      >
        <TableHead sx={{ bgcolor: HX.surface2 }}>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={all}
                indeterminate={!all && items.some(has)}
                inputProps={{ "aria-label": "تحديد كل أصناف الصفحة" }}
                onChange={() =>
                  onSelect(
                    all
                      ? selected.filter((entry) => !items.some((item) => item.orderId === entry.orderId))
                      : [...selected, ...items.filter((item) => !has(item))]
                  )
                }
              />
            </TableCell>
            {[
              "رقم العملية",
              "رقم الطلب",
              "الصنف / SKU",
              "المصنع",
              "الكمية",
              "تاريخ التصنيع",
              ...(mode === "received"
                ? ["تاريخ الاستلام", "مدة التصنيع", "استلم بواسطة", "الملاحظات", "سند الاستلام"]
                : []),
            ].map((label) => (
              <TableCell key={label} align="right" sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.orderId} selected={has(item)} hover>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={has(item)}
                  onChange={() => toggle(item)}
                  inputProps={{ "aria-label": `تحديد العملية ${item.operationNumber}` }}
                />
              </TableCell>
              <TableCell>{item.operationNumber}</TableCell>
              <TableCell>#{item.orderNumber}</TableCell>
              <TableCell sx={{ minWidth: 180 }}>
                <Typography fontSize={13} fontWeight={700}>
                  {item.productName}
                </Typography>
                <Typography fontSize={12} color="text.secondary" fontFamily="monospace">
                  {item.productSku || "—"}
                </Typography>
              </TableCell>
              <TableCell>{item.vendorName || "—"}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{dateLabel(item.manufactureDate)}</TableCell>
              {mode === "received" && (
                <>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {dateLabel(item.receivedDate)}
                  </TableCell>
                  <TableCell>
                    {item.manufactureDays == null ? "—" : `${item.manufactureDays} أيام`}
                  </TableCell>
                  <TableCell>{item.receiverName}</TableCell>
                  <TableCell sx={{ minWidth: 140, maxWidth: 250, whiteSpace: "pre-wrap" }}>
                    {item.notes || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => item.documentNumber && onDocument?.(item.documentNumber)}
                      disabled={!item.documentNumber}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {item.documentNumber || "لسه ما اتطبعش"}
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          {!items.length && (
            <TableRow>
              <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                لا توجد أصناف مطابقة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function Pagination({
  page,
  count,
  change,
}: {
  page: number;
  count: number;
  change: (page: number) => void;
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page - 1}
      rowsPerPage={20}
      rowsPerPageOptions={[20]}
      onPageChange={(_, value) => change(value + 1)}
      labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} من ${total}`}
      getItemAriaLabel={(type) => (type === "next" ? "الصفحة التالية" : "الصفحة السابقة")}
    />
  );
}

export default function ReceiptsPanel() {
  const { can } = usePermissions();
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
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCandidateDebounced(candidateSearch);
      setCandidatePage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [candidateSearch]);
  const list = useReceiptList("received", page, debounced, date);
  const candidates = useReceiptList("candidates", candidatePage, candidateDebounced, "", open);
  const receive = useReceiveItems();
  const combined = useReceiptDocument();
  const select = (items: ReceiptItem[], candidate = false) => {
    if (items.length > 100) {
      (candidate ? setFormError : setError)("يمكن اختيار ١٠٠ صنف بحد أقصى في السند الواحد");
      return;
    }
    (candidate ? setChosen : setSelected)(items);
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
        onSuccess: () => {
          setOpen(false);
          setSelected([]);
          setPage(1);
        },
        onError: (failure) => {
          setFormError(receiptError(failure));
          void candidates.refetch();
        },
      }
    );
  };
  return (
    <Box dir="rtl" sx={{ fontFamily: "'Cairo', sans-serif", display: "grid", gap: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Inventory2OutlinedIcon color="primary" />
            الاستلامات
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            الأصناف المستلمة من المصانع — تسجيل الوصول للمخزن وإصدار سندات الاستلام
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => {
              setHistoryPage(1);
              setHistoryOpen(true);
              void history.refetch();
            }}
          >
            سجل السندات
          </Button>
          {can("ship_edit") && (
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={start}>
              تسجيل استلام
            </Button>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ ...cardSx, p: 2 }}>
        <TextField
          size="small"
          label="بحث بالعملية، الطلب، SKU أو المصنع"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setSelected([]);
          }}
          sx={{ flex: "1 1 260px" }}
        />
        <TextField
          size="small"
          type="date"
          label="تاريخ الاستلام"
          value={date}
          InputLabelProps={{ shrink: true }}
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
            setSelected([]);
          }}
        />
        <Button
          onClick={() => {
            setSearch("");
            setDate("");
            setPage(1);
            setSelected([]);
          }}
        >
          مسح البحث
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {can("ship_edit") && (
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Typography fontSize={13}>
            {selected.length
              ? `${selected.length} صنف محدد (يشمل الصفحات الأخرى)`
              : `${list.data?.totalCount ?? 0} صنف مستلم`}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PrintOutlinedIcon />}
            disabled={!selected.length || combined.isPending || loadingDocument}
            onClick={() => {
              setError("");
              combined.mutate(
                selected.map((item) => item.orderId),
                { onSuccess: setDocument, onError: (failure) => setError(receiptError(failure)) }
              );
            }}
          >
            {combined.isPending ? "جارٍ إصدار السند…" : "سند واحد للأصناف المحددة"}
          </Button>
          {selected.length > 0 && <Button onClick={() => setSelected([])}>إلغاء التحديد</Button>}
          {loadingDocument && <CircularProgress size={20} />}
        </Stack>
      )}
      {list.isError ? (
        <Alert
          severity="error"
          action={<Button onClick={() => void list.refetch()}>إعادة المحاولة</Button>}
        >
          {receiptError(list.error)}
        </Alert>
      ) : list.isLoading ? (
        <Box sx={{ p: 5, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ItemTable
            items={list.data?.items ?? []}
            selected={selected}
            onSelect={(items) => select(items)}
            mode="received"
            onDocument={showDocument}
          />
          <Pagination page={page} count={list.data?.totalCount ?? 0} change={setPage} />
        </>
      )}
      <Dialog
        open={open}
        onClose={receive.isPending ? undefined : () => setOpen(false)}
        maxWidth="lg"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>تسجيل استلام من المصنع</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            اختر البنود التي وصلت فعليًا. لا يصدر سند الاستلام تلقائيًا — بعد التسجيل اختر الأصناف
            واطبع سندها من القائمة الرئيسية أو زر "سند واحد للأصناف المحددة".
          </Alert>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            fullWidth
            size="small"
            label="ابحث برقم العملية، الطلب، SKU أو المصنع"
            value={candidateSearch}
            onChange={(event) => setCandidateSearch(event.target.value)}
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              pointerEvents: receive.isPending ? "none" : "auto",
              opacity: receive.isPending ? 0.6 : 1,
            }}
          >
            {candidates.isError ? (
              <Alert severity="error">{receiptError(candidates.error)}</Alert>
            ) : candidates.isLoading ? (
              <CircularProgress />
            ) : (
              <ItemTable
                items={candidates.data?.items ?? []}
                selected={chosen}
                onSelect={(items) => select(items, true)}
                mode="candidates"
              />
            )}
            <Pagination
              page={candidatePage}
              count={candidates.data?.totalCount ?? 0}
              change={setCandidatePage}
            />
          </Box>
          <Stack direction="row" gap={2} flexWrap="wrap" sx={{ mt: 2 }}>
            <TextField
              type="date"
              label="تاريخ الاستلام"
              value={receivedDate}
              onChange={(event) => setReceivedDate(event.target.value)}
              inputProps={{ max: today() }}
              InputLabelProps={{ shrink: true }}
              required
              disabled={receive.isPending}
            />
            <TextField
              label="اسم مندوب المصنع (اختياري)"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              inputProps={{ maxLength: 200 }}
              sx={{ flex: 1 }}
              disabled={receive.isPending}
            />
          </Stack>
          <TextField
            multiline
            minRows={2}
            fullWidth
            label="ملاحظات الاستلام / حالة البضاعة"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            inputProps={{ maxLength: 4000 }}
            sx={{ mt: 2 }}
            disabled={receive.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Typography sx={{ mr: 2, flex: 1 }} fontSize={13}>
            {chosen.length} صنف محدد
          </Typography>
          <Button onClick={() => setChosen([])} disabled={receive.isPending || !chosen.length}>
            إلغاء التحديد
          </Button>
          <Button onClick={() => setOpen(false)} disabled={receive.isPending}>
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!chosen.length || receive.isPending}
          >
            {receive.isPending ? "جارٍ التسجيل…" : "تأكيد الاستلام"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="md"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>سجل سندات الاستلام</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error">{error}</Alert>}
          {history.isError ? (
            <Alert severity="error">{receiptError(history.error)}</Alert>
          ) : history.isLoading ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["رقم السند", "تاريخ الإصدار", "الأصناف", "الكمية", ""].map((label, index) => (
                      <TableCell key={index}>{label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(history.data?.items ?? []).map((item) => (
                    <TableRow key={item.number}>
                      <TableCell>{item.number}</TableCell>
                      <TableCell>{dateLabel(item.issuedAt)}</TableCell>
                      <TableCell>{item.itemCount}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Button onClick={() => showDocument(item.number)} disabled={loadingDocument}>
                          عرض وطباعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.data?.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>لا توجد سندات بعد</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Pagination
            page={historyPage}
            count={history.data?.totalCount ?? 0}
            change={setHistoryPage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      <ReceiptDocumentDialog document={document} onClose={() => setDocument(null)} />
    </Box>
  );
}
