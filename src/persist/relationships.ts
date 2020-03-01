import { ModelArgs, ModelArgsPropertyType } from "../model/types";
import { getBridgeTableNames } from "persist/getBridgeTableNames";
import { PersistedModelFactory, PersistModelRelationship } from "persist/types";

export function relationships(
  factory: PersistedModelFactory,
  modelArgs: ModelArgs
): PersistModelRelationship[] {
  const relationships: PersistModelRelationship[] = [];

  for (const [prop, arg] of Object.entries(modelArgs.properties)) {
    if (arg.type !== ModelArgsPropertyType.RELATIONSHIP) continue;
    delete arg.type;
    const [tableName, leftCol, rightCol] = getBridgeTableNames(
      factory,
      arg.modelFactory as PersistedModelFactory
    );
    arg.localKey = arg.localKey || leftCol;
    arg.foreignKey = arg.foreignKey || rightCol;
    arg.bridgeTableName = arg.bridgeTableName || tableName;
    relationships[prop] = arg;
    relationships[prop].accessor = prop;
  }

  return relationships;
}
