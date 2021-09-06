/** Find many $$pluralEntityName in the database by a constraint function */
export async function find$$pluralEntityName(
  query: (
    query: Knex.QueryBuilder<$$rawEntityTypeName, $$rawEntityTypeName[]>
  ) => unknown,
  connection: ConnectionOrTransaction
): Promise<$$entityName[]> {
  const queryBuilder = $$rawBaseQueryFunctionName(connection);
  await query(queryBuilder);
  const results = await queryBuilder;
  return results.map((rawEntity) => $$rawToNamedFunctionName(rawEntity));
}

/** Find a $$entityName in the database or fail */
export async function find$$entityNameOrFail(
  query: (
    query: Knex.QueryBuilder<$$rawEntityTypeName, $$rawEntityTypeName[]>
  ) => unknown,
  connection: ConnectionOrTransaction
): Promise<$$entityName> {
  const queryBuilder = $$rawBaseQueryFunctionName(connection);
  await query(queryBuilder);
  queryBuilder.limit(1);
  const results = await queryBuilder;
  if (results.length === 0) {
    throw new Error(
      "Error! Unable to find $$entityName in find$$entityNameOrFail call"
    );
  }
  return $$rawToNamedFunctionName(results[0]);
}
