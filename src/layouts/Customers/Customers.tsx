/**
 * صفحة العملاء — قائمة العملاء (شوبيفاي + يدويين) مع إحصائيات، بحث، إضافة
 * عميل يدوي، وتصدير Excel. البيانات مجمّعة من جدول customers مربوطة بعدد
 * طلبات كل عميل وإجمالي إنفاقه من جدول orders.
 */
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import moment from "moment";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { usePermissions } from "shared/permissions";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import {
  exportCustomers,
  useCreateCustomerMutation,
  useCustomersQuery,
  useCustomersSummaryQuery,
  type CustomerListItem,
} from "query/customers";

const FONT = "'Cairo', sans-serif";
const PAGE_SIZE = 50;

const TH: React.CSSProperties = {
  fontFamily: FONT, fontSize: "11px", fontWeight: 700, color: HX.tx2,
  padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `1px solid ${HX.border}`, background: HX.surface2,
};

const TD: React.CSSProperties = {
  fontFamily: FONT, fontSize: "12px", color: HX.tx,
  padding: "8px 12px", textAlign: "right", whiteSpace: "nowrap",
  borderBottom: `0.5px solid ${HX.border}`, verticalAlign: "middle",
};

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT, height: 38 },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

function money(value: number): string {
  return Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  return moment(value).format("D MMMM YYYY");
}

function customerName(item: CustomerListItem): string {
  return `${item.firstName} ${item.lastName}`.trim() || "عميل بدون اسم";
}

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Box sx={{ ...cardSx, p: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", color: HX.tx2 }}>{label}</Typography>
        <Box sx={{ color: HX.accent, display: "flex" }}>{icon}</Box>
      </Box>
      <Typography sx={{ fontFamily: FONT, fontSize: "20px", fontWeight: 800, color: HX.tx }}>{value}</Typography>
      {sub && <Typography sx={{ fontFamily: FONT, fontSize: "10.5px", color: HX.tx3 }}>{sub}</Typography>}
    </Box>
  );
}

function CreateCustomerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const create = useCreateCustomerMutation();

  useEffect(() => {
    if (!open) return;
    setFirstName(""); setLastName(""); setPhoneNumber(""); setEmail(""); setAddress("");
  }, [open]);

  const submit = () => {
    if (!firstName.trim() || !phoneNumber.trim()) {
      NotificationMeassage("error", "الاسم الأول ورقم الموبايل مطلوبان");
      return;
    }
    create.mutate(
      { address: address.trim(), email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim() },
      {
        onSuccess: () => {
          NotificationMeassage("success", "تم إضافة العميل");
          onClose();
        },
        onError: () => NotificationMeassage("error", "تعذّر إضافة العميل"),
      },
    );
  };

  return (
    <Dialog open={open} onClose={create.isPending ? undefined : onClose} dir="rtl" fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 700 }}>عميل جديد</DialogTitle>
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "16px !important" }}>
        <TextField label="الاسم الأول" size="small" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={fieldSx} required />
        <TextField label="الاسم الأخير" size="small" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={fieldSx} />
        <TextField label="رقم الموبايل" size="small" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} sx={fieldSx} required />
        <TextField label="البريد الإلكتروني" size="small" value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} />
        <TextField label="العنوان" size="small" value={address} onChange={(e) => setAddress(e.target.value)} multiline minRows={2} sx={fieldSx} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={create.isPending} sx={{ fontFamily: FONT, fontSize: "12px" }}>إلغاء</Button>
        <Button variant="contained" onClick={submit} disabled={create.isPending} sx={{ color: "#fff", fontFamily: FONT, fontSize: "12px" }}>
          {create.isPending ? "جارٍ الحفظ…" : "حفظ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Customers() {
  const { can, canAdd } = usePermissions();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [ordersFilter, setOrdersFilter] = useState<"all" | "with" | "without">("all");
  const [governorate, setGovernorate] = useState("");
  const [sort, setSort] = useState<"recent" | "spend" | "spend_asc" | "orders" | "name">("spend");
  const [createOpen, setCreateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = { governorate, orders: ordersFilter, page, search: debounced, size: PAGE_SIZE, sort };
  const list = useCustomersQuery(filters);
  const summary = useCustomersSummaryQuery();

  const items: CustomerListItem[] = list.data?.items ?? [];
  const totalCount = list.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCustomers({ governorate, orders: ordersFilter, search: debounced, sort });
      NotificationMeassage("success", "تم تصدير العملاء");
    } catch {
      NotificationMeassage("error", "تعذّر تصدير العملاء");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout
      pageTitle="العملاء"
      pageSubtitle="بيانات العملاء من شوبيفاي والعملاء المضافين يدويًا"
      pageActions={
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {can("customers_view") && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />}
              onClick={handleExport}
              disabled={exporting}
              sx={{ height: 38, fontFamily: FONT, fontSize: "12px", color: HX.accent, borderColor: HX.accentBorder, "&:hover": { borderColor: HX.accent, bgcolor: HX.accentLight } }}
            >
              {exporting ? "جارٍ التصدير…" : "تصدير Excel"}
            </Button>
          )}
          {canAdd("customers") && (
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ height: 38, fontFamily: FONT, fontSize: "12px", color: "#fff" }}
            >
              عميل جديد
            </Button>
          )}
        </Box>
      }
    >
      <ToastContainer />
      <Box sx={{ mt: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "8px", px: "14px", py: "10px",
          border: `1px solid ${HX.accentBorder}`, borderRadius: "10px", bgcolor: HX.accentLight,
          color: HX.accent,
        }}>
          <SyncOutlinedIcon aria-hidden="true" sx={{ fontSize: 17, flexShrink: 0 }} />
          <Typography sx={{ fontFamily: FONT, fontSize: "11.5px", lineHeight: 1.7 }}>
            بيانات العملاء مجمّعة من Shopify والعملاء المضافين يدويًا، وتشمل عدد الطلبات وإجمالي الإنفاق.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" } }}>
          <KpiCard
            icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
            label="إجمالي العملاء"
            value={summary.data?.totalCustomers ?? "—"}
            sub={summary.data ? `${summary.data.customersWithOrders} عندهم طلبات فعلية` : undefined}
          />
          <KpiCard
            icon={<PaidOutlinedIcon sx={{ fontSize: 18 }} />}
            label="إجمالي إنفاق العملاء"
            value={`${money(summary.data?.totalSpend ?? 0)} ج.م`}
            sub={summary.data?.totalCustomers ? `متوسط ${money(summary.data.totalSpend / summary.data.totalCustomers)} ج.م / عميل` : undefined}
          />
          <KpiCard
            icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />}
            label="أعلى عميل إنفاقًا"
            value={summary.data?.topSpender?.name ?? "—"}
            sub={summary.data?.topSpender ? `${money(summary.data.topSpender.totalSpend)} ج.م · ${summary.data.topSpender.ordersCount} طلبات` : undefined}
          />
          <KpiCard
            icon={<AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />}
            label="عملاء لم يطلبوا بعد"
            value={summary.data?.customersWithoutOrders ?? "—"}
            sub="فرصة للمتابعة"
          />
        </Box>

        <Box sx={{ ...cardSx, p: "12px 14px", display: "grid", gap: "8px", gridTemplateColumns: { xs: "1fr", md: "minmax(260px,1fr) 170px 170px 170px" } }}>
          <TextField
            size="small"
            placeholder="دوّر بالاسم أو الإيميل أو الموبايل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon aria-hidden="true" sx={{ fontSize: 18, color: HX.tx3 }} /></InputAdornment> }}
            inputProps={{ "aria-label": "البحث في العملاء" }}
            sx={fieldSx}
          />
          <TextField
            select
            size="small"
            value={ordersFilter}
            onChange={(e) => { setOrdersFilter(e.target.value as typeof ordersFilter); setPage(1); }}
            SelectProps={{ native: true }}
            inputProps={{ "aria-label": "فلتر الطلبات" }}
            sx={fieldSx}
          >
            <option value="all">كل العملاء</option>
            <option value="with">عندهم طلبات</option>
            <option value="without">من غير طلبات</option>
          </TextField>
          <TextField
            select
            size="small"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setPage(1); }}
            SelectProps={{ native: true }}
            inputProps={{ "aria-label": "فلتر المحافظة" }}
            sx={fieldSx}
          >
            <option value="">كل المحافظات</option>
            {(summary.data?.governorates ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
          </TextField>
          <TextField
            select
            size="small"
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
            SelectProps={{ native: true }}
            inputProps={{ "aria-label": "ترتيب العملاء" }}
            sx={fieldSx}
          >
            <option value="spend">الأكثر إنفاقًا</option>
            <option value="spend_asc">الأقل إنفاقًا</option>
            <option value="orders">الأكثر طلبات</option>
            <option value="recent">الأحدث انضمامًا</option>
            <option value="name">الاسم (أ-ي)</option>
          </TextField>
        </Box>

        {list.isError ? (
          <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.red }}>
            تعذّر تحميل العملاء
          </Box>
        ) : list.isLoading ? (
          <Box sx={{ ...cardSx, overflow: "hidden" }}>
            {[...Array(6)].map((_, i) => (
              <Box key={i} sx={{ height: 44, bgcolor: i % 2 === 0 ? HX.surface : HX.surface2, borderBottom: `0.5px solid ${HX.border}`, opacity: 0.7 }} />
            ))}
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3 }}>
            لا يوجد عملاء مطابقون
          </Box>
        ) : (
          <>
            <Box sx={{ ...cardSx, opacity: list.isFetching ? 0.7 : 1, transition: "opacity .2s" }}>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 1050, tableLayout: "fixed", borderCollapse: "collapse", direction: "rtl" }}>
                  <colgroup>
                    <col style={{ width: 180 }} />
                    <col style={{ width: 190 }} />
                    <col style={{ width: 135 }} />
                    <col style={{ width: 260 }} />
                    <col style={{ width: 125 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 125 }} />
                    <col style={{ width: 130 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={TH}>اسم العميل</th>
                      <th style={TH}>البريد الإلكتروني</th>
                      <th style={TH}>رقم الموبايل</th>
                      <th style={TH}>العنوان</th>
                      <th style={TH}>المحافظة</th>
                      <th style={{ ...TH, textAlign: "center" }}>الطلبات</th>
                      <th style={{ ...TH, textAlign: "center" }}>إجمالي الإنفاق</th>
                      <th style={TH}>تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}>
                        <td style={TD}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: "9px", fontWeight: 700 }}>
                            <Box aria-hidden="true" sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 34, height: 34, borderRadius: "50%", bgcolor: HX.accent, color: "#fff", fontWeight: 800, fontSize: "13px" }}>
                              {customerName(item).charAt(0).toUpperCase()}
                            </Box>
                            <Box component="span" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }} title={customerName(item)}>
                              {customerName(item)}
                            </Box>
                          </Box>
                        </td>
                        <td style={{ ...TD, overflow: "hidden", textOverflow: "ellipsis" }} title={item.email || undefined}>{item.email || "—"}</td>
                        <td style={TD} dir="ltr">{item.phoneNumber || "—"}</td>
                        <td style={{ ...TD, overflow: "hidden" }}>
                          <Tooltip title={item.address || ""} placement="top" arrow disableHoverListener={!item.address}>
                            <Box tabIndex={item.address ? 0 : undefined} sx={{ color: HX.tx2, fontSize: "11.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.address || "—"}
                            </Box>
                          </Tooltip>
                        </td>
                        <td style={TD}>
                          {item.governorate ? (
                            <Box component="span" sx={{ display: "inline-flex", maxWidth: "100%", px: "8px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, bgcolor: HX.blueLight, color: HX.blue, overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.governorate}
                            </Box>
                          ) : "—"}
                        </td>
                        <td style={{ ...TD, textAlign: "center" }}>
                          <Box component="span" sx={{ display: "inline-flex", minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", px: "6px", borderRadius: "100px", bgcolor: HX.accentLight, color: HX.accent, fontWeight: 700 }}>
                            {item.ordersCount}
                          </Box>
                        </td>
                        <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>{money(item.totalSpend)} ج.م</td>
                        <td style={TD}>{fmtDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
            {totalPages > 1 && (
              <Box sx={{ ...cardSx, overflow: "hidden" }}>
                <HomixPaginationBar page={page - 1} totalPages={totalPages} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={(p) => setPage(p + 1)} itemLabel="عميل" />
              </Box>
            )}
          </>
        )}
      </Box>

      <CreateCustomerModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </DashboardLayout>
  );
}
