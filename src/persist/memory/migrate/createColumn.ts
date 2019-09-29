import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableNotFound from "persist/schema/errors/tableNotFound";

export default function createColumn(
  map: MemoryMap,
  db: string,
  table: string
) {
  if (!map[db]) throw databaseNotFound(db);
  if (!map[db][table]) throw tableNotFound(db, table);
  // Do nothing here, since we don't keep column-level schema in memory
}
