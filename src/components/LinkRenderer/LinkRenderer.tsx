/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LinkRenderer.module.css";

export function LinkRenderer({
  url,
  value,
  formatter,
  data,
}: {
  url?: string;
  value?: unknown;
  formatter?: (v: unknown) => React.ReactNode;
  data?: unknown;
  openInNewTab?: boolean;
}): React.ReactElement | null {
  const navigate = useNavigate();
  const handleClick = () => {
    if (url) navigate(url);
  };
  const formattedValue = (formatter?.(value) ?? value) as React.ReactNode;
  if (!url) {
    return <>{formattedValue}</>;
  }

  return (
    <div>
      <span className={styles.linkRenderer} onClick={handleClick}>
        {formattedValue}
      </span>
    </div>
  );
}
