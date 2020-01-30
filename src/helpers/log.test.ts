/* eslint-disable no-global-assign */

import log, { LogLevel } from "./log";
const mockFn = jest.fn();
const originalConsole = console;

beforeEach(() => {
  console = originalConsole;
});

it("logs properly and maintains the context", () => {
  console.log = mockFn;
  log("test!", { toots: 123 });
  expect(console.log).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith(
    "/src/helpers/log.test.ts:13:6",
    "\n\n",
    "test!",
    `{\n\ttoots: 123\n}`
  );
});

it("logs warnings", () => {
  console.warn = mockFn;
  log(LogLevel.WARN, "test!", { toots: 123 });
  expect(console.warn).toHaveBeenCalled();
  expect(console.warn).toHaveBeenCalledWith(
    "/src/helpers/log.test.ts:13:6",
    "\n\n",
    "test!",
    `{\n\ttoots: 123\n}`
  );
});

it("logs errors", () => {
  console.error = mockFn;
  log(LogLevel.WARN, "test!", { toots: 123 });
  expect(console.error).toHaveBeenCalled();
  expect(console.error).toHaveBeenCalledWith(
    "/src/helpers/log.test.ts:13:6",
    "\n\n",
    "test!",
    `{\n\ttoots: 123\n}`
  );
});
