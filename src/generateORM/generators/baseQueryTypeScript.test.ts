import { baseQueryTypeScript } from "./baseQueryTypeScript";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();

it("generates a schema", () => {
  metaData.tableEntityNames.set("public.user", "RawUser");
  metaData.tableEntityNames.set("public.user_account", "RawUserAccount");
  expect(baseQueryTypeScript(getMockRawSchema(), metaData)).toMatchSnapshot();
});
