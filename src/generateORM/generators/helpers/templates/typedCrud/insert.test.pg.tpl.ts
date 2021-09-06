import { $$insertSingleFunctionName, $$insertPluralFunctionName } from "$$codeOutputFullPath";

describe("insert $$entityName", () => {
  it("$$insertSingleFunctionName", async () => {
    await expect(
      $$insertSingleFunctionName($$insertInput, connection)
    ).resolves.toEqual($$expectedOutput);
  });
});
