import { RequestContext } from "../context/request";
import { ResolvedEndpoint } from "./types";

export function lazyLoadedEndpoint<TModule extends () => Promise<any>>(
  module: TModule,
  {
    moduleProperty = "default",
    onUnexpectedError = defaultOnUnexpectedError,
  }: {
    moduleProperty?: string;
    onUnexpectedError?: OnUnexpectedError;
  } = {}
): ResolvedEndpoint["handler"] {
  let handlerPromise: Promise<ResolvedEndpoint["handler"]>;

  return async (context) => {
    if (!handlerPromise) {
      handlerPromise = new Promise<ResolvedEndpoint["handler"]>(
        (resolve) => async () => {
          try {
            const importedFile = await module();

            const handlerExists = moduleProperty in importedFile;
            if (!handlerExists) {
              return resolve(
                getErrorLoadingImportHandler(
                  `Handler has no such export: "${moduleProperty}"`,
                  {
                    moduleProperty,
                  }
                )
              );
            }

            resolve(async (context) => {
              await importedFile[moduleProperty](context);
              await context.response.flushData();
            });
          } catch (error) {
            resolve(getErrorLoadingImportHandler("Unexpected error", error));
            await onUnexpectedError?.({ error, context });
          }
        }
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
  context.log("error", "Unexpected error in handler", error);
  context.response.setStatus(500);
  context.response.flushData();
};

export type LazyLoadedHandler = (context: RequestContext) => any;

const getErrorLoadingImportHandler =
  (reason: string, ...details: any[]) =>
  (context: RequestContext) => {
    context.log("error", "Error lazy loading endpoint handler", {
      reason,
      details: details.length ? details : undefined,
    });
  };
