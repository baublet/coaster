import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";

export default function removeDatabase(map: MemoryMap, database: string) {
  if (!map[database]) throw databaseNotFound(database);
  delete map[database];
}
