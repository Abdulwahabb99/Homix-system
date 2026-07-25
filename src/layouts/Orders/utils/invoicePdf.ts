import html2pdf from "html2pdf.js";

function sanitizeFileBaseName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/** انتظار خط عربي قبل الرسم داخل الـ canvas حتى لا تسقط على خط بدون أشكال */
async function waitForInvoiceFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const families = ["Cairo", "Noto Sans Arabic"];
  const weights = ["400", "600", "700", "800"] as const;
  try {
    await Promise.all(
      families.flatMap((f) => weights.map((w) => document.fonts.load(`${w} 16px ${f}`)))
    );
  } catch {
    // continue — سيُستخدم الاحتياطي
  }
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

export async function downloadOrderInvoicePdf(
  element: HTMLElement,
  fileBaseName: string
): Promise<void> {
  await waitForInvoiceFonts();

  const safe = sanitizeFileBaseName(fileBaseName) || "invoice";
  const filename = `${safe}.pdf`;

  const opt = {
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename,
    image: { type: "jpeg", quality: 0.92 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      /* مهم: scale في onclone يفسد أشكال الحروف على canvas */
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };

  await html2pdf().set(opt).from(element).save();
}
