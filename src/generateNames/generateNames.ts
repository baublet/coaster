import { camelCase, pascalCase } from "change-case";
import pluralize from "pluralize";
import memoize from "lodash.memoize";

const unmemoizedGenerateNames = (
  name: string
): {
  pluralCamel: string;
  pluralPascal: string;
  raw: string;
  rawCamel: string;
  rawPascal: string;
  singularCamel: string;
  singularPascal: string;
} => {
  return {
    pluralCamel: camelCase(pluralize.plural(name)),
    pluralPascal: pascalCase(pluralize.plural(name)),
    raw: name,
    rawCamel: camelCase(name),
    rawPascal: pascalCase(name),
    singularCamel: camelCase(pluralize.singular(name)),
    singularPascal: pascalCase(pluralize.singular(name)),
  };
};

export const generateNames: typeof unmemoizedGenerateNames = memoize(
  unmemoizedGenerateNames
);
