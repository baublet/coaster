import { $$functionName, $$prefixedEntityName } from "$$codeOutputFullPath";

describe("assertIs$$prefixedEntityNameLike", () => {
  it("throws if input is not like a $$prefixedEntityName", () => {
    expect(() => $$functionName(1)).toThrow();
    expect(() => $$functionName([])).toThrow();
    expect(() => $$functionName(false)).toThrow();
    expect(() => $$functionName({})).toThrow();
  });

  it("does not throw and asserts properly if input is like a $$prefixedEntityName", () => {
    const likeA$$prefixedEntityName = {
      $$requiredColumns,
    } as unknown;
    expect(() => $$functionName(likeA$$prefixedEntityName)).not.toThrow();

    // We expect no TS error here
    $$functionName(likeA$$prefixedEntityName);
    const actualEntityType: $$prefixedEntityName = likeA$$prefixedEntityName;
    expect(actualEntityType).toEqual(likeA$$prefixedEntityName);
  });
});
