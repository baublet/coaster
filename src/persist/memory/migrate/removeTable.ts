import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableNotFound from "persist/schema/errors/tableNotFound";

export default function removeTable(
  map: MemoryMap,
  database: string,
  table: string
) {
  if (!map[database]) throw databaseNotFound(database);
  if (!map[database][table]) throw tableNotFound(database, table);
  delete map[database][table];
}
