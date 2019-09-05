import toSnakeCase from "snake-case";
import pluralize from "pluralize";

export interface GeneratedNames {
  canonical: string;
  original: string;
  originalPlural: string;
  plural: string;
  pluralSafe: string;
  safe: string;
}

export default function generateNames(
  name: string,
  original: string | false = false
): GeneratedNames {
  const safe = toSnakeCase(name);
  return {
    canonical: name,
    original: original || name,
    originalPlural: pluralize(original || name, 2),
    plural: pluralize(name, 2),
    pluralSafe: pluralize(safe, 2),
    safe: safe
  };
}
