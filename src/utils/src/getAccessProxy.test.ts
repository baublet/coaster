import {
  coasterTest,
  expect,
  it,
  beforeEach,
} from "@baublet/coaster-unit-test";

import {
  getAccessProxy,
  _getProxiesCreated,
  _resetProxiesCreated,
} from "./getAccessProxy";

beforeEach(_resetProxiesCreated);

it("provides a proper access proxy", () => {
  const fn = coasterTest.fn();
  const proxy = getAccessProxy(fn);

  // Invoking twice to ensure we don't recreate proxies
  proxy();
  proxy();
  proxy.foo();
  proxy.foo();
  proxy.foo.bar();
  proxy.foo.bar();
  proxy.foo.bar.baz();
  proxy.foo.bar.baz();

  expect(fn).toHaveBeenCalledWith(["foo"]);
  expect(fn).toHaveBeenCalledWith(["foo", "bar"]);
  expect(fn).toHaveBeenCalledWith(["foo", "bar", "baz"]);

  expect(_getProxiesCreated()).toBe(4);
  expect(fn).toHaveBeenCalledTimes(8);
});

it("properly caches access proxies", () => {
  const fn = coasterTest.fn();
  const proxy = getAccessProxy(fn);

  proxy.foo.bar.baz();

  expect(fn).toHaveBeenCalledWith(["foo", "bar", "baz"]);
});
