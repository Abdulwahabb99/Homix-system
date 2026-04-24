import { useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { getHomixDataGridSx, HOMIX_TABLE_DEFAULT_HEIGHT_PX } from "shared/theme/homixDataGridSx";

/**
 * ملاحظة حول RTL + تمرير أفقي:
 * في وضع RTL، بعض المتصفحات تُعيد scrollLeft سالبة على حاوية التمرير الأفقي،
 * فيتجاهلها handleScroll الداخلي للـ DataGrid (v5) ولا يُطلق حدث rowsScroll،
 * فيتوقف تزامن رأس الأعمدة مع الصفوف أثناء التمرير (mui-x#3435).
 *
 * الحل هنا (مع الحفاظ على ترتيب الأعمدة الطبيعي من اليمين لليسار):
 * - نُزامن رأس الأعمدة يدويًا مع scrollLeft لحاوية الجسم باستخدام
 *   transform: translate3d(-scrollLeft, 0, 0) (نفس صيغة DataGrid الداخلية).
 * - نرفع columnBuffer لضمان رندر جميع الأعمدة مُسبقًا حتى لا تفشل الفرتوالايزيشن
 *   الأفقية (التي تعتمد أيضًا على نفس حدث rowsScroll المحجوب).
 */
function setupHorizontalHeaderSync(root: HTMLElement): () => void {
  const virtualScroller = root.querySelector<HTMLElement>(".MuiDataGrid-virtualScroller");
  const columnHeadersInner = root.querySelector<HTMLElement>(".MuiDataGrid-columnHeadersInner");

  if (!virtualScroller || !columnHeadersInner) return () => undefined;

  const sync = () => {
    const { scrollLeft } = virtualScroller;
    columnHeadersInner.style.transform = `translate3d(${-scrollLeft}px, 0, 0)`;
  };

  sync();
  virtualScroller.addEventListener("scroll", sync, { passive: true });

  return () => virtualScroller.removeEventListener("scroll", sync);
}

/**
 * MUI X DataGrid with Homix theming, optional server-side pagination.
 * Use paginationMode="server" with rowCount + onPageChange for server-driven lists.
 */
function HomixDataTable({
  rows,
  columns,
  getRowId,
  loading = false,
  height = HOMIX_TABLE_DEFAULT_HEIGHT_PX,
  page,
  pageSize,
  onPageChange,
  rowCount,
  paginationMode = "client",
  disablePagination = false,
  checkboxSelection = false,
  selectionModel = [],
  onSelectionModelChange,
  hideFooter = false,
  rowHeight = 52,
  columnHeaderHeight = 40,
  sx: sxProp = undefined,
  ...dataGridRest
}) {
  const theme = useTheme();
  const serverMode = paginationMode === "server";
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const columnBuffer = useMemo(() => Math.max(columns.length + 2, 10), [columns.length]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return undefined;

    let detachSync: () => void = () => undefined;
    const attach = () => {
      detachSync();
      detachSync = setupHorizontalHeaderSync(node);
    };

    attach();
    const observer = new MutationObserver(() => attach());
    observer.observe(node, { childList: true, subtree: true });

    return () => {
      detachSync();
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      ref={wrapperRef}
      sx={{
        width: "100%",
        minWidth: 0,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05), 0 2px 12px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        "& .MuiDataGrid-virtualScroller": { minHeight: 0 },
        ...getHomixDataGridSx(theme),
        height,
        ...sxProp,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        rowHeight={rowHeight}
        headerHeight={columnHeaderHeight}
        disableColumnMenu
        disableSelectionOnClick={checkboxSelection}
        checkboxSelection={checkboxSelection}
        selectionModel={checkboxSelection ? selectionModel : undefined}
        onSelectionModelChange={checkboxSelection ? onSelectionModelChange : undefined}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        rowCount={serverMode ? rowCount : undefined}
        rowsPerPageOptions={serverMode && pageSize ? [pageSize] : [10, 25, 50, 100]}
        pagination={disablePagination ? undefined : true}
        paginationMode={serverMode ? "server" : "client"}
        hideFooter={hideFooter}
        columnBuffer={columnBuffer}
        sx={{ border: "none" }}
        {...dataGridRest}
      />
    </Box>
  );
}

HomixDataTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  getRowId: PropTypes.func,
  loading: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  rowCount: PropTypes.number,
  paginationMode: PropTypes.oneOf(["server", "client"]),
  disablePagination: PropTypes.bool,
  checkboxSelection: PropTypes.bool,
  selectionModel: PropTypes.array,
  onSelectionModelChange: PropTypes.func,
  hideFooter: PropTypes.bool,
  rowHeight: PropTypes.number,
  columnHeaderHeight: PropTypes.number,
  sx: PropTypes.object,
};

export default HomixDataTable;
