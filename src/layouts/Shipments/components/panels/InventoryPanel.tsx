import React, { useEffect, useMemo, useState } from "react";
import { Box, Checkbox, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, IconButton } from "@mui/material";
import InventoryItemModal from "./InventoryItemModal";
import InventoryBulkEditModal from "./InventoryBulkEditModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import {
  useBulkDeleteInventoryItemsMutation,
  useBulkUpdateInventoryItemsMutation,
  useDeleteInventoryItemMutation,
} from "query/shipmentsInventory";
import { HX } from "layouts/Orders/ordersHomixTheme";
import HomixPaginationBar from "components/HomixPaginationBar/HomixPaginationBar";
import {
  exportShipmentsInventory,
  useShipmentsInventoryQuery,
  INVENTORY_PAGE_SIZE,
  type InventoryItem,
  type InventoryParams,
} from "query/shipmentsInventory";

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
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  const isAbsoluteUrl = !!image && /^(https?:|data:|blob:|\/\/)/i.test(image);
  const isRelativeUrl = !!image && /^(\/|uploads\/)/i.test(image);
  const baseUrl = String(process.env.REACT_APP_API_URL ?? "").replace(/\/+$/, "");
  const imageUrl = isAbsoluteUrl
    ? image
    : isRelativeUrl
      ? `${baseUrl}/${image.replace(/^\/+/, "")}`
      : null;
  const showImage = Boolean(imageUrl) && !failed;
  return (
    <Box sx={{
      width: 180, height: 180, mx: "auto", bgcolor: HX.surface2, position: "relative",
      fontSize: "44px",
      border: `0.5px solid ${HX.border}`, borderRadius: "10px", overflow: "hidden",
    }}>
      {showImage ? (
        <Box
          component="img"
          src={imageUrl as string}
          alt=""
          aria-label={name}
          onError={() => setFailed(true)}
          sx={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", maxWidth: "none", objectFit: "cover" }}
        />
      ) : (
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box component="span" role="img" aria-label="لا توجد صورة" sx={{ lineHeight: 1 }}>📦</Box>
        </Box>
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

function InventoryCard({
  item, onEdit, onDelete, selected, onToggleSelect,
}: {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  selected: boolean;
  onToggleSelect: (id: number) => void;
}) {
  const available = item.quantity > 0;
  const qtyColor = item.quantity === 0 ? HX.red : item.quantity <= 2 ? HX.amber : HX.tx;
  return (
    <Box sx={{
      bgcolor: HX.surface,
      border: `${selected ? 1.5 : 0.5}px solid ${selected ? HX.accent : HX.border}`,
      borderRadius: HX.r,
      overflow: "hidden", transition: ".2s",
      "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
    }}>
      <Box sx={{ position: "relative", pt: "12px" }}>
        <InventoryImage image={item.image} name={item.productName} />
        <Checkbox
          size="small"
          checked={selected}
          onChange={() => onToggleSelect(item.id)}
          inputProps={{ "aria-label": `تحديد ${item.productName || item.productCode}` }}
          sx={{
            position: "absolute", bottom: 8, right: 8, p: "3px",
            bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, borderRadius: "6px",
            "&:hover": { bgcolor: HX.surface },
          }}
        />
        <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: "4px" }}>
          <IconButton
            size="small"
            aria-label="تعديل الصنف"
            onClick={() => onEdit(item)}
            sx={{ bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, "&:hover": { color: HX.accent } }}
          >
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="حذف الصنف"
            onClick={() => onDelete(item)}
            sx={{ bgcolor: HX.surface, border: `0.5px solid ${HX.border}`, "&:hover": { color: HX.red } }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
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

interface InventoryPanelProps {
  onExporterChange?: (exporter: { run: () => Promise<void>; successMessage: string } | null) => void;
}

export default function InventoryPanel({ onExporterChange }: InventoryPanelProps) {
  const [page, setPage] = useState(1);
  const [codeSearch, setCodeSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const deleteMutation = useDeleteInventoryItemMutation();
  const bulkUpdateMutation = useBulkUpdateInventoryItemsMutation();
  const bulkDeleteMutation = useBulkDeleteInventoryItemsMutation();

  /* الفلاتر تُرسَل للـ API. البحث النصّي مؤجَّل قليلاً حتى لا يُطلَب مع كل حرف. */
  const [debouncedCode, setDebouncedCode] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedCode(codeSearch.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [codeSearch]);

  const inventoryParams = useMemo<InventoryParams>(() => ({
    page,
    productCode: debouncedCode || undefined,
    status: stockFilter === "available" ? "1" : stockFilter === "out" ? "2" : undefined,
    vendorName: vendorFilter || undefined,
  }), [debouncedCode, page, stockFilter, vendorFilter]);
  const { data, isLoading, isFetching } = useShipmentsInventoryQuery(inventoryParams);

  const exportCurrentView = React.useCallback(
    () => exportShipmentsInventory(inventoryParams),
    [inventoryParams],
  );
  useEffect(() => {
    onExporterChange?.({ run: exportCurrentView, successMessage: "تم تصدير المخزون" });
    return () => onExporterChange?.(null);
  }, [exportCurrentView, onExporterChange]);

  const rawItems   = data?.items      ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / INVENTORY_PAGE_SIZE);

  const vendors = useMemo<string[]>(
    () => {
      const uniqueVendors = new Set<string>();
      rawItems.forEach((item) => {
        if (item.vendorName) uniqueVendors.add(item.vendorName);
      });
      return [...uniqueVendors];
    },
    [rawItems]
  );

  // الخادم يفلتر بالفعل، فلا نُعيد الفلترة على الصفحة المعروضة
  const items = rawItems;

  /* التحديد يخص الصفحة المعروضة: صفحة جديدة أو فلتر جديد يعني أصنافاً أخرى،
     وإبقاء تحديد غير مرئي يجعل «تعديل المحدد» يمسّ ما لا يراه المستخدم. */
  const visibleIds = useMemo(() => items.map((item) => item.id), [items]);
  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someSelected = !allSelected && visibleIds.some((id) => selectedIds.includes(id));

  const toggleSelect = (id: number) =>
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((selected) => selected !== id) : [...previous, id]
    );

  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : visibleIds);

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

        <Box component="select" sx={selectSx} value={vendorFilter} onChange={(e: any) => { setVendorFilter(e.target.value); setPage(1); }}>
          <option value="">كل البائعين</option>
          {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
        </Box>

        <Box component="select" sx={selectSx} value={stockFilter} onChange={(e: any) => { setStockFilter(e.target.value); setPage(1); }}>
          <option value="">حالة المخزون</option>
          <option value="available">متوفر</option>
          <option value="out">نفذ</option>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          sx={{ ml: "auto", color: "#fff", height: 34, fontFamily: FONT, fontSize: "12px", whiteSpace: "nowrap" }}
        >
          إضافة صنف
        </Button>
      </Box>

      {/* شريط التحديد والإجراءات الجماعية */}
      {items.length > 0 && (
        <Box sx={{
          bgcolor: selectedIds.length > 0 ? HX.accentLight : HX.surface,
          borderRadius: HX.r,
          border: `0.5px solid ${selectedIds.length > 0 ? HX.accentBorder : HX.border}`,
          p: "6px 14px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap",
        }}>
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleSelectAll}
            inputProps={{ "aria-label": "تحديد كل أصناف الصفحة" }}
          />
          <Typography sx={{ fontFamily: FONT, fontSize: "12px", color: HX.tx2 }}>
            {selectedIds.length > 0
              ? `${selectedIds.length} صنف محدد`
              : "تحديد كل أصناف الصفحة"}
          </Typography>

          {selectedIds.length > 0 && (
            <Box sx={{ display: "flex", gap: "8px", ml: "auto", flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                onClick={() => setIsBulkEditOpen(true)}
                sx={{ color: "#fff", height: 30, fontFamily: FONT, fontSize: "11.5px" }}
              >
                تعديل المحدد
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                onClick={() => setIsBulkDeleteOpen(true)}
                sx={{ height: 30, fontFamily: FONT, fontSize: "11.5px" }}
              >
                حذف المحدد
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedIds([])}
                sx={{ height: 30, fontFamily: FONT, fontSize: "11.5px", color: HX.tx2 }}
              >
                إلغاء التحديد
              </Button>
            </Box>
          )}
        </Box>
      )}

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
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onEdit={(target) => { setEditingItem(target); setIsModalOpen(true); }}
              onDelete={setPendingDelete}
            />
          ))}
        </Box>
      )}

      <InventoryItemModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        item={editingItem}
      />

      <InventoryBulkEditModal
        open={isBulkEditOpen}
        selectedCount={selectedIds.length}
        isSaving={bulkUpdateMutation.isPending}
        onClose={() => setIsBulkEditOpen(false)}
        onSubmit={(payload) =>
          bulkUpdateMutation.mutate(
            { inventoryItemIds: selectedIds, body: payload },
            {
              onSuccess: () => {
                setIsBulkEditOpen(false);
                setSelectedIds([]);
              },
            }
          )
        }
      />

      <ConfirmDeleteModal
        open={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        handleConfirmDelete={() =>
          bulkDeleteMutation.mutate(selectedIds, {
            onSuccess: () => {
              setIsBulkDeleteOpen(false);
              setSelectedIds([]);
            },
          })
        }
      />

      <ConfirmDeleteModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        handleConfirmDelete={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
          }
        }}
      />

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
