import { camelCase, pascalCase, snakeCase } from "change-case";
import pluralize from "pluralize";

export interface GeneratedNames {
  /**
   * The canonical name. Not safe for use in databases or in JS.
   */
  canonical: string;
  original: string;
  /**
   * Pluralized version of original.
   */
  originalPlural: string;
  /**
   * A database- and javascript-safe version of the string. Suitable for using
   * as database column names.
   */
  safe: string;
  /**
   * The plural version of the safe name.
   */
  safePlural: string;
  pascal: string;
  pascalPlural: string;
  camel: string;
  camelPlural: string;
  snake: string;
  snakePlural: string;
}

/**
 * Takes a string and returns a structure of various names for use within an
 * application. If `original` is passed in, we use that as the original value.
 * This is useful if the name passed in is already transformed in some way.
 * @param name
 * @param original
 */
export function generateNames(name: string): GeneratedNames {
  const snake = snakeCase(name);
  const pascal = pascalCase(name);
  const camel = camelCase(name);
  const plural = pluralize(name);
  return {
    canonical: pascal,
    original: name,
    originalPlural: plural,
    safe: snake,
    safePlural: snakeCase(plural),
    pascal: pascal,
    pascalPlural: pascalCase(plural),
    camel: camel,
    camelPlural: camelCase(plural),
    snake,
    snakePlural: snakeCase(plural),
  };
}
