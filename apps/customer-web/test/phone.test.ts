import { describe, expect, it } from "vitest";
import { getUgandanMobileProvider, normalizePhoneNumber } from "../shared/phone";

describe("normalizePhoneNumber", () => {
  it("normalizes Ugandan local numbers that start with 0", () => {
    expect(normalizePhoneNumber("0700123456")).toBe("+256700123456");
    expect(normalizePhoneNumber("0750 123 456")).toBe("+256750123456");
  });

  it("keeps Ugandan international numbers that start with +256", () => {
    expect(normalizePhoneNumber("+256700123456")).toBe("+256700123456");
    expect(normalizePhoneNumber("+256 750 123 456")).toBe("+256750123456");
  });

  it("identifies supported MTN Uganda and Airtel Uganda mobile ranges", () => {
    expect(getUgandanMobileProvider("0700123456")).toBe("airtel");
    expect(getUgandanMobileProvider("+256740123456")).toBe("airtel");
    expect(getUgandanMobileProvider("0770123456")).toBe("mtn");
    expect(getUgandanMobileProvider("+256790123456")).toBe("mtn");
  });

  it("rejects non-Ugandan or malformed values", () => {
    expect(normalizePhoneNumber("")).toBe("");
    expect(normalizePhoneNumber("hello")).toBe("");
    expect(normalizePhoneNumber("+12")).toBe("");
    expect(normalizePhoneNumber("256700123456")).toBe("");
    expect(normalizePhoneNumber("+14155552671")).toBe("");
    expect(normalizePhoneNumber("700123456")).toBe("");
    expect(normalizePhoneNumber("0710123456")).toBe("");
    expect(getUgandanMobileProvider("0710123456")).toBeNull();
  });
});
