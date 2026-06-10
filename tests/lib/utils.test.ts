import { describe, it, expect } from "vitest"
import { safeHref } from "@/lib/utils"

describe("safeHref", () => {
  it("allows http and https urls", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com")
    expect(safeHref("http://example.com")).toBe("http://example.com")
  })
  it("rejects javascript: urls", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined()
  })
  it("rejects data: urls", () => {
    expect(safeHref("data:text/html,<h1>xss</h1>")).toBeUndefined()
  })
  it("returns undefined for empty/null/undefined", () => {
    expect(safeHref(undefined)).toBeUndefined()
    expect(safeHref(null)).toBeUndefined()
    expect(safeHref("")).toBeUndefined()
  })
})
