import { describe, expect, it, jest } from "@jest/globals";
import { logger } from "..";

jest.spyOn(logger, "info");

describe("@repo/logger", () => {
  it("prints a message", () => {
    logger.info("hello");
    expect(logger.info).toHaveBeenCalledWith("hello");
  });
});
