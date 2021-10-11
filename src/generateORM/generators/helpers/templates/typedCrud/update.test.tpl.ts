import {
  $$updateSingleFunctionName,
  $$updatePluralFunctionName,
} from "$$codeOutputFullPath";

it("$$updateSingleFunctionName", async () => {
  const created = await $$insertSingleFunctionName(
    $$createMockEntityFunctionName(),
    connection
  );
  const newKey = v4();
  created["$$tablePrimaryKeyColumn"] = newKey;

  await expect(
    $$updateSingleFunctionName(created, connection)
  ).resolves.toEqual(
    expect.objectContaining({ ["$$tablePrimaryKeyColumn"]: newKey })
  );
});

it("$$updatePluralFunctionName", async () => {
  const created = await $$insertSingleFunctionName(
    $$createMockEntityFunctionName(),
    connection
  );

  const oldKey = created["$$tablePrimaryKeyColumn"];
  const newKey = v4();

  await expect(
    $$updatePluralFunctionName(
      { ["$$tablePrimaryKeyColumn"]: newKey },
      (q) => q.where({ ["$$tablePrimaryKeyColumn"]: oldKey }),
      connection
    )
  ).resolves.toEqual(
    expect.objectContaining([{ ["$$tablePrimaryKeyColumn"]: newKey }])
  );
});
