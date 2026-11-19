/**
 * رسم ختم «معتمد» على سياق canvas (دالة نقية بلا React). يُرسم على canvas لا SVG لأن
 * html2canvas يحوّل SVG إلى صورة والصورة لا ترى خطوط الصفحة (Cairo) فيسقط النص العربي.
 * كل الأبعاد بوحدات CSS px، وحجم الرسم الفعلي يتحكّم به `scale` عبر setTransform.
 */
import { HOMIX_WORDMARK_PATH, HOMIX_WORDMARK_VIEWBOX } from "./HomixWordmark";

export const STAMP_COLOR = "#476E9E";
/** مقاس الـ canvas بوحدات CSS (أكبر من الختم 153 حتى لا يُقص بعد الدوران). */
export const STAMP_CANVAS_SIZE = 170;
export const STAMP_ROTATION_DEG = -8;

const RING_OUTER = { r: 74.75, w: 3 };
const RING_THIN = { r: 68.5, w: 1 };
const RING_INNER = { r: 49.75, w: 1 };
const ARC_BASELINE_R = 60.5;
const ARC_PITCH_DEG = 7.1;
const ARC_START_DEG = 270;
const ARC_FONT = "700 9px Cairo, 'Noto Sans Arabic', sans-serif";

/** مقاطع النص القوسي: بداية كل مقطع بخانات (الخانة = 7.1°) من نقطة البداية. */
export const STAMP_ARC_SEGMENTS: ReadonlyArray<{ text: string; slot: number }> = [
  { text: "HOMIX MARKETPLACE", slot: 0 },
  { text: "★", slot: 18 },
  { text: "HOMIX-EG.COM", slot: 20 },
  { text: "★", slot: 33 },
  { text: "EGYPT", slot: 35 },
  { text: "★", slot: 40.3 },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

function drawRing(ctx: CanvasRenderingContext2D, ring: { r: number; w: number }) {
  ctx.beginPath();
  ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
  ctx.lineWidth = ring.w;
  ctx.stroke();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outer: number) {
  const inner = outer * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawArcText(ctx: CanvasRenderingContext2D) {
  ctx.font = ARC_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  STAMP_ARC_SEGMENTS.forEach(({ text, slot }) => {
    Array.from(text).forEach((ch, i) => {
      const angle = ARC_START_DEG + (slot + i) * ARC_PITCH_DEG + ARC_PITCH_DEG / 2;
      ctx.save();
      ctx.rotate(toRad(angle));
      if (ch === "★") {
        drawStar(ctx, 0, -(ARC_BASELINE_R + 3.25), 4.6);
      } else if (ch !== " ") {
        ctx.fillText(ch, 0, -ARC_BASELINE_R);
      }
      ctx.restore();
    });
  });
}

function drawWordmark(ctx: CanvasRenderingContext2D, centerY: number, width: number) {
  if (typeof Path2D === "undefined") return;
  const k = width / HOMIX_WORDMARK_VIEWBOX.width;
  ctx.save();
  ctx.translate(-width / 2, centerY - (HOMIX_WORDMARK_VIEWBOX.height * k) / 2);
  ctx.scale(k, k);
  ctx.fill(new Path2D(HOMIX_WORDMARK_PATH), "evenodd");
  ctx.restore();
}

/** يرسم الختم كاملاً على canvas بحجم `STAMP_CANVAS_SIZE` CSS px بدقّة `scale`. */
export function drawStamp(canvas: HTMLCanvasElement, date: string, label: string, scale = 3): void {
  const size = STAMP_CANVAS_SIZE;
  canvas.width = Math.round(size * scale);
  canvas.height = Math.round(size * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.translate(size / 2, size / 2);
  ctx.rotate(toRad(STAMP_ROTATION_DEG));
  ctx.strokeStyle = STAMP_COLOR;
  ctx.fillStyle = STAMP_COLOR;

  drawRing(ctx, RING_OUTER);
  drawRing(ctx, RING_THIN);
  drawRing(ctx, RING_INNER);
  drawArcText(ctx);
  drawWordmark(ctx, -15, 66);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.direction = "rtl";
  ctx.font = "800 20px Cairo, 'Noto Sans Arabic', sans-serif";
  ctx.fillText(label, 0, 7.5);
  ctx.direction = "ltr";
  ctx.font = "400 10.5px Cairo, 'Noto Sans Arabic', sans-serif";
  ctx.fillText(date, 0, 22);
}
