import React from "react";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import EditableAmountCell from "./EditableAmountCell";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
beforeEach(() => { container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container); });
afterEach(() => { act(() => root.unmount()); container.remove(); });

const render = (props) => act(() => {
  root.render(<EditableAmountCell value={100} display={<b>100 ج.م</b>} editable onCommit={() => {}} {...props} />);
});
const click = (el) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
const type = (input, value) => act(() => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
const key = (el, k) => act(() => { el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true })); });

describe("EditableAmountCell states", () => {
  it("read-only: no input on click, the reason is the tooltip", () => {
    render({ editable: false, disabledReason: "الدورة لم تنتهِ بعد" });
    expect(container.querySelector("[title='الدورة لم تنتهِ بعد']")).not.toBeNull();
    click(container.querySelector("b"));
    expect(container.querySelector("input")).toBeNull();
  });

  it("editable: click opens a number input pre-filled with the current value; Enter commits the new value", () => {
    const onCommit = jest.fn();
    render({ onCommit });
    click(container.querySelector("[role='button']"));
    const input = container.querySelector("input");
    expect(input.type).toBe("number");
    expect(input.value).toBe("100");
    type(input, "250");
    key(input, "Enter");
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(250);
    expect(container.querySelector("input")).toBeNull();
  });

  it("Escape cancels without saving", () => {
    const onCommit = jest.fn();
    render({ onCommit });
    click(container.querySelector("[role='button']"));
    const input = container.querySelector("input");
    type(input, "999");
    key(input, "Escape");
    expect(onCommit).not.toHaveBeenCalled();
    expect(container.querySelector("input")).toBeNull();
  });

  it("an empty box cancels (never saves 0); an explicit 0 is saved; the same value is not re-saved", () => {
    const onCommit = jest.fn();
    render({ onCommit });
    click(container.querySelector("[role='button']"));
    type(container.querySelector("input"), "");
    key(container.querySelector("input"), "Enter");
    expect(onCommit).not.toHaveBeenCalled();
    click(container.querySelector("[role='button']"));
    type(container.querySelector("input"), "0");
    key(container.querySelector("input"), "Enter");
    expect(onCommit).toHaveBeenCalledWith(0);
    onCommit.mockClear();
    click(container.querySelector("[role='button']"));
    key(container.querySelector("input"), "Enter");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("overridden: shows the marker with the original value in the tooltip and a working reset", () => {
    const onReset = jest.fn();
    render({ overridden: true, overriddenTitle: "معدّل يدوياً — الأصل 120 ج.م", onReset });
    expect(container.querySelector("[aria-label='قيمة معدّلة']").getAttribute("title")).toBe("معدّل يدوياً — الأصل 120 ج.م");
    click(container.querySelector("button[title='رجوع للحساب التلقائي']"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("busy: cannot start a second edit", () => {
    render({ busy: true });
    click(container.querySelector("[role='button']"));
    expect(container.querySelector("input")).toBeNull();
  });
});
