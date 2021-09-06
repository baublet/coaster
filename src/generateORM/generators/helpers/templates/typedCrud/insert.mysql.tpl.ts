/**
 * Insert a single $$entityName into the database, returning the inserted ID
 */
export async function $$insertSingleFunctionName(
  input: $$entityInputType,
  connection: ConnectionOrTransaction
): Promise<$$returnType> {
  const rawInput = $$namedToRawFunctionName(input);
  const result = await $$rawBaseQueryFunctionName(connection).insert(rawInput);
  return $$rawToNamedFunctionName(result[0]);
}

/**
 * Inserts one ore more $$pluralEntityName into the database, returning the inserted IDs
 */
export async function $$insertPluralFunctionName(
  input: $$entityInputType[],
  connection: ConnectionOrTransaction
): Promise<$$returnType[]> {
  const rawInput = input.map((input) => $$namedToRawFunctionName(input));
  const results = await $$rawBaseQueryFunctionName(connection).insert(rawInput);
  return results.map((rawEntity) => $$rawToNamedFunctionName(rawEntity));
}
