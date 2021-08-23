import path from "path";
import fs from "fs";
import mkdirp from "mkdirp";

export function getTemplateManager() {
  return getManager({
    "crud/insert.pg": [
      "connection",
      "entityInputType",
      "entityName",
      "namedToRawFunctionName",
      "pluralEntityName",
      "rawBaseQueryFunctionName",
      "rawToNamedFunctionName",
    ] as const,
  });
}

const templatesPath = path.resolve(__dirname, "templates");

mkdirp.sync(templatesPath);

export interface TemplateManager<T extends Record<string, Template>> {
  render: (
    args: {
      [K in keyof T]: {
        template: K;
        variables: { [key in T[K][number]]: string | number };
      };
    }[keyof T]
  ) => string;
}

type Template = readonly string[];

function getPathToTemplate(key: string): string {
  return path.resolve(templatesPath, `${key}.tpl`);
}

function getManager<T extends Record<string, Template>>(
  templates: T
): TemplateManager<T> {
  const templateTransformers = new Map<
    string,
    (args?: Record<string, any>) => string
  >();
  const regexList: Record<string, RegExp> = {};

  for (const key of Object.keys(templates)) {
    for (const variableKey of templates[key]) {
      regexList[variableKey] = new RegExp(`%${variableKey}%`, "g");
    }

    const absolutePath = getPathToTemplate(key);
    // istanbul ignore next - this is a runtime type guard intended to catch
    // things we forgot long before code hits production.
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Template not found: ${absolutePath}`);
    }

    const rawTemplate = fs.readFileSync(absolutePath).toString();
    templateTransformers.set(key, (args?: Record<string, any>) => {
      let newTemplate = rawTemplate;
      for (const [key, value] of Object.entries(args)) {
        newTemplate = newTemplate.replace(regexList[key], value);
      }
      return newTemplate;
    });
  }
  return {
    render: (args) =>
      templateTransformers.get(args.template as string)(args.variables),
  };
}
