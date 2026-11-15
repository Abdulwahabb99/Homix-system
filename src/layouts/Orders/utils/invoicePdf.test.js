jest.mock("html2pdf.js", () => jest.fn());

import { buildNativePrintCss, printElementNatively } from "./invoicePdf";

describe("native invoice print", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.head.querySelectorAll("#invoice-native-print-style").forEach((n) => n.remove());
  });

  it("neutralizes the off-screen wrapper (ancestors) so the page is not blank", () => {
    const css = buildNativePrintCss();
    expect(css).toMatch(/\.invoice-native-print-ancestor\s*{[^}]*position: static !important/);
    expect(css).toMatch(/\.invoice-native-print-ancestor\s*{[^}]*left: auto !important/);
    expect(css).toMatch(/\.invoice-native-print-ancestor\s*{[^}]*overflow: visible !important/);
    expect(css).toContain(".invoice-native-print-target *");
  });

  it("marks target and all ancestors, then restores them after print", () => {
    window.print = jest.fn();
    document.body.innerHTML =
      '<div id="a" style="position:fixed;left:-10000px"><div id="b"><div id="t"></div></div></div>';
    const t = document.getElementById("t");
    printElementNatively(t);
    expect(window.print).toHaveBeenCalled();
    expect(t.classList.contains("invoice-native-print-target")).toBe(true);
    expect(document.getElementById("a").classList.contains("invoice-native-print-ancestor")).toBe(true);
    expect(document.getElementById("b").classList.contains("invoice-native-print-ancestor")).toBe(true);
    window.dispatchEvent(new Event("afterprint"));
    expect(document.querySelector(".invoice-native-print-ancestor")).toBeNull();
    expect(t.classList.contains("invoice-native-print-target")).toBe(false);
  });
});
