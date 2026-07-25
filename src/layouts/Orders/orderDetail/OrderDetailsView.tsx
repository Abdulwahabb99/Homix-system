/**
 * صفحة تفاصيل الطلب — منسّق رفيع: يوزّع بيانات الطلب على بطاقات مقسّمة
 * (شريط علوي، منتجات، حالة، ملاحظات، عميل، مالية، إجراءات، سجل أحداث).
 * المنطق المشترك في `utils`/`hooks`، والثوابت في `constants`، والأنماط في `styles`.
 */
import React, { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { OD } from "./odTheme";
import CustomerEditModal, { type CustomerFormValues } from "./CustomerEditModal";
import OrderStrip from "./components/OrderStrip";
import ProductImageLightbox from "./components/ProductImageLightbox";
import ProductLineCard from "./components/ProductLineCard";
import OrderStatusCard from "./components/OrderStatusCard";
import OrderNotesCard from "./components/OrderNotesCard";
import CustomerInfoCard from "./components/CustomerInfoCard";
import FinancialDetailsCard from "./components/FinancialDetailsCard";
import QuickActionsCard from "./components/QuickActionsCard";
import OrderTimelineCard from "./components/OrderTimelineCard";

export type OrderDetailsViewProps = {
  orderDetails: any;
  orderlines: any[];
  manufactureStatus: number | null;
  administrator: string;
  users: any[];
  comments: any[];
  commentText: string;
  setCommentText: (v: string) => void;
  editingIndex: number | null;
  setEditingIndex: (v: number | null) => void;
  editedCommentText: string;
  setEditedCommentText: (v: string) => void;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  selectedFiles: { file: File; url: string }[];
  orderTotalPrice: number | null;
  orderTotalShipping: number | null;
  orderTotalToBeCollected: number | null;
  orderTotalCost: number | null;
  orderId: string | undefined;
  isVendor: boolean;
  isAdmin: boolean;
  isAddingComment: boolean;
  isUpdatingComment: boolean;
  navigate: NavigateFunction;
  changeManufactureStatus: (status: number | null) => void;
  changeOrderStatus: (status: number | null) => void;
  changeDeliveryStatus: (status: number | null) => void;
  changeAssignee: (userId: number | null) => void;
  changeDeliveryLocation: (shippedFromInventory: boolean) => void;
  changeToBeCollected: (value: number) => void;
  updateCustomer: (values: CustomerFormValues) => Promise<unknown>;
  isUpdatingCustomer: boolean;
  updateComment: (noteId: number | string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleAddComment: () => void;
  setPendingDeleteNoteId: (v: any) => void;
  handleDownloadInvoice: () => void;
};

export default function OrderDetailsView({
  orderDetails,
  orderlines,
  manufactureStatus,
  users,
  comments,
  commentText,
  setCommentText,
  editingIndex,
  setEditingIndex,
  editedCommentText,
  setEditedCommentText,
  selectedFiles,
  orderTotalPrice,
  orderTotalShipping,
  orderTotalToBeCollected,
  orderTotalCost,
  isVendor,
  isAdmin,
  isAddingComment,
  isUpdatingComment,
  navigate,
  changeManufactureStatus,
  changeOrderStatus,
  changeDeliveryStatus,
  changeAssignee,
  changeDeliveryLocation,
  changeToBeCollected,
  updateCustomer,
  isUpdatingCustomer,
  updateComment,
  handleFileChange,
  handleRemoveFile,
  handleAddComment,
  setPendingDeleteNoteId,
  handleDownloadInvoice,
}: OrderDetailsViewProps) {
  /* صورة المنتج المعروضة في نافذة التكبير (lightbox) — null = مغلقة */
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  /* نافذة تعديل بيانات العميل */
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const showCustomerCard = orderDetails?.customer || orderDetails?.shippedFromInventory;

  return (
    <Box sx={{ width: "100%", bgcolor: OD.bg, minHeight: "50vh" }}>
      <ProductImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />

      <CustomerEditModal
        open={customerModalOpen}
        customer={orderDetails?.customer}
        isSaving={isUpdatingCustomer}
        onClose={() => setCustomerModalOpen(false)}
        onSave={updateCustomer}
      />

      <OrderStrip orderDetails={orderDetails} />

      <Box sx={{ py: 2.25, width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" },
            gap: 1.75,
            alignItems: "start",
          }}
        >
          {/* ——— العمود الأيمن (المحتوى الرئيسي) ——— */}
          <Stack spacing={1.5}>
            {orderlines.map((order) => (
              <ProductLineCard
                key={order.id}
                order={order}
                orderDetails={orderDetails}
                onPreview={setPreviewImage}
              />
            ))}

            <OrderStatusCard
              orderDetails={orderDetails}
              manufactureStatus={manufactureStatus}
              users={users}
              changeOrderStatus={changeOrderStatus}
              changeDeliveryStatus={changeDeliveryStatus}
              changeAssignee={changeAssignee}
              changeDeliveryLocation={changeDeliveryLocation}
              changeManufactureStatus={changeManufactureStatus}
            />

            <OrderNotesCard
              comments={comments}
              users={users}
              commentText={commentText}
              setCommentText={setCommentText}
              editingIndex={editingIndex}
              setEditingIndex={setEditingIndex}
              editedCommentText={editedCommentText}
              setEditedCommentText={setEditedCommentText}
              selectedFiles={selectedFiles}
              isAdmin={isAdmin}
              isAddingComment={isAddingComment}
              isUpdatingComment={isUpdatingComment}
              updateComment={updateComment}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              handleAddComment={handleAddComment}
              setPendingDeleteNoteId={setPendingDeleteNoteId}
            />
          </Stack>

          {/* ——— العمود الأيسر (الشريط الجانبي) ——— */}
          <Stack spacing={1.5}>
            {showCustomerCard && (
              <CustomerInfoCard
                orderDetails={orderDetails}
                isVendor={isVendor}
                onEdit={() => setCustomerModalOpen(true)}
              />
            )}

            <FinancialDetailsCard
              orderDetails={orderDetails}
              orderTotalPrice={orderTotalPrice}
              orderTotalShipping={orderTotalShipping}
              orderTotalToBeCollected={orderTotalToBeCollected}
              orderTotalCost={orderTotalCost}
              isVendor={isVendor}
              changeToBeCollected={changeToBeCollected}
            />

            <QuickActionsCard
              orderDetails={orderDetails}
              navigate={navigate}
              handleDownloadInvoice={handleDownloadInvoice}
            />

            <OrderTimelineCard timeline={orderDetails.timeline} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
