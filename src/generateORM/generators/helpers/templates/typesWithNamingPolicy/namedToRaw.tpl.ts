export function $$namedToRawFunctionName<
  T extends $$namedEntityName | Partial<$$namedEntityName>
>(subject: T): $$namedToRawReturnTypeSignature {
  const rawSubject: Record<string, any> = {};
  $$namedToRawPropertyAssignments;
  return rawSubject as $$namedToRawReturnTypeSignature;
}
