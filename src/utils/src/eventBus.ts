import stringify from "safe-json-stringify";

import { createCoasterError } from "./createCoasterError";
import { CoasterError } from "./error";

type EventBusEvents = Record<string, any[]>;

interface EventBus<T extends EventBusEvents> {
  on: <K extends keyof T>(
    event: K,
    handler: (...args: T[K]) => void | Promise<void>
  ) => void;
  unregisterHandler: <K extends keyof T>(
    event: keyof T,
    handler: (...args: T[K]) => void | Promise<void>
  ) => void;
  unregisterAll: (event: keyof T) => void;
  broadcast: <K extends keyof T>(event: K, ...args: T[K]) => Promise<void>;
  broadcastAndForget: <K extends keyof T>(event: K, ...args: T[K]) => void;
  close: () => void;
}

export function getEventBus<T extends EventBusEvents>({
  handleBackgroundError = defaultHandleBackgroundError,
}: {
  handleBackgroundError?: (error: CoasterError) => void;
} = {}): EventBus<T> {
  const handlers: Map<any, any[]> = new Map();

  return {
    on: (event, handler) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
    },
    unregisterHandler: (event, handler) => {
      if (!handlers.has(event)) {
        return;
      }
      const handlersForEvent = handlers.get(event)!;
      const index = handlersForEvent.indexOf(handler);
      if (index === -1) {
        return;
      }
      handlersForEvent.splice(index, 1);
    },
    unregisterAll: (event) => {
      handlers.delete(event);
    },
    close: () => {
      handlers.clear();
    },
    broadcast: async (event, ...args) => {
      if (!handlers.has(event)) {
        return;
      }

      const handlerPromises: any[] = [];
      for (const handler of handlers.get(event)!) {
        handlerPromises.push(handler(...args));
      }

      await Promise.all(handlerPromises);
    },
    broadcastAndForget: (event, ...args) => {
      if (!handlers.has(event)) {
        return;
      }

      const handlerPromises: any[] = [];
      for (const handler of handlers.get(event)!) {
        handlerPromises.push(handler(...args));
      }

      const stackTrace = new Error().stack;

      Promise.all(handlerPromises)
        .then(() => {})
        .catch((reason) => {
          handleBackgroundError(
            createCoasterError({
              message: "Unexpected error in background event handlers",
              code: "background-event-handler-error",
              details: {
                reason: stringify(reason),
                broadcastAndForgetStackTrace: stackTrace,
              },
            })
          );
        });
    },
  };
}

function defaultHandleBackgroundError(error: CoasterError) {
  console.error("Unexpected error processing background event handlers");
  console.error(error);
}
