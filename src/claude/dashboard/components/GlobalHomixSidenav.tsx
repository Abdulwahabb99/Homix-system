import React, { useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useMaterialUIController, setMiniSidenav } from "context";
import { HomixSidenavPanel, type HomixNavRole } from "claude/dashboard/components/HomixSidebar";
import "claude/dashboard/homixDashboard.css";

const SIDEBAR_PX = 220;

type Props = { navRole: HomixNavRole };

/**
 * شريط Homix العام: ثابت من md (≥900px)، درج على الشاشات الضيقة.
 * في RTL: الشريط على يمين الشاشة (بداية السطر) — نستخدم insetInlineStart وليس insetInlineEnd.
 */
export default function GlobalHomixSidenav({ navRole }: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;

  const closeMobile = () => setMiniSidenav(dispatch, true);
  const onNavigate = isMdUp ? undefined : closeMobile;

  const panel = <HomixSidenavPanel role={navRole} onNavigate={onNavigate} />;

  /** مثل Sidenav السابق: على الشاشة الضيقة يبدأ الدرج مغلقًا حتى يفتحه المستخدم من الـ navbar */
  useEffect(() => {
    const md = theme.breakpoints.values.md;
    const apply = () => {
      if (window.innerWidth < md) {
        setMiniSidenav(dispatch, true);
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [dispatch, theme.breakpoints.values.md]);

  if (isMdUp) {
    return (
      <Box
        component="aside"
        className="h-sidebar h-sidebar--global"
        sx={{
          position: "fixed",
          top: 0,
          insetInlineStart: 0,
          insetInlineEnd: "auto",
          zIndex: (t) => t.zIndex.drawer,
          width: SIDEBAR_PX,
          height: "100dvh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {panel}
      </Box>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={!miniSidenav}
      onClose={closeMobile}
      keepMounted
      PaperProps={{
        className: "h-sidebar",
        sx: (t) => ({
          width: SIDEBAR_PX,
          maxWidth: "min(100vw, 320px)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          // RTL: تثبيت الورق على يمين الشاشة (MUI قد يعكس anchor مع الـ plugin)
          ...(t.direction === "rtl"
            ? { left: "auto", right: 0 }
            : { left: 0, right: "auto" }),
        }),
      }}
    >
      {panel}
    </Drawer>
  );
}
