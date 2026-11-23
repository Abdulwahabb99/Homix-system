import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import OrderInvoiceDocument from "./OrderInvoiceDocument";
import {
  INVOICE_NOTES_MAX_LENGTH,
  getInvoiceNotes,
  isInvoiceNotesDirty,
  normalizeInvoiceNotesDraft,
} from "./invoiceNotes";

jest.mock("../../../assets/images/homix.png", () => "homix.png");

const render = (orderDetails) =>
  renderToStaticMarkup(
    React.createElement(
      Provider,
      { store: configureStore({ reducer: { auth: () => ({ user: { userType: "1" } }) } }) },
      React.createElement(OrderInvoiceDocument, { orderDetails })
    )
  );

const baseOrder = { name: "#1001", orderLines: [], customer: { name: "علي" } };

describe("invoice notes helpers", () => {
  it("reads only a non-blank string", () => {
    expect(getInvoiceNotes({ invoiceNotes: "  تسليم الظهر  " })).toBe("تسليم الظهر");
    expect(getInvoiceNotes({ invoiceNotes: "   " })).toBe("");
    expect(getInvoiceNotes({ invoiceNotes: null })).toBe("");
    expect(getInvoiceNotes({})).toBe("");
    expect(getInvoiceNotes(null)).toBe("");
  });

  it("caps the draft at the backend limit and ignores whitespace-only edits", () => {
    expect(normalizeInvoiceNotesDraft(` ${"x".repeat(INVOICE_NOTES_MAX_LENGTH + 50)} `)).toHaveLength(INVOICE_NOTES_MAX_LENGTH);
    expect(isInvoiceNotesDirty("  a ", "a")).toBe(false);
    expect(isInvoiceNotesDirty("b", "a")).toBe(true);
    expect(isInvoiceNotesDirty("", "a")).toBe(true);
  });
});

describe("invoice document notes block", () => {
  it("prints the notes block with the text when the order has a draft note", () => {
    const html = render({ ...baseOrder, invoiceNotes: "التسليم بعد الظهر\nاتصل قبل الوصول" });
    expect(html).toContain("ملاحظات");
    expect(html).toContain("التسليم بعد الظهر");
    expect(html).toContain("اتصل قبل الوصول");
  });

  it.each([undefined, null, "", "   "])("omits the block when notes are %p", (invoiceNotes) => {
    const html = render({ ...baseOrder, invoiceNotes });
    expect(html).not.toContain("data-testid=\"invoice-notes\"");
  });
});
