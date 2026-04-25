/**
 * أنماط موحّدة لصفحة إضافة طلب (Homix): كروت، حقول
 */
export const addOrderPageCardSx = {
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 20px rgba(99, 102, 241, 0.06)",
  overflow: "hidden" as const,
};

export const addOrderTextFieldSx = {
  "& .MuiInputLabel-root": {
    fontSize: "0.8125rem",
    color: "primary.main",
    "&.Mui-focused": { color: "primary.main" },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: "0.8125rem",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(99, 102, 241, 0.35)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
      borderWidth: 2,
    },
  },
};
