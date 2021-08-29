import { $$functionName } from "$$codeOutputFullPath";

describe("$$functionName", () => {
  it("returns false if input is not like a $$prefixedEntityName", () => {
    expect($$functionName(1)).toBe(false);
    expect($$functionName([])).toBe(false);
    expect($$functionName(false)).toBe(false);
    expect($$functionName({})).toBe(false);
  });

  it("returns true and asserts properly if input is like a $$prefixedEntityName", () => {
    const likeA$$prefixedEntityName = {
      $$requiredColumns,
    } as unknown;
    expect($$functionName(likeA$$prefixedEntityName)).toBe(true);

    if ($$functionName(likeA$$prefixedEntityName)) {
      // We expect no TS error here
      const actualEntityType: $$prefixedEntityName = likeA$$prefixedEntityName;
      expect(actualEntityType).toEqual(likeA$$prefixedEntityName);
    } else {
      // @ts-expect-error
      const actualEntityType: $$prefixedEntityName = likeA$$prefixedEntityName;
      expect(actualEntityType).toEqual(likeA$$prefixedEntityName);
    }
  });
});
