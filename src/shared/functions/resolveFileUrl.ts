/**
 * The API stores uploaded files as relative paths (`uploads/factory/x.jpg`) and serves them from the API host, not from the
 * host the frontend is served from — a relative href would hit the frontend and answer 404. Absolute, blob: and data: URLs
 * are kept as they are.
 */
export function resolveFileUrl(url: unknown, apiBase: string = process.env.REACT_APP_API_URL || ""): string {
  if (url === null || url === undefined || url === "") return "";
  const value = String(url);
  if (/^(https?:|blob:|data:)/i.test(value)) return value;
  return `${apiBase.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}
