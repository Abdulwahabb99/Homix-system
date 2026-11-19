import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { isRegressionCancelled } from "./regressionConfirm";
import { useRegressionConfirm } from "./useRegressionConfirm";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const conflictErr = {
  response: {
    status: 409,
    data: { code: "REGRESSION_NEEDS_CONFIRMATION", message: "m", details: { regressions: [] } },
  },
};

let root;
let api;

beforeEach(() => {
  api = { current: undefined };
  function Harness() {
    api.current = useRegressionConfirm();
    return null;
  }
  root = createRoot(document.createElement("div"));
  act(() => root.render(<Harness />));
});
afterEach(() => act(() => root.unmount()));

describe("useRegressionConfirm", () => {
  it("opens on 409, resends with confirm=true on confirm and resolves", async () => {
    const send = jest.fn().mockRejectedValueOnce(conflictErr).mockResolvedValueOnce("ok");
    let p;
    await act(async () => {
      p = api.current.confirmable(send);
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith(false);
    expect(api.current.dialogProps.conflict).not.toBeNull();
    await act(async () => {
      api.current.dialogProps.onConfirm();
    });
    await expect(p).resolves.toBe("ok");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenLastCalledWith(true);
    expect(api.current.dialogProps.conflict).toBeNull();
  });

  it("rejects with a cancel error and does not resend on cancel", async () => {
    const send = jest.fn().mockRejectedValue(conflictErr);
    let p;
    await act(async () => {
      p = api.current.confirmable(send);
    });
    let caught;
    const settled = p.catch((e) => {
      caught = e;
    });
    await act(async () => {
      api.current.dialogProps.onCancel();
    });
    await settled;
    expect(isRegressionCancelled(caught)).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    expect(api.current.dialogProps.conflict).toBeNull();
  });

  it("passes non-409 errors through without opening the dialog", async () => {
    const forbidden = { response: { status: 403, data: { code: "REGRESSION_FORBIDDEN" } } };
    const send = jest.fn().mockRejectedValue(forbidden);
    await act(async () => {
      await expect(api.current.confirmable(send)).rejects.toBe(forbidden);
    });
    expect(api.current.dialogProps.conflict).toBeNull();
  });
});
