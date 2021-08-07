import { pascalCase, camelCase } from "change-case";

import { typesWithNamingPolicy } from "./typesWithNamingPolicy";
import { mockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const entityNamingPolicy = (str: string) => pascalCase(str);
const propertyNamingPolicy = (str: string) => camelCase(str);

const mockMetaData = getMockMetaData();
mockMetaData.tableEntityNames.set("public.user", "RawUser");
mockMetaData.tableEntityNames.set("public.user_account", "RawUserAccount");

describe("interfaces/types", () => {
  it("spits out types with the proper naming policy", () => {
    expect(
      typesWithNamingPolicy(mockRawSchema, mockMetaData, {
        typesOrInterfaces: "types",
        getEntityName: entityNamingPolicy,
        getPropertyName: propertyNamingPolicy,
      })
    ).toMatchSnapshot();
  });
});
