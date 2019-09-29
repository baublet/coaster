import { MemoryMap } from "../memory";
import databaseNotFound from "persist/schema/errors/databaseNotFound";
import databaseExists from "persist/schema/errors/databaseExists";

export default function renameDatabase(
  map: MemoryMap,
  from: string,
  to: string
) {
  if (!map[from]) throw databaseNotFound(from);
  if (map[to]) throw databaseExists(to);
  map[to] = map[from];
  delete map[from];
}
