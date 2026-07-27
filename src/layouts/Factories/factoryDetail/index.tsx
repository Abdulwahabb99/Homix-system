/**
 * صفحة تفاصيل المصنع — تصميم homix_factory_detail.html فوق `GET /factories/{id}`.
 *
 * الصفحة رفيعة: المنطق في `useFactoryDetailPage` والعرض في `components/`.
 * التعديل يستخدم نفس مودال صفحة القائمة (`FactoryFormModal`) فهو يجلب تفاصيله
 * بنفسه من نفس نقطة النهاية.
 */
import React from "react";
import { Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { HX } from "layouts/Orders/ordersHomixTheme";

import FactoryFormModal from "../components/FactoryFormModal";
import BankTransferCard from "./components/BankTransferCard";
import DocumentsCard from "./components/DocumentsCard";
import FactoryDetailSkeleton from "./components/FactoryDetailSkeleton";
import FactoryInfoCard from "./components/FactoryInfoCard";
import ResponsibleCard from "./components/ResponsibleCard";
import ShippingCostsCard from "./components/ShippingCostsCard";
import { useFactoryDetailPage } from "./hooks/useFactoryDetailPage";
import {
  colStackSx, detailGridSx, stateBoxSx, topBtnGhostSx, topBtnPrimarySx, FONT,
} from "./utils/styles";

export default function FactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const page = useFactoryDetailPage(id);
  const { detail } = page;

  // TODO(BE): لا توجد نقطة نهاية لتسوية المصنع المالية بعد
  const handleSettlement = () => NotificationMeassage("info", "التسوية المالية غير متاحة بعد");

  const breadcrumb = (
    <Box
      sx={{
        display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
        fontSize: "12px", color: HX.tx3, fontFamily: FONT,
      }}
    >
      <Box
        component="span"
        onClick={() => navigate("/factories")}
        sx={{ color: HX.tx2, cursor: "pointer", "&:hover": { color: HX.accent } }}
      >
        الصنّاع
      </Box>
      <Box component="span">/</Box>
      <Box component="span" sx={{ color: HX.tx, fontWeight: 700 }}>
        {detail?.name || "تفاصيل المصنع"}
      </Box>
    </Box>
  );

  const actions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <Box component="button" type="button" onClick={() => navigate("/factories")} sx={topBtnGhostSx}>
        <ArrowForwardIcon /> رجوع
      </Box>
      <Box
        component="button"
        type="button"
        disabled={!detail}
        onClick={page.openEdit}
        sx={{ ...topBtnGhostSx, opacity: detail ? 1 : 0.5 }}
      >
        <EditOutlinedIcon /> تعديل
      </Box>
      <Box component="button" type="button" onClick={handleSettlement} sx={topBtnPrimarySx}>
        <RequestQuoteOutlinedIcon /> تسوية مالية
      </Box>
    </Box>
  );

  let body: React.ReactNode;
  if (page.isLoading) {
    body = <FactoryDetailSkeleton />;
  } else if (page.isError || !detail) {
    body = (
      <Box sx={{ ...stateBoxSx, color: HX.red }}>تعذّر تحميل بيانات المصنع — حاول مرة أخرى.</Box>
    );
  } else {
    body = (
      <Box sx={detailGridSx}>
        {/* العمود الأيمن (الرئيسي) */}
        <Box sx={colStackSx}>
          <FactoryInfoCard detail={detail} />
          <ResponsibleCard detail={detail} />
        </Box>

        {/* العمود الجانبي */}
        <Box sx={colStackSx}>
          <BankTransferCard detail={detail} />
          <ShippingCostsCard detail={detail} />
          <DocumentsCard
            documents={detail.documents}
            documentTypes={page.meta?.documentTypes ?? []}
            onUpload={page.uploadDocuments}
            isUploading={page.isUploading}
            onDelete={page.deleteDocument}
            deletingId={page.deletingDocumentId}
          />
        </Box>
      </Box>
    );
  }

  return (
    <DashboardLayout header={<HomixPageHeader breadcrumb={breadcrumb} actions={actions} />}>
      <ToastContainer />

      <Box sx={{ mt: "16px", fontFamily: FONT }}>{body}</Box>

      <FactoryFormModal
        open={page.isEditOpen}
        factoryId={page.factoryId}
        meta={page.meta}
        isSaving={page.isSaving}
        onClose={page.closeEdit}
        onSave={(values) => page.saveFactory(values)}
      />
    </DashboardLayout>
  );
}
