import { resolveFileUrl } from "./resolveFileUrl";

describe("resolveFileUrl", () => {
  const base = "https://homix-gr70.onrender.com";

  it("points a relative upload path at the API host", () => {
    expect(resolveFileUrl("uploads/factory/a.jpeg", base)).toBe(`${base}/uploads/factory/a.jpeg`);
    expect(resolveFileUrl("/uploads/factory/a.jpeg", `${base}/`)).toBe(`${base}/uploads/factory/a.jpeg`);
  });

  it("keeps absolute, blob and data URLs", () => {
    expect(resolveFileUrl("https://cdn.example.com/a.pdf", base)).toBe("https://cdn.example.com/a.pdf");
    expect(resolveFileUrl("blob:http://localhost/1", base)).toBe("blob:http://localhost/1");
    expect(resolveFileUrl("data:image/png;base64,AA", base)).toBe("data:image/png;base64,AA");
  });

  it("returns an empty string when there is no url", () => {
    expect(resolveFileUrl(null, base)).toBe("");
    expect(resolveFileUrl(undefined, base)).toBe("");
    expect(resolveFileUrl("", base)).toBe("");
  });
});
