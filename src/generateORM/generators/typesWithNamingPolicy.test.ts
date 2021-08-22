import { pascalCase, camelCase } from "change-case";

import { typesWithNamingPolicy } from "./typesWithNamingPolicy";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const entityNamingPolicy = (str: string) => pascalCase(str);
const propertyNamingPolicy = (str: string) => camelCase(str);

const mockMetaData = getMockMetaData();
mockMetaData.tableRawEntityNames.set("public.user", "RawUser");
mockMetaData.tableRawEntityNames.set("public.user_account", "RawUserAccount");

describe("interfaces/types", () => {
  it("spits out types with the proper naming policy", () => {
    expect(
      typesWithNamingPolicy(getMockRawSchema(), mockMetaData, {
        typesOrInterfaces: "types",
        getEntityName: entityNamingPolicy,
        getPropertyName: propertyNamingPolicy,
      })
    ).toMatchSnapshot();
  });
});

describe("custom type names: `string` to `CHUMBAWUMBA`", () => {
  it("generates types with the proper naming policy", () => {
    expect(
      typesWithNamingPolicy(getMockRawSchema(), mockMetaData, {
        typesOrInterfaces: "types",
        getEntityName: entityNamingPolicy,
        getPropertyName: propertyNamingPolicy,
        getTypeName: (typeName) => {
          if (typeName === "string") {
            return "CHUMBAWUMBA";
          }
        },
      })
    ).toMatchSnapshot();
  });
});

it("generates test code", () => {
  mockMetaData.generateTestCode = true;
  expect(
    typesWithNamingPolicy(getMockRawSchema(), mockMetaData)
  ).toMatchSnapshot();
});
