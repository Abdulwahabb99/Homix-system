/**
 * إضافة صنف للمخزون أو تعديل كميته.
 *
 * الإضافة تبدأ بالبحث عن منتج بالكود أو الاسم من صفحة المنتجات، ثم تُدخَل الكمية
 * فقط — سعر التكلفة واللون والمقاس تأتي من الـ variant المختار ولا تُكتب يدوياً.
 * عند التعديل يبقى المنتج ثابتاً وتُعدَّل الكمية، لأن تغيير المنتج يعني صنفاً آخر.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import axiosRequest from "shared/functions/axiosRequest";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import {
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  type InventoryItem,
} from "query/shipmentsInventory";

/** خيار واحد لكل variant: الكود والتكلفة واللون والمقاس كلها تخصّ الـ variant لا المنتج. */
interface ProductOption {
  color: string;
  costPrice: number;
  id: number;
  label: string;
  productCode: string;
  size: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** عند تمريره نكون في وضع التعديل */
  item?: InventoryItem | null;
}

export default function InventoryItemModal({ open, onClose, item }: Props) {
  const isEdit = Boolean(item);

  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);

  const [quantity, setQuantity] = useState("");

  const createMutation = useCreateInventoryItemMutation();
  const updateMutation = useUpdateInventoryItemMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setSearchText("");
    setProducts([]);
    setSelectedProduct(null);
    setQuantity(item ? String(item.quantity ?? "") : "");
  }, [open, item]);

  // بحث بالكود أو الاسم — نفس نقطة النهاية التي تستخدمها نافذة اختيار المنتج بالطلبات
  useEffect(() => {
    if (isEdit || !open) return;
    const term = searchText.trim();
    if (term.length < 2) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      axiosRequest
        .get(`/products?searchQuery=${encodeURIComponent(term)}`)
        .then((response) => {
          const list = response?.data?.data?.products ?? [];
          // صف لكل variant — الكود/التكلفة/اللون/المقاس تختلف بين variants المنتج الواحد
          setProducts(
            list.flatMap((product: any) => {
              const variants = Array.isArray(product.variants) ? product.variants : [];
              const usable = variants.length > 0 ? variants : [{}];
              return usable
                .map((variant: any) => ({
                  color: String(variant?.option2 ?? ""),
                  costPrice: Number(variant?.cost) || 0,
                  id: Number(product.id),
                  label: String(product.title ?? ""),
                  productCode: String(variant?.sku ?? ""),
                  size: String(variant?.option1 ?? ""),
                }))
                .filter((option: ProductOption) => option.productCode);
            })
          );
        })
        .catch(() => setProducts([]))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchText, isEdit, open]);

  const canSave = useMemo(() => {
    if (isPending) return false;
    if (quantity.trim() === "" || Number(quantity) < 0) return false;
    return isEdit ? true : Boolean(selectedProduct);
  }, [isPending, quantity, isEdit, selectedProduct]);

  const handleSave = () => {
    if (!canSave) return;

    if (isEdit && item) {
      // التعديل يقتصر على الكمية — باقي البيانات تتبع المنتج
      updateMutation.mutate(
        { inventoryItemId: item.id, body: { quantity: Number(quantity) } },
        { onSuccess: onClose }
      );
      return;
    }

    if (!selectedProduct) return;
    if (!selectedProduct.productCode) {
      NotificationMeassage("error", "المنتج المختار بلا كود — اختر منتجاً آخر");
      return;
    }

    createMutation.mutate(
      {
        color: selectedProduct.color,
        costPrice: selectedProduct.costPrice,
        productCode: selectedProduct.productCode,
        productId: selectedProduct.id,
        quantity: Number(quantity),
        size: selectedProduct.size,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} dir="rtl" fullWidth maxWidth="xs">
      <DialogTitle>{isEdit ? "تعديل صنف المخزون" : "إضافة صنف للمخزون"}</DialogTitle>
      <DialogContent dividers>
        {isEdit ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={700}>
              {item?.productName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item?.productCode}
            </Typography>
          </Box>
        ) : (
          <Autocomplete
            options={products}
            loading={isSearching}
            value={selectedProduct}
            onChange={(_e, value) => setSelectedProduct(value)}
            onInputChange={(_e, value) => setSearchText(value)}
            getOptionLabel={(option) =>
              option.productCode ? `${option.label} — ${option.productCode}` : option.label
            }
            isOptionEqualToValue={(option, value) => option.productCode === value.productCode}
            noOptionsText={searchText.trim().length < 2 ? "اكتب كود أو اسم المنتج" : "لا توجد نتائج"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ابحث بكود أو اسم المنتج"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearching ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          label="الكمية"
          type="number"
          size="small"
          fullWidth
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputProps={{ min: 0, step: 1 }}
          sx={{ mb: 2 }}
        />
        {/* التكلفة واللون والمقاس تأتي من المنتج — تُعرض للتأكيد فقط */}
        {selectedProduct && !isEdit && (
          <Typography variant="caption" color="text.secondary" display="block">
            سعر التكلفة {selectedProduct.costPrice} ج.م
            {selectedProduct.color ? ` · اللون ${selectedProduct.color}` : ""}
            {selectedProduct.size ? ` · المقاس ${selectedProduct.size}` : ""}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          إلغاء
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave} sx={{ color: "#fff" }}>
          {isPending ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
