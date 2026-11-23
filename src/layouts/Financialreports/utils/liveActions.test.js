import { liveActionsAvailability, liveActionsFor, liveActionToast } from "./liveActions";

const ctx = { canSettle: true, isVendor: false, cycleState: "billing", invoicesState: "ready" };
const draft = { invoice: { id: 1, status: "draft", statusLabel: "معلّقة" } };

describe("liveActionsFor", () => {
  const names = (state) => liveActionsFor(state).map((item) => item.action);
  it("a live row with no invoice yet (or not on it) offers defer / freeze / delete", () => {
    expect(names(undefined)).toEqual(["defer", "freeze", "delete"]);
    expect(names("included")).toEqual(["defer", "freeze", "delete"]);
    expect(names("missing")).toEqual(["defer", "freeze", "delete"]);
  });
  it("follows the dialog rules for the other line states", () => {
    expect(names("frozen")).toEqual(["unfreeze", "defer", "delete"]);
    expect(names("deferred")).toEqual(["restore", "delete"]);
    expect(names("removed")).toEqual([]);
  });
  it("labels defer as moving to another cycle and confirms the destructive delete", () => {
    const items = liveActionsFor("included");
    expect(items.find((item) => item.action === "defer").label).toBe("تحويل لدورة أخرى");
    expect(items.find((item) => item.action === "delete")).toMatchObject({ confirm: true, danger: true });
    expect(liveActionToast("freeze")).toBeTruthy();
  });
});

describe("liveActionsAvailability", () => {
  it("is enabled with no invoice (the server creates the draft) and on a draft", () => {
    expect(liveActionsAvailability({ invoice: null }, ctx)).toEqual({ visible: true, enabled: true });
    expect(liveActionsAvailability(draft, ctx)).toEqual({ visible: true, enabled: true });
  });
  it("is hidden for vendors, users without finance_settle and custom periods", () => {
    expect(liveActionsAvailability(draft, { ...ctx, isVendor: true }).visible).toBe(false);
    expect(liveActionsAvailability(draft, { ...ctx, canSettle: false }).visible).toBe(false);
    expect(liveActionsAvailability(draft, { ...ctx, cycleState: "custom" }).visible).toBe(false);
  });
  it("is disabled with a reason on reviewed / frozen / transferred invoices", () => {
    for (const status of ["reviewed", "frozen", "transferred"]) {
      const result = liveActionsAvailability({ invoice: { id: 1, status, statusLabel: "x" } }, ctx);
      expect(result).toMatchObject({ visible: true, enabled: false });
      expect(result.reason).toBeTruthy();
    }
  });
  it("waits for the invoice states to load", () => {
    expect(liveActionsAvailability({ invoice: null }, { ...ctx, invoicesState: "loading" })).toMatchObject({ enabled: false });
    expect(liveActionsAvailability({ invoice: null }, { ...ctx, invoicesState: "error" })).toMatchObject({ enabled: false });
  });
});
