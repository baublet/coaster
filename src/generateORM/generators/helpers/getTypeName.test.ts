import { getTypeName } from "./getTypeName";

function getArgs(
  args: Partial<Parameters<typeof getTypeName>[0]>
): Parameters<typeof getTypeName>[0] {
  return {
    column: {
      type: "enum",
      name: "column",
      enumPath: "schema.enumName",
      ...({} as any),
    },
    table: {
      name: "table",
      ...({} as any),
    },
    metaData: {
      rawDatabaseEnumNames: new Map(),
      namedDatabaseEnumNames: new Map(),
      ...({} as any),
    },
    schema: {
      name: "schema",
      ...({} as any),
    },
    rawOrNamed: "raw",
    getTypeName: jest.fn(),
    ...args,
  };
}

it("returns the basics if it's not an enum", () => {
  expect(
    getTypeName(
      getArgs({
        column: {
          type: "boolean",
          ...({} as any),
        },
      })
    )
  ).toEqual("boolean");
});

it("returns the user-defined column type if they want it", () => {
  expect(
    getTypeName(
      getArgs({
        getTypeName: () => "UserDefined",
      })
    )
  ).toEqual("UserDefined");
});

describe("raw", () => {
  it("returns string if the enum name can't be found in the map", () => {
    const args = getArgs({ rawOrNamed: "raw" });
    args.metaData.rawDatabaseEnumNames.delete("schema.enumName");
    expect(getTypeName(args)).toEqual("string");
  });

  it("returns the enum name if it's found", () => {
    const args = getArgs({ rawOrNamed: "raw" });

    args.metaData.rawDatabaseEnumNames.set("schema.enumName", "EnumName");

    expect(getTypeName(args)).toEqual("EnumName");
  });
});

describe("named", () => {
  it("returns string if the enum name can't be found in the map", () => {
    const args = getArgs({ rawOrNamed: "named" });
    args.metaData.namedDatabaseEnumNames.delete("schema.enumName");
    expect(getTypeName(args)).toEqual("string");
  });

  it("returns the enum name if it's found", () => {
    const args = getArgs({ rawOrNamed: "named" });

    args.metaData.namedDatabaseEnumNames.set("schema.enumName", "EnumName");

    expect(getTypeName(args)).toEqual("EnumName");
  });
});
