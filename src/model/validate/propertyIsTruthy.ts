import { ModelData } from "../createModel";

function defaultTruthyEvaluator(value: any): boolean {
  if (!value) return false;
  if (Array.isArray(value)) {
    if (value.length) return true;
    return false;
  }
  if (typeof value === "object") {
    if (Object.keys(value).length) return true;
    return false;
  }
  return true;
}

export default function<T = Record<string, any>>(
  property: string,
  errorMessage: string = "%prop must be a truthy value",
  truthyEvaluator: (value: any) => boolean = defaultTruthyEvaluator
) {
  return (data: ModelData<T>) => {
    if (truthyEvaluator(data[property])) return true;
    return errorMessage.replace("%prop", property);
  };
}
