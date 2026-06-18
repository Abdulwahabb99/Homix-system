import React, { useState } from "react";
import { Box } from "@mui/material";
import { HX, cardSx } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { useShipmentsInventoryQuery, INVENTORY_PAGE_SIZE, type InventoryItem } from "query/shipmentsInventory";

const FONT = "'Cairo', sans-serif";

// ⚠️ STATIC MOCK DATA — temporary, to preview the design only.
// TODO: remove MOCK_INVENTORY and re-enable useShipmentsInventoryQuery below.
const USE_MOCK = true;
const MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, image: null, productCode: "PRD-1001", productName: "كنبة شيب 3 مقاعد", quantity: 8,  costPrice: 16999, color: "بيج",   size: "كبير",  statusLabel: "متوفر بالمخزون", vendorName: "ركة للأثاث" },
  { id: 2, image: null, productCode: "PRD-1002", productName: "طاولة طعام خشب زان",  quantity: 0,  costPrice: 8500,  color: "بني",   size: "وسط",   statusLabel: "نفذ بالمخزون",   vendorName: "دريسينج هاوس" },
  { id: 3, image: null, productCode: "PRD-1003", productName: "كرسي مكتب دوار",      quantity: 24, costPrice: 2200,  color: "أسود",  size: "قياسي", statusLabel: "متوفر بالمخزون", vendorName: "بين باج" },
  { id: 4, image: null, productCode: "PRD-1004", productName: "سرير كابتونيه",       quantity: 5,  costPrice: 12750, color: "رمادي", size: "180سم", statusLabel: "متوفر بالمخزون", vendorName: "ركة للأثاث" },
  { id: 5, image: null, productCode: "PRD-1005", productName: "مكتبة كتب 5 أرفف",     quantity: 0,  costPrice: 4300,  color: "أبيض",  size: "كبير",  statusLabel: "نفذ بالمخزون",   vendorName: "هوم سنتر" },
  { id: 6, image: null, productCode: "PRD-1006", productName: "ترابيزة قهوة رخام",    quantity: 13, costPrice: 3900,  color: "ذهبي",  size: "وسط",   statusLabel: "متوفر بالمخزون", vendorName: "دريسينج هاوس" },
  { id: 7, image: null, productCode: "PRD-1007", productName: "بين باج جلد",          quantity: 31, costPrice: 1450,  color: "أزرق",  size: "كبير",  statusLabel: "متوفر بالمخزون", vendorName: "بين باج" },
  { id: 8, image: null, productCode: "PRD-1008", productName: "دولاب ملابس 4 أبواب",  quantity: 2,  costPrice: 18900, color: "بني",   size: "كبير",  statusLabel: "متوفر بالمخزون", vendorName: "ركة للأثاث" },
];

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

function getInitials(name: string): string {
  return (name || "؟").slice(0, 2);
}

function ProductAvatar({ image, name }: { image: string | null; name: string }) {
  if (image) {
    return (
      <Box
        component="img"
        src={image}
        alt={name}
        sx={{ width: 36, height: 36, borderRadius: "8px", objectFit: "cover", display: "block", flexShrink: 0 }}
      />
    );
  }
  const initials = getInitials(name);
  const colors = [HX.accentLight, HX.greenLight, HX.tealLight, HX.blueLight, HX.purpleLight];
  const textColors = [HX.accent, HX.green, HX.teal, HX.blue, HX.purple];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <Box sx={{
      width: 36, height: 36, borderRadius: "8px", flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      bgcolor: colors[idx], color: textColors[idx],
      fontSize: "12px", fontWeight: 700, fontFamily: FONT,
    }}>
      {initials}
    </Box>
  );
}

function SkeletonRows() {
  return (
    <Box sx={{ ...cardSx, overflow: "hidden" }}>
      {[...Array(7)].map((_, i) => (
        <Box key={i} sx={{
          height: 52, bgcolor: i % 2 === 0 ? HX.surface : HX.surface2,
          borderBottom: `0.5px solid ${HX.border}`, opacity: 0.7,
        }} />
      ))}
    </Box>
  );
}

export default function InventoryPanel() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useShipmentsInventoryQuery({ page }, { enabled: !USE_MOCK });

  const items      = USE_MOCK ? MOCK_INVENTORY : (data?.items ?? []);
  const totalCount = USE_MOCK ? MOCK_INVENTORY.length : (data?.totalCount ?? 0);
  const totalPages = Math.ceil(totalCount / INVENTORY_PAGE_SIZE);

  if (!USE_MOCK && isLoading) return <SkeletonRows />;

  if (items.length === 0) {
    return (
      <Box sx={{ ...cardSx, py: 5, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3, opacity: isFetching ? 0.5 : 1 }}>
        لا توجد منتجات في المخزن
      </Box>
    );
  }

  return (
    <Box sx={{ ...cardSx, opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: "rtl" }}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "center" }}>الصورة</th>
              <th style={TH}>كود المنتج</th>
              <th style={TH}>اسم المنتج</th>
              <th style={{ ...TH, textAlign: "center" }}>الكمية</th>
              <th style={{ ...TH, textAlign: "center" }}>سعر التكلفة</th>
              <th style={TH}>اللون</th>
              <th style={TH}>المقاس</th>
              <th style={TH}>الحالة</th>
              <th style={TH}>البائع</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: InventoryItem, idx: number) => (
              <tr
                key={item.id}
                style={{ background: idx % 2 === 0 ? HX.surface : HX.surface2 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = HX.accentLight; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? HX.surface : HX.surface2; }}
              >
                <td style={{ ...TD, textAlign: "center" }}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <ProductAvatar image={item.image} name={item.productName} />
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontFamily: "monospace", fontSize: "11px", bgcolor: HX.surface3, px: "6px", py: "2px", borderRadius: "5px", color: HX.tx2 }}>
                    {item.productCode || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                    {item.productName || "—"}
                  </Box>
                </td>
                <td style={{ ...TD, textAlign: "center" }}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    minWidth: 30, height: 22, px: "6px", borderRadius: "100px",
                    fontSize: "12px", fontWeight: 700, fontFamily: FONT,
                    bgcolor: item.quantity > 0 ? HX.greenLight : HX.redLight,
                    color: item.quantity > 0 ? HX.green : HX.red,
                  }}>
                    {item.quantity ?? 0}
                  </Box>
                </td>
                <td style={{ ...TD, textAlign: "center" }}>
                  {item.costPrice != null ? (
                    <Box component="span" sx={{ fontSize: "12.5px", fontWeight: 700 }}>
                      {Number(item.costPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      <Box component="span" sx={{ fontSize: "10px", color: HX.tx3, mr: "3px" }}>ج.م</Box>
                    </Box>
                  ) : <span style={{ color: HX.tx3 }}>—</span>}
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.color || "—"}</Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.size || "—"}</Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{
                    display: "inline-flex", alignItems: "center", px: "8px", py: "3px",
                    borderRadius: "100px", fontSize: "11px", fontWeight: 600, fontFamily: FONT,
                    bgcolor: HX.tealLight, color: HX.teal,
                  }}>
                    {item.statusLabel || "—"}
                  </Box>
                </td>
                <td style={TD}>
                  <Box component="span" sx={{ fontSize: "12px", color: HX.tx2 }}>{item.vendorName || "—"}</Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      <HomixPaginationBar
        page={page - 1}
        totalPages={totalPages}
        pageSize={INVENTORY_PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={(p) => setPage(p + 1)}
        itemLabel="منتج"
      />
    </Box>
  );
}
