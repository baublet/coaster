import { MetaData, Generator } from ".";
import { generateNames } from "../../generateNames";
import { RawSchema } from "../drivers";
import { assertHasTypeMap } from "./helpers";

export const baseQueryTypeScript: Generator = (
  schema: RawSchema,
  metaData: MetaData
) => {
  let code = "";

  assertHasTypeMap(metaData);
  const typeMap = metaData.types;

  for (const table of schema.tables) {
    const entityName = typeMap.get(`${schema.name}.${table.name}`);
    const pluralEntityName = generateNames(entityName).pluralPascal;
    code += `
    export function ${pluralEntityName}<Result = ${entityName}>(
      options: options
    ): Promise<${entityName}[]> {
      return options.connection<${entityName}, Result>("${table.name}");
    }
    `;
  }

  return code;
};
