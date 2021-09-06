import { $$typeGuardFunctionName } from "$$codeOutputFullPath";

describe("$$typeGuardFunctionName", () => {
  it("returns false if input is not like a $$prefixedEntityName", () => {
    expect($$typeGuardFunctionName(1)).toBe(false);
    expect($$typeGuardFunctionName([])).toBe(false);
    expect($$typeGuardFunctionName(false)).toBe(false);
    expect($$typeGuardFunctionName({})).toBe(false);
  });
  it("returns true and asserts properly if input is like a $$prefixedEntityName", () => {
    const $$prefixedEntityNameLike = $$entityLikeAsJsonString as unknown;
    expect($$typeGuardFunctionName($$prefixedEntityNameLike)).toBe(true);

    if ($$typeGuardFunctionName($$prefixedEntityNameLike)) {
      // We expect no TS error here
      const actualEntityType: $$prefixedEntityName = $$prefixedEntityNameLike;
      expect(actualEntityType).toEqual($$prefixedEntityNameLike);
    } else {
      // @ts-expect-error
      const actualEntityType: $$prefixedEntityName = $$prefixedEntityNameLike;
      expect(actualEntityType).toEqual($$prefixedEntityNameLike);
    }
  });
});
