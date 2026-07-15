/**
 * شريط الفلاتر: بحث بالاسم/الإيميل + تبويبات الدور (فلترة من جانب العميل).
 */
import React from "react";
import { Box } from "@mui/material";
import { filterBarSx, searchInputSx, filterSepSx, roleTabSx } from "../utils/styles";
import { ROLE_TABS } from "../utils/constants";
import { RoleFilter } from "../utils/types";

interface UsersFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  role: RoleFilter;
  onRole: (v: RoleFilter) => void;
  roleCounts: Record<string, number>;
}

export default function UsersFilterBar({ search, onSearch, role, onRole, roleCounts }: UsersFilterBarProps) {
  return (
    <Box sx={filterBarSx}>
      <Box
        component="input"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        placeholder="بحث بالاسم أو الإيميل..."
        sx={searchInputSx}
      />
      <Box sx={filterSepSx} />
      <Box sx={{ display: "flex", gap: "4px", marginInlineStart: "auto", flexWrap: "wrap" }}>
        {ROLE_TABS.map((t) => {
          const count = roleCounts[t.value] ?? 0;
          return (
            <Box key={t.value} onClick={() => onRole(t.value)} sx={roleTabSx(role === t.value)}>
              {t.label} ({count})
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
