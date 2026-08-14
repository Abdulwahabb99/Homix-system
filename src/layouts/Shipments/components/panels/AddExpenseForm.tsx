/**
 * نموذج «إضافة مصروف جديد» أعلى تبويب المصروفات.
 * المصروفات تُدخَل يدوياً بالكامل — لا مصدر لها غير هذا النموذج.
 */
import React, { useEffect, useState } from "react";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useShipmentsMetaQuery } from "query/shipmentsMeta";
import { useCreateExpenseMutation } from "query/shipmentsAccounts";

const FONT = "'Cairo', sans-serif";

const fieldSx = {
  fontFamily: FONT,
  "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "12px", fontFamily: FONT, height: 40 },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "12px" },
} as const;

/** التسمية تطفو دائماً — قيمة الـ select تُضبَط برمجياً فتقع تحت التسمية بدونها */
const floatingLabel = { shrink: true } as const;

export default function AddExpenseForm() {
  const { data: meta } = useShipmentsMetaQuery();
  const createMutation = useCreateExpenseMutation();

  const expenseTypes = meta?.expenseTypes ?? [];
  const accountingStatuses = meta?.accountingStatuses ?? [];

  const [type, setType] = useState<number | "">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [accountingStatus, setAccountingStatus] = useState<number | "">("");
  const [accountingDate, setAccountingDate] = useState("");

  // الخيارات تصل بعد الـ meta، فنضبط القيم الافتراضية عند وصولها
  useEffect(() => {
    if (type === "" && expenseTypes.length > 0) setType(Number(expenseTypes[0].value));
    if (accountingStatus === "" && accountingStatuses.length > 0) {
      setAccountingStatus(Number(accountingStatuses[0].value));
    }
  }, [expenseTypes, accountingStatuses, type, accountingStatus]);

  const handleSave = () => {
    if (type === "") {
      NotificationMeassage("error", "اختر نوع المصروف");
      return;
    }
    if (!reason.trim()) {
      NotificationMeassage("error", "اكتب سبب المصروف");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      NotificationMeassage("error", "أدخل تكلفة صحيحة");
      return;
    }

    createMutation.mutate(
      {
        ...(accountingDate ? { accountingDate: new Date(accountingDate).toISOString() } : {}),
        ...(accountingStatus !== "" ? { accountingStatus: Number(accountingStatus) } : {}),
        amount: numericAmount,
        reason: reason.trim(),
        type: Number(type),
      },
      {
        onSuccess: () => {
          setAmount("");
          setReason("");
          setAccountingDate("");
        },
      }
    );
  };

  return (
    <Box sx={{ ...cardSx, p: "14px" }}>
      <Typography sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, mb: "12px" }}>
        إضافة مصروف جديد
      </Typography>

      <Box sx={{
        display: "grid", gap: "10px",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(3,1fr)" },
      }}>
        <TextField
          select
          label="نوع المصروف"
          InputLabelProps={floatingLabel}
          size="small"
          value={type}
          onChange={(e) => setType(Number(e.target.value))}
          sx={fieldSx}
        >
          {expenseTypes.map((option) => (
            <MenuItem key={option.value} value={Number(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="تكلفة المصروف (ج.م)"
          type="number"
          size="small"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 0, step: "0.01" }}
          sx={fieldSx}
        />

        <TextField
          label="سبب المصروف"
          InputLabelProps={floatingLabel}
          size="small"
          placeholder="اكتب السبب..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={fieldSx}
        />

        <TextField
          select
          label="حالة المحاسبة"
          InputLabelProps={floatingLabel}
          size="small"
          value={accountingStatus}
          onChange={(e) => setAccountingStatus(Number(e.target.value))}
          sx={fieldSx}
        >
          {accountingStatuses.map((option) => (
            <MenuItem key={option.value} value={Number(option.value)} sx={{ fontSize: "12px" }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="تاريخ المحاسبة"
          type="date"
          size="small"
          value={accountingDate}
          onChange={(e) => setAccountingDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />
      </Box>

      <Box sx={{ mt: "12px", display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={createMutation.isPending}
          sx={{ color: "#fff", fontFamily: FONT, fontSize: "12px" }}
        >
          {createMutation.isPending ? "جارٍ الحفظ..." : "حفظ المصروف"}
        </Button>
      </Box>
    </Box>
  );
}
