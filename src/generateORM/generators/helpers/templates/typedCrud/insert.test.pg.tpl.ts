import {
  $$insertSingleFunctionName,
  $$insertPluralFunctionName,
} from "$$codeOutputFullPath";

describe("insert $$entityName", () => {
  it("$$insertSingleFunctionName", async () => {
    await expect(
      $$insertSingleFunctionName($$createMockEntityFunctionName(), connection)
    ).resolves.toEqual($$expectedOutputShape);
  });

  it("$$insertPluralFunctionName", async () => {
    await expect(
      $$insertPluralFunctionName(
        [$$createMockEntityFunctionName(), $$createMockEntityFunctionName()],
        connection
      )
    ).resolves.toEqual([
      $$expectedOutputShape,
      $$expectedOutputShape,
    ]);
  });
});
