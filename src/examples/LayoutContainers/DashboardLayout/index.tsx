/**
 * Homix unified dashboard shell.
 * الواجهات تمرّر فقط المحتوى؛ الشريط العلوي (breadcrumb / عنوان) افتراضي هنا — أو عبر props.
 */

import React, { useEffect } from "react";
import MDBox from "components/MDBox";
import HomixPageHeader from "components/HomixPageHeader/HomixPageHeader";
import { useLocation } from "react-router-dom";
import { useMaterialUIController, setLayout } from "context";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  /**
   * شريط مخصّص (مثل قائمة الطلبات بأزرارها).
   * `undefined`: يُستخدم الافتراضي (breadcrumb من المسار).
   * `null`: بدون شريط علوي.
   */
  header?: React.ReactNode | null;
  /** اختصار لبناء `HomixPageHeader` بدل تمرير `header` يدوياً */
  pageTitle?: React.ReactNode;
  pageSubtitle?: React.ReactNode;
  pageActions?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  header,
  pageTitle,
  pageSubtitle,
  pageActions,
}: DashboardLayoutProps) {
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname, dispatch]);

  const resolvedHeader = (() => {
    if (header === null) return null;
    if (header !== undefined) return header;
    const hasShortcuts = pageTitle != null || pageSubtitle != null || pageActions != null;
    if (hasShortcuts) {
      return <HomixPageHeader title={pageTitle} subtitle={pageSubtitle} actions={pageActions} />;
    }
    return <HomixPageHeader />;
  })();

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",

        [breakpoints.up("lg")]: {
          marginInlineStart: pxToRem(220),
          transition: transitions.create(["margin-inline-start", "margin-inline-end"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      {resolvedHeader}
      {children}
    </MDBox>
  );
}
