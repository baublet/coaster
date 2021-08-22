import { rawBaseQuery } from "./rawBaseQuery";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();

metaData.tableRawEntityNames.set("public.user", "RawUser");
metaData.tableRawEntityNames.set("public.user_account", "RawUserAccount");

it("generates a schema", () => {
  expect(rawBaseQuery(getMockRawSchema(), metaData)).toMatchSnapshot();
});

it("generates test code", () => {
  metaData.generateTestCode = true;
  expect(rawBaseQuery(getMockRawSchema(), metaData)).toMatchSnapshot();
});
