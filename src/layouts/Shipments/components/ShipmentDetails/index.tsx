import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { ToastContainer } from "react-toastify";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { useShipmentDetailQuery, type ShipmentDetailData } from "query/shipmentDetail";
import { useShipmentsMetaQuery, type ShipmentsMetaOption } from "query/shipmentsMeta";

import { FONT } from "./constants";
import { useUpdateShipmentStatus } from "./hooks/useUpdateShipmentStatus";
import { useAddShipmentNote } from "./hooks/useAddShipmentNote";
import CenterState from "./components/CenterState";
import ShipmentBreadcrumb from "./components/ShipmentBreadcrumb";
import ShipmentHeaderActions from "./components/ShipmentHeaderActions";
import ShipmentHeaderStrip from "./components/ShipmentHeaderStrip";
import ProductsCard from "./components/ProductsCard";
import ShipmentInfoCard from "./components/ShipmentInfoCard";
import TimelineCard from "./components/TimelineCard";
import NotesCard from "./components/NotesCard";
import ClientCard from "./components/ClientCard";
import SellerCard from "./components/SellerCard";
import FinancialsCard from "./components/FinancialsCard";
import StatusControlCard from "./components/StatusControlCard";
import OrderInvoiceDocument from "layouts/Orders/orderInvoice/OrderInvoiceDocument";
import { downloadOrderInvoicePdf } from "layouts/Orders/utils/invoicePdf";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { buildShipmentInvoiceModel } from "./shipmentInvoiceAdapter";

export type ShipmentDetailsProps = { shipmentId?: string | number; embedded?: boolean; onEdit?: () => void };

export default function ShipmentDetails({ shipmentId, embedded = false, onEdit }: ShipmentDetailsProps = {}) {
  const { id } = useParams();
  const shipmentDetailId = String(shipmentId ?? id ?? "");

  const { data, isLoading, isError } = useShipmentDetailQuery(shipmentDetailId);
  const { data: meta } = useShipmentsMetaQuery();

  if (isLoading) {
    return embedded ? <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}><CircularProgress size={42} sx={{ color: HX.accent }} /></Box> : <CenterState><CircularProgress size={42} sx={{ color: HX.accent }} /></CenterState>;
  }
  if (isError || !data) {
    return embedded ? <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>تعذّر تحميل تفاصيل الشحنة</Box> : <CenterState>تعذّر تحميل تفاصيل الشحنة</CenterState>;
  }

  return (
    <LoadedShipmentDetails shipmentDetailId={shipmentDetailId} data={data} statusOptions={meta?.shipmentStatuses ?? []} embedded={embedded} onEdit={onEdit} />
  );
}

/**
 * Rendered only once the shipment has loaded, so the hooks below always have a
 * concrete `shipment` to work with (no conditional hooks in the page component).
 */
function LoadedShipmentDetails({
  shipmentDetailId,
  data,
  statusOptions,
  embedded,
  onEdit,
}: {
  shipmentDetailId: string;
  data: ShipmentDetailData;
  statusOptions: ShipmentsMetaOption[];
  embedded: boolean;
  onEdit?: () => void;
}) {
  const { shipment, customer, financial, products, timeline, vendor, notes } = data;

  const status = useUpdateShipmentStatus(shipmentDetailId, shipment);
  const note = useAddShipmentNote(shipmentDetailId, shipment.id);

  const shipNumber = shipment.shipmentNumber || `SH${shipment.orderNumber}`;

  /* فاتورة الشحنة = نفس مستند فاتورة الطلب، تُرسم خارج الشاشة ثم تُصدَّر PDF. */
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [invoicePdfLoading, setInvoicePdfLoading] = useState(false);
  const invoiceModel = buildShipmentInvoiceModel(data);

  const handleExportPdf = async () => {
    if (!invoiceRef.current) {
      NotificationMeassage("error", "تعذر تجهيز الفاتورة");
      return;
    }
    setInvoicePdfLoading(true);
    try {
      await downloadOrderInvoicePdf(invoiceRef.current, `فاتورة-${shipNumber}`);
      NotificationMeassage("success", "تم تحميل الفاتورة");
    } catch (e) {
      console.error(e);
      NotificationMeassage("error", "تعذر تصدير الفاتورة");
    } finally {
      setInvoicePdfLoading(false);
    }
  };

  const details = (
    <>
      <ToastContainer />
      <div
        aria-hidden
        style={{ position: "fixed", left: "-10000px", top: 0, width: 800, zIndex: -1, pointerEvents: "none", overflow: "hidden", background: "#fff" }}
      >
        <OrderInvoiceDocument ref={invoiceRef} orderDetails={invoiceModel} />
      </div>
      <Box sx={{ fontFamily: FONT, mt: embedded ? 0 : "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {embedded && <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}><ShipmentHeaderActions shipmentId={shipmentDetailId} onEdit={onEdit} onExportPdf={handleExportPdf} exportPdfLoading={invoicePdfLoading} /></Box>}
        <ShipmentHeaderStrip shipment={shipment} />
        <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", lg: "1fr 330px" }, alignItems: "start" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <ProductsCard products={products} /><ShipmentInfoCard shipment={shipment} /><TimelineCard timeline={timeline} />
            <NotesCard notes={notes ?? []} noteText={note.noteText} sending={note.sending} onChange={note.setNoteText} onSend={note.send} selectedFiles={note.selectedFiles} onFileChange={note.handleFileChange} onRemoveFile={note.handleRemoveFile} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <ClientCard customer={customer} shipment={shipment} /><SellerCard vendor={vendor} shipment={shipment} />
            <FinancialsCard financial={financial} shipment={shipment} />
            <StatusControlCard shipment={shipment} statusOptions={statusOptions} currentStatus={status.currentStatus} onChange={status.setStatusValue} saving={status.saving} saved={status.saved} onSave={status.save} />
          </Box>
        </Box>
      </Box>
    </>
  );
  if (embedded) return details;
  return (
    <DashboardLayout
      header={<HomixPageHeader breadcrumb={<ShipmentBreadcrumb shipNumber={shipNumber} />} actions={<ShipmentHeaderActions shipmentId={shipmentDetailId} onExportPdf={handleExportPdf} exportPdfLoading={invoicePdfLoading} />} />}
    >
      {details}
    </DashboardLayout>
  );
}
