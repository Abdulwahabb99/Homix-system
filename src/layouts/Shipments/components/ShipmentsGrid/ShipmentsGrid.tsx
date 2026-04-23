/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import styles from "./ShipmentsGrid.module.css";
import { Button, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

export type ShipmentsGridProps = {
  columnDefs: any;
  rowData: any;
  defaultColDef: any;
  handleReset: () => void;
  handleSearchClick: () => void;
  onCellValueChanged?: (params: any) => void;
  gridHeight?: string | number;
};

function ShipmentsGrid({
  columnDefs,
  rowData,
  defaultColDef,
  handleReset,
  handleSearchClick,
  onCellValueChanged,
  gridHeight,
}: ShipmentsGridProps) {
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact | null>(null);
  const onExportClick = () => {
    const api = gridRef.current?.api;
    api?.exportDataAsCsv();
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
          <IconButton size="small" onClick={onExportClick}>
            <DownloadIcon />
          </IconButton>{" "}
          <IconButton size="small" onClick={navigate.bind(this, "/shipments/add")}>
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
        rowHeight={56}
        headerHeight={40}
        modules={[CsvExportModule]}
        onGridReady={onGridReady}
        onCellValueChanged={onCellValueChange}
        quickFilterText=""
      />
    </div>
  );
}

export default ShipmentsGrid;
