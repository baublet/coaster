import DataLoader from "dataloader";

import { PersistedModelFactory } from "persist";

export function createDataLoaderForModelFactory<
  T extends PersistedModelFactory
>(factory: T): DataLoader<string, ReturnType<T>> {
  return new DataLoader(
    (keys: string[]) => factory.find(keys) as Promise<(ReturnType<T> | null)[]>
  );
}
