import { baseQueryTypeScript } from "./baseQueryTypeScript";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();

metaData.tableEntityNames.set("public.user", "RawUser");
metaData.tableEntityNames.set("public.user_account", "RawUserAccount");

it("generates a schema", () => {
  expect(baseQueryTypeScript(getMockRawSchema(), metaData)).toMatchSnapshot();
});

it("generates a schema with default knex options", () => {
  expect(
    baseQueryTypeScript(getMockRawSchema(), metaData, {
      knexConnectionOptions: undefined,
    })
  ).toMatchSnapshot();
});

it("generates a schema: custom knex options", () => {
  expect(
    baseQueryTypeScript(getMockRawSchema(), metaData, {
      knexConnectionOptions: {
        client: "pg",
      },
    })
  ).toMatchSnapshot();
});
