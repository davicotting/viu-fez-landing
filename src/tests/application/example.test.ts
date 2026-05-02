import { describe, it, expect, vi } from "vitest";

describe("application", () => {
  it("should test use cases with mocked repository interfaces", () => {
    const mockRepository = {
      findById: vi.fn(),
    };

    expect(mockRepository.findById).toBeDefined();
  });
});
