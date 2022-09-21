import { Suite, Target } from "benchmark";

import { coasterTest, expect, it } from "@baublet/coaster-unit-test";

import { getAccessProxy } from "./getAccessProxy";

const MINIMUM_OPS_PER_SECOND = 200_000;

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

  expect(fn).toHaveBeenCalledTimes(8);
});

it("benchmarks", async () => {
  const suite = new Suite();

  // add tests
  console.log("Benchmarking...");
  let cycleResult = 0;
  suite
    .add("pure access speed", () => {
      function doNothing() {}
      const proxy = getAccessProxy(doNothing);

      proxy.foo.bar.baz();
      proxy.daenerys.stormborn.of.house.targaryen.the.first.of.her.name.queen.of.the.andals.and.the.first.men.protector.of.the.seven.kingdoms.the.mother.of.dragons.the.khaleesi.of.the.great.grass.sea.the.unburnt.the.breaker.of.chains();
      proxy.daenerys.stormborn();
      proxy.daenerys.stormborn.of.house.targaryen();
      proxy.foo.bar();
    })
    // add listeners
    .on("cycle", (event: { target: Target }) => {
      function doNothing() {}
      const proxy = getAccessProxy(doNothing);

      proxy.foo.bar.baz();
      cycleResult = event.target.hz || 0;
    })
    .run();

  console.log(
    `Benchmark finished with ${cycleResult.toLocaleString()} ops/sec`
  );
  expect(cycleResult).toBeGreaterThan(MINIMUM_OPS_PER_SECOND);
});
