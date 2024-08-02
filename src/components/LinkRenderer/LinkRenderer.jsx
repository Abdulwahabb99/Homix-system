/* eslint-disable react/prop-types */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LinkRenderer.module.css";

export const LinkRenderer = ({ url, value, formatter, data, openInNewTab = true }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(url);
  };
  const formattedValue = formatter?.(value) ?? value;
  if (!url) {
    return formattedValue ?? null;
  }

  return (
    <div target={openInNewTab ? "_blank" : ""}>
      <span className={styles.linkRenderer} onClick={handleClick}>
        {formattedValue}
      </span>
    </div>
  );
};
