/**
 * ختم «معتمد» — canvas (لا SVG) كي تظهر الحروف العربية بخط Cairo داخل html2canvas.
 * يُرسم فوراً ثم يُعاد رسمه عند اكتمال تحميل الخط.
 */
import React, { useEffect, useRef } from "react";
import { STAMP_CANVAS_SIZE, drawStamp } from "./stampDraw";

const STAMP_LABEL = "معتمد";
const STAMP_FONTS = ["800 20px Cairo", "700 9px Cairo", "400 10.5px Cairo"];

interface Props {
  /** YYYY-MM-DD */
  date: string;
  className?: string;
}

export default function StatementStamp({ date, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    let alive = true;
    const paint = () => { if (alive && canvas) drawStamp(canvas, date, STAMP_LABEL); };
    paint();
    if (typeof document !== "undefined" && document.fonts) {
      Promise.all(STAMP_FONTS.map((font) => document.fonts.load(font, STAMP_LABEL))).then(paint).catch(() => undefined);
      document.fonts.addEventListener?.("loadingdone", paint);
    }
    return () => {
      alive = false;
      document.fonts?.removeEventListener?.("loadingdone", paint);
    };
  }, [date]);

  return <canvas ref={ref} className={className} style={{ width: STAMP_CANVAS_SIZE, height: STAMP_CANVAS_SIZE }} aria-label="ختم معتمد" />;
}
