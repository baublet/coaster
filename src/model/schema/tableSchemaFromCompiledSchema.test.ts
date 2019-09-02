import tableSchema from "./tableSchemaFromCompiledSchema";
import { SchemaNodeType } from ".";
import generateNames from "helpers/generateNames";

const expectedOperableColumnSchema = {
  columns: [
    {
      autoIncrement: true,
      default: undefined,
      name: "id",
      nullable: undefined,
      precision: undefined,
      primaryKey: true,
      scale: undefined,
      type: "BIGINT",
      uniqueName: "id"
    },
    {
      autoIncrement: false,
      default: undefined,
      name: "name",
      nullable: false,
      precision: undefined,
      primaryKey: false,
      scale: undefined,
      type: "TEXT",
      uniqueName: "name"
    }
  ],
  indexes: {},
  name: "test_table"
};

it("turns a compiled schema into a diffable, db-operable schema column tree", () => {
  expect(
    tableSchema({
      $tableName: "test_table",
      id: {
        names: generateNames("id"),
        type: SchemaNodeType.ID,
        relation: false,
        uniqueName: "id",
        persistOptions: {
          primaryKey: true,
          unique: true,
          autoIncrement: true
        }
      },
      name: {
        names: generateNames("name"),
        type: SchemaNodeType.STRING,
        uniqueName: "name",
        relation: false,
        persistOptions: {
          unique: false,
          autoIncrement: false,
          nullable: false,
          primaryKey: false
        }
      }
    })
  ).toEqual(expectedOperableColumnSchema);
});
