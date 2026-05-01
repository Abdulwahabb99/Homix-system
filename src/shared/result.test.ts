import { AppError } from "./errors";
import { failure, success } from "./result";

describe("result helpers", () => {
  it("creates a success result", () => {
    expect(success({ id: 1 })).toEqual({
      data: { id: 1 },
      ok: true,
    });
  });

  it("creates a failure result", () => {
    const error = new AppError("boom", 500, "ERR");

    expect(failure(error)).toEqual({
      error,
      ok: false,
    });
  });
});
