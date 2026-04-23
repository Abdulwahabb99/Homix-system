import React, { useId, useState } from "react";
import PropTypes from "prop-types";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const PRIMARY = "primary.main";

/** يدمج خصائص MUI المتداخلة حتى لا يحذف formControlSx الـ color/size الافتراضي */
function mergeFormControlSx(base, extra) {
  if (!extra) return base;
  const keysToDeepMerge = [
    "& .MuiInputLabel-root",
    "& .MuiOutlinedInput-root",
    "& .MuiSelect-select",
  ];
  const out = { ...base, ...extra };
  for (const k of keysToDeepMerge) {
    if (
      base[k] &&
      extra[k] &&
      typeof base[k] === "object" &&
      !Array.isArray(base[k]) &&
      typeof extra[k] === "object" &&
      !Array.isArray(extra[k])
    ) {
      out[k] = { ...base[k], ...extra[k] };
    }
  }
  return out;
}

const getDefaultFormControlStyles = (theme) => ({
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    color: PRIMARY,
    "&.Mui-focused": { color: PRIMARY },
    "&.MuiInputLabel-shrink": { color: PRIMARY },
    "&.MuiInputLabel-outlined": {
      color: PRIMARY,
      "&.MuiInputLabel-shrink": { color: PRIMARY },
    },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 52,
    borderRadius: 2,
    backgroundColor: "background.paper",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.28)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(6, 49, 70, 0.45)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: PRIMARY },
  },
  "& .MuiSelect-select": {
    py: 1.75,
    px: 1.5,
    fontSize: "0.875rem",
    textAlign: "start",
  },
});

/**
 * Select موحّد باستخدام MUI كما في التوثيق: FormControl + InputLabel + Select (outlined)
 */
function SelectComponent({
  label,
  options,
  value,
  onChange,
  name,
  id: idProp,
  disabled = false,
  fullWidth = true,
  error = false,
  variant = "outlined",
  withSectionBorder = true,
  /** تنسيقات إضافية لـ FormControl (تُدمج مع الافتراضي) */
  formControlSx: formControlSxFromProps,
  /** تنسيقات إضافية للـ Select فقط */
  selectSx: selectSxFromProps,
  /** تنسيقات الـ Box الخارجي (هوامش، border أعلى القسم، …) */
  boxSx: boxSxFromProps,
  menuProps: menuPropsOverride,
}: any) {
  const reactId = useId();
  const base = idProp ? idProp.replace(/[^a-zA-Z0-9-_]/g, "") : `sc-${reactId.replace(/:/g, "")}`;
  const labelId = `${base}-label`;
  const selectId = `${base}-select`;

  const [menuWidth, setMenuWidth] = useState(0);

  const internalValue = value == null || value === undefined ? "" : value;

  const optionByValue = (v) => options.find((o) => o.value === v);

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const opt = options.find((o) => String(o.value) === String(raw));
    if (opt) onChange(opt.value);
  };

  return (
    <Box
      sx={{
        width: fullWidth ? "100%" : "auto",
        px: 2,
        pb: 2.5,
        pt: 2.5,
        ...(withSectionBorder && {
          borderTop: "1px solid",
          borderColor: "divider",
        }),
        ...boxSxFromProps,
      }}
    >
      <FormControl
        fullWidth={fullWidth}
        variant={variant}
        disabled={disabled}
        error={error}
        sx={(theme) => {
          const base = getDefaultFormControlStyles(theme);
          if (!formControlSxFromProps) return base;
          const extra =
            typeof formControlSxFromProps === "function"
              ? formControlSxFromProps(theme)
              : formControlSxFromProps;
          return mergeFormControlSx(base, extra);
        }}
      >
        {label ? (
          <InputLabel
            id={labelId}
            color={error ? "error" : "primary"}
            sx={(theme) => ({
              // عنوان الحقل دائماً لون الـ primary (MUI الافتراضي يعرّض text.secondary)
              ...(!error && {
                color: theme.palette.primary.main,
                "&.Mui-focused": { color: theme.palette.primary.main },
                "&.MuiInputLabel-shrink": { color: theme.palette.primary.main },
                "&.MuiInputLabel-outlined": {
                  color: theme.palette.primary.main,
                  "&.MuiInputLabel-shrink": { color: theme.palette.primary.main },
                },
              }),
            })}
          >
            {label}
          </InputLabel>
        ) : null}
        <Select
          name={name}
          id={selectId}
          labelId={labelId}
          value={internalValue}
          label={label}
          displayEmpty
          onOpen={(e) => {
            const t = e.currentTarget;
            if (t && "offsetWidth" in t) setMenuWidth((t as HTMLElement).offsetWidth);
          }}
          onClose={() => setMenuWidth(0)}
          renderValue={(v) => {
            if (v === "" || v == null) return "\u00a0";
            return optionByValue(v)?.label ?? "";
          }}
          onChange={handleChange}
          sx={
            selectSxFromProps
              ? (theme) => ({
                  ...(typeof selectSxFromProps === "function"
                    ? selectSxFromProps(theme)
                    : selectSxFromProps),
                })
              : undefined
          }
          color="primary"
          MenuProps={{
            disableScrollLock: true,
            anchorOrigin: { vertical: "bottom", horizontal: "right" },
            transformOrigin: { vertical: "top", horizontal: "right" },
            PaperProps: {
              style: {
                minWidth: menuWidth > 0 ? menuWidth : undefined,
                maxWidth: "calc(100vw - 32px)",
              },
            },
            ...menuPropsOverride,
          }}
        >
          {options.map((opt) => (
            <MenuItem key={String(opt.value)} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

SelectComponent.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.node.isRequired, value: PropTypes.any.isRequired })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  error: PropTypes.bool,
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  withSectionBorder: PropTypes.bool,
  formControlSx: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  selectSx: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  boxSx: PropTypes.object,
  menuProps: PropTypes.object,
};

export default SelectComponent;
