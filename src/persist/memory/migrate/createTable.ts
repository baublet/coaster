import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import tableExists from "persist/schema/errors/tableExists";

export default function createTable(
  map: MemoryMap,
  database: string,
  table: string
) {
  if (!map[database]) throw databaseNotFound(database);
  if (map[database][table]) throw tableExists(database, table);
  map[database][table] = {};
}
