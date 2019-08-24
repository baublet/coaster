import { ModelData } from "../createModel";

function defaultEmptyEvaluator(value: any): boolean {
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
  emptyEvaluator: (value: any) => boolean = defaultEmptyEvaluator
) {
  const fullErrorMessage = errorMessage.replace("%prop", property);
  return (data: ModelData<T>) => {
    if (!data[property]) return fullErrorMessage;
    if (emptyEvaluator(data[property])) return true;
    return fullErrorMessage;
  };
}
