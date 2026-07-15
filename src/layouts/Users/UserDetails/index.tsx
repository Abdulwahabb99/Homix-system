/**
 * تفاصيل المستخدم — الصفحة الرفيعة: تُنسّق جلب البيانات (GET /users/:id) وتوزّعها
 * على المكوّنات المقسّمة، بتصميم مطابق لـ homix_user_detail.html.
 * البيانات الحقيقية: الاسم/البريد/الدور/الحالة. الأقسام الثابتة (الصلاحيات/سجل النشاط/
 * بيانات التحويل/الإحصائيات) تُقرأ من ملف الثوابت لحين ربط الـ BE مستقبلاً.
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import Spinner from "components/Spinner/Spinner";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useUserDetail } from "./hooks/useUserDetail";
import { colSx, contentSx, gridSx } from "./utils/styles";
import UserDetailBreadcrumb from "./components/UserDetailBreadcrumb";
import UserDetailActions from "./components/UserDetailActions";
import UserProfileHeader from "./components/UserProfileHeader";
import UserPermissionsMatrix from "./components/UserPermissionsMatrix";
import UserAccountInfo from "./components/UserAccountInfo";
import UserJobInfo from "./components/UserJobInfo";
import UserBankTransfer from "./components/UserBankTransfer";
import UserActivityTimeline from "./components/UserActivityTimeline";
import UserModal from "../components/UserModal";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading, name, initials, email, role, joined, isActive } = useUserDetail(id);

  const [editOpen, setEditOpen] = useState(false);

  const goBack = () => navigate("/users");
  const comingSoon = () => NotificationMeassage("info", "قريباً — سيتم دعم هذه الميزة لاحقاً");

  return (
    <DashboardLayout
      header={
        <HomixPageHeader
          breadcrumb={<UserDetailBreadcrumb current={name} onParentClick={goBack} />}
          actions={
            <UserDetailActions
              onBack={goBack}
              onEdit={() => setEditOpen(true)}
              onSuspend={comingSoon}
              onManagePermissions={comingSoon}
            />
          }
        />
      }
    >
      {isLoading || !user ? (
        <Spinner />
      ) : (
        <Box sx={contentSx}>
          <UserProfileHeader
            name={name}
            email={email}
            initials={initials}
            role={role}
            joined={joined}
            isActive={isActive}
          />

          <Box sx={gridSx}>
            {/* العمود الأيسر: مصفوفة الصلاحيات */}
            <Box sx={colSx}>
              <UserPermissionsMatrix />
            </Box>

            {/* العمود الأيمن: بيانات الحساب + وظيفية + التحويل + سجل النشاط */}
            <Box sx={colSx}>
              <UserAccountInfo email={email} role={role} joined={joined} isActive={isActive} />
              <UserJobInfo />
              <UserBankTransfer />
              <UserActivityTimeline />
            </Box>
          </Box>
        </Box>
      )}

      <UserModal open={editOpen} editUser={user} onClose={() => setEditOpen(false)} />
    </DashboardLayout>
  );
}
