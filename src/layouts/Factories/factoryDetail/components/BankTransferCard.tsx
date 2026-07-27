/**
 * بطاقة «بيانات التحويل» — ترويسة داكنة باسم البنك ونوع الحساب، ثم حقول
 * قابلة للنسخ. الحقول الفارغة لا تُعرض.
 */
import React from "react";
import { Box } from "@mui/material";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { groupAccountNumber } from "../utils/calc";
import {
  bankFieldLabelSx, bankFieldSx, bankFieldValueSx, bankHeaderSx, bankLogoSx, FONT,
} from "../utils/styles";
import type { FactoryDetail } from "../../utils/types";
import CopyButton from "./CopyButton";
import DetailCard from "./DetailCard";

interface BankFieldProps {
  label: string;
  /** النص المعروض */
  display: string;
  /** القيمة المنسوخة (بدون تنسيق) — تُستخدم للنسخ فقط */
  copyValue: string;
  mono?: boolean;
}

function BankField({ label, display, copyValue, mono }: BankFieldProps) {
  return (
    <Box sx={bankFieldSx}>
      <Box sx={bankFieldLabelSx}>{label}</Box>
      <Box sx={bankFieldValueSx}>
        <Box
          component="span"
          sx={{
            minWidth: 0, wordBreak: "break-word",
            ...(mono
              ? { fontFamily: "monospace", fontSize: "12.5px", letterSpacing: "1px", unicodeBidi: "plaintext" }
              : null),
          }}
        >
          {display}
        </Box>
        <CopyButton value={copyValue} label={label} />
      </Box>
    </Box>
  );
}

export default function BankTransferCard({ detail }: { detail: FactoryDetail }) {
  const hasAny = Boolean(
    detail.bankName ||
      detail.bankAccountHolderName ||
      detail.bankAccountNumber ||
      detail.walletNumber ||
      detail.instapayNumber
  );

  const walletLabel = detail.walletProvider
    ? `رقم المحفظة / ${detail.walletProvider}`
    : "رقم المحفظة";

  return (
    <DetailCard icon={<CreditCardOutlinedIcon />} title="بيانات التحويل">
      {!hasAny ? (
        <Box sx={{ fontSize: "12px", color: HX.tx3, fontFamily: FONT, textAlign: "center", py: "12px" }}>
          لا توجد بيانات تحويل مسجّلة
        </Box>
      ) : (
        <>
          <Box sx={bankHeaderSx}>
            <Box sx={bankLogoSx}>
              <AccountBalanceOutlinedIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ fontSize: "14px", fontWeight: 800, color: "#fff", fontFamily: FONT }}>
                {detail.bankName || "—"}
              </Box>
              {detail.bankAccountType ? (
                <Box sx={{ fontSize: "11px", color: "rgba(255,255,255,.4)", fontFamily: FONT }}>
                  {detail.bankAccountType}
                </Box>
              ) : null}
            </Box>
          </Box>

          {detail.bankAccountHolderName ? (
            <BankField
              label="اسم صاحب الحساب"
              display={detail.bankAccountHolderName}
              copyValue={detail.bankAccountHolderName}
            />
          ) : null}

          {detail.bankAccountNumber ? (
            <BankField
              label="رقم الحساب"
              display={groupAccountNumber(detail.bankAccountNumber)}
              // يُنسخ بلا مسافات ليصلح للّصق المباشر
              copyValue={detail.bankAccountNumber.replace(/\s+/g, "")}
              mono
            />
          ) : null}

          {detail.walletNumber ? (
            <BankField
              label={walletLabel}
              display={detail.walletNumber}
              copyValue={detail.walletNumber}
              mono
            />
          ) : null}

          {detail.instapayNumber ? (
            <BankField
              label="رقم InstaPay"
              display={detail.instapayNumber}
              copyValue={detail.instapayNumber}
              mono
            />
          ) : null}
        </>
      )}
    </DetailCard>
  );
}
