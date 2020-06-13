import { Model, ModelArgsPropertyType } from "model/types";
import { PersistConnection, PersistedModelFactory } from "persist/types";
import { createPersistedModel } from "persist/createPersistedModel";

let testTableDelta = 0;
export function getTestTableDelta() {
  return testTableDelta++;
}

export const db = {
  client: "sqlite3",
  connection: {
    filename: ":memory:"
  },
  useNullAsDefault: true
};

/**
 * Pass in an arbitrary ball of data and we'll turn it into a model and model
 * factory for you, that's ready to go and built with persistence.
 * @param persist
 * @param props
 */
export async function createTableForNewModelFactory(
  persist: PersistConnection,
  props: any
): Promise<{ factory: PersistedModelFactory<any>; model: Model<any> }> {
  const tableName = `test_${getTestTableDelta()}`;
  const tableNamePlural = `${tableName}s`;

  const modelProps = {};

  await persist.schema.createTable(tableNamePlural, table => {
    for (const [name, type] of Object.entries({ id: "id", ...props })) {
      switch (typeof type) {
        case "boolean":
          table.boolean(name);
          modelProps[name] = {
            type: ModelArgsPropertyType.BOOLEAN
          };
          break;
        case "number":
          table.bigInteger(name).unsigned();
          modelProps[name] = {
            type: ModelArgsPropertyType.NUMBER
          };
          break;
        default:
          modelProps[name] = {
            type: ModelArgsPropertyType.STRING
          };
          table.text(name);
      }
    }
  });

  const factory = createPersistedModel({
    name: tableName,
    properties: modelProps,
    persist: {
      with: persist,
      tableName: tableNamePlural
    }
  });

  return { factory, model: factory(props) };
}
