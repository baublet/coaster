import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  PersistModelFactoryRelationsipFindWhereFn,
  PersistRelationshipQueryOptions,
  PersistConnection,
  PersistWhereFunction
} from "persist/types";
import { relationshipOptionsFor } from "../relationshipOptionsFor";
import { findRelationshipsMultipleDatabases } from "./multipleDatabases";
import { connectionsAreEqual } from "persist/connectionsAreEqual";
import { findRelationshipsSameDatabase } from "./sameDatabases";

export type FindRelationshipStrategyOptions = {
  bridgeTableName: string;
  bridgeTablePersist: PersistConnection;
  foreignKey: string;
  foreignPersist: PersistConnection;
  foreignPrimaryKey: string;
  localKey: string;
  localPrimaryKey: string;
  modelFactory: PersistedModelFactory;
  on: PersistedModel;
  options: PersistRelationshipQueryOptions;
  where: PersistWhereFunction;
};

export function findWhereRelationshipFactory<
  Args extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationsipFindWhereFn<Args, ForeignFactory> {
  const {
    bridgeTableName,
    bridgeTablePersist,
    localKey,
    foreignKey,
    modelFactory
  } = relationshipOptionsFor(baseFactory.$relationships, relationship);
  const localPrimaryKey = modelFactory.$options.persist.primaryKey || "id";
  const foreignPrimaryKey = baseFactory.$options.persist.primaryKey || "id";
  const foreignPersist: PersistConnection = modelFactory.$options.persist.with;
  return async function(
    on: PersistedModel<Args>,
    where: PersistWhereFunction,
    options?: PersistRelationshipQueryOptions
  ): Promise<ReturnType<ForeignFactory>[]> {
    const sameDatabase = connectionsAreEqual(
      bridgeTablePersist,
      modelFactory.$options.persist.with,
      baseFactory.$options.persist.with
    );

    if (sameDatabase) {
      return findRelationshipsSameDatabase<ReturnType<ForeignFactory>>({
        bridgeTableName,
        bridgeTablePersist,
        foreignKey,
        foreignPersist,
        foreignPrimaryKey,
        localKey,
        localPrimaryKey,
        modelFactory,
        on,
        options,
        where
      });
    }

    return findRelationshipsMultipleDatabases<ReturnType<ForeignFactory>>({
      bridgeTableName,
      bridgeTablePersist,
      foreignKey,
      foreignPersist,
      foreignPrimaryKey,
      localKey,
      localPrimaryKey,
      modelFactory,
      on,
      options,
      where
    });
  };
}
