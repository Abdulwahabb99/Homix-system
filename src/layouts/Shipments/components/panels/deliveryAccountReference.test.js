import {
  deliveryAccountReferenceHref,
  isDeliveryAccountAttachment,
} from "./deliveryAccountReference";

describe("delivery account references", () => {
  const originalApiUrl = process.env.REACT_APP_API_URL;

  beforeEach(() => {
    process.env.REACT_APP_API_URL = "https://api.example.com/";
  });

  afterAll(() => {
    process.env.REACT_APP_API_URL = originalApiUrl;
  });

  it("resolves uploaded paths against the API URL", () => {
    expect(deliveryAccountReferenceHref("uploads/delivery-reference/ref.jpg"))
      .toBe("https://api.example.com/uploads/delivery-reference/ref.jpg");
  });

  it("keeps absolute attachment URLs unchanged", () => {
    expect(deliveryAccountReferenceHref("https://files.example.com/ref.pdf"))
      .toBe("https://files.example.com/ref.pdf");
  });

  it("distinguishes attachments from legacy text references", () => {
    expect(isDeliveryAccountAttachment("/uploads/delivery-reference/ref.jpg")).toBe(true);
    expect(isDeliveryAccountAttachment("https://files.example.com/ref.pdf")).toBe(true);
    expect(isDeliveryAccountAttachment("manual reference 123")).toBe(false);
  });
});
