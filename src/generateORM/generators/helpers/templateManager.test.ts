import { getTemplateManager } from "./templateManager";

it("doesn't throw", () => {
  expect(() => getTemplateManager()).not.toThrow();
});

describe("TemplateManager", () => {
  const manager = getTemplateManager();

  it("is properly typed and returns a valid template", () => {
    expect(() =>
      manager.render({
        // @ts-expect-error
        template: "unknown-template",
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"templateTransformers.get(...) is not a function"`
    );
  });

  it("is properly typed and returns a valid template", () => {
    expect(
      manager.render({
        template: "typedCrud/insert.pg",
        variables: {
          // @ts-expect-error
          test: "nobody-home",
          entityName: "EntityName",
          entityInputType: "EntityInputType",
          connection: "connection",
          namedToRawFunctionName: "namedToRawFunctionName",
          rawToNamedFunctionName: "rawToNamedFunctionName",
          pluralEntityName: "PluralEntityName",
          rawBaseQueryFunctionName: "rawBaseQueryFunctionName",
        },
      })
    ).toMatchInlineSnapshot(`
      "/**
       * Insert a single EntityName into the database, returning the inserted entity
       */
      export async function insertEntityName(
        input: EntityInputType,
        connection: ConnectionOrTransaction
      ): Promise<EntityName> {
        const rawInput = namedToRawFunctionName(input);
        const result = await rawBaseQueryFunctionName(connection)
          .insert(rawInput)
          .returning(\\"*\\");
        return rawToNamedFunctionName(result[0]);
      }

      /**
       * Inserts one ore more PluralEntityName into the database, returning the inserted entities
       */
      export async function insertPluralEntityName(
        input: EntityInputType[],
        connection: ConnectionOrTransaction
      ): Promise<EntityName[]> {
        const rawInput = input.map((input) => namedToRawFunctionName(input));
        const results = await rawBaseQueryFunctionName(connection)
          .insert(rawInput)
          .returning(\\"*\\");
        return results.map((rawEntity) => rawToNamedFunctionName(rawEntity));
      }
      "
    `);
  });
});
