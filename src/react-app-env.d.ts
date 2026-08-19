/// <reference types="react-scripts" />

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "html2pdf.js" {
  /** يعكس واجهة html2pdf.js الفعلية القابلة للتسلسل — سلسلة worker واحدة تُعاد من كل خطوة. */
  interface Html2PdfWorker {
    set(options: object): Html2PdfWorker;
    from(element: HTMLElement, type?: string): Html2PdfWorker;
    to(type: string): Html2PdfWorker;
    toContainer(): Html2PdfWorker;
    toCanvas(): Html2PdfWorker;
    toImg(): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    output(type?: string, options?: object): Promise<unknown>;
    outputPdf(type?: string, options?: object): Promise<unknown>;
    save(filename?: string): Promise<void>;
    /** يُعيد worker قابلاً للتسلسل (لا Promise) — مطابق لتوقيع worker.js الفعلي. */
    get(key: string, cbk?: (value: any) => any): Html2PdfWorker;
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any): Html2PdfWorker;
    catch(onRejected?: (reason: any) => any): Html2PdfWorker;
  }
  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}
