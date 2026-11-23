/** Query-string update for a submitted products search (Enter / search button / clear). */
export const buildProductSearchUpdate = (draft: string): { searchQuery: string; page: string } => ({
  searchQuery: String(draft ?? "").trim(),
  page: "1",
});
