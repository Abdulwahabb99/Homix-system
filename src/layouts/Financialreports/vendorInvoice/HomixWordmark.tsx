/**
 * شعار «homix» النصّي كمسار SVG (مُتتبَّع من كشف التسوية المرجعي). مسار فقط بلا خطوط
 * فيُرسم صحيحاً داخل html2canvas. المقاس الافتراضي 141×31.9 كما في التصميم.
 */
import React from "react";

export const HOMIX_WORDMARK_PATH =
  "M0 0H58V127L129 78L262 173V319H204V201L129 148L58 203V319H0Z M317 78H553V319H317Z M375 139V259H493V139Z M607 319V165L725 79L815 143L909 79L1031 165V319H972V194L910 150L848 194V319H789V198L724 152L665 195V319Z M1085 78H1142V319H1085Z M1191 78H1260L1299 135L1343 78H1410L1332 200L1410 319H1343L1299 262L1257 319H1192L1266 201Z";

export const HOMIX_WORDMARK_VIEWBOX = { width: 1410, height: 319 } as const;

interface Props {
  width?: number;
  fill?: string;
  className?: string;
}

export default function HomixWordmark({ width = 141, fill = "#fff", className }: Props) {
  const height = (width * HOMIX_WORDMARK_VIEWBOX.height) / HOMIX_WORDMARK_VIEWBOX.width;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${HOMIX_WORDMARK_VIEWBOX.width} ${HOMIX_WORDMARK_VIEWBOX.height}`}
      width={width}
      height={height}
      aria-label="homix"
      role="img"
    >
      <path fill={fill} fillRule="evenodd" d={HOMIX_WORDMARK_PATH} />
    </svg>
  );
}
