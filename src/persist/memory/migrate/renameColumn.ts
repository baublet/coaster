import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableNotFound from "persist/schema/errors/tableNotFound";

export default function renameColumn(
  map: MemoryMap,
  db: string,
  table: string,
  from: string,
  to: string
) {
  if (!map[db]) throw databaseNotFound(db);
  if (!map[db][table]) throw tableNotFound(db, table);
  Object.keys(map[db][table]).forEach(id => {
    if (!map[db][table][id][from]) return;
    map[db][table][id][to] = map[db][table][id][from];
    delete map[db][table][id][from];
  });
}
