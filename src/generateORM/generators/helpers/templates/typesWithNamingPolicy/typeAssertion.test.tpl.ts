import { ${functionName}, ${prefixedEntityName} } from "$$codeOutputFullPath"

describe("$$assertionFunctionName", () => {
  it("throws if input is not like a $$prefixedEntityName", () => {
    expect(() => $$assertionFunctionName(1)).toThrow();
    expect(() => $$assertionFunctionName([])).toThrow();
    expect(() => $$assertionFunctionName(false)).toThrow();
    expect(() => $$assertionFunctionName({})).toThrow();
  })
  it("does not throw and asserts properly if input is like a $$prefixedEntityName", () => {
    const $$prefixedEntityNameLike = $$entityLikeAsJsonString as unknown;
    expect(() => $$assertionFunctionName($$prefixedEntityNameLike)).not.toThrow();

    // We expect no TS error here
    $$assertionFunctionName($$prefixedEntityNameLike);
    const actualEntityType: $$prefixedEntityName = $$prefixedEntityNameLike;
    expect(actualEntityType).toEqual($$prefixedEntityNameLike);
  })
})