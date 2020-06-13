import {
  PersistedModelFactory,
  PersistModelArgs,
  PersistedModel,
  PersistModelFactoryRelationsipCreateManyFn,
  PersistModelFactoryRelationsipCreateFn,
  PersistTransaction
} from "persist/types";

export function createManyFactory<
  Args extends PersistModelArgs,
  ForeignFactory extends PersistedModelFactory
>(
  baseFactory: PersistedModelFactory,
  relationship: string
): PersistModelFactoryRelationsipCreateManyFn<Args, ForeignFactory> {
  return async function(
    on: PersistedModel<Args>,
    models: (
      | ReturnType<ForeignFactory>
      | Partial<Parameters<ForeignFactory>>
    )[],
    validate: boolean = true,
    transaction?: PersistTransaction,
    bridgeTableTransaction?: PersistTransaction
  ): Promise<ReturnType<ForeignFactory>[]> {
    // This needs to be here! The create function doesn't exist on the base
    // factory until after full instantiation
    const createFunction = baseFactory[relationship]
      .create as PersistModelFactoryRelationsipCreateFn<Args, ForeignFactory>;

    return Promise.all(
      models.map(model =>
        createFunction(on, model, validate, transaction, bridgeTableTransaction)
      )
    );
  };
}
