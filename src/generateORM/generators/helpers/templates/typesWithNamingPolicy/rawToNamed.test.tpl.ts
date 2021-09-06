import { $$rawToNamedFunctionName } from "$$codeOutputFullPath";

describe("$$rawToNamedFunctionName", () => {
  const $$rawEntityNameFull: $$rawEntityName = $$rawFullTestSubject;
  const $$namedEntityNameFull: $$namedEntityName = $$namedFullTestSubject;
  const $$rawEntityNamePartial: Partial<$$rawEntityName> = {};
  const $$namedEntityNamePartial: Partial<$$namedEntityName> = {};
  it("converts a full $$rawEntityName to a full $$namedEntityName", () => {
    expect($$rawToNamedFunctionName($$rawEntityNameFull)).toEqual($$namedEntityNameFull);
  });
  it("converts a partial $$rawEntityName to a partial $$namedEntityName", () => {
    expect($$rawToNamedFunctionName($$rawEntityNamePartial)).toEqual($$namedEntityNamePartial);
  });
});