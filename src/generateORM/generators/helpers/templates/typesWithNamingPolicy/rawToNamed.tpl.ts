export function $$rawToNamedFunctionName<
  T extends $$rawEntityName | Partial<$$rawEntityName>
>(subject: T): $$rawToNamedReturnTypeSignature {
  const namedSubject: Record<string, any> = {};
$$rawToNamedPropertyAssignments
  return namedSubject as $$rawToNamedReturnTypeSignature;
}
