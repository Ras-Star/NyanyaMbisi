import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "../shared/phone";

describe("normalizePhoneNumber", () => {
  it("normalizes Uganda local mobile numbers to +256", () => {
    expect(normalizePhoneNumber("0700123456")).toBe("+256700123456");
    expect(normalizePhoneNumber("0750 123 456")).toBe("+256750123456");
  });

  it("keeps valid international numbers in E.164 format", () => {
    expect(normalizePhoneNumber("+256700123456")).toBe("+256700123456");
    expect(normalizePhoneNumber("256700123456")).toBe("+256700123456");
    expect(normalizePhoneNumber("+1 (415) 555-2671")).toBe("+14155552671");
  });

  it("rejects blank or malformed values", () => {
    expect(normalizePhoneNumber("")).toBe("");
    expect(normalizePhoneNumber("hello")).toBe("");
    expect(normalizePhoneNumber("+12")).toBe("");
  });
});
