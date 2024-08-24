/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CsvExportModule } from "@ag-grid-community/csv-export";

import styles from "./AgGrid.module.css";
import { Button, IconButton, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import "./AgGrid.css";
function AgGrid({
  columnDefs,
  rowData,
  defaultColDef,
  handleReset,
  handleSearchClick,
  onCellValueChanged,
}) {
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
      style={{ width: "100%", height: "495px", marginTop: "10px" }}
    >
      <div className={styles.upperGridBtn}>
        <div className={styles.resetBtnBox}>
          <IconButton
            fontSize="small"
            style={{ marginLeft: "20px" }}
            className={styles.downloadBtn}
            onClick={onExportClick}
          >
            <DownloadIcon />
          </IconButton>
        </div>
        <div>
          <Button sx={{ padding: "0" }} onClick={handleReset}>
            اعادة ضبط
          </Button>
          <Button sx={{ padding: "0" }} onClick={handleSearchClick}>
            البحث
          </Button>
        </div>
      </div>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          ...defaultColDef,
          headerClass: styles.gridHeader,
        }}
        ref={gridRef}
        enableRtl
        domLayout="normal"
        enableCellTextSelection
        rowHeight={"35rem"}
        headerHeight={"35rem"}
        modules={[CsvExportModule]}
        onGridReady={onGridReady}
        onCellValueChanged={onCellValueChange}
      />
    </div>
  );
}

export default AgGrid;
