import { ModelArgsPropertyType } from "../model/types";
import { getBridgeTableNames } from "./getBridgeTableNames";
import {
  PersistedModelFactory,
  PersistModelRelationship,
  PersistModelArgs
} from "./types";

export function relationships(
  factory: PersistedModelFactory,
  modelArgs: PersistModelArgs
): PersistModelRelationship[] {
  const relationships: PersistModelRelationship[] = [];

  for (const [prop, arg] of Object.entries(modelArgs.properties)) {
    if (arg.type !== ModelArgsPropertyType.RELATIONSHIP) continue;
    delete arg.type;
    const [tableName, leftCol, rightCol] = getBridgeTableNames(
      factory,
      arg.modelFactory as PersistedModelFactory<any>
    );
    arg.localKey = arg.localKey || leftCol;
    arg.foreignKey = arg.foreignKey || rightCol;
    arg.bridgeTableName = arg.bridgeTableName || tableName;
    relationships.push(Object.assign({}, arg, { accessor: prop }) as any);
  }

  return relationships;
}
