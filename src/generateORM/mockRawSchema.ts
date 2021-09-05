import { RawSchema } from "./drivers";

export const getMockRawSchema: () => RawSchema = () => ({
  name: "public",
  flavor: "pg",
  enums: [
    {
      name: "user_account_source",
      values: ["github", "bitbucket"],
    },
  ],
  tables: [
    {
      name: "user",
      primaryKeyColumn: "id",
      primaryKeyType: "string",
      uniqueConstraints: [],
      columns: [
        {
          name: "id",
          columnType: "columnType",
          nullable: false,
          type: "string",
          foreignKeys: [],
          hasDefault: true,
        },
        {
          name: "name",
          comment: "Users don't have to provide their name",
          columnType: "columnType",
          nullable: true,
          type: "string",
          foreignKeys: [],
          hasDefault: false,
        },
        {
          name: "data",
          columnType: "columnType",
          nullable: false,
          type: "AnyJson",
          foreignKeys: [],
          hasDefault: false,
        },
      ],
    },
    {
      name: "user_account",
      comment: "Singular users can have multiple accounts",
      primaryKeyColumn: "id",
      primaryKeyType: "string",
      uniqueConstraints: [],
      columns: [
        {
          name: "id",
          columnType: "columnType",
          nullable: false,
          type: "unknown",
          foreignKeys: [],
          hasDefault: true,
        },
        {
          name: "source",
          comment: "Who sent us this users' data?",
          columnType: "columnType",
          nullable: false,
          type: "enum",
          foreignKeys: [],
          hasDefault: false,
          enumPath: "public.user_account_source",
        },
        {
          name: "source_data",
          comment: "The raw data sent from the source provider",
          columnType: "columnType",
          nullable: false,
          type: "AnyJson",
          foreignKeys: [],
          hasDefault: false,
        },
      ],
    },
  ],
});
