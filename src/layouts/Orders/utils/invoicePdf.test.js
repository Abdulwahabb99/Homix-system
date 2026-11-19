jest.mock("html2pdf.js", () => jest.fn());

import { buildNativePrintCss, printElementNatively } from "./invoicePdf";
import { applyPrintLayout } from "./nativePrint";

const SHELL =
  '<div id="root"><aside id="side"></aside><main id="main"></main></div>' +
  '<div id="portal"><div id="backdrop"></div><div id="paper"><h2 id="title"></h2>' +
  '<div id="a" style="position:fixed;left:-10000px"><div id="b"><div id="t"><p id="child"></p></div></div></div>' +
  '<button id="btn"></button></div></div>';

describe("native invoice print", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.head.querySelectorAll("#invoice-native-print-style").forEach((n) => n.remove());
  });

  it("builds print-only CSS: A4 page with zero margin, hidden siblings removed from layout, ancestors reset", () => {
    const css = buildNativePrintCss();
    expect(css).toMatch(/@page\s*{\s*size: A4;\s*margin: 0;\s*}/);
    expect(css).toMatch(/\.invoice-native-print-hidden\s*{\s*display: none !important/);
    expect(css).not.toMatch(/visibility:\s*hidden/);
    for (const rule of [
      "display: block !important",
      "position: static !important",
      "left: auto !important",
      "overflow: visible !important",
      "height: auto !important",
      "min-height: 0 !important",
      "margin: 0 !important",
      "padding: 0 !important",
      "transform: none !important",
      "background: #fff !important",
    ]) {
      expect(css).toMatch(new RegExp(`\\.invoice-native-print-ancestor\\s*{[^}]*${rule.replace(/[.]/g, "\\.")}`));
    }
    expect(css).toMatch(/\.invoice-native-print-target\s*{[^}]*width: 100% !important/);
    expect(css).toMatch(/html, body\s*{[^}]*height: auto !important[^}]*overflow: visible !important/);
    expect(css).toMatch(/padding: 10mm !important/);
  });

  it("hides every sibling of the ancestor chain and target, keeps the chain and target visible", () => {
    document.body.innerHTML = SHELL;
    const t = document.getElementById("t");
    applyPrintLayout(t);
    const hidden = (id) => document.getElementById(id).classList.contains("invoice-native-print-hidden");
    expect(hidden("root")).toBe(true);
    expect(hidden("backdrop")).toBe(true);
    expect(hidden("title")).toBe(true);
    expect(hidden("btn")).toBe(true);
    // السلسلة نفسها والهدف وأبناء الهدف لا تُخفى
    ["portal", "paper", "a", "b", "t", "child"].forEach((id) => expect(hidden(id)).toBe(false));
    ["a", "b", "paper", "portal"].forEach((id) =>
      expect(document.getElementById(id).classList.contains("invoice-native-print-ancestor")).toBe(true)
    );
    expect(t.classList.contains("invoice-native-print-target")).toBe(true);
  });

  it("printElementNatively marks the layout, prints, and removes every class after afterprint", () => {
    window.print = jest.fn();
    document.body.innerHTML = SHELL;
    const t = document.getElementById("t");
    printElementNatively(t);
    expect(window.print).toHaveBeenCalled();
    expect(document.getElementById("invoice-native-print-style").textContent).toContain("@page");
    expect(document.querySelector(".invoice-native-print-hidden")).not.toBeNull();
    window.dispatchEvent(new Event("afterprint"));
    expect(document.querySelector(".invoice-native-print-ancestor")).toBeNull();
    expect(document.querySelector(".invoice-native-print-hidden")).toBeNull();
    expect(document.querySelector(".invoice-native-print-target")).toBeNull();
  });

  it("restore() undoes the marking and clears stale marks from an earlier print", () => {
    document.body.innerHTML = SHELL;
    document.getElementById("main").classList.add("invoice-native-print-hidden");
    const restore = applyPrintLayout(document.getElementById("t"));
    restore();
    expect(document.querySelector("[class*='invoice-native-print']")).toBeNull();
  });

  it("fitToOnePage zooms an invoice that is slightly taller than a page and restores it", () => {
    document.body.innerHTML = SHELL;
    const t = document.getElementById("t");
    t.getBoundingClientRect = () => ({ height: 1100, width: 700 });
    const restore = applyPrintLayout(t, { fitToOnePage: true });
    const zoom = parseFloat(t.style.zoom);
    expect(zoom).toBeGreaterThan(0.72);
    expect(zoom).toBeLessThan(1);
    restore();
    expect(t.style.zoom).toBeFalsy();
  });

  it("fitToOnePage leaves short invoices alone and does not shrink absurdly tall ones", () => {
    for (const h of [600, 3000]) {
      document.body.innerHTML = SHELL;
      const t = document.getElementById("t");
      t.getBoundingClientRect = () => ({ height: h, width: 700 });
      applyPrintLayout(t, { fitToOnePage: true });
      expect(t.style.zoom).toBeFalsy();
    }
  });

  it("fullBleed CSS drops the page padding and forces colour printing", () => {
    const css = buildNativePrintCss(undefined, undefined, undefined, true);
    expect(css).toMatch(/padding: 0mm !important/);
    expect(css).toMatch(/print-color-adjust: exact/);
    expect(buildNativePrintCss()).not.toMatch(/print-color-adjust/);
  });
});
