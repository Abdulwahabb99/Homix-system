/**
 * بطاقة بيانات التحويل — ثابتة حالياً؛ ستُربط بالـ BE مستقبلاً.
 * ترويسة بنك داكنة + اسم الحساب + رقم الحساب/المحفظة/InstaPay مع أزرار نسخ.
 */
import React from "react";
import { Box } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { bankHeaderIcoSx, bankHeaderSx, monoValSx, FONT } from "../utils/styles";
import { BANK_TRANSFER } from "../utils/constants";
import DetailCard from "./DetailCard";
import InfoRowItem from "./InfoRowItem";
import CopyButton from "./CopyButton";

export default function UserBankTransfer() {
  const b = BANK_TRANSFER;
  return (
    <DetailCard title="بيانات التحويل" icon={<AccountBalanceIcon />}>
      {/* ترويسة البنك الداكنة */}
      <Box sx={bankHeaderSx}>
        <Box sx={bankHeaderIcoSx}>
          <AccountBalanceIcon />
        </Box>
        <Box>
          <Box sx={{ fontSize: "13px", fontWeight: 800, color: "#fff", fontFamily: FONT }}>{b.bankName}</Box>
          <Box sx={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)", fontFamily: FONT }}>{b.accountType}</Box>
        </Box>
      </Box>

      <InfoRowItem
        icon="shield"
        tone="accent"
        label="اسم الحساب"
        value={<Box component="span" sx={{ fontSize: "12.5px" }}>{b.accountName}</Box>}
      />
      <InfoRowItem
        icon="email"
        tone="blue"
        label="رقم الحساب"
        value={<Box component="span" sx={monoValSx}>{b.accountNumber}</Box>}
        trailing={<CopyButton text={b.accountNumberRaw} />}
      />
      <InfoRowItem
        icon="money"
        tone="amber"
        label="المحفظة"
        value={<Box component="span" sx={monoValSx}>{b.wallet}</Box>}
        trailing={<CopyButton text={b.wallet} />}
      />
      <InfoRowItem
        icon="lock"
        tone="green"
        label="InstaPay"
        value={<Box component="span" sx={monoValSx}>{b.instaPay}</Box>}
        trailing={<CopyButton text={b.instaPay} />}
      />
    </DetailCard>
  );
}
