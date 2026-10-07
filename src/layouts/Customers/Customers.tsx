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
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
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
  padding: "9px 12px", textAlign: "right", whiteSpace: "nowrap",
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
  const [sort, setSort] = useState<"recent" | "spend" | "orders">("recent");
  const [createOpen, setCreateOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filters = { page, search: debounced, size: PAGE_SIZE, sort };
  const list = useCustomersQuery(filters);
  const summary = useCustomersSummaryQuery();

  const items: CustomerListItem[] = list.data?.items ?? [];
  const totalCount = list.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCustomers({ search: debounced, sort });
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
        <Box sx={{ display: "grid", gap: "12px", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" } }}>
          <KpiCard
            icon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
            label="إجمالي العملاء"
            value={summary.data?.totalCustomers ?? "—"}
          />
          <KpiCard
            icon={<PaidOutlinedIcon sx={{ fontSize: 18 }} />}
            label="إجمالي إنفاق العملاء"
            value={`${money(summary.data?.totalSpend ?? 0)} ج.م`}
          />
          <KpiCard
            icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />}
            label="أعلى عميل إنفاقًا"
            value={summary.data?.topSpender?.name ?? "—"}
            sub={summary.data?.topSpender ? `${money(summary.data.topSpender.totalSpend)} ج.م` : undefined}
          />
        </Box>

        <Box sx={{ ...cardSx, p: "12px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="دوّر بالاسم أو الإيميل أو الموبايل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...fieldSx, flex: "1 1 260px" }}
          />
          <TextField
            select
            size="small"
            label="ترتيب حسب"
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
            SelectProps={{ native: true }}
            sx={{ ...fieldSx, minWidth: 160 }}
          >
            <option value="recent">الأحدث انضمامًا</option>
            <option value="spend">الأعلى إنفاقًا</option>
            <option value="orders">الأكثر طلبات</option>
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
                <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
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
                      <th style={TH}>المصدر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}>
                        <td style={TD}>
                          <Box sx={{ fontWeight: 700 }}>{`${item.firstName} ${item.lastName}`.trim() || "—"}</Box>
                        </td>
                        <td style={TD}>{item.email || "—"}</td>
                        <td style={TD} dir="ltr">{item.phoneNumber || "—"}</td>
                        <td style={{ ...TD, maxWidth: 260, whiteSpace: "normal" }}>
                          <Box sx={{ color: HX.tx2, fontSize: "11.5px" }}>{item.address || "—"}</Box>
                        </td>
                        <td style={TD}>
                          {item.governorate ? (
                            <Box component="span" sx={{ display: "inline-flex", px: "8px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, bgcolor: HX.blueLight, color: HX.blue }}>
                              {item.governorate}
                            </Box>
                          ) : "—"}
                        </td>
                        <td style={{ ...TD, textAlign: "center" }}>{item.ordersCount}</td>
                        <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>{money(item.totalSpend)} ج.م</td>
                        <td style={TD}>{fmtDate(item.createdAt)}</td>
                        <td style={TD}>
                          <Box component="span" sx={{
                            display: "inline-flex", px: "8px", py: "3px", borderRadius: "100px", fontSize: "11px", fontWeight: 600,
                            bgcolor: item.isManual ? HX.amberLight : HX.greenLight, color: item.isManual ? "#92400e" : "#065f46",
                          }}>
                            {item.isManual ? "يدوي" : "Shopify"}
                          </Box>
                        </td>
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
