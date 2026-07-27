/**
 * بطاقة التفاصيل المالية: سعر البيع/التكلفة/الهامش/الشحن/الخصم +
 * «جدية الشراء» القابلة للتعديل inline (للأدوار غير البائع).
 *
 * «المبلغ المطلوب تحصيله» يأتي من الـ API (`financial.amountToCollect`) للقراءة فقط،
 * و«هامش الربح» محسوب: سعر البيع + سعر الشحن − سعر التكلفة.
 */
import React from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { OD } from "../odTheme";
import { formatMoney } from "../utils";
import { useInlineNumberEdit } from "../hooks/useInlineNumberEdit";
import SectionCard from "./SectionCard";

interface FinancialDetailsCardProps {
  orderDetails: any;
  orderTotalPrice: number | null;
  orderTotalShipping: number | null;
  orderTotalToBeCollected: number | null;
  orderTotalCost: number | null;
  isVendor: boolean;
  changeDownPayment: (downPayment: number) => void;
}

/** صف واحد في جدول التفاصيل المالية */
function FinancialRow({
  label,
  children,
  isTotal = false,
}: {
  label: string;
  children: React.ReactNode;
  isTotal?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderBottom: `0.5px solid ${OD.brd}`,
        ...(isTotal
          ? {
              background: `linear-gradient(135deg,${OD.al},rgba(99,102,241,0.04))`,
              borderTop: `0.5px solid ${OD.ab}`,
            }
          : {}),
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", color: isTotal ? OD.tx : OD.tx2, fontWeight: isTotal ? 700 : 500 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/** قيمة مبلغ عادية داخل صف مالي */
function MoneyValue({ value, zeroMuted = false }: { value: number; zeroMuted?: boolean }) {
  return (
    <Typography
      component="span"
      sx={{ fontWeight: 700, fontSize: "0.81rem", color: value === 0 && zeroMuted ? OD.tx3 : OD.tx }}
    >
      {formatMoney(value)} ج.م
    </Typography>
  );
}

export default function FinancialDetailsCard({
  orderDetails,
  orderTotalPrice,
  orderTotalShipping,
  orderTotalToBeCollected,
  orderTotalCost,
  isVendor,
  changeDownPayment,
}: FinancialDetailsCardProps) {
  const sell = Number(orderDetails.subTotalPrice ?? orderTotalPrice ?? 0);
  const ship = Number(orderDetails.shippingFees ?? orderTotalShipping ?? 0);
  /** «سعر التكلفة» — نفس القيمة المعروضة تُستخدم في هامش الربح ليتّسق الحساب المرئي */
  const cost = Number(orderDetails.orderLines?.[0]?.cost ?? orderDetails.totalCost ?? orderTotalCost ?? 0);
  const disc = Number(orderDetails.totalDiscounts ?? 0);
  const down = Number(orderDetails.downPayment ?? 0);

  /** هامش الربح = سعر البيع + سعر الشحن − سعر التكلفة */
  const margin = sell + ship - cost;

  /** المبلغ المطلوب تحصيله يأتي من الـ API (`financial.amountToCollect`) — للقراءة فقط */
  const collect = Number(orderDetails.toBeCollected ?? orderTotalToBeCollected ?? 0);

  const downEdit = useInlineNumberEdit(changeDownPayment);

  const downNode = downEdit.editing ? (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <TextField
        autoFocus
        type="number"
        size="small"
        value={downEdit.draft}
        onChange={(e) => downEdit.setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") downEdit.save(down);
          if (e.key === "Escape") downEdit.cancel();
        }}
        inputProps={{ min: 0, style: { textAlign: "center", fontWeight: 800, width: 90, padding: "5px 6px" } }}
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: OD.sur } }}
      />
      <IconButton size="small" onClick={() => downEdit.save(down)} aria-label="حفظ" sx={{ color: OD.green }}>
        <CheckIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton size="small" onClick={downEdit.cancel} aria-label="إلغاء" sx={{ color: OD.red }}>
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Stack>
  ) : (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {!isVendor && (
        <IconButton
          size="small"
          onClick={() => downEdit.start(down)}
          aria-label="تعديل جدية الشراء"
          sx={{ color: OD.tx3, "&:hover": { color: OD.accent } }}
        >
          <EditIcon sx={{ fontSize: 15 }} />
        </IconButton>
      )}
      <Typography
        component="span"
        onClick={!isVendor ? () => downEdit.start(down) : undefined}
        sx={{
          fontWeight: 700,
          fontSize: "0.81rem",
          color: down === 0 ? OD.tx3 : OD.tx,
          cursor: !isVendor ? "pointer" : "default",
        }}
      >
        {formatMoney(down)} ج.م
      </Typography>
    </Stack>
  );

  return (
    <SectionCard
      icon={<PaymentsOutlinedIcon sx={{ fontSize: 18, color: OD.tx2 }} />}
      title="التفاصيل المالية"
      bodySx={{ p: 0 }}
    >
      <FinancialRow label="سعر البيع">
        <MoneyValue value={sell} />
      </FinancialRow>
      <FinancialRow label="سعر التكلفة">
        <MoneyValue value={cost} />
      </FinancialRow>
      <FinancialRow label="هامش الربح">
        <Typography component="span" sx={{ fontWeight: 700, fontSize: "0.81rem", color: margin >= 0 ? OD.green : OD.red }}>
          {margin >= 0 ? "+" : ""}
          {formatMoney(margin)} ج.م
        </Typography>
      </FinancialRow>
      <FinancialRow label="تكلفة الشحن">
        <MoneyValue value={ship} zeroMuted />
      </FinancialRow>
      <FinancialRow label="الخصم">
        <MoneyValue value={disc} zeroMuted />
      </FinancialRow>
      <FinancialRow label="جدية الشراء">
        {downNode}
      </FinancialRow>
      <FinancialRow label="المبلغ المطلوب تحصيله" isTotal>
        <Typography
          component="span"
          sx={{ fontWeight: 900, fontSize: "0.94rem", color: OD.accent }}
        >
          {formatMoney(collect)} ج.م
        </Typography>
      </FinancialRow>
    </SectionCard>
  );
}
