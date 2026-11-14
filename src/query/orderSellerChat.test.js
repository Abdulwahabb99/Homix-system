import { postSellerChatMessage, SellerChatUploadError } from "./orderSellerChat";

const file = { name: "a.png" };

describe("seller chat send", () => {
  it("retrying after a failed upload re-uploads only and does not post the text again", async () => {
    const pending = { current: null };
    const post = jest
      .fn()
      .mockResolvedValueOnce({ data: { data: { id: 11 } } }) // text posted
      .mockRejectedValueOnce(new Error("network")) // upload fails
      .mockResolvedValueOnce({ data: {} }); // retry upload ok
    const http = { post };

    await expect(postSellerChatMessage(http, 7, { text: "hi", files: [file] }, pending)).rejects.toBeInstanceOf(SellerChatUploadError);
    expect(pending.current).toEqual({ messageId: 11, text: "hi" });

    await expect(postSellerChatMessage(http, 7, { text: "hi", files: [file] }, pending)).resolves.toBe(11);

    const urls = post.mock.calls.map(([url]) => url);
    expect(urls).toEqual(["/orders/7/seller-chat", "/orders/7/seller-chat/11/upload", "/orders/7/seller-chat/11/upload"]);
    expect(pending.current).toBeNull();
  });

  it("a different text after a failed upload is a new message", async () => {
    const pending = { current: { messageId: 11, text: "old" } };
    const post = jest.fn().mockResolvedValue({ data: { data: { id: 12 } } });
    await postSellerChatMessage({ post }, 7, { text: "new", files: [] }, pending);
    expect(post.mock.calls[0][0]).toBe("/orders/7/seller-chat");
  });

  it("a failed text post rejects with the original error and leaves nothing pending", async () => {
    const pending = { current: null };
    const boom = new Error("500");
    await expect(postSellerChatMessage({ post: jest.fn().mockRejectedValue(boom) }, 7, { text: "x", files: [] }, pending)).rejects.toBe(boom);
    expect(pending.current).toBeNull();
  });
});
