/** Deletes a $$entityName */
export async function delete$$entityName(
  entity: $$entityName,
  connection: ConnectionOrTransaction
): Promise<number> {
  return $$rawBaseQueryFunctionName<number>(connection)
    .where("$$tablePrimaryKeyColumn", "=", entity.$$tablePrimaryKeyColumn)
    .delete()
    .limit(1);
}

/** Delete one or more $$pluralEntityName under specific conditions */
export async function delete$$entityNameWhere(
  query: (query: knex.QueryBuilder<$$rawEntityTypeName, number>) => unknown,
  connection: ConnectionOrTransaction
): Promise<number> {
  const queryBuilder = $$rawBaseQueryFunctionName<number>(connection);
  await query(queryBuilder);
  queryBuilder.delete();
  return queryBuilder;
}
