import { CoasterError } from "./error";
import { createCoasterError } from "./createCoasterError";

type Types =
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  | "null"
  | "object"
  | "function";

export function asTypeOrError<
  TEndType extends Types,
  TFunction = (...args: any[]) => any
>(
  type: TEndType,
  subject: unknown
):
  | CoasterError
  | (TEndType extends "string"
      ? string
      : TEndType extends "number"
      ? number
      : TEndType extends "boolean"
      ? boolean
      : TEndType extends "undefined"
      ? undefined
      : TEndType extends "null"
      ? null
      : TEndType extends "object"
      ? Record<string, any>
      : TEndType extends "function"
      ? TFunction
      : never) {
  const subjectAsAny: any = subject;
  switch (type) {
    case "string": {
      if (typeof subject !== "string") {
        return createCoasterError({
          code: `asTypeOrError-string`,
          message: `Expected a string, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "number": {
      if (typeof subject !== "number") {
        return createCoasterError({
          code: `asTypeOrError-number`,
          message: `Expected a number, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "boolean": {
      if (typeof subject !== "boolean") {
        return createCoasterError({
          code: `asTypeOrError-boolean`,
          message: `Expected a boolean, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "undefined": {
      if (typeof subject !== "undefined") {
        return createCoasterError({
          code: `asTypeOrError-undefined`,
          message: `Expected undefined, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "null": {
      if (subject !== null) {
        return createCoasterError({
          code: `asTypeOrError-null`,
          message: `Expected null, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "object": {
      if (typeof subject !== "object" || Array.isArray(subject)) {
        return createCoasterError({
          code: `asTypeOrError-object`,
          message: `Expected an object, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    case "function": {
      if (typeof subject !== "function") {
        return createCoasterError({
          code: `asTypeOrError-function`,
          message: `Expected a function, got a ${typeof subject}`,
        });
      }
      return subjectAsAny;
    }
    default:
      return createCoasterError({
        code: `asTypeOrError-unknown`,
        message: `Unknown type: ${type}`,
      });
  }
}
