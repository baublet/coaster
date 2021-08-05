import { baseQueryTypeScript } from "./baseQueryTypeScript";
import { mockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();

it("generates a schema", () => {
  metaData.tableEntityNames.set("public.user", "RawUser");
  metaData.tableEntityNames.set("public.userAccount", "RawUserAccount");
  expect(baseQueryTypeScript(mockRawSchema, metaData)).toMatchSnapshot();
});
