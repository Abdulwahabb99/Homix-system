import { ARCHIVE_STATUSES } from "./InvoicesArchive";

it("the archive never offers or requests drafts", () => {
  expect(ARCHIVE_STATUSES).toEqual(["reviewed", "frozen", "transferred"]);
  expect(ARCHIVE_STATUSES).not.toContain("draft");
});
