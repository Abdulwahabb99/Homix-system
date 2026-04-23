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
import AddIcon from "@mui/icons-material/Add";
import "./AgGrid.css";

export type AgGridProps = {
  columnDefs: any;
  rowData: any;
  defaultColDef: any;
  handleReset?: () => void;
  handleSearchClick?: () => void;
  onCellValueChanged?: (params: any) => void;
  enableQuickFilter?: boolean;
  gridHeight?: string | number;
  enableExcel?: boolean;
  handleAdd?: () => void;
  showExelIcon?: boolean;
};

function AgGrid({
  columnDefs,
  rowData,
  defaultColDef,
  handleReset,
  handleSearchClick,
  onCellValueChanged,
  enableQuickFilter,
  gridHeight,
  enableExcel,
  handleAdd,
  showExelIcon,
}: AgGridProps) {
  const [quickFilterText, setQuickFilterText] = useState("");
  const gridRef = useRef<import("ag-grid-react").AgGridReact | null>(null);
  const onExportClick = () => {
    gridRef.current?.api?.exportDataAsCsv();
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  const onCellValueChange = (params) => {
    if (onCellValueChanged) onCellValueChanged(params);
  };

  const onQuickFilterChange = (event) => {
    setQuickFilterText(event.target.value);
  };

  useEffect(() => {
    if (enableQuickFilter && gridRef.current && gridRef.current.api) {
      gridRef.current.api.setQuickFilter(quickFilterText);
    }
  }, [quickFilterText]);

  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: gridHeight ? gridHeight : "495px", marginTop: "10px" }}
    >
      <div className={styles.upperGridBtn}>
        <div className={styles.resetBtnBox}>
          {enableExcel ? (
            <IconButton
              size="small"
              style={{ marginLeft: "20px" }}
              className={styles.downloadBtn}
              onClick={onExportClick}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          ) : (
            handleAdd && (
              <div>
                <Button
                  variant="contained"
                  size="large"
                  style={{ margin: "0 0 10px 20px", color: "#fff" }}
                  className={styles.downloadBtn}
                  onClick={handleAdd}
                >
                  <AddIcon />
                </Button>
                {showExelIcon && (
                  <IconButton
                    size="small"
                    style={{ marginLeft: "20px" }}
                    className={styles.downloadBtn}
                    onClick={onExportClick}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                )}
              </div>
            )
          )}{" "}
        </div>
        {enableQuickFilter ? (
          <div>
            <TextField
              label="البحث"
              variant="standard"
              value={quickFilterText}
              onChange={onQuickFilterChange}
              fullWidth
              style={{ marginBottom: "10px" }}
              type="text"
              autoComplete="off"
              name="search-field"
            />
          </div>
        ) : (
          <div>
            <Button sx={{ padding: "0" }} onClick={() => handleReset?.()}>
              اعادة ضبط
            </Button>
            <Button sx={{ padding: "0" }} onClick={() => handleSearchClick?.()}>
              البحث
            </Button>
          </div>
        )}
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
        quickFilterText={enableQuickFilter ? quickFilterText : ""}
      />
    </div>
  );
}

export default AgGrid;
