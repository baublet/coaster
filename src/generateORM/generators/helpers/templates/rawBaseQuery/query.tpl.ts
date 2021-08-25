export function $$pluralEntityName<Result = $$entityName[]>(
  connection: ConnectionOrTransaction
) {
  return connection<$$entityName, Result>("$$tableName");
}
