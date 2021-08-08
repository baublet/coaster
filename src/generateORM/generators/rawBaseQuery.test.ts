import { rawBaseQuery } from "./rawBaseQuery";
import { getMockRawSchema } from "../mockRawSchema";
import { getMockMetaData } from "../mockMetaData";

const metaData = getMockMetaData();

metaData.tableEntityNames.set("public.user", "RawUser");
metaData.tableEntityNames.set("public.user_account", "RawUserAccount");

it("generates a schema", () => {
  expect(rawBaseQuery(getMockRawSchema(), metaData)).toMatchSnapshot();
});

it("generates a schema with default knex options", () => {
  expect(
    rawBaseQuery(getMockRawSchema(), metaData, {
      knexConnectionOptions: undefined,
    })
  ).toMatchSnapshot();
});

it("generates a schema: custom knex options", () => {
  expect(
    rawBaseQuery(getMockRawSchema(), metaData, {
      knexConnectionOptions: {
        client: "pg",
      },
    })
  ).toMatchSnapshot();
});
