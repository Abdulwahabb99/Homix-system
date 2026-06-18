import React from "react";
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

export default function ShipmentDetails() {
  const { id } = useParams();
  const shipmentDetailId = id as string;

  const { data, isLoading, isError } = useShipmentDetailQuery(shipmentDetailId);
  const { data: meta } = useShipmentsMetaQuery();

  if (isLoading) {
    return <CenterState><CircularProgress size={42} sx={{ color: HX.accent }} /></CenterState>;
  }
  if (isError || !data) {
    return <CenterState>تعذّر تحميل تفاصيل الشحنة</CenterState>;
  }

  return (
    <LoadedShipmentDetails shipmentDetailId={shipmentDetailId} data={data} statusOptions={meta?.shipmentStatuses ?? []} />
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
}: {
  shipmentDetailId: string;
  data: ShipmentDetailData;
  statusOptions: ShipmentsMetaOption[];
}) {
  const { shipment, customer, financial, products, timeline, vendor, notes } = data;

  const status = useUpdateShipmentStatus(shipmentDetailId, shipment);
  const note = useAddShipmentNote(shipmentDetailId, shipment.id);

  const shipNumber = shipment.shipmentNumber || `SH-${shipment.id}`;

  return (
    <DashboardLayout
      header={<HomixPageHeader breadcrumb={<ShipmentBreadcrumb shipNumber={shipNumber} />} actions={<ShipmentHeaderActions />} />}
    >
      <ToastContainer />
      <Box sx={{ fontFamily: FONT, mt: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <ShipmentHeaderStrip shipment={shipment} />

        <Box sx={{ display: "grid", gap: "14px", gridTemplateColumns: { xs: "1fr", lg: "1fr 330px" }, alignItems: "start" }}>
          {/* LEFT */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <ProductsCard products={products} />
            <ShipmentInfoCard shipment={shipment} />
            <TimelineCard timeline={timeline} />
            <NotesCard
              notes={notes ?? []}
              noteText={note.noteText}
              sending={note.sending}
              onChange={note.setNoteText}
              onSend={note.send}
            />
          </Box>

          {/* RIGHT */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <ClientCard customer={customer} shipment={shipment} />
            <SellerCard vendor={vendor} shipment={shipment} />
            <FinancialsCard financial={financial} shipment={shipment} />
            <StatusControlCard
              shipment={shipment}
              statusOptions={statusOptions}
              currentStatus={status.currentStatus}
              onChange={status.setStatusValue}
              saving={status.saving}
              saved={status.saved}
              onSave={status.save}
            />
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
