/**
 * Insert a single $$entityName into the database, returning the inserted entity
 */
export async function $$insertSingleFunctionName(
  input: $$entityInputType,
  connection: ConnectionOrTransaction
): Promise<$$entityName> {
  const rawInput = $$namedToRawFunctionName(input);
  const result = await $$rawBaseQueryFunctionName(connection)
    .insert(rawInput)
    .returning("*");
  return $$rawToNamedFunctionName(result[0]);
}

/**
 * Inserts one ore more $$pluralEntityName into the database, returning the inserted entities
 */
export async function $$insertPluralFunctionName(
  input: $$entityInputType[],
  connection: ConnectionOrTransaction
): Promise<$$entityName[]> {
  const rawInput = input.map((input) => $$namedToRawFunctionName(input));
  const results = await $$rawBaseQueryFunctionName(connection)
    .insert(rawInput)
    .returning("*");
  return results.map((rawEntity) => $$rawToNamedFunctionName(rawEntity));
}
