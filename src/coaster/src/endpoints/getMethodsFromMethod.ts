import { EndpointInput, HttpMethod, HTTP_METHODS } from "./types";

export function getMethodsFromMethod(
  endpointInput: EndpointInput["method"]
): HttpMethod[] {
  if (Array.isArray(endpointInput)) {
    return endpointInput;
  }
  if (!endpointInput) {
    return HTTP_METHODS.slice(0);
  }
  switch (endpointInput) {
    case "all":
      return HTTP_METHODS.slice(0);
    default:
      return [endpointInput];
  }
}
