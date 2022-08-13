import stringify from "safe-json-stringify";

import { CoasterError } from "./error";

export function htmlifyCoasterErrorPage(error: CoasterError): string {
  const pieces: string[] = [];

  pieces.push('<div class="coaster-error coaster-error-page">');

  if (error.message) {
    pieces.push(`<h1>Unexpected Error</h1>`);
    pieces.push(`<h2>${error.message}</h2>`);
  }

  if (error.code) {
    pieces.push(`<p><small><b>Code:</b> ${error.code}</small></p>`);
  }

  if (error.details) {
    const errorString = stringify(error.details)
      .replace(/\n/g, "<br>")
      .replace(/ {2}/g, "&nbsp;");
    pieces.push(`<p><small><b>Details:</b> ${errorString}</small></p>`);
  }

  pieces.push("</div>");

  return pieces.join("\n");
}
