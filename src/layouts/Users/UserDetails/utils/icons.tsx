/**
 * خرائط الأيقونات (MUI) المستخدمة في صفحة تفاصيل المستخدم — مفصولة عن المكوّنات
 * لإبقائها تصريحية. مفاتيح المجموعات/الإجراءات تطابق ما يعيده الـ API.
 */
import React from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { InfoRow, PermActionKind } from "./types";
import { permActionFromKey } from "./constants";

/** أيقونة إجراء الصلاحية */
export function permActionIcon(action: PermActionKind): React.ReactNode {
  const map: Record<PermActionKind, React.ReactNode> = {
    view: <VisibilityOutlinedIcon />,
    edit: <EditOutlinedIcon />,
    create: <AddIcon />,
    delete: <DeleteOutlineIcon />,
    export: <FileDownloadOutlinedIcon />,
    check: <CheckIcon />,
    reply: <ReplyOutlinedIcon />,
    shield: <ShieldOutlinedIcon />,
    settings: <SettingsOutlinedIcon />,
  };
  return map[action];
}

/** أيقونة عنصر صلاحية من مفتاحه مباشرة (orders_view → عين) */
export function permItemIcon(key: string): React.ReactNode {
  return permActionIcon(permActionFromKey(key));
}

/** أيقونة مجموعة الصلاحيات حسب المفتاح */
export function permGroupIcon(key: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    dashboard: <GridViewOutlinedIcon />,
    orders: <Inventory2OutlinedIcon />,
    factory: <FactoryOutlinedIcon />,
    products: <ShoppingBagOutlinedIcon />,
    vendors: <StorefrontOutlinedIcon />,
    employees: <BadgeOutlinedIcon />,
    customers: <PeopleAltOutlinedIcon />,
    ship: <LocalShippingOutlinedIcon />,
    finance: <PaymentsOutlinedIcon />,
    tickets: <ConfirmationNumberOutlinedIcon />,
    notifications: <NotificationsNoneOutlinedIcon />,
    users: <ManageAccountsOutlinedIcon />,
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
    phone: <PhoneOutlinedIcon />,
  };
  return map[icon];
}

/** أيقونة عنصر سجل النشاط حسب نوع الحدث */
export function activityIcon(action: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    login: <LoginIcon />,
    logout: <LogoutIcon />,
    create: <AddIcon />,
    update: <EditOutlinedIcon />,
    edit: <EditOutlinedIcon />,
    delete: <DeleteOutlineIcon />,
    settle: <CheckIcon />,
    close: <CheckIcon />,
    reply: <ReplyOutlinedIcon />,
  };
  return map[action] ?? <HistoryIcon />;
}
