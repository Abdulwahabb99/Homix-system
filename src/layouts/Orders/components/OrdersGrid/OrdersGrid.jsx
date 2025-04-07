/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import styles from "./OrdersGrid.module.css";
import { Button, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

function OrdersGrid({
  columnDefs,
  rowData,
  defaultColDef,
  handleReset,
  handleSearchClick,
  onCellValueChanged,
  enableQuickFilter,
  gridHeight,
}) {
  const navigate = useNavigate();
  const gridRef = useRef();
  const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  const onCellValueChange = (params) => {
    if (onCellValueChanged) onCellValueChanged(params);
  };

  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: gridHeight ? gridHeight : "495px", marginTop: "10px" }}
    >
      <div className={styles.upperGridBtn}>
        <div className={styles.resetBtnBox}>
          <Button sx={{ padding: "0" }} onClick={handleSearchClick}>
            البحث
          </Button>
          <Button sx={{ padding: "0" }} onClick={handleReset}>
            اعادة ضبط
          </Button>
        </div>

        <div className={styles.resetBtnBox}>
          <IconButton
            fontSize="small"
            onClick={onExportClick}
          >
            <DownloadIcon />
          </IconButton>{" "}
          <IconButton
            fontSize="small"
            variant="contained"
            onClick={navigate.bind(this, "/orders/add")}
          >
            <AddIcon />
          </IconButton>{" "}
        </div>
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          ...defaultColDef,
          headerClass: styles.gridHeader,
        }}
        enableRtl
        domLayout="normal"
        enableCellTextSelection
        rowHeight={"35rem"}
        headerHeight={"35rem"}
        modules={[CsvExportModule]}
        onGridReady={onGridReady}
        onCellValueChanged={onCellValueChange}
        quickFilterText={enableQuickFilter ? quickFilterText : ""}
      />
    </div>
  );
}

export default OrdersGrid;
