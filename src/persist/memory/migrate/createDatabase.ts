import { MemoryMap } from "../memory";
import databaseExists from "persist/schema/errors/databaseExists";

export default function createDatabase(map: MemoryMap, database: string) {
  if (map[database]) throw databaseExists(database);
  map[database] = {};
}
