import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import ReceiptsPanel from "./ReceiptsPanel";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUpload = jest.fn();
const mockRemove = jest.fn();
let mockReceipts = [];
jest.mock("query/financialInvoices", () => ({
  useInvoiceReceipts: () => ({ data: mockReceipts, isLoading: false, isError: false }),
  useUploadReceipts: () => ({ mutate: (...a) => mockUpload(...a), isPending: false }),
  useRemoveReceipt: () => ({ mutate: (...a) => mockRemove(...a), isPending: false }),
  fetchReceiptBlob: jest.fn(async () => new Blob(["x"])),
  downloadReceipt: jest.fn(async () => undefined),
}));
jest.mock("components/NotificationMeassage/NotificationMeassage", () => ({ NotificationMeassage: jest.fn() }));

const invoice = { id: 7, status: "transferred" };
const rec = (id, name, mime, size = 100) => ({ id, name, mime, size, uploadedAt: "2026-11-02T10:00:00.000Z" });

let container;
let root;
beforeEach(() => {
  mockUpload.mockClear(); mockRemove.mockClear();
  global.URL.createObjectURL = jest.fn(() => "blob:thumb");
  global.URL.revokeObjectURL = jest.fn();
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

const show = async (props = {}) => { await act(async () => { root.render(<ReceiptsPanel invoice={invoice} staff mergeBusy={false} onMerge={jest.fn()} {...props} />); }); };
const items = () => [...container.querySelectorAll("[data-testid='receipt-item']")];

describe("ReceiptsPanel", () => {
  it("lists every receipt in order with a type icon (pdf), a thumbnail for small images and a download action", async () => {
    mockReceipts = [rec(1, "a.pdf", "application/pdf"), rec(2, "b.png", "image/png", 9 * 1024 * 1024), rec(3, "c.jpg", "image/jpeg", 1000)];
    await show();
    expect(items()).toHaveLength(3);
    expect(items()[2].querySelector("img")).not.toBeNull();
    expect(items()[1].querySelector("img")).toBeNull();
    expect(items()[0].textContent).toContain("1. a.pdf");
    expect(items()[0].querySelector("[aria-label='PDF']")).not.toBeNull();
    expect(items()[1].querySelector("[aria-label='صورة']")).not.toBeNull(); // large image: icon, no thumbnail download
    expect(container.textContent).toContain("إيصالات التحويل (3)");
    expect(container.textContent).toContain("تنزيل الفاتورة + الإيصالات (PDF واحد)");
  });

  it("staff can add several files at once (valid ones sent, invalid ones rejected) and remove one after confirming", async () => {
    mockReceipts = [rec(1, "a.pdf", "application/pdf")];
    window.confirm = jest.fn(() => true);
    await show();
    const input = container.querySelector("input[type='file']");
    expect(input.multiple).toBe(true);
    const good1 = new File(["a"], "x.pdf", { type: "application/pdf" });
    const good2 = new File(["b"], "y.png", { type: "image/png" });
    const bad = new File(["c"], "z.webp", { type: "image/webp" });
    Object.defineProperty(input, "files", { value: [good1, bad, good2], configurable: true });
    act(() => { input.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(mockUpload).toHaveBeenCalledWith({ id: 7, files: [good1, good2] });
    const removeButton = [...items()[0].querySelectorAll("button")].find((b) => b.textContent === "إزالة");
    act(() => { removeButton.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
    expect(mockRemove).toHaveBeenCalledWith({ id: 7, receiptId: 1 });
  });

  it("vendors only view/download: no upload and no remove", async () => {
    mockReceipts = [rec(1, "a.pdf", "application/pdf")];
    await show({ staff: false });
    expect(container.querySelector("input[type='file']")).toBeNull();
    expect([...container.querySelectorAll("button")].some((b) => b.textContent === "إزالة")).toBe(false);
    expect(container.textContent).toContain("عرض / تحميل");
  });

  it("empty: shows the missing-receipt hint and no merge button", async () => {
    mockReceipts = [];
    await show();
    expect(container.textContent).toContain("لسه مفيش إيصال مرفوع");
    expect(container.textContent).not.toContain("PDF واحد");
  });
});
