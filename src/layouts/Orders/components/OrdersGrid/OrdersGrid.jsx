/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import styles from "./OrdersGrid.module.css";
import { Button, IconButton, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

function OrdersGrid({
  columnDefs,
  rowData,
  defaultColDef,
  handleReset,
  handleSearchClick,
  onCellValueChanged,
  enableQuickFilter,
  gridHeight,
  gridRef,
  onSelectionChanged,
  setIsBulkEditModalOpen,
  selectedRows,
  setIsBulkDeleteModalOpen,
  handleExport,
  isOrdersPage,
  isBulkEdited,
  enableBulkEdit,
}) {
  const searchParam = new URLSearchParams(window.location.search);
  const startDateParam = searchParam.get("startDate");
  const endDateParam = searchParam.get("endDate");

  const navigate = useNavigate();
  const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
  };
  const onCellValueChange = (params) => {
    if (onCellValueChanged) onCellValueChanged(params);
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.userType === "2";

  const updatedColumnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: "right",
    },
    ...columnDefs,
  ];

  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: gridHeight ? gridHeight : "495px", marginTop: "15px" }}
    >
      <div className={styles.upperGridBtn}>
        <div className={styles.resetBtnBox}>
          {!isVendor && (
            <Tooltip title="تعديل جماعي">
              <IconButton onClick={enableBulkEdit} sx={{ fontSize: "20px" }}>
                {!isBulkEdited ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Button sx={{ padding: "0" }} onClick={handleSearchClick}>
            البحث
          </Button>
          <Button sx={{ padding: "0" }} onClick={handleReset}>
            اعادة ضبط
          </Button>
          {selectedRows?.length > 1 && (
            <>
              <Button
                sx={{ padding: "0", margin: "0 5px" }}
                onClick={() => setIsBulkEditModalOpen(true)}
              >
                تعديل الطلبات المحددة
              </Button>
              <Button
                sx={{ padding: "0", color: "red", margin: "0 5px" }}
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                مسح الطلبات المحددة
              </Button>
            </>
          )}
        </div>
        {!isVendor && (
          <div className={styles.resetBtnBox}>
            <IconButton
              fontSize="small"
              onClick={() =>
                isOrdersPage ? handleExport(startDateParam, endDateParam) : onExportClick()
              }
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
        )}{" "}
      </div>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={isBulkEdited ? updatedColumnDefs : columnDefs}
        defaultColDef={{
          ...defaultColDef,
          headerClass: styles.gridHeader,
        }}
        rowSelection="multiple"
        // rowMultiSelectWithClick={true}
        onSelectionChanged={onSelectionChanged}
        enableRtl
        domLayout="normal"
        // enableCellTextSelection
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
