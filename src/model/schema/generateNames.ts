import toSnakeCase from "../../helpers/toSnakeCase";

export interface SchemaNodeNames {
  canonical: string;
  safe: string;
}

export default function generateNames(name: string): SchemaNodeNames {
  return {
    canonical: name,
    safe: toSnakeCase(name)
  };
}
