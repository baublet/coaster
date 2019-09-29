import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableNotFound from "persist/schema/errors/tableNotFound";

export default function removeColumn(
  map: MemoryMap,
  db: string,
  table: string,
  column: string
) {
  if (!map[db]) throw databaseNotFound(db);
  if (!map[db][table]) throw tableNotFound(db, table);
  Object.keys(map[db][table]).forEach(id => {
    if (!map[db][table][id][column]) return;
    delete map[db][table][id][column];
  });
}
