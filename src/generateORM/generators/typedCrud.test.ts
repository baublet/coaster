import { typedCrud } from "./typedCrud";

import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();
const mockSchema = getMockRawSchema();

metaData.tableRawEntityNames.set("public.user", "RawUser");
metaData.tableRawEntityNames.set("public.user_account", "RawUserAccount");
metaData.tableEntityNames.set("public.user", "User");
metaData.tableEntityNames.set("public.user_account", "UserAccount");

metaData.rawBaseQueryFunctionNames.set("public.user", "RawUsers");
metaData.rawBaseQueryFunctionNames.set(
  "public.user_account",
  "RawUserAccounts"
);

metaData.transformerFunctionNames["RawUser"] = {};
metaData.transformerFunctionNames["RawUser"]["User"] = "rawUserToUser";
metaData.transformerFunctionNames["RawUserAccount"] = {};
metaData.transformerFunctionNames["RawUserAccount"]["UserAccount"] =
  "rawUserAccountToUserAccount";

metaData.transformerFunctionNames["User"] = {};
metaData.transformerFunctionNames["User"]["RawUser"] = "userToRawUser";
metaData.transformerFunctionNames["UserAccount"] = {};
metaData.transformerFunctionNames["UserAccount"]["RawUserAccount"] =
  "userAccountToRawUserAccount";

metaData.namedEntityInputTypeNames.set("public.user", "UserInput");
metaData.namedEntityInputTypeNames.set(
  "public.user_account",
  "UserAccountInput"
);

it("generates some code: PG flavored", () => {
  expect(typedCrud(mockSchema, metaData)).toMatchSnapshot();
});

it("generates some code: MySQL flavored", () => {
  const mockSchema = getMockRawSchema();
  mockSchema.flavor = "mysql";

  expect(typedCrud(mockSchema, metaData)).toMatchSnapshot();
});
