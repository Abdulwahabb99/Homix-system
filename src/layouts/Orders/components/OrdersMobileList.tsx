import React from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { NavigateFunction } from "react-router-dom";
import moment from "moment";
import { DeliveryStatusChip, OrderStatusChip } from "layouts/Orders/components/OrderStatusChips";
import { deliveryStatusValues } from "layouts/Orders/utils/constants";

const paymentStatusLabels: Record<number, string> = {
  2: "مدفوع",
  1: "دفع عند الاستلام",
};

type Row = {
  orderId: number | string;
  code?: string;
  orderNumber?: string;
  customerName?: string;
  status?: number;
  totalPrice?: string | number;
  paymentStatus?: number;
  deliveryStatus?: number;
  PoDate?: string;
  userId?: number;
  items?: { unitCost?: string | number; quantity?: string | number }[];
  type?: string;
};

function computeRowCost(row: Row) {
  let c = 0;
  row.items?.forEach((item) => {
    c += Number(item.unitCost) * Number(item.quantity);
  });
  return Number(c).toFixed(0);
}

type OrdersMobileListProps = {
  orders: Row[];
  isVendor: boolean;
  users: { id: number; firstName?: string; lastName?: string }[];
  selectionModel: (string | number)[];
  onSelectionModelChange: (ids: (string | number)[]) => void;
  onEdit: (row: Row) => void;
  onDelete: (row: Row) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  navigate: NavigateFunction;
  calculateDaysFromPoDate: (date: string) => string | undefined;
};

/**
 * عرض الطلبات كبطاقات على الشاشات الصغيرة بدل جدول البيانات.
 */
export function OrdersMobileList({
  orders,
  isVendor,
  users,
  selectionModel,
  onSelectionModelChange,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  navigate,
  calculateDaysFromPoDate,
}: OrdersMobileListProps) {
  const showCheckbox = !isVendor;
  const idInSelection = (id: string | number) =>
    selectionModel.some((x) => String(x) === String(id));

  const toggleSelect = (orderId: string | number) => {
    if (idInSelection(orderId)) {
      onSelectionModelChange(selectionModel.filter((x) => String(x) !== String(orderId)));
    } else {
      onSelectionModelChange([...selectionModel, orderId]);
    }
  };

  if (!orders.length) {
    return (
      <Box
        sx={{
          py: 4,
          px: 2,
          textAlign: "center",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
        }}
      >
        <Typography color="text.secondary" fontSize="0.9rem">
          لا توجد طلبات في هذه الصفحة
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      {orders.map((row) => {
        const orderHref = `/orders/${row.orderId}`;
        const admin = users.find((u) => u.id === row.userId);
        const adminLabel = admin ? `${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim() : "";
        return (
          <Card
            key={String(row.orderId)}
            elevation={0}
            sx={(t) => ({
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 16px rgba(99, 102, 241, 0.05)",
              overflow: "visible",
            })}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" alignItems="flex-start" gap={1}>
                {showCheckbox && (
                  <Checkbox
                    size="small"
                    checked={idInSelection(row.orderId)}
                    onChange={() => toggleSelect(row.orderId)}
                    sx={{ p: 0.5, mt: -0.25 }}
                    color="primary"
                    inputProps={{ "aria-label": "تحديد الطلب" }}
                  />
                )}
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(orderHref)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(orderHref);
                    }
                  }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    textAlign: "start",
                    outline: "none",
                    borderRadius: 1,
                    "&:focus-visible": {
                      boxShadow: (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                    flexWrap="wrap"
                    sx={{ mb: 1, width: "100%" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={0.75}
                      flexWrap="wrap"
                      sx={{ minWidth: 0, justifyContent: "flex-start" }}
                    >
                      <Typography
                        component="span"
                        fontWeight={800}
                        fontSize="0.95rem"
                        color="primary.main"
                        noWrap
                      >
                        {row.orderNumber || "—"}
                      </Typography>
                      {row.code ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontSize="0.7rem"
                          noWrap
                        >
                          #{row.code}
                        </Typography>
                      ) : null}
                    </Stack>
                    <ChevronLeftIcon
                      sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0, opacity: 0.6 }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    flexWrap="wrap"
                    gap={0.75}
                    sx={{ mb: 1.25, width: "100%", alignSelf: "stretch" }}
                  >
                    <OrderStatusChip status={row.status} />
                    <DeliveryStatusChip deliveryStatus={row.deliveryStatus} />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    fontSize="0.85rem"
                    sx={{
                      mb: 0.75,
                      width: "100%",
                      textAlign: "start",
                      alignSelf: "flex-start",
                    }}
                    noWrap
                  >
                    {row.customerName || "—"}
                  </Typography>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1.25}
                    useFlexGap
                    alignItems="flex-start"
                    justifyContent="flex-start"
                    sx={{ width: "100%" }}
                  >
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      البيع:{" "}
                      <Box component="span" color="text.primary" fontWeight={600}>
                        {row.totalPrice != null
                          ? `${Number(row.totalPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                      التكلفة:{" "}
                      <Box component="span" color="text.primary" fontWeight={600}>
                        {computeRowCost(row)}
                      </Box>
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1.25}
                    sx={{ mt: 0.75, width: "100%" }}
                    useFlexGap
                    alignItems="flex-start"
                    justifyContent="flex-start"
                  >
                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                      الدفع: {paymentStatusLabels[Number(row.paymentStatus)] || "—"}
                    </Typography>
                    {row.PoDate ? (
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem" noWrap>
                        أمر التصنيع: {moment.utc(row.PoDate).tz("Africa/Cairo").format("YY/MM/DD")}
                        {calculateDaysFromPoDate(row.PoDate)
                          ? ` · ${calculateDaysFromPoDate(row.PoDate)}`
                          : ""}
                      </Typography>
                    ) : null}
                    {!isVendor && row.type ? (
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem" noWrap>
                        النوع: {row.type}
                      </Typography>
                    ) : null}
                    {!isVendor && adminLabel ? (
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem" noWrap>
                        المسؤول: {adminLabel}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
                {!isVendor && (
                  <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      aria-label="تعديل"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="حذف"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        );
      })}

      {totalPages > 1 ? (
        <Stack alignItems="center" sx={{ pt: 1.5, pb: 0.5 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
            size="small"
            siblingCount={0}
            boundaryCount={1}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
