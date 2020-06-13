import { camelCase, pascalCase, snakeCase } from "change-case";
import pluralize from "pluralize";
import memoize from "lodash.memoize";

export interface GeneratedNames {
  /**
   * The canonical name. Not safe for use in databases or in JS.
   */
  canonical: string;
  /**
   * Plural version of canonical.
   */
  plural: string;
  /**
   * Often the same as above, but in cases where canonical needs to vary from
   * the canonical, use this.
   */
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
  pluralSafe: string;
  /**
   * The pascal-case name
   */
  pascal: string;
  /**
   * The camel-case name
   */
  camel: string;
}

/**
 * Takes a string and returns a structure of various names for use within an
 * application. If `original` is passed in, we use that as the original value.
 * This is useful if the name passed in is already transformed in some way.
 * @param name
 * @param original
 */
function generateNames(
  name: string,
  original: string | false = false
): GeneratedNames {
  const safe = snakeCase(name);
  return {
    canonical: name,
    original: original || name,
    originalPlural: pluralize(original || name, 2),
    plural: pluralize(name, 2),
    pluralSafe: pluralize(safe, 2),
    safe: safe,
    pascal: pascalCase(name),
    camel: camelCase(name)
  };
}

export default memoize<typeof generateNames>(generateNames);
