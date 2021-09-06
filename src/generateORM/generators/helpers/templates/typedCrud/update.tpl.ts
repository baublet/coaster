/** Update a single $$entityName */
export async function update$$entityName(
  entity: $$entityInputType,
  connection: ConnectionOrTransaction
): Promise<void> {
  const { $$tablePrimaryKeyColumn, ...rawInput } =
    $$namedToRawFunctionName(entity);
  await $$rawBaseQueryFunctionName(connection)
    .update(rawInput)
    .where("$$tablePrimaryKeyColumn", "=", entity.$$tablePrimaryKeyColumn)
    .limit(1);
}

/** Update one or more $$pluralEntityName under specific conditions */
export async function update$$entityNameWhere(
  updatePayload: Partial<$$entityInputType>,
  query: (query: Knex.QueryBuilder<$$rawEntityTypeName, number>) => unknown,
  connection: ConnectionOrTransaction
): Promise<void> {
  const rawUpdatePayload = $$namedToRawFunctionName(updatePayload);
  const queryBuilder =
    $$rawBaseQueryFunctionName(connection).update(rawUpdatePayload);
  await query(queryBuilder);
  await queryBuilder;
}
