import type { SxProps, Theme } from "@mui/material/styles";

type UserOption = { label: string; value: string | number };

/**
 * اختيار «المسؤول» مع بحث في القائمة + اتجاه RTL (نفس فكرة فلتر المصنعين)
 */
export function getUserSelectAutocompleteConfig(minInputHeight: number) {
  return {
    noOptionsText: "لا نتائج" as const,
    openOnFocus: true,
    ListboxProps: { style: { maxHeight: 320, overflow: "auto" as const } },
    componentsProps: {
      popper: { sx: { zIndex: (t: Theme) => t.zIndex.modal + 1 } },
      paper: {
        elevation: 8,
        sx: { borderRadius: 2, mt: 0.5, maxHeight: 360, overflow: "hidden" },
      },
    },
    isOptionEqualToValue: (a: UserOption, b: UserOption) =>
      String(a.value) === String(b.value),
    getOptionLabel: (o: UserOption) => o?.label ?? "",
    sx: {
      direction: "rtl" as const,
      width: "100%",
      "& .MuiAutocomplete-option": {
        fontSize: "0.875rem",
      },
      "& .MuiAutocomplete-inputRoot": {
        minHeight: minInputHeight,
        fontSize: "0.875rem",
        justifyContent: "flex-start",
      },
      "& .MuiAutocomplete-input": {
        textAlign: "start" as const,
        minWidth: "3em !important",
      },
      "& .MuiAutocomplete-endAdornment": { top: "unset" },
    } satisfies SxProps<Theme>,
  };
}

export function getUserSelectValue(
  options: UserOption[],
  value: string | number | null | undefined
): UserOption | null {
  if (value == null || value === "") return null;
  return options.find((o) => String(o.value) === String(value)) ?? null;
}
