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
  interface Html2PdfChain {
    from(element: HTMLElement): { save(): Promise<void> };
  }
  function html2pdf(): { set(options: object): Html2PdfChain };
  export default html2pdf;
}
