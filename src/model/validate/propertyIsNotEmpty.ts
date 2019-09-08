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

export default function(
  prop: string,
  errorMessage: string = "%prop must be a truthy value",
  emptyEvaluator: (value: any) => boolean = defaultEmptyEvaluator
) {
  const fullErrorMessage = errorMessage.replace("%prop", prop);
  return (data: ModelData) => {
    if (!data[prop]) return fullErrorMessage;
    if (emptyEvaluator(data[prop])) return true;
    return fullErrorMessage;
  };
}
