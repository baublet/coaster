import { ModelArgs, Model, isModel } from "./types";

export function toJson<Args extends ModelArgs>(
  model: Model<Args>,
  maxDepth: number = 5,
  currentDepth: number = 0
): Record<string, any> {
  const data: Record<string, any> = {};
  if (currentDepth > maxDepth) return undefined;
  for (const prop in model) {
    if (prop[0] === "$") continue;
    const propValue = model[prop];
    if (isModel(propValue)) {
      data[prop] = toJson(propValue, maxDepth, currentDepth + 1);
      continue;
    }
    if (Array.isArray(propValue)) {
      if (propValue.length === 0) continue;
      data[prop] = propValue.map(model =>
        toJson(model, maxDepth, currentDepth + 1)
      );
      continue;
    }
    data[prop] = propValue;
  }
  return data;
}
