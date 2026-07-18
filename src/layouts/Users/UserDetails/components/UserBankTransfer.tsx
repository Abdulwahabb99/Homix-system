/**
 * بطاقة بيانات التحويل — من الـ API (اسم البنك/نوع الحساب/اسم الحساب/رقم الحساب/المحفظة/InstaPay).
 * أزرار النسخ تظهر فقط عند توفّر قيمة فعلية.
 */
import React from "react";
import { Box } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { bankHeaderIcoSx, bankHeaderSx, monoValSx, FONT } from "../utils/styles";
import { PLACEHOLDER } from "../utils/constants";
import { BankInfo } from "../utils/types";
import DetailCard from "./DetailCard";
import InfoRowItem from "./InfoRowItem";
import CopyButton from "./CopyButton";

/** القيمة الخام للنسخ (أرقام فقط لرقم الحساب/الهاتف) */
const raw = (v: string) => v.replace(/\s+/g, "");

export default function UserBankTransfer({ bank }: { bank: BankInfo }) {
  const hasValue = (v: string) => v !== PLACEHOLDER && v.trim() !== "";
  const copy = (v: string) => (hasValue(v) ? <CopyButton text={raw(v)} /> : undefined);

  return (
    <DetailCard title="بيانات التحويل" icon={<AccountBalanceIcon />}>
      {/* ترويسة البنك الداكنة */}
      <Box sx={bankHeaderSx}>
        <Box sx={bankHeaderIcoSx}>
          <AccountBalanceIcon />
        </Box>
        <Box>
          <Box sx={{ fontSize: "13px", fontWeight: 800, color: "#fff", fontFamily: FONT }}>{bank.bankName}</Box>
          <Box sx={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)", fontFamily: FONT }}>{bank.accountType}</Box>
        </Box>
      </Box>

      <InfoRowItem
        icon="shield"
        tone="accent"
        label="اسم الحساب"
        value={<Box component="span" sx={{ fontSize: "12.5px" }}>{bank.accountName}</Box>}
      />
      <InfoRowItem
        icon="email"
        tone="blue"
        label="رقم الحساب"
        value={<Box component="span" sx={monoValSx}>{bank.accountNumber}</Box>}
        trailing={copy(bank.accountNumber)}
      />
      <InfoRowItem
        icon="phone"
        tone="amber"
        label="المحفظة"
        value={<Box component="span" sx={monoValSx}>{bank.wallet}</Box>}
        trailing={copy(bank.wallet)}
      />
      <InfoRowItem
        icon="money"
        tone="green"
        label="InstaPay"
        value={<Box component="span" sx={monoValSx}>{bank.instaPay}</Box>}
        trailing={copy(bank.instaPay)}
      />
    </DetailCard>
  );
}
