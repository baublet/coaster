/* eslint-disable no-global-assign */

import log from "./log";
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
