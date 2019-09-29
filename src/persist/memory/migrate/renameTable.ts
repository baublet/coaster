import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableExists from "persist/schema/errors/tableExists";
import tableNotFound from "persist/schema/errors/tableNotFound";

export default function renameTable(
  map: MemoryMap,
  database: string,
  from: string,
  to: string
) {
  if (!map[database]) throw databaseNotFound(database);
  if (!map[database][from]) throw tableNotFound(database, from);
  if (map[database][to]) throw tableExists(database, to);
  map[database][to] = map[database][from];
  delete map[database][from];
}
