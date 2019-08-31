import toSnakeCase from "snake-case";

export interface SchemaNodeNames {
  canonical: string;
  original: string;
  safe: string;
}

export default function generateNames(
  name: string,
  original: string | false = false
): SchemaNodeNames {
  return {
    canonical: name,
    original: original || name,
    safe: toSnakeCase(name)
  };
}
