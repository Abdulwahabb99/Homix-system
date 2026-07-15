/**
 * خرائط الأيقونات (MUI) المستخدمة في صفحة تفاصيل المستخدم — مفصولة عن المكوّنات
 * لإبقائها تصريحية. كل مفتاح يطابق نوعاً معرّفاً في types.ts.
 */
import React from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckOutlinedIcon from "@mui/icons-material/Check";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { ActivityEntry, InfoRow, PermActionKind, PermissionSection } from "./types";

/** أيقونة إجراء الصلاحية */
export function permActionIcon(action: PermActionKind): React.ReactNode {
  const map: Record<PermActionKind, React.ReactNode> = {
    view: <VisibilityOutlinedIcon />,
    edit: <EditOutlinedIcon />,
    create: <AddOutlinedIcon />,
    delete: <DeleteOutlineIcon />,
    export: <FileDownloadOutlinedIcon />,
    check: <CheckOutlinedIcon />,
    reply: <ReplyOutlinedIcon />,
    shield: <ShieldOutlinedIcon />,
    settings: <SettingsOutlinedIcon />,
  };
  return map[action];
}

/** أيقونة قسم الصلاحيات حسب المفتاح */
export function permSectionIcon(key: PermissionSection["key"]): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    orders: <Inventory2OutlinedIcon />,
    factories: <FactoryOutlinedIcon />,
    shipping: <LocalShippingOutlinedIcon />,
    finance: <PaymentsOutlinedIcon />,
    tickets: <ConfirmationNumberOutlinedIcon />,
    users: <GroupOutlinedIcon />,
  };
  return map[key] ?? <ShieldOutlinedIcon />;
}

/** أيقونة صف المعلومات */
export function infoRowIcon(icon: InfoRow["icon"]): React.ReactNode {
  const map: Record<InfoRow["icon"], React.ReactNode> = {
    email: <MailOutlineIcon />,
    shield: <ShieldOutlinedIcon />,
    clock: <AccessTimeIcon />,
    calendar: <CalendarTodayOutlinedIcon />,
    lock: <LockOutlinedIcon />,
    briefcase: <WorkOutlineIcon />,
    money: <PaymentsOutlinedIcon />,
  };
  return map[icon];
}

/** أيقونة عنصر سجل النشاط */
export function activityIcon(icon: ActivityEntry["icon"]): React.ReactNode {
  const map: Record<ActivityEntry["icon"], React.ReactNode> = {
    check: <CheckOutlinedIcon />,
    factory: <FactoryOutlinedIcon />,
    ticket: <ChatBubbleOutlineIcon />,
    money: <PaymentsOutlinedIcon />,
    edit: <EditOutlinedIcon />,
  };
  return map[icon];
}
