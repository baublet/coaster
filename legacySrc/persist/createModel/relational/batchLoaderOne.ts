import DataLoader from "dataloader";

import { Connection } from "persist";

interface BatchLoaderOneArguments {
  connection: Connection;
  idField: string;
  tableName: string;
}

export function batchLoaderOne<T>({
  connection,
  idField,
  tableName,
}: BatchLoaderOneArguments) {
  async function batchLoad(ids: (string | number)[]) {
    const results = await connection
      .table(tableName)
      .select("*")
      .whereIn(idField, ids)
      .limit(ids.length);
    const entities = new Array(ids.length);

    for (let i = 0; i < entities.length; i++) {
      entities[i] = null;
      const found = results.find((e) => e[idField] === ids[i]);
      if (found) entities[i] = found;
    }

    return entities;
  }

  const loader = new DataLoader(batchLoad, { cache: false });

  return async (id: string | number): Promise<T | null> => {
    return loader.load(id);
  };
}
