import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReceiptPaper } from "./ReceiptDocument";

const item = {
  orderId: 1,
  productName: "كرسي",
  productSku: "SKU-1",
  orderNumber: "1633",
  operationNumber: "34585",
  vendorName: "Royal Home",
  quantity: 2,
  manufactureDate: "2026-09-21",
  receivedDate: "2026-09-30",
  manufactureDays: 9,
  receiverName: "مسؤول المخزن",
  notes: "",
  senderName: "",
};
const paper = (items) =>
  renderToStaticMarkup(
    <ReceiptPaper
      document={{ id: 1, number: "RCV-2026-000001", issuedAt: "2026-09-30T12:00:00Z", items }}
    />
  );

test("one voucher includes every selected item, quantities, manufacturers and receipt dates", () => {
  const html = paper([
    item,
    { ...item, orderId: 2, productSku: "SKU-2", vendorName: "مصنع آخر", quantity: 3 },
  ]);
  const root = document.createElement("div");
  root.innerHTML = html;
  expect(root.querySelectorAll("tbody tr")).toHaveLength(2);
  expect(root.querySelector(".receipt-totals").textContent).toContain("إجمالي الكمية5");
  expect(html).toContain("SKU-1");
  expect(html).toContain("SKU-2");
  expect(html).toContain("مصنع آخر");
  expect(html).toContain("RCV-2026-000001");
});
test("missing manufacturing date has no invented duration and notes are escaped", () => {
  const html = paper([
    { ...item, manufactureDate: null, manufactureDays: null, notes: '<script>alert("x")</script>' },
  ]);
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain("متوسط مدة التصنيع<strong>—</strong>");
});


test("voucher issue dates follow Cairo's calendar at the UTC day boundary", () => {
  const html = renderToStaticMarkup(<ReceiptPaper document={{ id: 1, number: "RCV-1", issuedAt: "2026-09-30T22:30:00Z", items: [item] }} />);
  const root = document.createElement("div"); root.innerHTML = html;
  const date = root.querySelectorAll(".receipt-meta strong")[1].textContent;
  expect(date).toMatch(/[1١]/);
  expect(date).toContain("أكتوبر");
});
