import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { HX } from "layouts/Orders/ordersHomixTheme";
import { formatRegressionChange, type RegressionConflict } from "./regressionConfirm";

export type RegressionConfirmDialogProps = {
  conflict: RegressionConflict | null;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function RegressionConfirmDialog({
  conflict,
  busy,
  onConfirm,
  onCancel,
}: RegressionConfirmDialogProps) {
  return (
    <Dialog
      open={Boolean(conflict)}
      onClose={busy ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      PaperProps={{ sx: { borderRadius: HX.r, bgcolor: HX.surface, direction: "rtl" } }}
    >
      <DialogTitle sx={{ color: HX.tx, fontWeight: 700, fontSize: 18 }}>
        تأكيد الرجوع بحالة الطلب
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: HX.border }}>
        {(conflict?.regressions ?? []).map((item, i) => (
          <Box
            key={`${item.orderId}-${i}`}
            data-testid="regression-item"
            sx={{
              bgcolor: HX.surface2,
              border: `0.5px solid ${HX.border2}`,
              borderRadius: HX.r,
              p: 1.5,
              mb: 1.25,
            }}
          >
            <Typography sx={{ color: HX.tx, fontWeight: 700, fontSize: 14 }}>
              الطلب {item.orderNumber ?? item.orderId}
            </Typography>
            {item.reasonLabels.map((label, j) => (
              <Typography key={j} sx={{ color: HX.red, fontSize: 13, mt: 0.5 }}>
                {label}
              </Typography>
            ))}
            <Box component="ul" sx={{ m: 0, mt: 0.75, pr: 2.5, pl: 0, color: HX.tx2, fontSize: 13 }}>
              {item.changes.map((change, k) => (
                <li key={k}>{formatRegressionChange(change)}</li>
              ))}
            </Box>
          </Box>
        ))}
        <Box
          sx={{
            bgcolor: HX.amberLight,
            color: HX.tx,
            borderRadius: "10px",
            p: 1.25,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          سيتم تسجيل هذا التغيير في سجل التدقيق.
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={busy}
          sx={{ bgcolor: HX.red, "&:hover": { bgcolor: HX.red }, color: "#fff", borderRadius: "10px" }}
        >
          {busy ? <CircularProgress size={18} color="inherit" /> : "تأكيد الرجوع"}
        </Button>
        <Button onClick={onCancel} disabled={busy} sx={{ color: HX.tx2, borderRadius: "10px" }}>
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
}
