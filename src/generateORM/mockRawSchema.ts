import { RawSchema } from "./drivers";

export const getMockRawSchema: () => RawSchema = () => ({
  name: "public",
  flavor: "pg",
  tables: [
    {
      name: "user",
      primaryKeyColumn: "id",
      primaryKeyType: "string",
      columns: [
        {
          name: "id",
          columnType: "columnType",
          nullable: false,
          type: "string",
          foreignKeys: [],
          uniqueConstraints: [],
        },
        {
          name: "name",
          comment: "Users don't have to provide their name",
          columnType: "columnType",
          nullable: true,
          type: "string",
          foreignKeys: [],
          uniqueConstraints: [],
        },
        {
          name: "data",
          columnType: "columnType",
          nullable: false,
          type: "JSON",
          foreignKeys: [],
          uniqueConstraints: [],
        },
      ],
    },
    {
      name: "user_account",
      comment: "Singular users can have multiple accounts",
      primaryKeyColumn: "id",
      primaryKeyType: "string",
      columns: [
        {
          name: "id",
          columnType: "columnType",
          nullable: false,
          type: "unknown",
          foreignKeys: [],
          uniqueConstraints: [],
        },
        {
          name: "source",
          comment: "Who sent us this users' data?",
          columnType: "columnType",
          nullable: false,
          type: "string",
          foreignKeys: [],
          uniqueConstraints: [],
        },
        {
          name: "source_data",
          comment: "The raw data sent from the source provider",
          columnType: "columnType",
          nullable: false,
          type: "JSON",
          foreignKeys: [],
          uniqueConstraints: [],
        },
      ],
    },
  ],
});
