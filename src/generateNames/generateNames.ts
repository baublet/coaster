export function generateNames(
  name: string
): {
  raw: string;
  rawCamel: string;
  rawPascal: string;
  singularCamel: string;
  singularPascal: string;
  pluralCamel: string;
  pluralPascal: string;
} {
  return {
    raw: name,
    rawCamel: name,
    rawPascal: name,
    singularCamel: name,
    pluralCamel: name,
    pluralPascal: name,
    singularPascal: name,
  };
}
