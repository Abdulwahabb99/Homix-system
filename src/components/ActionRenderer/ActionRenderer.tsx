/* eslint-disable react/prop-types */
import React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const ActionRenderer = ({ data, onClick }) => {
  const handleEdit = () => {};

  const handleClick = () => {
    onClick(data);
  };

  return (
    <div>
      <IconButton onClick={handleEdit} sx={{ fontSize: "1.2rem" }}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={handleClick} sx={{ color: "#d32f2f", fontSize: "1.3rem" }}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default ActionRenderer;
