import { Model, ModelFactoryWithPersist } from "model/types";
import { createModel } from "model";
import { PersistConnection } from "persist/types";

let testTableDelta = 0;

export const db = {
  client: "sqlite3",
  connection: {
    filename: ":memory:"
  },
  useNullAsDefault: true
};

export async function createTableForNewModelFactory<T = any, C = any>(
  persist: PersistConnection,
  props: any,
  computedProps: any = {}
): Promise<[ModelFactoryWithPersist<T, C>, Model<T & C>]> {
  const tableName = `test_${testTableDelta++}`;
  const tableNamePlural = `${tableName}s`;

  await persist.schema.createTable(tableNamePlural, table => {
    for (const [name, type] of Object.entries({ id: "test", ...props })) {
      switch (typeof type) {
        case "boolean":
          table.boolean(name);
          break;
        case "number":
          table.bigInteger(name).unsigned();
          break;
        default:
          table.text(name);
      }
    }
  });

  const factory = createModel<T, C>({
    name: tableName,
    computedProps,
    persistWith: persist
  });

  return [factory, factory(props)];
}
