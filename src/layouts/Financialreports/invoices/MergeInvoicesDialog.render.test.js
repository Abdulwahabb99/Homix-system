import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import MergeInvoicesDialog from "./MergeInvoicesDialog";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockMutate = jest.fn();
let mockItems = [];
jest.mock("query/financialInvoices", () => ({
  useVendorOptions: () => ({ data: [{ id: 5, name: "ركة" }] }),
  useInvoicesList: () => ({ data: { items: mockItems }, isLoading: false, isError: false }),
  useConsolidateInvoices: () => ({ mutate: (...args) => mockMutate(...args), isPending: false }),
}));

const item = (id, over = {}) => ({
  id, code: `INV-${id}`, vendorId: 5, vendorName: "ركة", billingDay: 13, periodEnd: `2026-10-${10 + id}T21:59:59.999Z`, status: "reviewed", statusLabel: "تمت المراجعة",
  netAmount: 0, kind: "standard", mergeable: true, hasReceipt: false, transferredAt: null, mergedIntoId: null, ...over,
});

let container;
let root;
beforeEach(() => { mockMutate.mockClear(); container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); document.body.innerHTML = ""; });

const show = () => act(() => { root.render(<MergeInvoicesDialog open onClose={() => {}} onOpenInvoice={jest.fn()} initialVendorId="5" />); });
const q = (selector) => document.body.querySelector(selector);
const qa = (selector) => [...document.body.querySelectorAll(selector)];
const tick = (box) => act(() => { box.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const latin = (text) => text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
const button = (text) => qa("button").find((b) => b.textContent.includes(text));

describe("MergeInvoicesDialog", () => {
  it("lists the vendor's invoices with cycle/net direction; ineligible ones are disabled with the reason", () => {
    mockItems = [item(1, { netAmount: 900 }), item(2, { netAmount: -300 }), item(3, { status: "frozen", statusLabel: "مجمدة" }), item(4, { status: "transferred", hasReceipt: true })];
    show();
    const rows = qa("[data-testid='merge-row']");
    expect(rows).toHaveLength(4);
    expect(rows[0].textContent).toContain("مستحق للصانع");
    expect(rows[1].textContent).toContain("مستحق لهوميكس");
    expect(rows[2].querySelector("input").disabled).toBe(true);
    expect(rows[2].textContent).toContain("لا يمكن دمجها");
    expect(rows[3].querySelector("input").disabled).toBe(true);
    expect(rows[0].querySelector("input").disabled).toBe(false);
  });

  it("needs two invoices; the preview shows the combined signed net and the bank direction; confirm sends the ids", () => {
    mockItems = [item(1, { netAmount: 900 }), item(2, { netAmount: -300 }), item(3, { netAmount: -1000 })];
    window.confirm = jest.fn(() => true);
    show();
    expect(button("تأكيد الدمج").disabled).toBe(true);
    const boxes = qa("[data-testid='merge-row'] input");
    tick(boxes[0]);
    expect(button("تأكيد الدمج").disabled).toBe(true);
    tick(boxes[1]);
    expect(latin(q("[data-testid='merge-preview-net']").textContent)).toContain("600");
    expect(q("[data-testid='merge-preview']").textContent).toContain("صافي المستحق للبائع");
    expect(q("[data-testid='merge-preview-bank']").textContent).toContain("حساب الصانع");
    tick(boxes[2]);
    expect(latin(q("[data-testid='merge-preview-net']").textContent)).toContain("400");
    expect(q("[data-testid='merge-preview']").textContent).toContain("صافي المستحق لهوميكس");
    expect(q("[data-testid='merge-preview-bank']").textContent).toContain("حساب هوميكس");
    tick(button("تأكيد الدمج"));
    expect(window.confirm).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({ invoiceIds: [1, 2, 3] }, expect.any(Object));
  });

  it("does nothing when the confirmation is declined", () => {
    mockItems = [item(1, { netAmount: 5 }), item(2, { netAmount: 5 })];
    window.confirm = jest.fn(() => false);
    show();
    qa("[data-testid='merge-row'] input").forEach(tick);
    tick(button("تأكيد الدمج"));
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
