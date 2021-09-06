function $$functionName(
  defaults: Partial<$$prefixedEntityName> = {}
): $$prefixedEntityName {
  const test$$prefixedEntityName: $$prefixedEntityName = {
    $$columnDefaults,
    ...defaults,
  };
  return test$$prefixedEntityName;
}
