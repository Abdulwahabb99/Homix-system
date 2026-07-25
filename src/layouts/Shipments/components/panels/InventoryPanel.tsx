import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { HX } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import { useShipmentsInventoryQuery, INVENTORY_PAGE_SIZE, type InventoryItem } from "query/shipmentsInventory";

const FONT = "'Cairo', sans-serif";

function fmt(n: number): string {
  return Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function StockBadge({ available }: { available: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        px: "9px", py: "3px", borderRadius: "20px",
        fontFamily: FONT, fontSize: "10.5px", fontWeight: 700, whiteSpace: "nowrap",
        bgcolor: available ? HX.greenLight : HX.redLight,
        color: available ? "#065f46" : "#991b1b",
      }}
    >
      <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: available ? HX.green : HX.red, flexShrink: 0 }} />
      {available ? "متوفر" : "نفذ"}
    </Box>
  );
}

function InventoryImage({ image, name }: { image: string | null; name: string }) {
  const isUrl = !!image && /^(https?:)?\/\//.test(image);
  return (
    <Box sx={{
      height: 110, bgcolor: HX.surface2, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "44px", position: "relative",
      borderBottom: `0.5px solid ${HX.border}`, overflow: "hidden",
    }}>
      {isUrl ? (
        <Box component="img" src={image as string} alt={name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : image ? (
        <Box component="span" sx={{ lineHeight: 1 }}>{image}</Box>
      ) : (
        <Box component="span" sx={{ lineHeight: 1 }}>📦</Box>
      )}
    </Box>
  );
}

function InvTag({ icon, value }: { icon: string; value: string }) {
  return (
    <Box component="span" sx={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontFamily: FONT, fontSize: "10.5px", color: HX.tx2,
      bgcolor: HX.surface2, px: "8px", py: "2px", borderRadius: "5px",
    }}>
      <Box component="span">{icon}</Box>
      {value}
    </Box>
  );
}

function InventoryCard({ item }: { item: InventoryItem }) {
  const available = item.quantity > 0;
  const qtyColor = item.quantity === 0 ? HX.red : item.quantity <= 2 ? HX.amber : HX.tx;
  return (
    <Box sx={{
      bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: HX.r,
      overflow: "hidden", transition: ".2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
    }}>
      <Box sx={{ position: "relative" }}>
        <InventoryImage image={item.image} name={item.productName} />
        <Box sx={{ position: "absolute", top: 8, left: 8 }}>
          <StockBadge available={available} />
        </Box>
      </Box>

      <Box sx={{ p: "12px" }}>
        <Box component="span" sx={{
          display: "inline-block", fontFamily: "monospace", fontSize: "10.5px",
          color: HX.accent, bgcolor: HX.accentLight, px: "7px", py: "2px",
          borderRadius: "5px", mb: "6px",
        }}>
          {item.productCode || "—"}
        </Box>

        <Box sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.tx, mb: "4px" }}>
          {item.productName || "—"}
        </Box>

        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", mb: "8px" }}>
          {item.size      && <InvTag icon="📐" value={item.size} />}
          {item.color     && <InvTag icon="🎨" value={item.color} />}
          {item.vendorName && <InvTag icon="🏭" value={item.vendorName} />}
        </Box>

        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `0.5px solid ${HX.border}`, pt: "8px", mt: "4px",
        }}>
          <Box>
            <Box sx={{ fontFamily: FONT, fontSize: "18px", fontWeight: 900, color: qtyColor, lineHeight: 1 }}>
              {item.quantity ?? 0}
            </Box>
            <Box sx={{ fontFamily: FONT, fontSize: "10px", color: HX.tx3, mt: "1px" }}>وحدة</Box>
          </Box>
          <Box sx={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: HX.accent }}>
            {fmt(item.costPrice)} ج.م
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function SkeletonGrid() {
  return (
    <Box sx={{
      display: "grid", gap: "10px",
      gridTemplateColumns: { xs: "repeat(1,1fr)", sm: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(4,1fr)" },
    }}>
      {[...Array(8)].map((_, i) => (
        <Box key={i} sx={{
          bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: HX.r,
          height: 230, animation: "hx-pulse 1.4s ease-in-out infinite",
          "@keyframes hx-pulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
        }} />
      ))}
    </Box>
  );
}

const inputSx = {
  display: "flex", alignItems: "center", gap: "6px",
  border: `0.5px solid ${HX.border}`, borderRadius: "8px",
  px: "10px", height: 32, bgcolor: HX.surface, flex: "1 1 160px", minWidth: 0,
  "&:focus-within": { borderColor: HX.accent },
};

const selectSx = {
  fontFamily: FONT, fontSize: "12px", height: 32, px: "8px",
  border: `0.5px solid ${HX.border}`, borderRadius: "8px",
  bgcolor: HX.surface, color: "#000", cursor: "pointer", outline: "none",
  flex: "1 1 160px", minWidth: 0,
};

export default function InventoryPanel() {
  const [page, setPage] = useState(1);
  const [codeSearch, setCodeSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const { data, isLoading, isFetching } = useShipmentsInventoryQuery({ page });

  const rawItems   = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / INVENTORY_PAGE_SIZE);

  const vendors = useMemo(
    () => Array.from(new Set(rawItems.map((i) => i.vendorName).filter(Boolean))),
    [rawItems]
  );

  const items = useMemo(() => {
    return rawItems.filter((i) => {
      if (codeSearch && !(i.productCode || "").toLowerCase().includes(codeSearch.toLowerCase())) return false;
      if (vendorFilter && i.vendorName !== vendorFilter) return false;
      if (stockFilter === "available" && i.quantity <= 0) return false;
      if (stockFilter === "out" && i.quantity > 0) return false;
      return true;
    });
  }, [rawItems, codeSearch, vendorFilter, stockFilter]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Filters */}
      <Box sx={{
        bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`,
        p: "12px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap",
      }}>
        <Box sx={inputSx}>
          <SearchIcon sx={{ fontSize: 14, color: HX.tx3, flexShrink: 0 }} />
          <Box
            component="input"
            type="text"
            placeholder="بحث بكود المنتج..."
            value={codeSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCodeSearch(e.target.value)}
            sx={{
              border: "none", outline: "none", flex: 1, minWidth: 0,
              fontSize: "12px", fontFamily: FONT, color: "#000", bgcolor: "transparent",
              "&::placeholder": { color: HX.tx3 },
            }}
          />
        </Box>

        <Box component="select" sx={selectSx} value={vendorFilter} onChange={(e: any) => setVendorFilter(e.target.value)}>
          <option value="">كل البائعين</option>
          {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
        </Box>

        <Box component="select" sx={selectSx} value={stockFilter} onChange={(e: any) => setStockFilter(e.target.value)}>
          <option value="">حالة المخزون</option>
          <option value="available">متوفر</option>
          <option value="out">نفذ</option>
        </Box>
      </Box>

      {/* Cards grid */}
      {isLoading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <Box sx={{
          bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`,
          py: 6, textAlign: "center", fontFamily: FONT, fontSize: "13px", color: HX.tx3,
        }}>
          لا توجد منتجات في المخزون
        </Box>
      ) : (
        <Box sx={{
          display: "grid", gap: "10px",
          opacity: isFetching && !isLoading ? 0.7 : 1, transition: "opacity .2s",
          gridTemplateColumns: { xs: "repeat(1,1fr)", sm: "repeat(2,1fr)", md: "repeat(3,1fr)", lg: "repeat(4,1fr)" },
        }}>
          {items.map((item) => <InventoryCard key={item.id} item={item} />)}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ bgcolor: HX.surface, borderRadius: HX.r, border: `0.5px solid ${HX.border}`, overflow: "hidden" }}>
          <HomixPaginationBar
            page={page - 1}
            totalPages={totalPages}
            pageSize={INVENTORY_PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={(p) => setPage(p + 1)}
            itemLabel="منتج"
          />
        </Box>
      )}
    </Box>
  );
}
