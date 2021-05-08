export function generateNames(
  name: string
): {
  singularCamel: string;
  singularPascal: string;
  pluralCamel: string;
  pluralPascal: string;
} {
  return {
    singularCamel: name,
    pluralCamel: name,
    pluralPascal: name,
    singularPascal: name,
  };
}
