/* eslint-disable react/prop-types */
// src/components/Pagination.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const Pagination = ({ page, totalPages }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNext = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      navigate(`/?page=${nextPage}`);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      const prevPage = page - 1;
      navigate(`/?page=${prevPage}`);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <IconButton onClick={handlePrev} disabled={page <= 1}>
        <ArrowBack />
      </IconButton>
      <IconButton onClick={handleNext} disabled={page >= totalPages}>
        <ArrowForward />
      </IconButton>
    </div>
  );
};

export default Pagination;
