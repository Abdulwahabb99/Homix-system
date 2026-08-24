/** Converts an uploaded reference path into a browser-safe absolute URL. */
export function deliveryAccountReferenceHref(value: string | undefined | null): string | undefined {
  if (!value?.trim()) return undefined;
  const reference = value.trim();
  if (/^https?:\/\//i.test(reference)) return reference;
  const base = String(process.env.REACT_APP_API_URL ?? "").replace(/\/+$/, "");
  return base ? `${base}/${reference.replace(/^\/+/, "")}` : reference;
}

/** Old references may be plain text; only uploaded paths and URLs are links. */
export function isDeliveryAccountAttachment(value: string | undefined | null): boolean {
  const reference = value?.trim() ?? "";
  return /^https?:\/\//i.test(reference) || /^\/?uploads\//i.test(reference);
}
