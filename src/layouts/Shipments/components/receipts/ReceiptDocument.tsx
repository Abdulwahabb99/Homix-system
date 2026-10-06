import React, { useRef, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import moment from "moment-timezone";
import logo from "assets/images/homix.png";
import type { ReceiptDocument as DocumentData } from "query/shipmentReceipts";
import "./receipts.css";

const fmt = (date: string | null) => (date ? moment(date).tz("Africa/Cairo").locale("ar").format("D MMMM YYYY") : "—");

export function ReceiptPaper({ document }: { document: DocumentData }) {
  const items = document.items;
  const names = (field: "vendorName" | "receiverName" | "senderName") =>
    [...new Set(items.map((item) => item[field]).filter(Boolean))].join("، ") || "—";
  const measured = items.filter((item) => item.manufactureDays != null);
  const average = measured.length
    ? Math.round(measured.reduce((sum, item) => sum + item.manufactureDays, 0) / measured.length)
    : null;
  const notes = [...new Set(items.map((item) => item.notes).filter(Boolean))];
  return (
    <article className="receipt-paper" dir="rtl">
      <header className="receipt-banner">
        <div>
          <small>مستند مخزني</small>
          <h1>سند استلام بضاعة</h1>
        </div>
        <div className="receipt-brand">
          <div className="receipt-brand-name">
            <img src={logo} alt="هوميكس" />
            <strong>HOMIX</strong>
          </div>
          <small>Marketplace — homix-eg.com</small>
        </div>
      </header>
      <main className="receipt-body">
        <div className="receipt-meta">
          <div>
            <small>رقم السند</small>
            <strong dir="ltr">{document.number}</strong>
          </div>
          <div>
            <small>تاريخ إصدار السند</small>
            <strong>{fmt(document.issuedAt)}</strong>
          </div>
          <div>
            <small>مستلم من (المصنع)</small>
            <strong>{names("vendorName")}</strong>
          </div>
          <div>
            <small>استلم بواسطة</small>
            <strong>{names("receiverName")}</strong>
          </div>
        </div>
        <table className="receipt-lines">
          <thead>
            <tr>
              {[
                "م",
                "الصنف / كود المنتج",
                "المصنع",
                "رقم العملية",
                "رقم الطلب",
                "الكمية",
                "تاريخ التصنيع",
                "تاريخ الاستلام",
                "مدة التصنيع – الاستلام",
              ].map((text) => (
                <th key={text}>{text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.orderId}>
                <td>{index + 1}</td>
                <td>
                  <strong>{item.productName}</strong>
                  <small dir="ltr">{item.productSku || "—"}</small>
                </td>
                <td>{item.vendorName}</td>
                <td>{item.operationNumber}</td>
                <td>#{item.orderNumber}</td>
                <td>{item.quantity}</td>
                <td>{fmt(item.manufactureDate)}</td>
                <td>{fmt(item.receivedDate)}</td>
                <td>{item.manufactureDays == null ? "—" : `${item.manufactureDays} أيام`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="receipt-totals">
          <div>
            إجمالي الأصناف<strong>{items.length}</strong>
          </div>
          <div>
            إجمالي الكمية
            <strong>{items.reduce((sum, item) => sum + Number(item.quantity), 0)}</strong>
          </div>
          <div>
            متوسط مدة التصنيع<strong>{average == null ? "—" : `${average} أيام`}</strong>
          </div>
        </div>
        <section className="receipt-notes">
          <strong>ملاحظات الاستلام</strong>
          <p>{notes.length ? notes.join("\n") : "لا توجد ملاحظات مسجلة على الأصناف"}</p>
          <div className="receipt-writing-line" />
        </section>
        <p className="receipt-declaration">
          تم استلام الأصناف الموضحة أعلاه بمخزن هوميكس، وتُسجَّل أي ملاحظات على حالتها في خانة
          الملاحظات.
        </p>
        <footer className="receipt-signatures">
          <section>
            <strong>المسلِّم — مندوب المصنع</strong>
            <p>الاسم: {names("senderName")}</p>
            <p>التوقيع: ____________________</p>
          </section>
          <section>
            <strong>المستلم — أمين المخزن</strong>
            <p>الاسم: {names("receiverName")}</p>
            <p>التوقيع: ____________________</p>
            <small>ختم المخزن: ____________________</small>
          </section>
        </footer>
      </main>
    </article>
  );
}

export default function ReceiptDocumentDialog({
  document,
  onClose,
}: {
  document: DocumentData | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const print = async () => {
    if (!ref.current) return;
    setPrinting(true);
    setError("");
    const iframe = window.document.createElement("iframe");
    iframe.title = "طباعة سند الاستلام";
    iframe.style.cssText = "position:fixed;width:1px;height:1px;bottom:0;left:0;border:0;";
    window.document.body.appendChild(iframe);
    try {
      const target = iframe.contentDocument;
      if (!target || !iframe.contentWindow) throw new Error("Print unavailable");
      // Print a separate document: dialogs/RTL app styles cannot clip or duplicate pages.
      target.open();
      target.write(
        "<!doctype html><html lang='ar' dir='rtl'><head><meta charset='utf-8'></head><body></body></html>"
      );
      target.close();
      target.title = document.number;
      const base = target.createElement("base");
      base.href = window.document.baseURI;
      target.head.appendChild(base);
      window.document
        .querySelectorAll("style, link[rel='stylesheet']")
        .forEach((style) => target.head.appendChild(style.cloneNode(true)));
      target.body.appendChild(ref.current.firstElementChild.cloneNode(true));
      await Promise.all(
        Array.from(target.querySelectorAll("link[rel='stylesheet']")).map((link: HTMLLinkElement) =>
          link.sheet
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                link.onload = () => resolve();
                link.onerror = () => resolve();
                setTimeout(resolve, 3000);
              })
        )
      );
      await target.fonts.ready;
      await Promise.all(
        Array.from(target.images).map((img) => img.decode().catch(() => undefined))
      );
      iframe.contentWindow.addEventListener("afterprint", () => iframe.remove(), { once: true });
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 60000);
    } catch {
      iframe.remove();
      setError("تعذّرت الطباعة. أعد المحاولة.");
    } finally {
      setPrinting(false);
    }
  };
  return (
    <Dialog open={Boolean(document)} onClose={onClose} maxWidth="lg" fullWidth dir="rtl">
      <DialogTitle>سند الاستلام — {document?.number}</DialogTitle>
      <DialogActions>
        <Button
          variant="contained"
          startIcon={<PrintOutlinedIcon />}
          onClick={print}
          disabled={printing}
        >
          {printing ? "جارٍ تجهيز الطباعة…" : "طباعة السند"}
        </Button>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
      <DialogContent sx={{ bgcolor: "#e8edf1", p: { xs: 1, sm: 3 } }}>
        {error && <Alert severity="error">{error}</Alert>}
        <div ref={ref}>{document && <ReceiptPaper document={document} />}</div>
      </DialogContent>
    </Dialog>
  );
}
