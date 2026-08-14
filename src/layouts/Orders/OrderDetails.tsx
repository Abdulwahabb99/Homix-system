import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import EditOrderProductsModal from "./components/EditOrderProductsModal/EditOrderProductsModal";
import OrderInvoiceDocument from "./orderInvoice/OrderInvoiceDocument";
import { downloadOrderInvoicePdf } from "./utils/invoicePdf";
import OrderDetailsSkeleton from "./components/OrderDetailsSkeleton";
import ConfirmDeleteModal from "layouts/Orders/components/ConfirmDeleteModal";
import OrderDetailsView from "./orderDetail/OrderDetailsView";
import OrderDetailsLayoutHeader from "./orderDetail/OrderDetailsLayoutHeader";
import { useOrderDetailsPage } from "./orderDetail/useOrderDetailsPage";

function OrderDetails() {
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement | null>(null);
  const {
    id,
    isLoading,
    orderDetails,
    manufactureStatus,
    slectedOrderLine,
    orderTotalPrice,
    orderTotalShipping,
    orderTotalToBeCollected,
    orderTotalCost,
    isEditModalOpenned,
    setIsEditModalOpenned,
    orderlines,
    commentText,
    setCommentText,
    comments,
    setComments,
    pendingDeleteNoteId,
    setPendingDeleteNoteId,
    editingIndex,
    setEditingIndex,
    editedCommentText,
    setEditedCommentText,
    administrator,
    users,
    selectedFiles,
    invoicePdfLoading,
    setInvoicePdfLoading,
    isVendor,
    isAdmin,
    isAddingComment,
    isUpdatingComment,
    changeManufactureStatus,
    changeOrderStatus,
    changeDeliveryStatus,
    changeAssignee,
    changeDeliveryBy,
    changeDownPayment,
    changeShippingFees,
    changeDiscount,
    changePriority,
    updateCustomer,
    isUpdatingCustomer,
    onEdit,
    updateComment,
    deleteComment,
    handleAddComment,
    handleFileChange,
    handleRemoveFile,
  } = useOrderDetailsPage();

  const handleDownloadInvoice = async () => {
    if (!componentRef.current) {
      NotificationMeassage("error", "تعذر تجهيز الفاتورة");
      return;
    }
    setInvoicePdfLoading(true);
    try {
      const namePart =
        [orderDetails?.name, orderDetails?.code].filter(Boolean).join(" ") ||
        String(orderDetails?.id ?? id ?? "order");
      await downloadOrderInvoicePdf(componentRef.current, `فاتورة-${namePart}`);
      NotificationMeassage("success", "تم تحميل الفاتورة");
    } catch (e) {
      console.error(e);
      NotificationMeassage("error", "تعذر تصدير الفاتورة");
    } finally {
      setInvoicePdfLoading(false);
    }
  };

  return (
    <>
      {orderDetails?.id && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            width: 800,
            maxWidth: "100vw",
            zIndex: -1,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <OrderInvoiceDocument ref={componentRef} orderDetails={orderDetails} />
        </div>
      )}
      <DashboardLayout
        header={
          orderDetails && !isLoading ? (
            <OrderDetailsLayoutHeader
              orderDetails={orderDetails}
              routeOrderId={id}
              isVendor={isVendor}
              invoicePdfLoading={invoicePdfLoading}
              onNavigateEdit={() => navigate(`/orders/edit/${id}`)}
              onDownloadInvoice={handleDownloadInvoice}
            />
          ) : undefined
        }
      >
        <ToastContainer />
        <ConfirmDeleteModal
          open={pendingDeleteNoteId != null}
          onClose={() => setPendingDeleteNoteId(null)}
          handleConfirmDelete={() => {
            if (pendingDeleteNoteId != null) deleteComment(pendingDeleteNoteId);
          }}
          title="التعليق"
          message="سيتم حذف التعليق نهائياً. هل تريد المتابعة؟"
          tone="danger"
          confirmButtonText="حذف"
          cancelButtonText="رجوع"
        />
        {isEditModalOpenned && slectedOrderLine && (
          <EditOrderProductsModal
            open={isEditModalOpenned}
            onClose={() => {
              setIsEditModalOpenned(false);
            }}
            onEdit={onEdit}
            data={slectedOrderLine}
          />
        )}
        <Box sx={{ width: "100%" }}>
          {isLoading ? (
            <OrderDetailsSkeleton />
          ) : !orderDetails ? null : (
            <OrderDetailsView
              orderDetails={orderDetails}
              orderlines={orderlines}
              manufactureStatus={manufactureStatus}
              administrator={administrator}
              users={users}
              comments={comments}
              commentText={commentText}
              setCommentText={setCommentText}
              editingIndex={editingIndex}
              setEditingIndex={setEditingIndex}
              editedCommentText={editedCommentText}
              setEditedCommentText={setEditedCommentText}
              setComments={setComments}
              selectedFiles={selectedFiles}
              orderTotalPrice={orderTotalPrice}
              orderTotalShipping={orderTotalShipping}
              orderTotalToBeCollected={orderTotalToBeCollected}
              orderTotalCost={orderTotalCost}
              orderId={id}
              isVendor={isVendor}
              isAdmin={isAdmin}
              isAddingComment={isAddingComment}
              isUpdatingComment={isUpdatingComment}
              navigate={navigate}
              changeManufactureStatus={changeManufactureStatus}
              changeOrderStatus={changeOrderStatus}
              changeDeliveryStatus={changeDeliveryStatus}
              changeAssignee={changeAssignee}
              changeDeliveryBy={changeDeliveryBy}
              changeDownPayment={changeDownPayment}
              changeShippingFees={changeShippingFees}
              changeDiscount={changeDiscount}
              changePriority={changePriority}
              updateCustomer={updateCustomer}
              isUpdatingCustomer={isUpdatingCustomer}
              updateComment={updateComment}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              handleAddComment={handleAddComment}
              setPendingDeleteNoteId={setPendingDeleteNoteId}
              handleDownloadInvoice={handleDownloadInvoice}
            />
          )}
        </Box>
      </DashboardLayout>
    </>
  );
}

export default OrderDetails;
