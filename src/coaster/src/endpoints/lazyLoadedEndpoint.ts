import stringify from "safe-json-stringify";

import { RequestContext } from "../context/request";
import { ResolvedEndpoint } from "./types";

export function lazyLoadedEndpoint<TModule extends () => Promise<any>>(
  module: TModule,
  {
    moduleProperty = "handler",
    onUnexpectedError = defaultOnUnexpectedError,
  }: {
    moduleProperty?: string;
    onUnexpectedError?: OnUnexpectedError;
  } = {}
): ResolvedEndpoint["handler"] {
  let handlerPromise: Promise<ResolvedEndpoint["handler"]>;
  return async (context) => {
    if (!handlerPromise) {
      handlerPromise = new Promise<ResolvedEndpoint["handler"]>((resolve) =>
        (async () => {
          try {
            const importedFile = await module();

            const handlerExists = moduleProperty in importedFile;
            if (!handlerExists) {
              return resolve(
                getErrorLoadingImportHandler(
                  `Handler has no such export: "${moduleProperty}"`,
                  {
                    moduleProperty,
                    properties: Object.keys(importedFile),
                  }
                )
              );
            }

            resolve(async (context) => {
              try {
                await importedFile[moduleProperty](context);
              } catch (error) {
                context.response.status(500);
                await onUnexpectedError?.({ error, context });
              }
            });
          } catch (error) {
            resolve(getErrorLoadingImportHandler("Unexpected error", error));
            await onUnexpectedError?.({ error, context });
          }
        })()
      );
    }

    const resolvedHandler = await handlerPromise;
    await resolvedHandler(context);
  };
}

type OnUnexpectedError = (args: {
  error: unknown;
  context: RequestContext;
}) => Promise<void>;

const defaultOnUnexpectedError: OnUnexpectedError = async ({
  context,
  error,
}) => {
  context.log("error", "Unexpected error in handler", { error });
  context.response.status(500);
};

export type LazyLoadedHandler = (context: RequestContext) => any;

const getErrorLoadingImportHandler =
  (reason: string, ...details: any[]) =>
  (context: RequestContext) => {
    context.response.status(500);
    context.response.send(
      `Error loading endpoint handler: ${stringify([reason, ...details])}`
    );
    context.log("error", "Error lazy loading endpoint handler", {
      reason,
      details: details.length ? details : undefined,
    });
  };
