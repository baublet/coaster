import { CoasterError, createCoasterError } from "@baublet/coaster-utils";

export function createResponseHeadersSentError(): CoasterError {
  return createCoasterError({
    code: "response-headers-sent",
    message:
      "Response headers have already been sent. Invoking this method after response headers are sent does nothing.",
  });
}
