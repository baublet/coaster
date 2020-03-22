import {
  PersistTransaction,
  PersistConnection,
  PersistedModelFactory
} from "persist/types";
import { connectionsAreEqual } from "persist/connectionsAreEqual";

interface ForeignAndBridgePersistProps {
  transaction: PersistTransaction;
  bridgeTableTransaction: PersistTransaction;
  bridgeTablePersist: PersistConnection;
  modelFactory: PersistedModelFactory;
}

export function foreignAndBridgePersists({
  transaction,
  bridgeTableTransaction,
  bridgeTablePersist,
  modelFactory
}: ForeignAndBridgePersistProps) {
  return {
    modelPersist: transaction || modelFactory.$options.persist.with,
    bridgePersist:
      bridgeTableTransaction ||
      (transaction &&
        connectionsAreEqual(
          bridgeTablePersist,
          modelFactory.$options.persist.with
        ))
        ? transaction
        : bridgeTablePersist
  };
}
