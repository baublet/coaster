import { PersistConnection } from "./types";

export function connectionsAreEqual(
  ...connections: PersistConnection[]
): boolean {
  for (let i = 1; i < connections.length; i++) {
    if (connections[i] !== connections[0]) return false;
  }
  return true;
}
