import { it, expect, coasterTest, wait } from "@baublet/coaster-unit-test";
import { getEventBus } from "./eventBus";

it("create a basic event bus that adds and unregisters events", async () => {
  const eventBus = getEventBus<{
    test: [string];
  }>();

  const handler = coasterTest.fn();

  eventBus.unregisterHandler("nothing happens" as any, undefined as any);
  eventBus.broadcast("nothing happens" as any, undefined);
  eventBus.broadcastAndForget("nothing happens" as any, undefined);

  eventBus.on("test", handler);

  await eventBus.broadcast("test", "test");

  expect(handler).toHaveBeenCalledWith("test");

  eventBus.unregisterAll("test");
  handler.mockClear();

  await eventBus.broadcast("test", "test");

  expect(handler).not.toHaveBeenCalled();
});

it("fires and forgets", async () => {
  const eventBus = getEventBus<{
    test: [string];
  }>();

  const handler = coasterTest.fn();
  eventBus.on("test", async (message) => {
    await wait();
    handler(message);
  });

  eventBus.broadcastAndForget("test", "test");
  expect(handler).not.toHaveBeenCalled();

  await wait();
  expect(handler).toHaveBeenCalledWith("test");
});

it("unregisters specific handlers", async () => {
  const eventBus = getEventBus<{
    test: [string];
  }>();

  const handler1 = coasterTest.fn();
  eventBus.on("test", handler1);
  const handler2 = coasterTest.fn();
  eventBus.on("test", handler2);

  await eventBus.broadcast("test", "test");

  expect(handler1).toHaveBeenCalledWith("test");
  expect(handler2).toHaveBeenCalledWith("test");

  eventBus.unregisterHandler("test", undefined as any);
  eventBus.unregisterHandler("test", handler1);
  handler1.mockClear();
  handler2.mockClear();

  await eventBus.broadcast("test", "test");

  expect(handler1).not.toHaveBeenCalled();
  expect(handler2).toHaveBeenCalledWith("test");

  eventBus.close();

  handler2.mockClear();
  await eventBus.broadcast("test", "test");

  expect(handler2).not.toHaveBeenCalled();
});

it("handles failures: default", async () => {
  const eventBus = getEventBus<{
    test: [string];
  }>();

  const errorSpy = coasterTest
    .spyOn(console, "error")
    .mockImplementation(coasterTest.fn() as any);

  const handler1 = coasterTest.fn().mockRejectedValue("Error!");
  eventBus.on("test", handler1);

  eventBus.broadcastAndForget("test", "test");

  await wait();
  expect(errorSpy).toHaveBeenCalled();
});

it("handles failures: custom", async () => {
  const handleBackgroundError = coasterTest.fn();
  const eventBus = getEventBus<{
    test: [string];
  }>({
    handleBackgroundError,
  });

  const handler1 = coasterTest.fn().mockRejectedValue("Error!");
  eventBus.on("test", handler1);

  eventBus.broadcastAndForget("test", "test");

  await wait();
  expect(handleBackgroundError).toHaveBeenCalled();
});
