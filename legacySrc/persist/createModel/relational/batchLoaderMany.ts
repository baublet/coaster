import DataLoader from "dataloader";

import { Connection } from "persist";

interface BatchLoaderManyArguments {
  connection: Connection;
  searchColumn: string;
  tableName: string;
}

export function batchLoaderMany<T>({
  connection,
  searchColumn,
  tableName,
}: BatchLoaderManyArguments) {
  async function batchLoadMany(parentIds: (string | number)[]) {
    const results = await connection
      .table(tableName)
      .whereIn(searchColumn, parentIds);
    const entities = new Array(parentIds.length);

    for (let i = 0; i < entities.length; i++) {
      const subset = results.filter((e) => e[searchColumn] === parentIds[i]);
      entities[i] = subset;
    }

    return entities;
  }

  const loader = new DataLoader(batchLoadMany, { cache: false });

  return async (id: string | number): Promise<T[]> => {
    return loader.load(id);
  };
}
