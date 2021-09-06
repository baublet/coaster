import { $$namedToRawFunctionName } from "$$codeOutputFullPath";

describe("$$namedToRawFunctionName", () => {
  const $$namedEntityNameFull: $$namedEntityName = $$namedTestSubject;
  const $$rawEntityNameFull: $$rawEntityName = $$rawTestSubject;
  const $$rawEntityNamePartial: Partial<$$rawEntityName> = {};
  const $$namedEntityNamePartial: Partial<$$namedEntityName> = {};
  it("converts a full $$namedEntityName to a full $$rawEntityName", () => {
    expect($$namedToRawFunctionName($$namedEntityNameFull)).toEqual(
      $$rawEntityNameFull
    );
  });
  it("converts a partial $$namedEntityName to a partial $$rawEntityName", () => {
    expect($$namedToRawFunctionName($$namedEntityNamePartial)).toEqual(
      $$rawEntityNamePartial
    );
  });
});
