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
  setRowData,
  setColDefs,
  handleSearchClick,
  onCellValueChanged,
}) {
  const gridRef = useRef();
  const [searchText, setSearchText] = useState("");

  const resetToDefaults = () => {
    gridRef.current.api.setQuickFilter("");
    gridRef.current.columnApi.applyColumnState({
      state: [],
      applyOrder: true,
    });
    gridRef.current.api.setQuickFilter("");
    setSearchText("");
    setRowData((old) => old);
    setColDefs((old) => old);
  };
  const onSearchChange = (event) => {
    setSearchText(event.target.value);
    gridRef.current.api.setQuickFilter(event.target.value);
  };
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
          <Button className={`${styles.resetBtn}`} onClick={resetToDefaults}>
            Reset to Defaults
          </Button>

          <IconButton
            fontSize="small"
            style={{ marginLeft: "20px" }}
            className={styles.downloadBtn}
            onClick={onExportClick}
          >
            <DownloadIcon />
          </IconButton>
        </div>
        {/* <TextField
          variant="standard"
          label="البحث"
          value={searchText}
          onChange={onSearchChange}
          style={{ marginBottom: "10px" }}
        /> */}
        <Button sx={{}} onClick={handleSearchClick}>
          البحث
        </Button>
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
        // pagination
        // paginationPageSize={20}
        enableCellTextSelection
        rowHeight={"35rem"}
        headerHeight={"35rem"}
        modules={[CsvExportModule]}
        onGridReady={onGridReady}
        onCellValueChanged={onCellValueChange}
        // localeText={{
        //   // Custom localization text
        //   nextPage: "الصفحة التالية",
        //   previousPage: "الصفحة السابقة",
        //   first: "الأولى",
        //   last: "الأخيرة",
        //   of: "من",
        //   page: "صفحة",
        //   more: "المزيد",
        //   to: "إلى",
        // }}
      />
      {/* <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      <Button onClick={() => handlePageChange(page + 1)}>Next</Button> */}
    </div>
  );
}

export default AgGrid;
