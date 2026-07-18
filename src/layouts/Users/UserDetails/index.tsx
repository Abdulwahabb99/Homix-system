/**
 * تفاصيل المستخدم — الصفحة الرفيعة: تُنسّق جلب البيانات (GET /users/:id) وتوزّعها
 * على المكوّنات المقسّمة، بتصميم مطابق لـ homix_user_detail.html.
 * كل الأقسام مدفوعة ببيانات حقيقية من الـ API (الحساب/الصلاحيات المجمّعة/التحويل/سجل النشاط).
 */
import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { NotificationMeassage } from "components/NotificationMeassage/NotificationMeassage";
import { useUserDetail } from "./hooks/useUserDetail";
import { colSx, contentSx, gridSx } from "./utils/styles";
import UserDetailBreadcrumb from "./components/UserDetailBreadcrumb";
import UserDetailActions from "./components/UserDetailActions";
import UserDetailsSkeleton from "./components/UserDetailsSkeleton";
import UserPermissionsMatrix from "./components/UserPermissionsMatrix";
import UserAccountInfo from "./components/UserAccountInfo";
import UserJobInfo from "./components/UserJobInfo";
import UserBankTransfer from "./components/UserBankTransfer";
import UserActivityTimeline from "./components/UserActivityTimeline";
import UserModal from "../components/UserModal";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user, isLoading, name, email, role, joined,
    statusLabel, statusOnline, lastPasswordChange,
    permissionsSummary, activity, bank, job,
  } = useUserDetail(id);

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
        <UserDetailsSkeleton />
      ) : (
        <Box sx={contentSx}>
          <Box sx={gridSx}>
            {/* العمود الأيسر: مصفوفة الصلاحيات */}
            <Box sx={colSx}>
              <UserPermissionsMatrix summary={permissionsSummary} userId={user.id} />
            </Box>

            {/* العمود الأيمن: بيانات الحساب + وظيفية + التحويل + سجل النشاط */}
            <Box sx={colSx}>
              <UserAccountInfo
                email={email}
                role={role}
                joined={joined}
                statusLabel={statusLabel}
                statusOnline={statusOnline}
                lastPasswordChange={lastPasswordChange}
              />
              <UserJobInfo job={job} />
              <UserBankTransfer bank={bank} />
              <UserActivityTimeline activity={activity} />
            </Box>
          </Box>
        </Box>
      )}

      <UserModal open={editOpen} editUser={user} onClose={() => setEditOpen(false)} />
    </DashboardLayout>
  );
}
