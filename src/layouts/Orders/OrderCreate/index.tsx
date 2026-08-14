import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import AddProductModal from "layouts/Orders/components/AddOrderModal/AddProductModal";
import { FONT } from "./constants";
import { useOrderCreateForm, productToLineItem } from "./hooks/useOrderCreateForm";
import OrderCreateBreadcrumb from "./components/OrderCreateBreadcrumb";
import OrderCreateHeaderActions from "./components/OrderCreateHeaderActions";
import CustomerSection from "./components/CustomerSection";
import ProductsSection from "./components/ProductsSection";
import ShippingPaymentSection from "./components/ShippingPaymentSection";
import OrderSummarySidebar from "./components/OrderSummarySidebar";
import DraftInvoiceDialog from "./components/DraftInvoiceDialog";

export default function OrderCreate() {
  const form = useOrderCreateForm();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  /* لقطة من الطلب قيد الإنشاء تُمرَّر لحوار الفاتورة (قبل الحفظ).
     مُذكَّرة حتى لا يُعاد بناؤها مع كل ضغطة مفتاح في نموذج الطلب. */
  const draftForm = useMemo(
    () => ({
      customer: form.customer,
      lineItems: form.lineItems,
      orderDate: form.orderDate,
      expectedDeliveryDate: form.expectedDeliveryDate,
      paymentStatus: form.paymentStatus,
      deliveryBy: form.deliveryBy,
      downPayment: form.downPayment,
      shippingFees: form.shippingFees,
      toBeCollected: form.toBeCollected,
    }),
    [
      form.customer,
      form.lineItems,
      form.orderDate,
      form.expectedDeliveryDate,
      form.paymentStatus,
      form.deliveryBy,
      form.downPayment,
      form.shippingFees,
      form.toBeCollected,
    ]
  );

  const handlePickProduct = (product: any) => {
    if (product) form.addLineItem(productToLineItem(product));
    setIsPickerOpen(false);
  };

  return (
    <DashboardLayout
      header={
        <HomixPageHeader
          breadcrumb={<OrderCreateBreadcrumb />}
          actions={
            <OrderCreateHeaderActions
              onSubmit={form.submit}
              canSubmit={form.isValid}
              isSubmitting={form.isSubmitting}
              onPrintInvoice={() => setIsInvoiceOpen(true)}
              canPrintInvoice={form.lineItems.length > 0}
            />
          }
        />
      }
    >
      <ToastContainer />

      {isInvoiceOpen && (
        <DraftInvoiceDialog
          open={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          form={draftForm}
        />
      )}

      {isPickerOpen && (
        <AddProductModal
          open={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={handlePickProduct}
          product={null}
        />
      )}

      <Box sx={{ fontFamily: FONT, mt: "12px" }}>
        <Box sx={{ display: "grid", gap: "16px", gridTemplateColumns: { xs: "1fr", lg: "1fr 330px" }, alignItems: "start" }}>
          {/* LEFT — form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <CustomerSection customer={form.customer} onChange={form.setCustomerField} />
            <ProductsSection
              lineItems={form.lineItems}
              onOpenPicker={() => setIsPickerOpen(true)}
              onRemove={form.removeLineItem}
              onQuantityChange={form.setLineItemQuantity}
            />
            <ShippingPaymentSection
              orderDate={form.orderDate}
              setOrderDate={form.setOrderDate}
              expectedDeliveryDate={form.expectedDeliveryDate}
              setExpectedDeliveryDate={form.setExpectedDeliveryDate}
              paymentStatus={form.paymentStatus}
              setPaymentStatus={form.setPaymentStatus}
              deliveryBy={form.deliveryBy}
              setDeliveryBy={form.setDeliveryBy}
              downPayment={form.downPayment}
              setDownPayment={form.setDownPayment}
              shippingFees={form.shippingFees}
              setShippingFees={form.setShippingFees}
              toBeCollected={form.toBeCollected}
              setToBeCollected={form.setToBeCollected}
            />
          </Box>

          {/* RIGHT — summary */}
          <OrderSummarySidebar
            totals={form.totals}
            itemsCount={form.lineItems.length}
            canSubmit={form.isValid}
            isSubmitting={form.isSubmitting}
            onSubmit={form.submit}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}
