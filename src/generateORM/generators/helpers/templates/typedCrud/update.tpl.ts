/** Update a single $$entityName. Resolves the number of affected rows. */
export function $$updateSingleFunctionName(
  entity: $$entityInputType,
  connection: ConnectionOrTransaction
): Promise<number> {
  const { $$tablePrimaryKeyColumn, ...rawInput } =
    $$namedToRawFunctionName(entity);
  return $$rawBaseQueryFunctionName(connection)
    .update(rawInput)
    .where("$$tablePrimaryKeyColumn", "=", entity.$$tablePrimaryKeyColumn)
    .limit(1);
}

/** Update one or more $$pluralEntityName under specific conditions. Resolves the number of affected rows. */
export async function $$updatePluralFunctionName(
  updatePayload: Partial<$$entityInputType>,
  query: (query: Knex.QueryBuilder<$$rawEntityTypeName, number>) => unknown,
  connection: ConnectionOrTransaction
): Promise<number> {
  const rawUpdatePayload = $$namedToRawFunctionName(updatePayload);
  const queryBuilder =
    $$rawBaseQueryFunctionName(connection).update(rawUpdatePayload);
  await query(queryBuilder);
  return await queryBuilder.clone();
}
