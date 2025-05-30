import React from "react";
import PropTypes from "prop-types";

const MoneyRotateIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 25 24" fill="none">
    <path
      d="M10 13.75C10 14.72 10.75 15.5 11.67 15.5H13.55C14.35 15.5 15 14.82 15 13.97C15 13.06 14.6 12.73 14.01 12.52L11 11.47C10.41 11.26 10.01 10.94 10.01 10.02C10.01 9.18 10.66 8.49001 11.46 8.49001H13.34C14.26 8.49001 15.01 9.27001 15.01 10.24"
      stroke={color || "#00314C"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 7.5V16.5"
      stroke={color || "#00314C"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5 12C22.5 17.52 18.02 22 12.5 22C6.98 22 2.5 17.52 2.5 12C2.5 6.48 6.98 2 12.5 2"
      stroke={color || "#00314C"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.5 6V2H18.5"
      stroke={color || "#00314C"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 7L22.5 2"
      stroke={color || "#00314C"}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

MoneyRotateIcon.propTypes = {
  color: PropTypes.string,
};

export default MoneyRotateIcon;
